"use client";

import { useEffect, useState } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

export function useChatPersistence() {
  const STORAGE_KEY = 'dua-chat-history';
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar mensagens uma única vez ao montar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setInitialMessages(parsed);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Salvar mensagens automaticamente
  const saveMessages = (messages: ChatMessage[]) => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  };

  // Limpar histórico
  const clearHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setInitialMessages([]);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  return { initialMessages, isLoaded, saveMessages, clearHistory };
}
