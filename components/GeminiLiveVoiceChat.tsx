"use client";

import { useGeminiLiveVoice } from "@/hooks/useGeminiLiveVoice";
import { X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GeminiLiveVoiceChatProps {
  onClose: () => void;
}

const GeminiLiveVoiceChat: React.FC<GeminiLiveVoiceChatProps> = ({ onClose }) => {
  const [audioQueue, setAudioQueue] = useState<Blob[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<Array<{role: "user" | "assistant", content: string, timestamp: Date}>>([]);
  const [autoStarted, setAutoStarted] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  const handleClose = () => {
    stopAudioCapture();
    closeSession();
    onClose();
  };

  const {
    initializeSession,
    startAudioCapture,
    stopAudioCapture,
    closeSession,
    isConnected,
    isRecording,
    isLoading,
    error,
  } = useGeminiLiveVoice({
    systemInstruction: `Você é um assistente de IA premium em português de Portugal. 
    Responda de forma natural, conversacional e concisa (máximo 2-3 frases).
    Mantenha o tom profissional mas amigável, similar ao ChatGPT.`,
    onMessage: (text) => {
      setMessages(prev => [...prev, {role: "assistant", content: text, timestamp: new Date()}]);
    },
    onAudio: (audioBlob) => {
      setAudioQueue((prev) => [...prev, audioBlob]);
    },
  });

  // Auto-iniciar sessão quando componente carrega (UX como ChatGPT)
  useEffect(() => {
    if (!autoStarted && !isLoading && !isConnected) {
      setAutoStarted(true);
      initializeSession().then(() => {
        // Auto-iniciar captura após conectar (mais fluido)
        setTimeout(() => {
          if (!isRecording) {
            startAudioCapture();
          }
        }, 1000);
      });
    }
  }, [autoStarted, isLoading, isConnected, initializeSession, startAudioCapture, isRecording]);

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

  // Core logic fix: Separate initialization and recording start
  // 1. Initialize session on component mount
  useEffect(() => {
    initializeSession();

    // Cleanup function to close session on unmount
    return () => {
      stopAudioCapture();
      closeSession();
    };
  }, [initializeSession, closeSession, stopAudioCapture]);

  // 2. Start audio capture only when connected
  useEffect(() => {
    if (isConnected) {
      // Short delay to ensure everything is ready
      const timer = setTimeout(() => {
        startAudioCapture();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, startAudioCapture]);


  // Determine orb state based on hook states
  const getOrbState = () => {
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

    return {
      outerRing: "",
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
            width: !isConnected ? "400px" : isRecording ? "600px" : "500px",
            height: !isConnected ? "400px" : isRecording ? "600px" : "500px",
            backgroundColor: !isConnected ? "rgba(234, 179, 8, 0.1)" : isRecording ? "rgba(59, 130, 246, 0.15)" : "rgba(168, 85, 247, 0.15)",
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
          className={`relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center transition-all duration-700 ${mainOrb}`}
        >
          {/* Inner glow */}
          <motion.div 
            className={`absolute inset-0 rounded-full transition-all duration-700 ${innerGlow}`}
          />
          
          {/* DUA logo */}
          <motion.div 
            className="relative text-white/80 font-bold text-6xl md:text-7xl tracking-widest"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            DUA
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Status Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-3">
        <motion.div
          className="w-2 h-2 rounded-full"
          animate={{ backgroundColor: isLoading ? "#eab308" : isConnected ? "#8b5cf6" : "#4b5563" }}
          transition={{ duration: 0.3 }}
        />
        <motion.div
          className="w-2 h-2 rounded-full"
          animate={{ backgroundColor: isRecording ? "#3b82f6" : "#4b5563" }}
          transition={{ duration: 0.3 }}
        />
        <motion.div
          className="w-2 h-2 rounded-full"
          animate={{ backgroundColor: error ? "#ef4444" : "#4b5563" }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <audio ref={audioPlayerRef} onEnded={handleAudioEnded} className="hidden" />
    </motion.div>
  );
};

export default GeminiLiveVoiceChat;
