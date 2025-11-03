"use client";

import { useState, useRef, useEffect } from "react";
import { useGeminiLiveVoice } from "@/hooks/useGeminiLiveVoice";
import { X } from "lucide-react";

export default function GeminiLiveVoiceChat({ onClose }: { onClose: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    initializeSession,
    startAudioCapture,
    stopAudioCapture,
    closeSession,
    isConnected,
    isRecording,
    error,
  } = useGeminiLiveVoice({
    systemInstruction: `Você é o DUA, um assistente de IA premium e sofisticado. 
    Responda em português de Portugal de forma natural, concisa e elegante.
    Mantenha as respostas breves (1-2 frases) para uma experiência fluida em tempo real.`,
    language: "pt-PT",
    voiceName: "Aoede",
    onMessage: () => {
      // Apenas recebe a mensagem, sem exibir texto
    },
    onAudio: (audioBlob) => {
      if (audioRef.current) {
        const url = URL.createObjectURL(audioBlob);
        audioRef.current.src = url;
        audioRef.current.play().catch((e) => console.error("Erro ao reproduzir:", e));
      }
    },
  });

  // Auto inicializa a sessão e começa a gravar
  useEffect(() => {
    const init = async () => {
      await initializeSession();
      setTimeout(async () => {
        await startAudioCapture();
      }, 1000);
    };
    init();

    return () => {
      stopAudioCapture();
      closeSession();
    };
  }, []);

  const handleClose = () => {
    stopAudioCapture();
    closeSession();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center touch-none">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/10 to-black" />
      
      {/* Ambient glow - adapta ao estado */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px] transition-all duration-1000 ${
            !isConnected 
              ? "w-[400px] h-[400px] bg-yellow-500/10"
              : isRecording 
                ? "w-[600px] h-[600px] bg-blue-500/15 animate-pulse" 
                : "w-[500px] h-[500px] bg-purple-500/15"
          }`}
        />
      </div>

      {/* Close button - minimal */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 transition-all duration-300 active:scale-95"
      >
        <X className="w-5 h-5 text-white/60" />
      </button>

      {/* Main orb */}
      <div className="relative">
        {/* Outer pulse ring - só quando conectado e gravando */}
        {isConnected && isRecording && (
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
        )}
        
        {/* Middle glow ring */}
        <div 
          className={`absolute -inset-8 md:-inset-12 rounded-full transition-all duration-700 ${
            !isConnected
              ? "bg-yellow-500/10 blur-2xl"
              : isRecording 
                ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl animate-pulse" 
                : "bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"
          }`}
        />
        
        {/* Main orb - responsive */}
        <div 
          className={`relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center transition-all duration-700 ${
            !isConnected
              ? "bg-gradient-to-br from-yellow-600 to-yellow-800 shadow-[0_0_100px_rgba(234,179,8,0.4)]"
              : isRecording
                ? "bg-gradient-to-br from-blue-600 to-blue-900 shadow-[0_0_120px_rgba(59,130,246,0.5)] scale-105"
                : "bg-gradient-to-br from-purple-600 to-purple-900 shadow-[0_0_100px_rgba(168,85,247,0.5)]"
          }`}
        >
          {/* Inner glow */}
          <div className={`absolute inset-8 md:inset-12 rounded-full transition-all duration-700 ${
            !isConnected
              ? "bg-gradient-to-br from-yellow-400 to-yellow-600 blur-3xl opacity-50"
              : isRecording 
                ? "bg-gradient-to-br from-blue-400 to-blue-600 blur-3xl opacity-60 animate-pulse"
                : "bg-gradient-to-br from-purple-400 to-purple-600 blur-3xl opacity-50"
          }`} />
          
          {/* Logo text - responsive */}
          <span className="relative text-6xl sm:text-7xl md:text-8xl font-bold text-white tracking-wider drop-shadow-2xl">
            DUA
          </span>

          {/* Connection status indicator - minimal dot */}
          {!isConnected && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animation-delay-150" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animation-delay-300" />
            </div>
          )}

          {/* Error indicator */}
          {error && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Audio element */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
