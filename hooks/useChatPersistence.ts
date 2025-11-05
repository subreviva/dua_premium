"use client";

import { useEffect } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

export function useChatPersistence(messages: ChatMessage[]) {
  const STORAGE_KEY = 'dua-chat-history';

  // Carregar mensagens ao montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    return [];
  }, []);

  // Salvar mensagens automaticamente
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  }, [messages]);

  // Limpar histórico
  const clearHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  return { clearHistory };
}
