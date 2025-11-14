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
          try {
            const parsed = JSON.parse(saved);
            // 🔧 FILTRAR mensagens inválidas ou de sistema
            const validMessages = parsed.filter((msg: any) => {
              // Remover qualquer mensagem que não seja do user ou assistant
              if (msg.role !== 'user' && msg.role !== 'assistant') return false;
              // Remover mensagens vazias
              if (!msg.content || msg.content.trim() === '') return false;
              // Remover mensagens de boas-vindas automáticas
              if (msg.content.includes('Tava a sonhar') || msg.content.includes('beat perfeito')) return false;
              return true;
            });
            
            setInitialMessages(validMessages);
            console.log(`[CHAT] Carregadas ${validMessages.length} mensagens válidas do usuário ${user.id.slice(0, 8)}`);
            
            // Se filtramos mensagens, atualizar o storage
            if (validMessages.length !== parsed.length) {
              localStorage.setItem(storageKey, JSON.stringify(validMessages));
              console.log(`[CHAT] Removidas ${parsed.length - validMessages.length} mensagens inválidas`);
            }
          } catch (error) {
            console.error('[CHAT] Erro ao parsear mensagens, limpando:', error);
            localStorage.removeItem(storageKey);
          }
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
        // 🔧 FILTRAR mensagens inválidas antes de salvar
        const validMessages = messages.filter((msg: any) => {
          // Remover qualquer mensagem que não seja do user ou assistant
          if (msg.role !== 'user' && msg.role !== 'assistant') return false;
          // Remover mensagens vazias
          if (!msg.content || msg.content.trim() === '') return false;
          // Remover mensagens de boas-vindas automáticas
          if (msg.content.includes('Tava a sonhar') || msg.content.includes('beat perfeito')) return false;
          return true;
        });
        
        const storageKey = getStorageKey(currentUserId);
        if (storageKey && validMessages.length > 0) {
          localStorage.setItem(storageKey, JSON.stringify(validMessages));
          console.log(`[CHAT] Salvadas ${validMessages.length} mensagens válidas do usuário ${currentUserId.slice(0, 8)}`);
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
