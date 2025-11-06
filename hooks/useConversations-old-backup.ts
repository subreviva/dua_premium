"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  syncVersion?: number;
}

interface SupabaseConversation {
  id: string;
  user_id: string;
  title: string;
  messages: any[];
  created_at: string;
  updated_at: string;
  sync_version: number;
  deleted_at: string | null;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [deletedConversations, setDeletedConversations] = useState<Conversation[]>([]);

  // === HELPER FUNCTIONS ===

  const saveToLocalStorage = (convs: Conversation[]) => {
    try {
      localStorage.setItem('dua-conversations', JSON.stringify(convs));
      if (currentConversationId) {
        localStorage.setItem('dua-current-conversation', currentConversationId);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar no localStorage:', error);
    }
  };

  const loadConversationsFromLocalStorage = (): boolean => {
    try {
      const saved = localStorage.getItem('dua-conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        const conversationsWithDates = parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date()
          }))
        }));
        
        setConversations(conversationsWithDates);
        
        // Restaurar conversa atual
        const currentId = localStorage.getItem('dua-current-conversation');
        if (currentId && conversationsWithDates.find((c: Conversation) => c.id === currentId)) {
          setCurrentConversationId(currentId);
        } else if (conversationsWithDates.length > 0) {
          setCurrentConversationId(conversationsWithDates[0].id);
        }
        
        console.log(`📱 ${conversationsWithDates.length} conversas carregadas do localStorage`);
        return conversationsWithDates.length > 0;
      }
      return false;
    } catch (error) {
      console.error('❌ Erro ao carregar do localStorage:', error);
      return false;
    }
  };

  // Migrar conversas do localStorage para Supabase
  const migrateLocalToSupabase = async (uid: string) => {
    try {
      setIsSyncing(true);
      const saved = localStorage.getItem('dua-conversations');
      if (!saved) return;

      const parsed = JSON.parse(saved);
      console.log(`🔄 Migrando ${parsed.length} conversas para Supabase...`);

      for (const conv of parsed) {
        await supabase.from('conversations').insert({
          id: conv.id,
          user_id: uid,
          title: conv.title,
          messages: conv.messages,
          created_at: conv.createdAt,
          updated_at: conv.updatedAt
        });
      }

      console.log('✅ Migração concluída!');
      toast.success('Conversas sincronizadas com a nuvem!');
    } catch (error) {
      console.error('❌ Erro na migração:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // === CARREGAR CONVERSAS ===

  // Carregar user ID e iniciar sync
  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        await loadConversationsFromSupabase(session.user.id);
      } else {
        loadConversationsFromLocalStorage();
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  // Carregar conversas do Supabase (Priority 1)
  const loadConversationsFromSupabase = async (uid: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', uid)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar do Supabase:', error);
        loadConversationsFromLocalStorage();
        return;
      }

      if (data && data.length > 0) {
        const formattedConversations = data.map((conv: SupabaseConversation) => ({
          id: conv.id,
          title: conv.title,
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            createdAt: new Date(msg.createdAt || msg.created_at)
          })),
          createdAt: new Date(conv.created_at),
          updatedAt: new Date(conv.updated_at),
          userId: conv.user_id,
          syncVersion: conv.sync_version
        }));

        setConversations(formattedConversations);
        saveToLocalStorage(formattedConversations);
        
        // Restaurar conversa atual
        const currentId = localStorage.getItem('dua-current-conversation');
        if (currentId && formattedConversations.find((c: Conversation) => c.id === currentId)) {
          setCurrentConversationId(currentId);
        } else if (formattedConversations.length > 0) {
          setCurrentConversationId(formattedConversations[0].id);
        }
        
        console.log(`✅ ${data.length} conversas carregadas do Supabase`);
      } else {
        // Sem conversas no Supabase, tentar localStorage
        const hasLocal = loadConversationsFromLocalStorage();
        if (hasLocal) {
          await migrateLocalToSupabase(uid);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);
      loadConversationsFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // === SYNC COM SUPABASE ===

  // Sync conversa para Supabase (debounced)
  const syncToSupabase = useCallback(async (conv: Conversation) => {
    if (!userId) return;

    // Debounce: aguardar 2 segundos de inatividade
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSyncing(true);
        
        const { error } = await supabase.from('conversations').upsert({
          id: conv.id,
          user_id: userId,
          title: conv.title,
          messages: conv.messages,
          updated_at: conv.updatedAt.toISOString()
        });

        if (error) {
          console.error('❌ Erro ao sync:', error);
        } else {
          console.log(`✅ Conversa ${conv.id} sincronizada`);
        }
      } catch (error) {
        console.error('❌ Erro no sync:', error);
      } finally {
        setIsSyncing(false);
      }
    }, 2000);
  }, [userId]);

  // Auto-sync quando conversas mudam
  useEffect(() => {
    if (!isLoading && conversations.length > 0) {
      // Salvar localmente
      saveToLocalStorage(conversations);
      
      // Sync com Supabase (última conversa modificada)
      if (currentConversationId) {
        const current = conversations.find(c => c.id === currentConversationId);
        if (current) {
          syncToSupabase(current);
            title = firstMessage.content.substring(0, 50) + (firstMessage.content.length > 50 ? '...' : '');
          }
        }

        return {
          ...conv,
          messages,
          title,
          updatedAt: new Date()
        };
      }
      return conv;
    }));
  }, [currentConversationId]);

  // Selecionar conversa
  const selectConversation = useCallback((id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setCurrentConversationId(id);
      localStorage.setItem('dua-current-conversation', id);
    }
  }, [conversations]);

  // Deletar conversa
  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      
      // Se deletou a conversa atual, selecionar a primeira disponível
      if (id === currentConversationId) {
        if (filtered.length > 0) {
          setCurrentConversationId(filtered[0].id);
        } else {
          setCurrentConversationId(null);
        }
      }
      
      return filtered;
    });

    toast.success('🗑️ Conversa deletada');
  }, [currentConversationId]);

  // Renomear conversa
  const renameConversation = useCallback((id: string, newTitle: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === id ? { ...conv, title: newTitle, updatedAt: new Date() } : conv
    ));
  }, []);

  // Limpar todas as conversas
  const clearAllConversations = useCallback(() => {
    setConversations([]);
    setCurrentConversationId(null);
    localStorage.removeItem('dua-conversations');
    localStorage.removeItem('dua-current-conversation');
    toast.success('🧹 Histórico limpo');
  }, []);

  // Obter mensagens da conversa atual
  const getCurrentMessages = useCallback((): ChatMessage[] => {
    const current = getCurrentConversation();
    return current?.messages || [];
  }, [getCurrentConversation]);

  return {
    conversations,
    currentConversationId,
    isLoading,
    getCurrentConversation,
    getCurrentMessages,
    createNewConversation,
    updateCurrentConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    clearAllConversations
  };
}
