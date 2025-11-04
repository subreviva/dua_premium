"use client";

import { useGeminiLiveAPI } from "@/hooks/useGeminiLiveAPI";
import { X } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GeminiLiveVoiceChatProps {
  onClose: () => void;
}

const GeminiLiveVoiceChat: React.FC<GeminiLiveVoiceChatProps> = ({ onClose }) => {
  const [audioQueue, setAudioQueue] = useState<Blob[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<Array<{role: "user" | "assistant", content: string, timestamp: Date}>>([]);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  const handleNewMessage = useCallback((text: string) => {
    setMessages(prev => [...prev, {role: "assistant", content: text, timestamp: new Date()}]);
  }, []);

  const handleNewAudio = useCallback((audioBlob: Blob) => {
    setAudioQueue(prev => [...prev, audioBlob]);
  }, []);

  const {
    connect,
    toggleRecording,
    stopAudioCapture,
    closeSession,
    isConnected,
    isRecording,
    isLoading,
    error,
  } = useGeminiLiveAPI({
    systemInstruction: `Você é um assistente de IA premium em português de Portugal. 
    Responda de forma natural, conversacional e concisa (máximo 2-3 frases).
    Mantenha o tom profissional mas amigável, similar ao ChatGPT.`,
    onMessage: handleNewMessage,
    onAudio: handleNewAudio,
  });

  // -- OTIMIZAÇÃO: Pré-aquecimento da Conexão --
  // Inicia a conexão com a API assim que o componente é montado para uma resposta instantânea ao clique.
  useEffect(() => {
    connect().catch(e => {
      // O erro já é tratado no hook e exposto no estado `error`.
      console.error("Falha na pré-conexão automática:", e);
    });

    // Garante que a sessão é fechada ao desmontar o componente.
    return () => {
      stopAudioCapture();
      closeSession();
    };
  }, [connect, closeSession, stopAudioCapture]);

  // -- REMOVIDA A LÓGICA "ALWAYS-ON" --
  // A ativação automática foi removida para cumprir as políticas de segurança dos navegadores,
  // que exigem um gesto do utilizador (clique) para iniciar a captura de áudio.
  // A conexão permanece pré-aquecida para garantir uma resposta instantânea quando o utilizador clicar.


  // Handle audio playback queue
  useEffect(() => {
    if (audioQueue.length > 0 && !isPlaying) {
      setIsPlaying(true);
      const nextAudio = audioQueue[0];
      const audioUrl = URL.createObjectURL(nextAudio);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = audioUrl;
        audioPlayerRef.current.play().catch(e => console.error("Audio play failed:", e));
      }
    }
  }, [audioQueue, isPlaying]);

  const handleAudioEnded = () => {
    URL.revokeObjectURL(audioPlayerRef.current?.src || "");
    setIsPlaying(false);
    setAudioQueue((prev) => prev.slice(1));
  };

  const handleClose = () => {
    stopAudioCapture();
    closeSession();
    onClose();
  };

  // Inicia/para a sessão de voz quando o utilizador clica na orb
  const handleOrbClick = async () => {
    // A conexão já foi (ou está a ser) estabelecida em segundo plano.
    // A única responsabilidade do clique é alternar a gravação de áudio.
    // Esta é a abordagem correta e segura, cumprindo as políticas de segurança dos navegadores.
    try {
      await toggleRecording();
    } catch (e) {
      // O hook `useGeminiLive` já define o estado de erro,
      // que será exibido na UI.
      console.error("Falha ao alternar a gravação:", e);
    }
  };


  // Determine orb state based on hook states
  const getOrbState = () => {
    if (isLoading) { // Adicionado estado de loading
      return {
        outerRing: "animate-spin",
        middleRing: "bg-yellow-500/10 blur-2xl",
        mainOrb: "bg-gradient-to-br from-yellow-600 to-yellow-800 shadow-[0_0_100px_rgba(234,179,8,0.4)]",
        innerGlow: "bg-gradient-to-br from-yellow-400 to-yellow-600 blur-3xl opacity-50",
      };
    }

    if (!isConnected) {
      return {
        outerRing: "animate-pulse",
        middleRing: "bg-yellow-500/10 blur-2xl",
        mainOrb: "bg-gradient-to-br from-yellow-600 to-yellow-800 shadow-[0_0_100px_rgba(234,179,8,0.4)]",
        innerGlow: "bg-gradient-to-br from-yellow-400 to-yellow-600 blur-3xl opacity-50",
      };
    }

    if (isRecording) {
      return {
        outerRing: "animate-ping",
        middleRing: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl animate-pulse",
        mainOrb: "bg-gradient-to-br from-blue-600 to-blue-900 shadow-[0_0_120px_rgba(59,130,246,0.5)] scale-105",
        innerGlow: "bg-gradient-to-br from-blue-400 to-blue-600 blur-3xl opacity-60 animate-pulse",
      };
    }

    // Estado "Pronto" - Conectado mas não a gravar
    return {
      outerRing: "animate-pulse",
      middleRing: "bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl",
      mainOrb: "bg-gradient-to-br from-purple-600 to-purple-900 shadow-[0_0_100px_rgba(168,85,247,0.5)]",
      innerGlow: "bg-gradient-to-br from-purple-400 to-purple-600 blur-3xl opacity-50",
    };
  };

  const { outerRing, middleRing, mainOrb, innerGlow } = getOrbState();

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center touch-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/10 to-black" />
      
      {/* Ambient glow - adapta ao estado */}
      <AnimatePresence>
        <motion.div 
          key={getOrbState().mainOrb} // Change key to trigger animation
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            width: isLoading ? "450px" : isRecording ? "600px" : "500px",
            height: isLoading ? "450px" : isRecording ? "600px" : "500px",
            backgroundColor: isLoading ? "rgba(234, 179, 8, 0.12)" : isRecording ? "rgba(59, 130, 246, 0.15)" : "rgba(168, 85, 247, 0.15)",
          }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </AnimatePresence>

      {/* Close button - minimal */}
      <motion.button
        onClick={handleClose}
        className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 transition-all duration-300 active:scale-95"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <X className="w-5 h-5 text-white/60" />
      </motion.button>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="absolute top-24 left-1/2 -translate-x-1/2 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className="font-semibold">Erro na Voz em Tempo Real</p>
            <p className="text-sm text-white/80">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main orb */}
      <motion.div 
        className="relative"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
      >
        {/* Outer pulse ring - só quando conectado e gravando */}
        <AnimatePresence>
          {isConnected && isRecording && (
            <motion.div 
              className="absolute inset-0 rounded-full bg-blue-500/20"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>
        
        {/* Middle glow ring */}
        <motion.div 
          className={`absolute -inset-8 md:-inset-12 rounded-full transition-all duration-700 ${middleRing}`}
        />
        
        {/* Main orb - responsive */}
        <motion.div 
          onClick={!isLoading ? handleOrbClick : undefined}
          role="button"
          tabIndex={0}
          aria-label={isLoading ? "A conectar..." : isRecording ? "Parar escuta" : "Iniciar escuta"}
          className={`relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center transition-all duration-700 ${mainOrb} ${isLoading ? 'cursor-wait' : 'cursor-pointer'}`}
        >
          {/* Inner glow */}
          <motion.div 
            className={`absolute inset-0 rounded-full transition-all duration-700 ${innerGlow}`}
          />
          
          {/* Icon */}
          <motion.div 
            className="relative z-10"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isLoading ? "loading" : isRecording ? "recording" : "idle"}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isLoading ? (
                  <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : isRecording ? (
                  <div className="w-16 h-16 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />
                ) : (
                  <svg className="w-16 h-16 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75-11.25a3.75 3.75 0 017.5 0v1.5a3.75 3.75 0 01-7.5 0v-1.5z" />
                  </svg>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Transcript display */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 p-8 overflow-y-auto h-full">
          {/* We can map messages here if we want to show a transcript */}
        </div>
      </div>

      {/* Audio player */}
      <audio ref={audioPlayerRef} onEnded={handleAudioEnded} className="hidden" />
    </motion.div>
  );
};

export default GeminiLiveVoiceChat;
