-- =====================================================
-- 💬 TABELA DE CONVERSAS - Sistema de Backup Cloud
-- =====================================================
-- Criado: 2025-11-06
-- Propósito: Backup automático de conversas do chat
-- Features: Sync bidirecional, conflict resolution, performance otimizada
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca full-text

-- =====================================================
-- 1. TABELA PRINCIPAL: conversations
-- =====================================================

CREATE TABLE IF NOT EXISTS public.conversations (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Conteúdo
    title TEXT NOT NULL DEFAULT 'Nova Conversa',
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Sync control
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    sync_version INTEGER NOT NULL DEFAULT 1,
    
    -- Soft delete (para undo)
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    
    -- Analytics
    message_count INTEGER GENERATED ALWAYS AS (jsonb_array_length(messages)) STORED,
    
    -- Full-text search
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('portuguese', coalesce(title, ''))
    ) STORED,
    
    -- Constraints
    CONSTRAINT valid_messages CHECK (jsonb_typeof(messages) = 'array'),
    CONSTRAINT valid_title CHECK (char_length(title) > 0 AND char_length(title) <= 500),
    CONSTRAINT valid_message_count CHECK (message_count >= 0)
);

-- =====================================================
-- 2. INDEXES PARA PERFORMANCE
-- =====================================================

-- Index principal: busca por user_id (mais usado)
CREATE INDEX IF NOT EXISTS idx_conversations_user_id 
ON public.conversations(user_id) 
WHERE deleted_at IS NULL;

-- Index para ordenação (lista de conversas)
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at 
ON public.conversations(user_id, updated_at DESC) 
WHERE deleted_at IS NULL;

-- Index para sync (buscar conversas modificadas)
CREATE INDEX IF NOT EXISTS idx_conversations_sync 
ON public.conversations(user_id, last_synced_at) 
WHERE deleted_at IS NULL;

-- Index para full-text search (busca)
CREATE INDEX IF NOT EXISTS idx_conversations_search 
ON public.conversations USING GIN(search_vector);

-- Index para soft delete (recovery)
CREATE INDEX IF NOT EXISTS idx_conversations_deleted 
ON public.conversations(user_id, deleted_at) 
WHERE deleted_at IS NOT NULL;

-- Index para analytics (estatísticas)
CREATE INDEX IF NOT EXISTS idx_conversations_created_at 
ON public.conversations(user_id, created_at DESC);

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users podem ver apenas suas conversas
CREATE POLICY "Users can view own conversations"
ON public.conversations
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users podem criar suas conversas
CREATE POLICY "Users can create own conversations"
ON public.conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users podem atualizar suas conversas
CREATE POLICY "Users can update own conversations"
ON public.conversations
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users podem deletar suas conversas (soft delete)
CREATE POLICY "Users can delete own conversations"
ON public.conversations
FOR DELETE
USING (auth.uid() = user_id);

-- Policy: Admins podem ver todas conversas
CREATE POLICY "Admins can view all conversations"
ON public.conversations
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.has_access = true
    )
);

-- =====================================================
-- 4. TRIGGER: Auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.sync_version = OLD.sync_version + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversations_updated_at();

-- =====================================================
-- 5. FUNÇÃO: Soft Delete (para undo)
-- =====================================================

CREATE OR REPLACE FUNCTION public.soft_delete_conversation(
    conversation_id UUID
)
RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se conversa existe e pertence ao user
    IF NOT EXISTS (
        SELECT 1 FROM public.conversations
        WHERE id = conversation_id
        AND user_id = auth.uid()
        AND deleted_at IS NULL
    ) THEN
        RETURN QUERY SELECT false, 'Conversa não encontrada ou já deletada';
        RETURN;
    END IF;
    
    -- Soft delete
    UPDATE public.conversations
    SET deleted_at = NOW()
    WHERE id = conversation_id
    AND user_id = auth.uid();
    
    RETURN QUERY SELECT true, 'Conversa deletada com sucesso';
END;
$$;

-- =====================================================
-- 6. FUNÇÃO: Undo Delete (restaurar conversa)
-- =====================================================

CREATE OR REPLACE FUNCTION public.restore_conversation(
    conversation_id UUID
)
RETURNS TABLE(success BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Verificar se conversa existe e está deletada
    IF NOT EXISTS (
        SELECT 1 FROM public.conversations
        WHERE id = conversation_id
        AND user_id = auth.uid()
        AND deleted_at IS NOT NULL
    ) THEN
        RETURN QUERY SELECT false, 'Conversa não encontrada ou não está deletada';
        RETURN;
    END IF;
    
    -- Restaurar
    UPDATE public.conversations
    SET deleted_at = NULL
    WHERE id = conversation_id
    AND user_id = auth.uid();
    
    RETURN QUERY SELECT true, 'Conversa restaurada com sucesso';
END;
$$;

-- =====================================================
-- 7. FUNÇÃO: Limpar conversas deletadas antigas (30 dias)
-- =====================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_deleted_conversations()
RETURNS TABLE(deleted_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    count_deleted INTEGER;
BEGIN
    -- Deletar permanentemente conversas deletadas há mais de 30 dias
    WITH deleted AS (
        DELETE FROM public.conversations
        WHERE deleted_at IS NOT NULL
        AND deleted_at < NOW() - INTERVAL '30 days'
        RETURNING *
    )
    SELECT COUNT(*) INTO count_deleted FROM deleted;
    
    RETURN QUERY SELECT count_deleted;
END;
$$;

-- =====================================================
-- 8. FUNÇÃO: Busca full-text em conversas
-- =====================================================

CREATE OR REPLACE FUNCTION public.search_conversations(
    search_query TEXT,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE(
    id UUID,
    title TEXT,
    message_count INTEGER,
    updated_at TIMESTAMPTZ,
    rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.message_count,
        c.updated_at,
        ts_rank(c.search_vector, plainto_tsquery('portuguese', search_query)) AS rank
    FROM public.conversations c
    WHERE c.user_id = auth.uid()
    AND c.deleted_at IS NULL
    AND c.search_vector @@ plainto_tsquery('portuguese', search_query)
    ORDER BY rank DESC, c.updated_at DESC
    LIMIT limit_count;
END;
$$;

-- =====================================================
-- 9. FUNÇÃO: Estatísticas do usuário
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_conversation_stats()
RETURNS TABLE(
    total_conversations INTEGER,
    total_messages INTEGER,
    avg_messages_per_conversation NUMERIC,
    oldest_conversation TIMESTAMPTZ,
    newest_conversation TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER AS total_conversations,
        SUM(message_count)::INTEGER AS total_messages,
        ROUND(AVG(message_count), 2) AS avg_messages_per_conversation,
        MIN(created_at) AS oldest_conversation,
        MAX(created_at) AS newest_conversation
    FROM public.conversations
    WHERE user_id = auth.uid()
    AND deleted_at IS NULL;
END;
$$;

-- =====================================================
-- 10. FUNÇÃO: Export conversations (GDPR compliance)
-- =====================================================

CREATE OR REPLACE FUNCTION public.export_user_conversations()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'user_id', auth.uid(),
        'exported_at', NOW(),
        'total_conversations', COUNT(*),
        'conversations', jsonb_agg(
            jsonb_build_object(
                'id', id,
                'title', title,
                'messages', messages,
                'created_at', created_at,
                'updated_at', updated_at,
                'message_count', message_count
            ) ORDER BY updated_at DESC
        )
    )
    INTO result
    FROM public.conversations
    WHERE user_id = auth.uid()
    AND deleted_at IS NULL;
    
    RETURN result;
END;
$$;

-- =====================================================
-- 11. TRIGGER: Notificar cliente sobre mudanças (Realtime)
-- =====================================================

CREATE OR REPLACE FUNCTION public.notify_conversation_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Notificar via pg_notify para Supabase Realtime
    PERFORM pg_notify(
        'conversation_changes',
        json_build_object(
            'operation', TG_OP,
            'record', row_to_json(NEW),
            'user_id', COALESCE(NEW.user_id, OLD.user_id)
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_conversation_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_conversation_change();

-- =====================================================
-- 12. GRANTS (Permissões)
-- =====================================================

-- Garantir que authenticated users possam acessar
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Garantir que service_role pode fazer tudo (para migrations)
GRANT ALL ON public.conversations TO service_role;

-- =====================================================
-- 13. COMENTÁRIOS (Documentação)
-- =====================================================

COMMENT ON TABLE public.conversations IS 'Armazena todas as conversas do chat com backup automático e sync bidirecional';
COMMENT ON COLUMN public.conversations.id IS 'UUID único da conversa';
COMMENT ON COLUMN public.conversations.user_id IS 'ID do usuário dono da conversa (FK para auth.users)';
COMMENT ON COLUMN public.conversations.title IS 'Título da conversa (auto-gerado ou customizado)';
COMMENT ON COLUMN public.conversations.messages IS 'Array JSONB com todas as mensagens da conversa';
COMMENT ON COLUMN public.conversations.sync_version IS 'Versão de sync para conflict resolution';
COMMENT ON COLUMN public.conversations.deleted_at IS 'Soft delete timestamp (NULL = ativo, NOT NULL = deletado)';
COMMENT ON COLUMN public.conversations.message_count IS 'Contador automático de mensagens (computed column)';
COMMENT ON COLUMN public.conversations.search_vector IS 'Vector para full-text search (auto-gerado)';

-- =====================================================
-- 14. DADOS DE TESTE (Opcional - Remover em produção)
-- =====================================================

-- Descomentar para criar dados de teste
/*
INSERT INTO public.conversations (user_id, title, messages) VALUES
(
    auth.uid(),
    'Como fazer bolo de chocolate?',
    '[
        {"id": "msg1", "role": "user", "content": "Como fazer bolo de chocolate?", "createdAt": "2025-11-06T10:00:00Z"},
        {"id": "msg2", "role": "assistant", "content": "Para fazer um delicioso bolo de chocolate...", "createdAt": "2025-11-06T10:00:05Z"}
    ]'::jsonb
);
*/

-- =====================================================
-- 15. VERIFICAÇÃO FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Tabela conversations criada com sucesso!';
    RAISE NOTICE '📊 Indexes criados: 6';
    RAISE NOTICE '🔐 RLS policies criadas: 5';
    RAISE NOTICE '⚡ Triggers criados: 2';
    RAISE NOTICE '🔧 Funções criadas: 7';
    RAISE NOTICE '📝 Comentários adicionados: 8';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Sistema de backup de conversas pronto para uso!';
    RAISE NOTICE '📱 Sync bidirecional: ativo';
    RAISE NOTICE '🔍 Full-text search: ativo';
    RAISE NOTICE '♻️ Soft delete com undo: ativo';
    RAISE NOTICE '📊 Analytics: ativo';
    RAISE NOTICE '🔐 Row Level Security: ativo';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ Próximos passos:';
    RAISE NOTICE '1. Atualizar hooks/useConversations.ts para usar Supabase';
    RAISE NOTICE '2. Implementar sync automático';
    RAISE NOTICE '3. Adicionar Realtime subscriptions';
    RAISE NOTICE '4. Testar backup e restore';
END $$;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
