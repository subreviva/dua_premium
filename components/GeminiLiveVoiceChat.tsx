'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGeminiLiveVoice } from '@/hooks/useGeminiLiveVoice';
import { Mic, MicOff, Bot, User, Loader, AlertTriangle, Play, StopCircle, X } from 'lucide-react';

// --- Tipos ---
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  isFinal: boolean;
};

// --- Componentes de UI ---

const IconButton: React.FC<{
  onClick: () => void;
  Icon: React.ElementType;
  label: string;
  className?: string;
  disabled?: boolean;
}> = ({ onClick, Icon, label, className = '', disabled = false }) => (
  <button
    onClick={onClick}
    aria-label={label}
    disabled={disabled}
    className={`p-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className} ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
    }`}
  >
    <Icon className="w-6 h-6" />
  </button>
);

const StatusIndicator: React.FC<{ state: string }> = ({ state }) => {
  const stateInfo = {
    idle: { text: 'Inativo', color: 'bg-gray-500' },
    listening: { text: 'A ouvir...', color: 'bg-green-500 animate-pulse' },
    processing: { text: 'A processar...', color: 'bg-yellow-500' },
    speaking: { text: 'A falar...', color: 'bg-blue-500' },
    error: { text: 'Erro', color: 'bg-red-500' },
  };
  const { text, color } = stateInfo[state as keyof typeof stateInfo] || stateInfo.idle;

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-400">
      <span className={`w-3 h-3 rounded-full ${color}`}></span>
      <span>{text}</span>
    </div>
  );
};

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.sender === 'user';
  const bubbleClass = isUser
    ? 'bg-blue-600 text-white self-end rounded-br-none'
    : 'bg-gray-700 text-gray-200 self-start rounded-bl-none';
  const opacityClass = message.isFinal ? 'opacity-100' : 'opacity-60';

  return (
    <div
      className={`flex items-start gap-3 max-w-xl w-fit p-3 rounded-xl shadow-md transition-opacity duration-300 ${bubbleClass} ${opacityClass}`}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>
      <p className="py-1">{message.text}</p>
    </div>
  );
};

// --- Componente Principal ---

const GeminiLiveVoiceChat: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const transcriptRef = useRef('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleTranscript = (transcript: string, isFinal: boolean) => {
    transcriptRef.current = transcript;
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage?.sender === 'user' && !lastMessage.isFinal) {
        // Atualiza a última mensagem do utilizador
        return [...prev.slice(0, -1), { ...lastMessage, text: transcript, isFinal }];
      } else {
        // Adiciona uma nova mensagem do utilizador
        return [...prev, { id: `user-${Date.now()}`, text: transcript, sender: 'user', isFinal }];
      }
    });
  };

  const {
    sessionState,
    error,
    isMuted,
    startSession,
    stopSession,
    toggleMute,
  } = useGeminiLiveVoice({
    projectId: process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID || '',
    onTranscript: handleTranscript,
    onError: (e) => console.error('Erro na sessão de voz:', e),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isSessionActive = sessionState !== 'idle' && sessionState !== 'error';

  return (
    <div className="absolute inset-0 flex flex-col bg-gray-900 text-white font-sans z-50">
      <header className="flex items-center justify-between p-4 border-b border-gray-800 shadow-lg">
        <h1 className="text-xl font-bold text-center flex-1">Duaa.i - Gemini Real-Time</h1>
        <IconButton
          onClick={onClose}
          Icon={X}
          label="Fechar Chat de Voz"
          className="bg-gray-700 hover:bg-gray-600"
        />
      </header>

      <main className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        {error && (
          <div className="flex items-center justify-center p-2 mb-2 bg-red-900/50 text-red-300 rounded-lg">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <p className="text-sm">{error.message}</p>
          </div>
        )}

        <div className="flex items-center justify-center space-x-4">
          <StatusIndicator state={sessionState} />

          <IconButton
            onClick={isSessionActive ? stopSession : startSession}
            Icon={isSessionActive ? StopCircle : Play}
            label={isSessionActive ? 'Parar Sessão' : 'Iniciar Sessão'}
            className={isSessionActive ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}
          />

          <IconButton
            onClick={toggleMute}
            Icon={isMuted ? MicOff : Mic}
            label={isMuted ? 'Ativar Microfone' : 'Desativar Microfone'}
            className={isMuted ? 'bg-yellow-600' : 'bg-gray-600'}
            disabled={!isSessionActive}
          />
        </div>
        <p className="text-xs text-center text-gray-500 mt-3">
          {sessionState === 'listening' ? 'Pode começar a falar...' : 'Clique em Iniciar para começar.'}
        </p>
      </footer>
    </div>
  );
};

export default GeminiLiveVoiceChat;
