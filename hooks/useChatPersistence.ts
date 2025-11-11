"use client";

import { useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

export function useChatPersistence() {
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // ⚡ CRITICAL FIX: Usar user ID para separar conversas por usuário
  const getStorageKey = (userId: string | null) => {
    if (!userId) return null;
    return `dua-chat-history-${userId}`; // ✅ Chave ÚNICA por usuário
  };

  // Carregar mensagens uma única vez ao montar
  useEffect(() => {
    const loadUserMessages = async () => {
      try {
        // ✅ Obter usuário autenticado
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (!user) {
          console.warn('[CHAT] Usuário não autenticado');
          setIsLoaded(true);
          return;
        }

        setCurrentUserId(user.id);
        const storageKey = getStorageKey(user.id);
        
        if (!storageKey) {
          setIsLoaded(true);
          return;
        }

        // ✅ Carregar mensagens específicas deste usuário
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setInitialMessages(parsed);
          console.log(`[CHAT] Carregadas ${parsed.length} mensagens do usuário ${user.id.slice(0, 8)}`);
        }
      } catch (error) {
        console.error('[CHAT] Erro ao carregar histórico:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadUserMessages();
  }, []);

  // Salvar mensagens automaticamente
  const saveMessages = (messages: ChatMessage[]) => {
    if (messages.length > 0 && currentUserId) {
      try {
        const storageKey = getStorageKey(currentUserId);
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(messages));
          console.log(`[CHAT] Salvadas ${messages.length} mensagens do usuário ${currentUserId.slice(0, 8)}`);
        }
      } catch (error) {
        console.error('[CHAT] Erro ao salvar histórico:', error);
      }
    }
  };

  // Limpar histórico APENAS do usuário atual
  const clearHistory = () => {
    try {
      if (currentUserId) {
        const storageKey = getStorageKey(currentUserId);
        if (storageKey) {
          localStorage.removeItem(storageKey);
          setInitialMessages([]);
          console.log(`[CHAT] Histórico limpo do usuário ${currentUserId.slice(0, 8)}`);
        }
      }
    } catch (error) {
      console.error('[CHAT] Erro ao limpar histórico:', error);
    }
  };

  return { initialMessages, isLoaded, saveMessages, clearHistory };
}
