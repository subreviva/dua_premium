-- =====================================================
-- 💬 SISTEMA DE CHAT COM HISTÓRICO E SESSÕES
-- =====================================================
-- Criado: 2024-11-14
-- Propósito: Sistema completo de chat com histórico persistente
-- Features: Múltiplas sessões, histórico completo, busca, auto-criação no login
-- =====================================================

-- Garantir extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca full-text

-- =====================================================
-- 1. TABELA: chat_sessions
-- =====================================================
-- Gerencia sessões de chat (conversas)

CREATE TABLE IF NOT EXISTS public.chat_sessions (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Informações da sessão
    title TEXT NOT NULL DEFAULT 'Nova Conversa',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    
    -- Metadata
    message_count INTEGER NOT NULL DEFAULT 0,
    model_used TEXT DEFAULT 'gemini-1.5-flash',
    
    -- Soft delete
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    
    -- Full-text search
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('portuguese', coalesce(title, ''))
    ) STORED,
    
    -- Constraints
    CONSTRAINT valid_title CHECK (char_length(title) > 0 AND char_length(title) <= 500)
);

-- =====================================================
-- 2. TABELA: chat_messages
-- =====================================================
-- Armazena todas as mensagens de todas as sessões

CREATE TABLE IF NOT EXISTS public.chat_messages (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    
    -- Conteúdo
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Metadata opcional (JSON para flexibilidade)
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Para imagens/anexos
    has_image BOOLEAN NOT NULL DEFAULT false,
    image_url TEXT,
    
    -- Full-text search
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('portuguese', coalesce(content, ''))
    ) STORED,
    
    -- Constraints
    CONSTRAINT valid_content CHECK (char_length(content) > 0),
    CONSTRAINT valid_metadata CHECK (jsonb_typeof(metadata) = 'object')
);

-- =====================================================
-- 3. INDEXES PARA PERFORMANCE
-- =====================================================

-- chat_sessions indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_active 
ON public.chat_sessions(user_id, is_active, updated_at DESC) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_created 
ON public.chat_sessions(user_id, created_at DESC) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_search 
ON public.chat_sessions USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message 
ON public.chat_sessions(user_id, last_message_at DESC NULLS LAST) 
WHERE deleted_at IS NULL AND is_active = true;

-- chat_messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_session 
ON public.chat_messages(session_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_role 
ON public.chat_messages(session_id, role);

CREATE INDEX IF NOT EXISTS idx_chat_messages_search 
ON public.chat_messages USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created 
ON public.chat_messages(created_at DESC);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies para chat_sessions
CREATE POLICY "Users can view own sessions"
ON public.chat_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
ON public.chat_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
ON public.chat_sessions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
ON public.chat_sessions FOR DELETE
USING (auth.uid() = user_id);

-- Policies para chat_messages
CREATE POLICY "Users can view messages from own sessions"
ON public.chat_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.chat_sessions
        WHERE chat_sessions.id = chat_messages.session_id
        AND chat_sessions.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create messages in own sessions"
ON public.chat_messages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.chat_sessions
        WHERE chat_sessions.id = chat_messages.session_id
        AND chat_sessions.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update messages in own sessions"
ON public.chat_messages FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.chat_sessions
        WHERE chat_sessions.id = chat_messages.session_id
        AND chat_sessions.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete messages from own sessions"
ON public.chat_messages FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.chat_sessions
        WHERE chat_sessions.id = chat_messages.session_id
        AND chat_sessions.user_id = auth.uid()
    )
);

-- =====================================================
-- 5. TRIGGERS AUTOMÁTICOS
-- =====================================================

-- Trigger: Atualizar updated_at da sessão
CREATE OR REPLACE FUNCTION public.update_chat_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_chat_session_timestamp
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_chat_session_timestamp();

-- Trigger: Atualizar last_message_at e message_count ao adicionar mensagem
CREATE OR REPLACE FUNCTION public.update_session_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chat_sessions
    SET 
        last_message_at = NEW.created_at,
        message_count = message_count + 1,
        updated_at = NOW()
    WHERE id = NEW.session_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_session_on_message
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_session_on_message();

-- Trigger: Decrementar message_count ao deletar mensagem
CREATE OR REPLACE FUNCTION public.update_session_on_message_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chat_sessions
    SET 
        message_count = GREATEST(0, message_count - 1),
        updated_at = NOW()
    WHERE id = OLD.session_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_session_on_message_delete
    AFTER DELETE ON public.chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_session_on_message_delete();

-- =====================================================
-- 6. FUNÇÕES ÚTEIS
-- =====================================================

-- Função: Criar nova sessão automaticamente
CREATE OR REPLACE FUNCTION public.create_new_chat_session(
    p_user_id UUID,
    p_title TEXT DEFAULT 'Nova Conversa'
)
RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
BEGIN
    -- Desativar sessões ativas anteriores
    UPDATE public.chat_sessions
    SET is_active = false
    WHERE user_id = p_user_id AND is_active = true;
    
    -- Criar nova sessão
    INSERT INTO public.chat_sessions (user_id, title, is_active)
    VALUES (p_user_id, p_title, true)
    RETURNING id INTO v_session_id;
    
    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: Buscar mensagens em todas as sessões do usuário
CREATE OR REPLACE FUNCTION public.search_chat_messages(
    p_user_id UUID,
    p_search_term TEXT
)
RETURNS TABLE (
    session_id UUID,
    session_title TEXT,
    message_id UUID,
    message_content TEXT,
    message_role TEXT,
    message_created_at TIMESTAMPTZ,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title,
        m.id,
        m.content,
        m.role,
        m.created_at,
        ts_rank(m.search_vector, plainto_tsquery('portuguese', p_search_term)) as relevance
    FROM public.chat_messages m
    JOIN public.chat_sessions s ON m.session_id = s.id
    WHERE s.user_id = p_user_id
    AND s.deleted_at IS NULL
    AND m.search_vector @@ plainto_tsquery('portuguese', p_search_term)
    ORDER BY relevance DESC, m.created_at DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: Obter estatísticas do chat do usuário
CREATE OR REPLACE FUNCTION public.get_user_chat_stats(
    p_user_id UUID
)
RETURNS TABLE (
    total_sessions BIGINT,
    active_sessions BIGINT,
    total_messages BIGINT,
    messages_today BIGINT,
    most_active_session_id UUID,
    most_active_session_title TEXT,
    most_active_session_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(DISTINCT s.id) FILTER (WHERE s.is_active = true) as active_sessions,
        COUNT(m.id) as total_messages,
        COUNT(m.id) FILTER (WHERE m.created_at >= CURRENT_DATE) as messages_today,
        s_max.id as most_active_session_id,
        s_max.title as most_active_session_title,
        s_max.message_count as most_active_session_count
    FROM public.chat_sessions s
    LEFT JOIN public.chat_messages m ON m.session_id = s.id
    LEFT JOIN LATERAL (
        SELECT id, title, message_count
        FROM public.chat_sessions
        WHERE user_id = p_user_id AND deleted_at IS NULL
        ORDER BY message_count DESC
        LIMIT 1
    ) s_max ON true
    WHERE s.user_id = p_user_id
    AND s.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: Arquivar sessões antigas automaticamente
CREATE OR REPLACE FUNCTION public.auto_archive_old_sessions()
RETURNS INTEGER AS $$
DECLARE
    v_archived_count INTEGER;
BEGIN
    -- Arquivar sessões inativas há mais de 30 dias
    WITH archived AS (
        UPDATE public.chat_sessions
        SET 
            is_archived = true,
            is_active = false,
            updated_at = NOW()
        WHERE is_archived = false
        AND is_active = false
        AND deleted_at IS NULL
        AND updated_at < NOW() - INTERVAL '30 days'
        RETURNING id
    )
    SELECT COUNT(*) INTO v_archived_count FROM archived;
    
    RETURN v_archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: Limpar sessões muito antigas (opcional, cuidado!)
CREATE OR REPLACE FUNCTION public.cleanup_very_old_sessions()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    -- Soft delete de sessões arquivadas há mais de 1 ano
    WITH deleted AS (
        UPDATE public.chat_sessions
        SET deleted_at = NOW()
        WHERE is_archived = true
        AND deleted_at IS NULL
        AND updated_at < NOW() - INTERVAL '1 year'
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. COMENTÁRIOS INFORMATIVOS
-- =====================================================

COMMENT ON TABLE public.chat_sessions IS 'Sessões de chat dos usuários com histórico persistente';
COMMENT ON TABLE public.chat_messages IS 'Mensagens individuais de cada sessão de chat';

COMMENT ON COLUMN public.chat_sessions.is_active IS 'Apenas uma sessão ativa por usuário por vez';
COMMENT ON COLUMN public.chat_sessions.is_archived IS 'Sessões arquivadas não aparecem na lista principal';
COMMENT ON COLUMN public.chat_sessions.message_count IS 'Contador automático atualizado via trigger';

COMMENT ON FUNCTION public.create_new_chat_session IS 'Cria nova sessão e desativa as anteriores';
COMMENT ON FUNCTION public.search_chat_messages IS 'Busca full-text em todas as mensagens do usuário';
COMMENT ON FUNCTION public.get_user_chat_stats IS 'Retorna estatísticas completas do chat do usuário';
COMMENT ON FUNCTION public.auto_archive_old_sessions IS 'Arquiva automaticamente sessões antigas';

-- =====================================================
-- ✅ SCHEMA CRIADO COM SUCESSO!
-- =====================================================
-- Próximos passos:
-- 1. Criar hook React para gerenciar sessões
-- 2. Integrar com a página de chat
-- 3. Migrar dados existentes (opcional)
-- 4. Testar funcionalidades
-- =====================================================
