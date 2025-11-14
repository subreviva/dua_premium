"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  hasImage?: boolean;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  isActive: boolean;
  isArchived: boolean;
  messageCount: number;
  modelUsed?: string;
}

interface ChatStats {
  totalSessions: number;
  activeSessions: number;
  totalMessages: number;
  messagesToday: number;
  mostActiveSession?: {
    id: string;
    title: string;
    count: number;
  };
}

export function useChatSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // =====================================================
  // INICIALIZAÇÃO - Carregar usuário e sessão ativa
  // =====================================================
  useEffect(() => {
    const initializeChatSessions = async () => {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (!user) {
          console.warn('[CHAT SESSIONS] Usuário não autenticado');
          setIsLoading(false);
          return;
        }

        setUserId(user.id);
        console.log(`[CHAT SESSIONS] Inicializando para usuário: ${user.id.slice(0, 8)}`);

        // Carregar todas as sessões do usuário
        await loadUserSessions(user.id);

        // Verificar se existe sessão ativa
        const activeSession = await getActiveSession(user.id);
        
        if (activeSession) {
          console.log(`[CHAT SESSIONS] Sessão ativa encontrada: ${activeSession.id.slice(0, 8)}`);
          setCurrentSession(activeSession);
          await loadSessionMessages(activeSession.id);
        } else {
          // Criar nova sessão automaticamente
          console.log('[CHAT SESSIONS] Nenhuma sessão ativa, criando nova...');
          await createNewSession(user.id);
        }

      } catch (error) {
        console.error('[CHAT SESSIONS] Erro na inicialização:', error);
        toast.error('Erro ao carregar histórico de conversas');
      } finally {
        setIsLoading(false);
      }
    };

    initializeChatSessions();
  }, []);

  // =====================================================
  // CARREGAR SESSÕES DO USUÁRIO
  // =====================================================
  const loadUserSessions = async (uid: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('chat_sessions')
        .select('*')
        .eq('user_id', uid)
        .is('deleted_at', null)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedSessions: ChatSession[] = (data || []).map(s => ({
        id: s.id,
        userId: s.user_id,
        title: s.title,
        createdAt: new Date(s.created_at),
        updatedAt: new Date(s.updated_at),
        lastMessageAt: s.last_message_at ? new Date(s.last_message_at) : undefined,
        isActive: s.is_active,
        isArchived: s.is_archived,
        messageCount: s.message_count || 0,
        modelUsed: s.model_used,
      }));

      setSessions(mappedSessions);
      console.log(`[CHAT SESSIONS] Carregadas ${mappedSessions.length} sessões`);
      
      return mappedSessions;
    } catch (error) {
      console.error('[CHAT SESSIONS] Erro ao carregar sessões:', error);
      return [];
    }
  };

  // =====================================================
  // OBTER SESSÃO ATIVA
  // =====================================================
  const getActiveSession = async (uid: string): Promise<ChatSession | null> => {
    try {
      const { data, error } = await supabaseClient
        .from('chat_sessions')
        .select('*')
        .eq('user_id', uid)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Não encontrado
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        lastMessageAt: data.last_message_at ? new Date(data.last_message_at) : undefined,
        isActive: data.is_active,
        isArchived: data.is_archived,
        messageCount: data.message_count || 0,
        modelUsed: data.model_used,
      };
    } catch (error) {
      console.error('[CHAT SESSIONS] Erro ao obter sessão ativa:', error);
      return null;
    }
  };

  // =====================================================
  // CRIAR NOVA SESSÃO
  // =====================================================
  const createNewSession = async (uid?: string, title?: string): Promise<ChatSession | null> => {
    try {
      const targetUserId = uid || userId;
      if (!targetUserId) {
        console.error('[CHAT SESSIONS] Usuário não identificado');
        return null;
      }

      console.log('[CHAT SESSIONS] Criando nova sessão...');

      // Usar função SQL que desativa sessões anteriores automaticamente
      const { data, error } = await supabaseClient
        .rpc('create_new_chat_session', {
          p_user_id: targetUserId,
          p_title: title || 'Nova Conversa'
        });

      if (error) throw error;

      const sessionId = data;
      console.log(`[CHAT SESSIONS] Nova sessão criada: ${sessionId?.slice(0, 8)}`);

      // Recarregar sessões
      const updatedSessions = await loadUserSessions(targetUserId);
      const newSession = updatedSessions.find(s => s.id === sessionId);

      if (newSession) {
        setCurrentSession(newSession);
        setCurrentMessages([]);
        toast.success('Nova conversa iniciada');
        return newSession;
      }

      return null;
    } catch (error) {
      console.error('[CHAT SESSIONS] Erro ao criar sessão:', error);
      toast.error('Erro ao criar nova conversa');
      return null;
    }
  };

  // =====================================================
  // CARREGAR MENSAGENS DA SESSÃO
  // =====================================================
  const loadSessionMessages = async (sessionId: string) => {
    try {
      const { data, error } = await supabaseClient
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const mappedMessages: ChatMessage[] = (data || []).map(m => ({
        id: m.id,
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
        createdAt: new Date(m.created_at),
        hasImage: m.has_image,
        imageUrl: m.image_url,
        metadata: m.metadata,
      }));

      setCurrentMessages(mappedMessages);
      console.log(`[CHAT SESSIONS] Carregadas ${mappedMessages.length} mensagens da sessão ${sessionId.slice(0, 8)}`);
      
      return mappedMessages;
    } catch (error) {
      console.error('[CHAT SESSIONS] Erro ao carregar mensagens:', error);
      return [];
    }
  };

  // =====================================================
  // SALVAR MENSAGEM
  // =====================================================
  const saveMessage = async (
    role: 'user' | 'assistant',
    content: string,
    metadata?: Record<string, any>
  ): Promise<ChatMessage | null> => {
    try {
      if (!currentSession) {
        console.error('[CHAT SESSIONS] Nenhuma sessão ativa para salvar mensagem');
        return null;
      }

      setIsSaving(true);

      const { data, error } = await supabaseClient
        .from('chat_messages')
        .insert({
          session_id: currentSession.id,
          role,
          content,
          metadata: metadata || {},
          has_image: metadata?.imageUrl ? true : false,
          image_url: metadata?.imageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      const newMessage: ChatMessage = {
        id: data.id,
        role: data.role,
        content: data.content,
        createdAt: new Date(data.created_at),
        hasImage: data.has_image,
        imageUrl: data.image_url,
        metadata: data.metadata,
      };

      // Atualizar mensagens localmente
      setCurrentMessages(prev => [...prev, newMessage]);

      console.log(`[CHAT SESSIONS] Mensagem salva: ${data.id.slice(0, 8)}`);
      
      return newMessage;
    } catch (error) {
      console.error('[CHAT SESSIONS] Erro ao salvar mensagem:', error);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // =====================================================
  // SALVAR MÚLTIPLAS MENSAGENS (para migração/import)
  // =====================================================
  const saveMessages = async (messages: Array<{ role: 'user' | 'assistant'; content: string }>) => {
    try {
      if (!currentSession) {
        console.error('[CHAT SESSIONS] Nenhuma sessão ativa');
        return;
      }

      const messagesToInsert = messages.map(msg => ({
        session_id: currentSession.id,
        role: msg.role,
        content: msg.content,
        metadata: {},
      }));

      const { error } = await supabaseClient
        .from('chat_messages')
        .insert(messagesToInsert);

      if (error) throw error;

      // Recarregar mensagens
      await loadSessionMessages(currentSession.id);
      
      console.log(`[CHAT SESSIONS] ${messages.length} mensagens salvas em batch`);
    } catch (error) {
      console.error('[CHAT SESSIONS] Erro ao salvar múltiplas mensagens:', error);
    }
  };

  // =====================================================
  // TROCAR DE SESSÃO
  // =====================================================
  const switchSession = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (!session) {
        console.error('[CHAT SESSIONS] Sessão não encontrada:', sessionId);
        return;
      }

      console.log(`[CHAT SESSIONS] Trocando para sessão: ${sessionId.slice(0, 8)}`);

      // Desativar sessão atual
      if (currentSession) {
        await supabaseClient
          .from('chat_sessions')
          .update({ is_active: false })
          .eq('id', currentSession.id);
      }

      // Ativar nova sessão
      await supabaseClient
        .from('chat_sessions')
        .update({ is_active: true })
        .eq('id', sessionId);

      setCurrentSession(session);
      await loadSessionMessages(sessionId);

      // Atualizar lista de sessões
      if (userId) {
        await loadUserSessions(userId);
      }

      toast.success(`Conversa: ${session.title}`);
    } catch (error) {
      console.error('[CHAT SESSIONS] Erro ao trocar de sessão:', error);
      toast.error('Erro ao trocar de conversa');
    }
  };

  // =====================================================
  // RENOMEAR SESSÃO
  // =====================================================
  const renameSession = async (sessionId: string, newTitle: string) => {
    try {
      const { error } = await supabaseClient
        .from('chat_sessions')
        .update({ title: newTitle })
        .eq('id', sessionId);

      if (error) throw error;

      // Atualizar localmente
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? { ...s, title: newTitle } : s
      ));

      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, title: newTitle } : null);
      }

      console.log(`[CHAT SESSIONS] Sessão renomeada: ${newTitle}`);
      toast.success('Conversa renomeada');
    } catch (error) {
      console.error('[CHAT SESSIONS] Erro ao renomear sessão:', error);
      toast.error('Erro ao renomear conversa');
    }
  };

  // =====================================================
  // ARQUIVAR SESSÃO
  // =====================================================
  const archiveSession = async (sessionId: string) => {
    try {
      const { error } = await supabaseClient
        .from('chat_sessions')
        .update({ is_archived: true, is_active: false })
        .eq('id', sessionId);

      if (error) throw error;

      // Se arquivar a sessão atual, criar nova
      if (currentSession?.id === sessionId && userId) {
        await createNewSession(userId);
      }

      // Atualizar lista
      if (userId) {
        await loadUserSessions(userId);
      }

      toast.success('Conversa arquivada');
    } catch (error) {
      console.error('[CHAT SESSIONS] Erro ao arquivar sessão:', error);
      toast.error('Erro ao arquivar conversa');
    }
  };

  // =====================================================
  // DELETAR SESSÃO (soft delete)
  // =====================================================
  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabaseClient
        .from('chat_sessions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      // Se deletar a sessão atual, criar nova
      if (currentSession?.id === sessionId && userId) {
        await createNewSession(userId);
      }

      // Atualizar lista
      if (userId) {
        await loadUserSessions(userId);
      }

      toast.success('Conversa deletada');
    } catch (error) {
      console.error('[CHAT SESSIONS] Erro ao deletar sessão:', error);
      toast.error('Erro ao deletar conversa');
    }
  };

  // =====================================================
  // BUSCAR MENSAGENS
  // =====================================================
  const searchMessages = async (searchTerm: string) => {
    try {
      if (!userId || !searchTerm.trim()) return [];

      const { data, error } = await supabaseClient
        .rpc('search_chat_messages', {
          p_user_id: userId,
          p_search_term: searchTerm
        });

      if (error) throw error;

      console.log(`[CHAT SESSIONS] Busca retornou ${data?.length || 0} resultados`);
      
      return data || [];
    } catch (error) {
      console.error('[CHAT SESSIONS] Erro na busca:', error);
      return [];
    }
  };

  // =====================================================
  // OBTER ESTATÍSTICAS
  // =====================================================
  const getStats = async (): Promise<ChatStats | null> => {
    try {
      if (!userId) return null;

      const { data, error } = await supabaseClient
        .rpc('get_user_chat_stats', {
          p_user_id: userId
        });

      if (error) throw error;

      if (!data || data.length === 0) return null;

      const stats = data[0];
      
      return {
        totalSessions: Number(stats.total_sessions) || 0,
        activeSessions: Number(stats.active_sessions) || 0,
        totalMessages: Number(stats.total_messages) || 0,
        messagesToday: Number(stats.messages_today) || 0,
        mostActiveSession: stats.most_active_session_id ? {
          id: stats.most_active_session_id,
          title: stats.most_active_session_title,
          count: stats.most_active_session_count,
        } : undefined,
      };
    } catch (error) {
      console.error('[CHAT SESSIONS] Erro ao obter estatísticas:', error);
      return null;
    }
  };

  // =====================================================
  // LIMPAR MENSAGENS DA SESSÃO ATUAL
  // =====================================================
  const clearCurrentMessages = async () => {
    try {
      if (!currentSession) return;

      const { error } = await supabaseClient
        .from('chat_messages')
        .delete()
        .eq('session_id', currentSession.id);

      if (error) throw error;

      setCurrentMessages([]);
      toast.success('Mensagens limpas');
      
      console.log(`[CHAT SESSIONS] Mensagens da sessão ${currentSession.id.slice(0, 8)} limpas`);
    } catch (error) {
      console.error('[CHAT SESSIONS] Erro ao limpar mensagens:', error);
      toast.error('Erro ao limpar mensagens');
    }
  };

  // =====================================================
  // RETORNO DO HOOK
  // =====================================================
  return {
    // Estado
    sessions,
    currentSession,
    currentMessages,
    isLoading,
    isSaving,
    userId,

    // Ações de sessão
    createNewSession,
    switchSession,
    renameSession,
    archiveSession,
    deleteSession,

    // Ações de mensagens
    saveMessage,
    saveMessages,
    clearCurrentMessages,
    loadSessionMessages,

    // Utilidades
    searchMessages,
    getStats,
  };
}
