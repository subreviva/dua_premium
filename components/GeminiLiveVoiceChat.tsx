"use client";

import { useGeminiLiveAPI } from "@/hooks/useGeminiLiveAPI";
import { DUA_SYSTEM_INSTRUCTION } from "@/lib/dua-prompt";
import { X, Mic } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiriOrb } from "@/components/ui/siri-orb";

// --- STREAMING AUDIO PLAYER: Alta Performance em Tempo Real ---
// Esta classe implementa o padrão recomendado pela Google para playback de áudio
// em tempo real usando a Web Audio API. Em vez de esperar pelo áudio completo,
// toca os chunks à medida que chegam, eliminando o atraso.
class StreamingAudioPlayer {
  private audioContext: AudioContext;
  private audioQueue: Int16Array[] = [];
  private activeSource: AudioBufferSourceNode | null = null; // Rastrear a fonte ativa
  private isPlaying = false;
  private nextPlayTime = 0;
  private sampleRate: number;

  constructor(sampleRate = 24000) { // API Gemini retorna 24kHz
    this.sampleRate = sampleRate;
    this.audioContext = new AudioContext({
      sampleRate: this.sampleRate,
    });
  }

  public addChunk(chunk: Int16Array) {
    this.audioQueue.push(chunk);
    if (!this.isPlaying) {
      this.play();
    }
  }

  private play() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      this.activeSource = null;
      return;
    }
    this.isPlaying = true;

    const chunk = this.audioQueue.shift()!;
    
    // Converter Int16Array para Float32Array (formato da Web Audio API)
    const float32Array = new Float32Array(chunk.length);
    for (let i = 0; i < chunk.length; i++) {
      float32Array[i] = chunk[i] / 32768.0; // Normalizar de [-32768, 32767] para [-1, 1]
    }

    // Criar buffer de áudio
    const audioBuffer = this.audioContext.createBuffer(1, float32Array.length, this.sampleRate);
    audioBuffer.copyToChannel(float32Array, 0);

    // Criar source e conectar ao destino
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    this.activeSource = source; // Guardar a referência

    // Agendar playback sem gaps (seamless)
    const currentTime = this.audioContext.currentTime;
    const startTime = Math.max(currentTime, this.nextPlayTime);
    
    source.start(startTime);
    
    // Calcular o tempo do próximo chunk para não haver gaps
    this.nextPlayTime = startTime + audioBuffer.duration;
    
    // Quando terminar, tocar o próximo chunk
    source.onended = () => {
      if (this.activeSource === source) {
        this.play();
      }
    };
  }

  // MELHORIA: Método para parar o áudio imediatamente
  public stop() {
    if (this.activeSource) {
      try {
        this.activeSource.onended = null; // Evitar que o próximo chunk toque
        this.activeSource.stop();
      } catch (e) {
        // Ignorar erros se já parou
      }
      this.activeSource = null;
    }
    this.audioQueue = []; // Limpar a fila
    this.isPlaying = false;
    this.nextPlayTime = 0;
  }

  public close() {
    this.stop(); // Garantir que para tudo antes de fechar
    this.audioContext.close();
  }
}

// MELHORIA: Singleton do AudioContext para poupar recursos (recomendação Google)
let playerInstance: StreamingAudioPlayer | null = null;
const getPlayerInstance = () => {
  if (!playerInstance) {
    playerInstance = new StreamingAudioPlayer(24000);
    console.log("✅ DUA StreamingAudioPlayer singleton criado");
  }
  return playerInstance;
};

interface GeminiLiveVoiceChatProps {
  onClose: () => void;
}

// --- ESTADO DA INTERFACE ---
type ChatState = "idle" | "connecting" | "listening" | "speaking" | "error";

const GeminiLiveVoiceChat: React.FC<GeminiLiveVoiceChatProps> = ({ onClose }) => {
  const [chatState, setChatState] = useState<ChatState>("idle");
  // Usar singleton para performance otimizada
  const streamingPlayerRef = useRef<StreamingAudioPlayer>(getPlayerInstance());

  const handleNewAudio = useCallback((audioChunk: Int16Array) => {
    console.log(`🎵 DUA a falar - chunk recebido (${audioChunk.length} samples)`);
    setChatState("speaking");
    streamingPlayerRef.current.addChunk(audioChunk);
  }, []);

  // CORREÇÃO: Nova callback para saber quando a DUA termina de falar
  const handleTurnComplete = useCallback(() => {
    console.log("✅ DUA terminou de falar - voltando ao estado idle");
    setChatState("idle");
  }, []);

  const {
    connect, // EXPOR A FUNÇÃO CONNECT DO HOOK
    toggleRecording,
    closeSession,
    isConnected,
    isRecording,
    isLoading,
    error,
  } = useGeminiLiveAPI({
    systemInstruction: DUA_SYSTEM_INSTRUCTION,
    onAudio: handleNewAudio,
    onTurnComplete: handleTurnComplete, // Passar a nova callback
  });

  // CORREÇÃO: Pré-aquecer a conexão assim que o componente é montado
  useEffect(() => {
    console.log("🔥 Iniciando pré-aquecimento da conexão com a DUA...");
    connect().catch(e => {
      console.error("❌ Falha ao pré-aquecer a conexão:", e);
      // O erro já é tratado e exposto no estado `error` do hook
    });

    // Garante que a sessão da API é fechada ao desmontar o componente
    return () => {
      console.log("🧹 DUA a encerrar sessão...");
      closeSession();
    };
  }, [connect, closeSession]);

  // CORREÇÃO: Atualizar o estado da UI com base nos estados do hook
  useEffect(() => {
    if (error) {
      setChatState("error");
    } else if (isLoading) {
      // Simplificado: se está a carregar, mostra "A conectar"
      setChatState("connecting");
    } else if (isRecording) {
      setChatState("listening");
    } else if (isConnected && chatState !== 'speaking') {
      // Se conectado e não a falar, fica idle
      setChatState("idle");
    }
  }, [isRecording, isLoading, isConnected, error, chatState]);

  const handleInteraction = () => {
    // MELHORIA: Feedback tátil em dispositivos móveis que suportam
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Vibração curta de 50ms
    }

    // MELHORIA: Permitir interromper a DUA
    if (chatState === "speaking") {
      console.log("🛑 Utilizador interrompeu a DUA");
      streamingPlayerRef.current.stop();
    }
    
    if (chatState === "idle" || chatState === "speaking" || chatState === "error") {
      toggleRecording();
    }
  };

  const getStatusText = () => {
    switch (chatState) {
      case "idle": return "Pressiona para falar com a DUA";
      case "connecting": return "A conectar...";
      case "listening": return "A ouvir...";
      case "speaking": return "DUA a falar...";
      case "error": return "Ocorreu um erro. Tenta novamente.";
      default: return "";
    }
  };

  const getStatusSubtext = () => {
    switch (chatState) {
      case "idle": return "Voz criativa da 2 LADOS";
      case "connecting": return "A estabelecer ligação";
      case "listening": return "Fala agora";
      case "speaking": return "Reproduzindo resposta";
      case "error": return error || "Erro desconhecido";
      default: return "";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 overflow-hidden"
    >
      {/* Efeito de fundo com gradiente dinâmico */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: chatState === "listening" 
            ? "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.3), transparent 70%)"
            : chatState === "speaking"
            ? "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.3), transparent 70%)"
            : "radial-gradient(circle at 50% 50%, rgba(100, 100, 100, 0.1), transparent 70%)",
        }}
        transition={{ duration: 0.8 }}
      />

      {/* Botão de Fechar */}
      <motion.button
        onClick={onClose}
        className="absolute top-6 right-6 text-gray-400 hover:text-white transition-all duration-300 p-2 rounded-full hover:bg-white/5 backdrop-blur-sm"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <X size={32} />
      </motion.button>

      {/* Erro Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="absolute top-20 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-full text-red-300 text-sm backdrop-blur-xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conteúdo Principal */}
      <div className="text-center z-10 px-4">
        {/* Título DUA */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-2"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-2 tracking-tight">
            DUA
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm font-light tracking-wider uppercase">
            {getStatusSubtext()}
          </p>
        </motion.div>

        {/* Status Text */}
        <motion.p
          key={chatState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-gray-300 text-base sm:text-lg mb-8 sm:mb-12 font-light px-4"
        >
          {getStatusText()}
        </motion.p>

        {/* Botão Principal com Siri Orb - RESPONSIVO */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
          className="relative flex justify-center items-center"
        >
          <button
            onClick={handleInteraction}
            disabled={chatState === "connecting"}
            className="relative focus:outline-none focus:ring-4 focus:ring-purple-500/50 rounded-full transition-all duration-300 touch-manipulation active:scale-95"
            aria-label={getStatusText()}
          >
            {/* Siri Orb com Estados Visuais - TAMANHO RESPONSIVO */}
            <div className="relative">
              <SiriOrb
                size={typeof window !== 'undefined' && window.innerWidth < 640 ? "180px" : "256px"}
                className="drop-shadow-2xl"
                isListening={chatState === "listening"}
                animationDuration={chatState === "listening" ? 8 : 20}
                colors={{
                  c1: chatState === "listening" ? "oklch(75% 0.2 250)" : "oklch(75% 0.15 300)",
                  c2: chatState === "listening" ? "oklch(80% 0.18 220)" : "oklch(80% 0.12 280)",
                  c3: chatState === "speaking" ? "oklch(78% 0.16 320)" : "oklch(78% 0.14 290)",
                }}
              />
              
              {/* Ícone Central - TAMANHO RESPONSIVO */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                animate={{
                  scale: chatState === "listening" ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 1.5,
                  repeat: chatState === "listening" ? Infinity : 0,
                  ease: "easeInOut",
                }}
              >
                <AnimatePresence mode="wait">
                  {chatState === "connecting" ? (
                    <motion.div
                      key="connecting"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"
                    />
                  ) : (
                    <motion.div
                      key="mic"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <Mic
                        size={chatState === "listening" ? (typeof window !== 'undefined' && window.innerWidth < 640 ? 56 : 80) : (typeof window !== 'undefined' && window.innerWidth < 640 ? 48 : 64)}
                        className={`transition-all duration-300 ${
                          chatState === "listening"
                            ? "text-blue-300 drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]"
                            : "text-white/90"
                        }`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </button>

          {/* Indicador de Áudio (Visualização de Ondas) - RESPONSIVO */}
          <AnimatePresence>
            {chatState === "speaking" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -bottom-12 sm:-bottom-16 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5"
              >
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 sm:w-1.5 bg-purple-400 rounded-full"
                    animate={{
                      height: ["16px", "32px", "16px"],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Hint Text - RESPONSIVO */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-gray-500 text-xs sm:text-sm mt-12 sm:mt-16 max-w-md mx-auto px-6"
        >
          {chatState === "idle" && "Toca no orbe para começar uma conversa por voz"}
          {chatState === "listening" && "Fala naturalmente, a DUA está a ouvir"}
          {chatState === "speaking" && "A DUA está a responder"}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default GeminiLiveVoiceChat;
