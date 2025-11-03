"use client";

import { useState, useRef, useEffect } from "react";
import { useGeminiLiveVoice } from "@/hooks/useGeminiLiveVoice";
import { X } from "lucide-react";

export default function GeminiLiveVoiceChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string; timestamp: Date }>
  >([]);
  const [inputText, setInputText] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    initializeSession,
    sendText,
    startAudioCapture,
    stopAudioCapture,
    closeSession,
    isConnected,
    isRecording,
    isLoading,
    error,
    metrics,
  } = useGeminiLiveVoice({
    systemInstruction: `Você é um assistente amigável e profissional do DUA AI, 
    uma plataforma premium de IA. Responda em português de Portugal de forma natural e conversacional.
    Mantenha as respostas concisas (máximo 2-3 frases) para melhor experiência em tempo real.`,
    language: "pt-PT",
    voiceName: "Aoede",
    onMessage: (message) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: message, timestamp: new Date() },
      ]);
    },
    onAudio: (audioBlob) => {
      if (audioRef.current) {
        const url = URL.createObjectURL(audioBlob);
        audioRef.current.src = url;
        audioRef.current.play().catch((e) => console.error("Erro ao reproduzir:", e));
      }
    },
  });

  // Auto-scroll para última mensagem
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Inicializar sessão ao montar
  useEffect(() => {
    if (sessionActive && !isConnected && !isLoading) {
      initializeSession();
    }
  }, [sessionActive, isConnected, isLoading, initializeSession]);

  // Handlers
  const handleSendText = async () => {
    if (!inputText.trim() || !isConnected) return;

    const text = inputText;
    setInputText("");

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, timestamp: new Date() },
    ]);

    await sendText(text);
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopAudioCapture();
    } else {
      await startAudioCapture();
    }
  };

  const handleStartSession = async () => {
    setSessionActive(true);
    setMessages([]);
  };

  const handleEndSession = () => {
    closeSession();
    setSessionActive(false);
    onClose();
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-black text-white font-sans z-50">
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 pb-4 border-b border-purple-500/30">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            DUA AI Voice Chat
          </h1>
          <p className="text-sm text-gray-400 mt-1">Native Audio em Português de Portugal</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Connection */}
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full transition-all ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-xs font-medium">
              {isConnected ? "Conectado" : "Desconectado"}
            </span>
          </div>

          {/* Custo Estimado */}
          <div className="text-xs bg-blue-900/50 px-3 py-1 rounded-full">
            💰 ${metrics.estimatedCost.toFixed(4)}
          </div>

          {/* Botão Fechar */}
          <button
            onClick={handleEndSession}
            className="p-2 hover:bg-gray-700 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* SESSION CONTROL */}
      {!sessionActive ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl">🎙️</div>
            <h2 className="text-2xl font-bold text-white">Inicia uma Conversa</h2>
            <p className="text-gray-400 max-w-md">
              Conversa em tempo real com IA usando voz natural em português
            </p>
            <button
              onClick={handleStartSession}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition"
            >
              Iniciar Sessão
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* CHAT MESSAGES */}
          <div className="flex-1 overflow-y-auto bg-black/40 rounded-lg p-4 m-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Inicia uma conversa falando ou digitando uma mensagem...</p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-purple-600 text-white"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString("pt-PT")}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* INPUT CONTROLS */}
          <div className="p-4 space-y-3">
            {/* Texto */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendText()}
                placeholder="Escreve uma mensagem..."
                disabled={!isConnected || isLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white placeholder-gray-400 border border-purple-500/50 focus:border-purple-500 transition disabled:opacity-50"
              />
              <button
                onClick={handleSendText}
                disabled={!isConnected || isLoading || !inputText.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                Enviar
              </button>
            </div>

            {/* Controles de Áudio */}
            <div className="flex gap-2">
              <button
                onClick={handleToggleRecording}
                disabled={!isConnected}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold text-white transition ${
                  isRecording
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-purple-600 hover:bg-purple-700"
                } disabled:opacity-50`}
              >
                {isRecording ? (
                  <>
                    <span className="inline-block animate-pulse">●</span> Parar Gravação
                  </>
                ) : (
                  <>🎤 Iniciar Fala</>
                )}
              </button>

              <button
                onClick={handleEndSession}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition"
              >
                Terminar
              </button>
            </div>

            {/* Informações */}
            <div className="text-xs text-gray-400 flex justify-between">
              <span>
                {isLoading ? "🔄 Conectando..." : isRecording ? "🎤 Gravando..." : ""}
              </span>
              <span>
                Tokens: {metrics.totalTokens} | Custo: ${metrics.estimatedCost.toFixed(4)}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Audio Hidden */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
