"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Verificar variáveis de ambiente
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis de ambiente Supabase não configuradas!', {
    hasUrl: !!SUPABASE_URL,
    hasKey: !!SUPABASE_ANON_KEY
  });
}

const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_ANON_KEY || ''
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

export interface ConversationGroup {
  name: string;
  order: number;
  conversations: Conversation[];
}

export type GroupedConversations = {
  hoje: Conversation[];
  ontem: Conversation[];
  semana: Conversation[];
  mes: Conversation[];
  antigos: Conversation[];
}

interface SupabaseConversation {
  id: string;
  user_id: string;
  title: string;
  model?: string;
  system_prompt?: string;
  message_count?: number;
  created_at: string;
  updated_at: string;
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
        await supabase.from('duaia_conversations').insert({
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
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          console.warn('⚠️  Erro ao obter sessão:', authError.message);
          loadConversationsFromLocalStorage();
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          setUserId(session.user.id);
          await loadConversationsFromSupabase(session.user.id);
        } else {
          loadConversationsFromLocalStorage();
          setIsLoading(false);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar usuário:', error);
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
      
      // Validar user ID
      if (!uid || uid.trim() === '') {
        console.warn('⚠️  User ID inválido, usando localStorage');
        loadConversationsFromLocalStorage();
        setIsLoading(false);
        return;
      }
      
      console.log('🔍 Carregando conversas do Supabase para user:', uid);
      
      const { data, error } = await supabase
        .from('duaia_conversations')
        .select('*')
        .eq('user_id', uid)
        .order('updated_at', { ascending: false });

      console.log('📦 Resposta do Supabase:', { hasData: !!data, hasError: !!error, dataLength: data?.length });

      if (error) {
        // Verificar se o erro é realmente um objeto vazio ou null
        const errorKeys = error ? Object.keys(error) : [];
        const isEmptyError = errorKeys.length === 0;
        
        if (isEmptyError) {
          console.warn('⚠️  Erro vazio retornado do Supabase (possível problema de RLS ou autenticação), usando localStorage');
          loadConversationsFromLocalStorage();
          return;
        }
        
        // PGRST205 = tabela não existe, silenciar erro e usar localStorage
        if (error.code === 'PGRST205') {
          console.warn('⚠️  Tabela duaia_conversations não existe no Supabase, usando localStorage');
        } else if (error.code === 'PGRST116') {
          console.warn('⚠️  Erro de permissão RLS no Supabase, usando localStorage');
        } else {
          // Log detalhado do erro para debug - acessando propriedades diretamente
          console.error('❌ Erro ao carregar conversas do Supabase:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            status: (error as any).status,
            statusText: (error as any).statusText
          });
          
          // Se é erro 400, pode ser problema com a query ou RLS
          if ((error as any).status === 400 || error.code?.startsWith('PGRST')) {
            console.warn('⚠️  Erro 400 do Supabase - possível problema de RLS ou query inválida');
          }
        }
        loadConversationsFromLocalStorage();
        return;
      }

      if (data && data.length > 0) {
        const formattedConversations = data.map((conv: SupabaseConversation) => ({
          id: conv.id,
          title: conv.title || 'Nova Conversa',
          messages: [], // Mensagens serão carregadas separadamente
          createdAt: new Date(conv.created_at),
          updatedAt: new Date(conv.updated_at),
          userId: conv.user_id,
          syncVersion: 1
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
    } catch (error: any) {
      console.error('❌ Erro ao carregar conversas:', {
        message: error?.message || 'Erro desconhecido',
        stack: error?.stack || 'N/A'
      });
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
        
        const { error } = await supabase.from('duaia_conversations').upsert({
          id: conv.id,
          user_id: userId,
          title: conv.title,
          messages: conv.messages,
          updated_at: conv.updatedAt.toISOString()
        });

        if (error) {
          // PGRST205 = tabela não existe, silenciar (localStorage já salva)
          if (error.code !== 'PGRST205') {
            console.error('❌ Erro ao sync:', error);
          }
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
        }
      }
    }
  }, [conversations, isLoading, currentConversationId, syncToSupabase]);

  // === CRUD OPERATIONS ===

  // Criar nova conversa
  const createNewConversation = useCallback(async (): Promise<string> => {
    const now = new Date();
    const newConv: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: 'Nova Conversa',
      messages: [],
      createdAt: now,
      updatedAt: now,
      userId: userId || undefined,
      syncVersion: 1
    };

    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    
    // Sync imediato para Supabase
    if (userId) {
      try {
        await supabase.from('duaia_conversations').insert({
          id: newConv.id,
          user_id: userId,
          title: newConv.title,
          messages: [],
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        });
        console.log('✅ Nova conversa criada no Supabase');
      } catch (error) {
        console.error('❌ Erro ao criar no Supabase:', error);
      }
    }
    
    toast.success('✨ Nova conversa iniciada');
    return newConv.id;
  }, [userId]);

  // Obter conversa atual
  const getCurrentConversation = useCallback((): Conversation | null => {
    if (!currentConversationId) return null;
    return conversations.find(c => c.id === currentConversationId) || null;
  }, [currentConversationId, conversations]);

  // Atualizar mensagens da conversa atual
  const updateCurrentConversation = useCallback((messages: ChatMessage[]) => {
    if (!currentConversationId) return;

    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversationId) {
        // Gerar título automaticamente se for a primeira mensagem
        let title = conv.title;
        if (messages.length === 1 && conv.title === 'Nova Conversa') {
          const firstMessage = messages[0];
          if (firstMessage.role === 'user') {
            title = firstMessage.content.substring(0, 50) + (firstMessage.content.length > 50 ? '...' : '');
          }
        }

        return {
          ...conv,
          messages,
          title,
          updatedAt: new Date(),
          syncVersion: (conv.syncVersion || 1) + 1
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

  // Deletar conversa (com undo)
  const deleteConversation = useCallback(async (id: string) => {
    const deleted = conversations.find(c => c.id === id);
    if (!deleted) return;

    // Guardar para undo
    setDeletedConversations(prev => [...prev, deleted]);

    // Remover da lista
    setConversations(prev => prev.filter(c => c.id !== id));
    
    // Se deletou a conversa atual, selecionar outra
    if (id === currentConversationId) {
      const remaining = conversations.filter(c => c.id !== id);
      if (remaining.length > 0) {
        setCurrentConversationId(remaining[0].id);
      } else {
        setCurrentConversationId(null);
      }
    }

    // Soft delete no Supabase
    if (userId) {
      try {
        await supabase.rpc('soft_delete_conversation', { conversation_id: id });
      } catch (error: any) {
        // PGRST205/PGRST202 = tabela/função não existe, silenciar (localStorage já deletou)
        if (error?.code !== 'PGRST205' && error?.code !== 'PGRST202') {
          console.error('❌ Erro ao deletar no Supabase:', error);
        }
      }
    }

    // Toast com Undo
    toast.success('🗑️ Conversa deletada', {
      action: {
        label: 'Desfazer',
        onClick: () => restoreConversation(id)
      },
      duration: 5000
    });

    // Auto-remover do undo após 5 segundos
    setTimeout(() => {
      setDeletedConversations(prev => prev.filter(c => c.id !== id));
    }, 5000);
  }, [conversations, currentConversationId, userId]);

  // Restaurar conversa (undo delete)
  const restoreConversation = useCallback(async (id: string) => {
    const conv = deletedConversations.find(c => c.id === id);
    if (!conv) return;

    // Restaurar na lista
    setConversations(prev => [conv, ...prev]);
    setDeletedConversations(prev => prev.filter(c => c.id !== id));

    // Restaurar no Supabase
    if (userId) {
      try {
        await supabase.rpc('restore_conversation', { conversation_id: id });
        toast.success('✅ Conversa restaurada');
      } catch (error: any) {
        // PGRST205/PGRST202 = tabela/função não existe, silenciar (localStorage já restaurou)
        if (error?.code !== 'PGRST205' && error?.code !== 'PGRST202') {
          console.error('❌ Erro ao restaurar no Supabase:', error);
        }
      }
    }
  }, [deletedConversations, userId]);

  // Renomear conversa
  const renameConversation = useCallback(async (id: string, newTitle: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === id ? { ...conv, title: newTitle, updatedAt: new Date() } : conv
    ));

    // Sync com Supabase
    if (userId) {
      try {
        await supabase
          .from('duaia_conversations')
          .update({ title: newTitle, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('user_id', userId);
      } catch (error) {
        console.error('❌ Erro ao renomear no Supabase:', error);
      }
    }
  }, [userId]);

  // Limpar todas as conversas
  const clearAllConversations = useCallback(async () => {
    if (!confirm('⚠️ Tem certeza que deseja deletar TODAS as conversas? Esta ação não pode ser desfeita.')) {
      return;
    }

    setConversations([]);
    setCurrentConversationId(null);
    localStorage.removeItem('dua-conversations');
    localStorage.removeItem('dua-current-conversation');

    // Deletar todas no Supabase
    if (userId) {
      try {
        await supabase
          .from('duaia_conversations')
          .delete()
          .eq('user_id', userId);
        toast.success('🧹 Todas conversas deletadas');
      } catch (error) {
        console.error('❌ Erro ao limpar Supabase:', error);
      }
    }
  }, [userId]);

  // Obter mensagens da conversa atual
  const getCurrentMessages = useCallback((): ChatMessage[] => {
    const current = getCurrentConversation();
    return current?.messages || [];
  }, [getCurrentConversation]);

  // Export conversations (GDPR)
  const exportConversations = useCallback(() => {
    const dataStr = JSON.stringify({
      exported_at: new Date().toISOString(),
      user_id: userId,
      total_conversations: conversations.length,
      conversations: conversations.map(conv => ({
        id: conv.id,
        title: conv.title,
        messages: conv.messages,
        created_at: conv.createdAt,
        updated_at: conv.updatedAt,
        message_count: conv.messages.length
      }))
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `dua-conversations-${new Date().toISOString()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('📦 Conversas exportadas!');
  }, [conversations, userId]);

  // Agrupar conversas por data (client-side)
  const groupConversationsByDate = useCallback((): GroupedConversations => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const grouped: GroupedConversations = {
      hoje: [],
      ontem: [],
      semana: [],
      mes: [],
      antigos: []
    };

    conversations.forEach(conv => {
      const convDate = new Date(conv.updatedAt);
      const convDay = new Date(convDate.getFullYear(), convDate.getMonth(), convDate.getDate());

      if (convDay.getTime() === today.getTime()) {
        grouped.hoje.push(conv);
      } else if (convDay.getTime() === yesterday.getTime()) {
        grouped.ontem.push(conv);
      } else if (convDate >= sevenDaysAgo) {
        grouped.semana.push(conv);
      } else if (convDate >= thirtyDaysAgo) {
        grouped.mes.push(conv);
      } else {
        grouped.antigos.push(conv);
      }
    });

    return grouped;
  }, [conversations]);

  return {
    conversations,
    currentConversationId,
    isLoading,
    isSyncing,
    getCurrentConversation,
    getCurrentMessages,
    createNewConversation,
    updateCurrentConversation,
    selectConversation,
    deleteConversation,
    restoreConversation,
    renameConversation,
    clearAllConversations,
    exportConversations,
    groupConversationsByDate
  };
}
