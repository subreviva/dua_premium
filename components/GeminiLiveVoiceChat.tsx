"use client";

import { useState, useRef, useEffect } from "react";
import { useGeminiLiveVoice } from "@/hooks/useGeminiLiveVoice";
import { X, Mic } from "lucide-react";

export default function GeminiLiveVoiceChat({ onClose }: { onClose: () => void }) {
  const [transcript, setTranscript] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);

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
    systemInstruction: `Você é o DUA, um assistente de IA premium e sofisticado. 
    Responda em português de Portugal de forma natural, concisa e elegante.
    Mantenha as respostas breves (1-2 frases) para uma experiência fluida em tempo real.`,
    language: "pt-PT",
    voiceName: "Aoede",
    onMessage: (message) => {
      setAiResponse(message);
      setTranscript("");
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

  // Determina o estado visual
  const getStatus = () => {
    if (error) return { text: "Erro na conexão", color: "text-red-400" };
    if (!isConnected) return { text: "A conectar...", color: "text-yellow-400" };
    if (isRecording && transcript) return { text: transcript, color: "text-blue-400" };
    if (aiResponse) return { text: aiResponse, color: "text-purple-400" };
    return { text: "A ouvir...", color: "text-green-400" };
  };

  const status = getStatus();

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/20 to-black" />
      
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] transition-all duration-1000 ${
            isRecording ? "bg-blue-500/20" : "bg-purple-500/20"
          }`}
        />
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-8 right-8 z-50 p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 transition-all duration-300 group"
      >
        <X className="w-6 h-6 text-white/70 group-hover:text-white transition-colors" />
      </button>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-12 px-8 max-w-4xl mx-auto">
        
        {/* Orb container */}
        <div className="relative">
          {/* Outer ring - pulses when listening */}
          <div 
            className={`absolute inset-0 rounded-full transition-all duration-700 ${
              isRecording 
                ? "scale-150 opacity-0 animate-ping bg-blue-500/30" 
                : "scale-100 opacity-0"
            }`}
          />
          
          {/* Middle ring */}
          <div 
            className={`absolute -inset-4 rounded-full transition-all duration-500 ${
              isRecording 
                ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl animate-pulse" 
                : "bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-xl"
            }`}
          />
          
          {/* Main orb */}
          <div 
            className={`relative w-64 h-64 rounded-full flex items-center justify-center transition-all duration-700 ${
              isRecording
                ? "bg-gradient-to-br from-blue-600 to-blue-800 shadow-[0_0_80px_rgba(59,130,246,0.5)]"
                : "bg-gradient-to-br from-purple-600 to-purple-900 shadow-[0_0_80px_rgba(168,85,247,0.5)]"
            }`}
          >
            {/* Inner glow */}
            <div className={`absolute inset-8 rounded-full transition-all duration-700 ${
              isRecording 
                ? "bg-gradient-to-br from-blue-400 to-blue-600 blur-2xl opacity-60 animate-pulse"
                : "bg-gradient-to-br from-purple-400 to-purple-600 blur-2xl opacity-60"
            }`} />
            
            {/* Logo text */}
            <span className="relative text-7xl font-bold text-white tracking-wider drop-shadow-2xl">
              DUA
            </span>
          </div>

          {/* Microphone indicator */}
          {isRecording && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 animate-in fade-in slide-in-from-bottom-4">
              <Mic className="w-4 h-4 text-blue-400 animate-pulse" />
              <span className="text-sm text-blue-300 font-medium">A ouvir</span>
            </div>
          )}
        </div>

        {/* Status text */}
        <div className="text-center space-y-3 max-w-2xl">
          <p className={`text-2xl font-medium transition-all duration-500 ${status.color} min-h-[32px]`}>
            {status.text}
          </p>
          
          {!isConnected && !error && (
            <p className="text-sm text-white/40 animate-pulse">
              A estabelecer conexão...
            </p>
          )}
          
          {error && (
            <p className="text-sm text-red-400/80">
              {error}
            </p>
          )}
        </div>

        {/* Subtle hint */}
        {isConnected && !error && (
          <p className="text-sm text-white/30 text-center animate-in fade-in duration-1000 delay-500">
            Fale naturalmente, o DUA está a ouvir
          </p>
        )}
      </div>

      {/* Audio element */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
