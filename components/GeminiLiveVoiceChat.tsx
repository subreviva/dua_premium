"use client";

import { useGeminiLiveAPI } from "@/hooks/useGeminiLiveAPI";
import { DUA_SYSTEM_INSTRUCTION } from "@/lib/dua-prompt";
import { X, Mic } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiriOrb } from "@/components/ui/siri-orb";

// --- STREAMING AUDIO PLAYER: Arquitetura Final com Gestão de Estado ---
// Esta classe implementa a solução oficial da Google para Web Audio API.
// CORREÇÃO DEFINITIVA: Gestão ativa do AudioContext para prevenir suspensão
// pelo navegador (política de economia de bateria em mobile/desktop).
class StreamingAudioPlayer {
  private audioContext: AudioContext | null = null;
  private audioQueue: { chunk: Int16Array; sampleRate: number }[] = [];
  private isPlaying = false;
  private nextPlayTime = 0; // Relógio absoluto e preciso
  private activeSources: AudioBufferSourceNode[] = []; // Fila de fontes agendadas
  private schedulerTimeout: NodeJS.Timeout | null = null; // Timer do scheduler

  constructor() {}

  // CORREÇÃO CRÍTICA 1: Garantir que o AudioContext está "acordado"
  private async ensureAudioContextIsRunning(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      console.warn("⚠️ AudioContext estava suspenso. Tentando retomar...");
      await this.audioContext.resume();
      console.log("✅ AudioContext retomado com sucesso!");
    }
  }

  public addChunk(audio: { chunk: Int16Array; sampleRate: number }) {
    // Se o AudioContext ainda não foi criado, cria-o com a frequência correta da API
    if (!this.audioContext) {
      console.log(`🎧 Criando AudioContext adaptativo com frequência da API: ${audio.sampleRate}Hz`);
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: audio.sampleRate,
        latencyHint: 'interactive', // CRÍTICO: Baixa latência para conversação em tempo real
      });
      // Inicia o relógio absoluto quando o contexto é criado
      this.nextPlayTime = this.audioContext.currentTime;
    }
    
    // Validação: Se um chunk com frequência diferente chegar, reinicia o contexto (edge case)
    if (this.audioContext.sampleRate !== audio.sampleRate) {
      console.warn(`⚠️ Frequência mudou! Reiniciando AudioContext: ${this.audioContext.sampleRate}Hz → ${audio.sampleRate}Hz`);
      this.close(); // Fecha e limpa tudo
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: audio.sampleRate,
        latencyHint: 'interactive',
      });
      this.nextPlayTime = this.audioContext.currentTime;
    }

    this.audioQueue.push(audio);
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.scheduleNextChunk();
    }
  }

  private async scheduleNextChunk() {
    // CORREÇÃO CRÍTICA 2: Antes de qualquer agendamento, garantir que o contexto está ativo
    await this.ensureAudioContextIsRunning();

    if (this.audioQueue.length === 0 || !this.audioContext) {
      this.isPlaying = false;
      return;
    }

    const currentTime = this.audioContext.currentTime;
    
    // CORREÇÃO CRÍTICA 3: Loop de processamento robusto
    // Processa todos os chunks que já deveriam ter sido agendados (lida com "saltos" de tempo)
    while (this.audioQueue.length > 0 && this.nextPlayTime <= currentTime + 0.1) { // 100ms de margem
      const audio = this.audioQueue.shift()!;
      const { chunk, sampleRate } = audio;

      // Converter Int16Array para Float32Array (formato da Web Audio API)
      const float32Array = new Float32Array(chunk.length);
      for (let i = 0; i < chunk.length; i++) {
        float32Array[i] = chunk[i] / 32767; // Normalizar de [-32768, 32767] para [-1, 1]
      }

      // Criar buffer de áudio com a frequência correta do chunk
      const audioBuffer = this.audioContext.createBuffer(1, float32Array.length, sampleRate);
      audioBuffer.copyToChannel(float32Array, 0);

      // Criar source e conectar ao destino
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      // CORREÇÃO CRÍTICA 4: Detecção e reajuste de dessincronização
      // Se o relógio está no passado, reinicia para o presente
      if (this.nextPlayTime < currentTime) {
        console.warn(`⚠️ Relógio de áudio dessincronizado (${(currentTime - this.nextPlayTime).toFixed(2)}s atrás). Ajustando para o presente.`);
        this.nextPlayTime = currentTime;
      }

      // Agenda o áudio para tocar no tempo absoluto e preciso
      source.start(this.nextPlayTime);
      (source as any).stopTime = this.nextPlayTime + audioBuffer.duration; // Guardar tempo de paragem
      this.activeSources.push(source);

      // Avança o relógio absoluto para o final deste pedaço de áudio
      this.nextPlayTime += audioBuffer.duration;
    }

    // Limpa fontes antigas que já terminaram
    this.activeSources = this.activeSources.filter(s => {
      const stopTime = (s as any).stopTime;
      return stopTime && currentTime < stopTime;
    });

    // CORREÇÃO: Limpa o timeout anterior antes de agendar um novo
    if (this.schedulerTimeout) {
      clearTimeout(this.schedulerTimeout);
    }
    
    // Scheduler desacoplado - continua o ciclo após 100ms
    this.schedulerTimeout = setTimeout(() => this.scheduleNextChunk(), 100);
  }

  public stop() {
    // CORREÇÃO CRÍTICA 5: Cleanup completo e robusto
    // Limpar o scheduler
    if (this.schedulerTimeout) {
      clearTimeout(this.schedulerTimeout);
      this.schedulerTimeout = null;
    }

    // Para todas as fontes de áudio agendadas e futuras
    this.activeSources.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // Ignorar erros se a fonte já parou
      }
    });
    this.activeSources = [];
    this.audioQueue = [];
    this.isPlaying = false;
  }

  public close() {
    this.stop();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(console.error);
    }
    this.audioContext = null;
  }
}

// MELHORIA: Singleton do AudioContext para poupar recursos (recomendação Google)
let playerInstance: StreamingAudioPlayer | null = null;
const getPlayerInstance = () => {
  if (!playerInstance) {
    playerInstance = new StreamingAudioPlayer(); // Sem argumentos - adaptativo
    console.log("✅ DUA StreamingAudioPlayer adaptativo criado (singleton)");
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

  // MODIFICADO: A callback agora recebe o objeto de áudio com chunk e frequência
  const handleNewAudio = useCallback((audio: { chunk: Int16Array; sampleRate: number }) => {
    console.log(`🎵 DUA a falar - chunk recebido (${audio.chunk.length} samples @ ${audio.sampleRate}Hz)`);
    setChatState("speaking");
    streamingPlayerRef.current.addChunk(audio);
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
    mediaStream, // NOVO: Stream de áudio para análise em tempo real
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
    // ULTRA-PREMIUM: Feedback tátil sofisticado (padrões diferentes por estado)
    if ('vibrate' in navigator) {
      if (chatState === "idle") {
        navigator.vibrate([30, 20, 30]); // Padrão de "início" elegante
      } else if (chatState === "speaking") {
        navigator.vibrate(50); // Vibração única para interrupção
      } else {
        navigator.vibrate(30); // Vibração suave padrão
      }
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
      {/* Efeito de fundo com gradiente dinâmico ULTRA-PREMIUM */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: chatState === "listening" 
            ? "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.4), rgba(147, 51, 234, 0.2), transparent 70%)"
            : chatState === "speaking"
            ? "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.4), rgba(236, 72, 153, 0.2), transparent 70%)"
            : "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15), transparent 70%)",
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      {/* Glassmorphism overlay para profundidade */}
      <div className="absolute inset-0 backdrop-blur-3xl opacity-5" />

      {/* Botão de Fechar - ULTRA-PREMIUM */}
      <motion.button
        onClick={onClose}
        className="absolute top-4 sm:top-6 right-4 sm:right-6 text-gray-400 hover:text-white transition-all duration-300 p-2.5 sm:p-3 rounded-full hover:bg-white/10 backdrop-blur-md border border-white/5 shadow-xl touch-manipulation active:scale-90"
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 25 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <X size={24} className="sm:w-8 sm:h-8" />
      </motion.button>

      {/* Erro Display - ULTRA-PREMIUM */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 px-6 py-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-sm backdrop-blur-xl shadow-2xl"
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              <span className="font-medium">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conteúdo Principal */}
      <div className="text-center z-10 px-4 sm:px-6">
        {/* Título DUA - ULTRA-PREMIUM */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 150 }}
          className="mb-3 sm:mb-4"
        >
          <motion.h1 
            className="text-6xl sm:text-7xl md:text-8xl font-bold text-white mb-2 sm:mb-3 tracking-tight"
            animate={{
              textShadow: chatState === "listening" 
                ? "0 0 40px rgba(59, 130, 246, 0.6), 0 0 80px rgba(59, 130, 246, 0.3)"
                : chatState === "speaking"
                ? "0 0 40px rgba(168, 85, 247, 0.6), 0 0 80px rgba(168, 85, 247, 0.3)"
                : "0 0 20px rgba(139, 92, 246, 0.2)",
            }}
            transition={{ duration: 0.8 }}
          >
            DUA
          </motion.h1>
          <motion.p 
            className="text-gray-400 text-xs sm:text-sm font-light tracking-[0.2em] uppercase"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {getStatusSubtext()}
          </motion.p>
        </motion.div>

        {/* Status Text - ULTRA-PREMIUM */}
        <motion.p
          key={chatState}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-gray-300 text-base sm:text-lg mb-10 sm:mb-14 font-light px-4"
        >
          {getStatusText()}
        </motion.p>

        {/* Botão Principal com Siri Orb - ULTRA-PREMIUM RESPONSIVO */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 250, damping: 20 }}
          className="relative flex justify-center items-center"
        >
          <button
            onClick={handleInteraction}
            disabled={chatState === "connecting"}
            className="relative focus:outline-none focus:ring-4 focus:ring-purple-500/50 rounded-full transition-all duration-500 touch-manipulation active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={getStatusText()}
          >
            {/* Siri Orb com Estados Visuais - TAMANHO RESPONSIVO */}
            <motion.div 
              className="relative"
              animate={{
                filter: chatState === "listening" 
                  ? "drop-shadow(0 0 40px rgba(59, 130, 246, 0.6))"
                  : chatState === "speaking"
                  ? "drop-shadow(0 0 40px rgba(168, 85, 247, 0.6))"
                  : "drop-shadow(0 0 20px rgba(139, 92, 246, 0.3))",
              }}
              transition={{ duration: 0.8 }}
            >
              <SiriOrb
                size={typeof window !== 'undefined' && window.innerWidth < 640 ? "200px" : "280px"}
                className="transition-all duration-500"
                isListening={chatState === "listening"}
                audioStream={chatState === "listening" ? mediaStream : null} // NOVO: Passar stream apenas quando a ouvir
                animationDuration={chatState === "listening" ? 6 : chatState === "speaking" ? 10 : 20}
                colors={{
                  c1: chatState === "listening" ? "oklch(78% 0.22 250)" : chatState === "speaking" ? "oklch(76% 0.20 280)" : "oklch(75% 0.15 300)",
                  c2: chatState === "listening" ? "oklch(82% 0.20 220)" : chatState === "speaking" ? "oklch(80% 0.18 260)" : "oklch(80% 0.12 280)",
                  c3: chatState === "listening" ? "oklch(80% 0.18 240)" : chatState === "speaking" ? "oklch(78% 0.19 300)" : "oklch(78% 0.14 290)",
                }}
              />
              
              {/* Ícone Central - TAMANHO RESPONSIVO */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                animate={{
                  scale: chatState === "listening" ? [1, 1.08, 1] : chatState === "speaking" ? [1, 1.05, 1] : 1,
                }}
                transition={{
                  duration: chatState === "listening" ? 1.2 : 2,
                  repeat: chatState === "listening" || chatState === "speaking" ? Infinity : 0,
                  ease: "easeInOut",
                }}
              >
                <AnimatePresence mode="wait">
                  {chatState === "connecting" ? (
                    <motion.div
                      key="connecting"
                      initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
                      animate={{ opacity: 1, scale: 1, rotate: 360 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ rotate: { duration: 1, repeat: Infinity, ease: "linear" } }}
                      className="w-14 h-14 sm:w-20 sm:h-20 border-[3px] border-white/20 border-t-white/80 rounded-full"
                    />
                  ) : (
                    <motion.div
                      key="mic"
                      initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Mic
                        size={chatState === "listening" ? (typeof window !== 'undefined' && window.innerWidth < 640 ? 64 : 88) : (typeof window !== 'undefined' && window.innerWidth < 640 ? 56 : 72)}
                        className={`transition-all duration-500 ${
                          chatState === "listening"
                            ? "text-blue-200 drop-shadow-[0_0_25px_rgba(59,130,246,0.9)]"
                            : chatState === "speaking"
                            ? "text-purple-200 drop-shadow-[0_0_25px_rgba(168,85,247,0.9)]"
                            : "text-white/95 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                        }`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </button>

          {/* Indicador de Áudio (Visualização de Ondas) - ULTRA-PREMIUM RESPONSIVO */}
          <AnimatePresence>
            {chatState === "speaking" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -bottom-14 sm:-bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2"
              >
                {[...Array(7)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 sm:w-1.5 rounded-full bg-gradient-to-t from-purple-500 via-pink-400 to-purple-300 shadow-lg shadow-purple-500/50"
                    animate={{
                      height: i === 3 ? ["20px", "48px", "20px"] : ["16px", "40px", "16px"],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.08,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Hint Text - ULTRA-PREMIUM RESPONSIVO */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
          className="text-gray-500 text-xs sm:text-sm mt-16 sm:mt-20 max-w-md mx-auto px-6 font-light leading-relaxed"
        >
          <motion.span
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {chatState === "idle" && "Toca no orbe para começar uma conversa por voz com a DUA"}
            {chatState === "listening" && "Fala naturalmente, a DUA está a ouvir com atenção"}
            {chatState === "speaking" && "A DUA está a responder, aguarda ou toca para interromper"}
            {chatState === "connecting" && "A estabelecer ligação segura com a DUA..."}
          </motion.span>
        </motion.p>
      </div>
    </motion.div>
  );
};

export default GeminiLiveVoiceChat;
