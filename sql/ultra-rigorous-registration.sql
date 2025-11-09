-- ═══════════════════════════════════════════════════════════════════════════
-- SISTEMA DE REGISTO ULTRA RIGOROSO - DUA IA
-- Criado: 08/11/2025
-- Versão: 1.0 Production Ready
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 1: ATUALIZAR TABELA USERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Adicionar colunas de controle de registo
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS username_set BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS avatar_set BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS welcome_seen BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS session_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_session_check TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS registration_ip TEXT,
ADD COLUMN IF NOT EXISTS registration_user_agent TEXT;

-- Adicionar colunas de saldos DUA
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS dua_ia_balance INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS dua_coin_balance INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'normal';

-- Adicionar comentários
COMMENT ON COLUMN public.users.registration_completed IS 'Indica se o processo de registo foi concluído';
COMMENT ON COLUMN public.users.onboarding_completed IS 'Indica se o onboarding foi concluído';
COMMENT ON COLUMN public.users.username_set IS 'Indica se o username foi definido';
COMMENT ON COLUMN public.users.avatar_set IS 'Indica se o avatar foi configurado';
COMMENT ON COLUMN public.users.welcome_seen IS 'Indica se a mensagem de boas-vindas foi vista';
COMMENT ON COLUMN public.users.session_active IS 'Indica se há uma sessão ativa';
COMMENT ON COLUMN public.users.last_session_check IS 'Timestamp da última verificação de sessão';
COMMENT ON COLUMN public.users.dua_ia_balance IS 'Saldo de DUA IA (créditos de IA)';
COMMENT ON COLUMN public.users.dua_coin_balance IS 'Saldo de DUA COIN (moeda da plataforma)';
COMMENT ON COLUMN public.users.account_type IS 'Tipo de conta: normal, premium, admin';

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 2: CRIAR TABELA DE SESSÕES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    ip_address TEXT,
    user_agent TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    active BOOLEAN DEFAULT true,
    terminated_at TIMESTAMPTZ,
    termination_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON public.user_sessions(expires_at);

-- Comentários
COMMENT ON TABLE public.user_sessions IS 'Controle rigoroso de sessões ativas dos usuários';
COMMENT ON COLUMN public.user_sessions.session_token IS 'Token único da sessão (UUID)';
COMMENT ON COLUMN public.user_sessions.expires_at IS 'Data/hora de expiração (24h após criação)';
COMMENT ON COLUMN public.user_sessions.active IS 'Indica se a sessão está ativa';
COMMENT ON COLUMN public.user_sessions.termination_reason IS 'Motivo do término: logout, expired, admin_action';

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 3: CRIAR TABELA DE LOGS DE ATIVIDADE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    activity_details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    session_id UUID REFERENCES public.user_sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON public.user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_session ON public.user_activity_logs(session_id);

-- Comentários
COMMENT ON TABLE public.user_activity_logs IS 'Log completo de todas as atividades dos usuários';
COMMENT ON COLUMN public.user_activity_logs.activity_type IS 'Tipo: registration, login, logout, onboarding_completed, profile_update, page_access, session_validation';
COMMENT ON COLUMN public.user_activity_logs.activity_details IS 'Detalhes em JSON da atividade';

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 4: FUNÇÕES DE VALIDAÇÃO
-- ═══════════════════════════════════════════════════════════════════════════

-- Função para validar sessão ativa
CREATE OR REPLACE FUNCTION public.validate_active_session(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_session_count
    FROM public.user_sessions
    WHERE user_id = p_user_id
      AND active = true
      AND expires_at > NOW();
    
    RETURN v_session_count > 0;
END;
$$;

COMMENT ON FUNCTION public.validate_active_session IS 'Valida se o usuário tem sessão ativa e não expirada';

-- Função para terminar todas as sessões de um usuário
CREATE OR REPLACE FUNCTION public.terminate_user_sessions(
    p_user_id UUID,
    p_reason TEXT DEFAULT 'logout'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    -- Atualizar sessões ativas
    UPDATE public.user_sessions
    SET active = false,
        terminated_at = NOW(),
        termination_reason = p_reason
    WHERE user_id = p_user_id
      AND active = true;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    -- Atualizar status na tabela users
    UPDATE public.users
    SET session_active = false,
        last_session_check = NOW()
    WHERE id = p_user_id;
    
    RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.terminate_user_sessions IS 'Termina todas as sessões ativas de um usuário';

-- Função para limpar sessões expiradas (executar periodicamente)
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE public.user_sessions
    SET active = false,
        terminated_at = NOW(),
        termination_reason = 'expired'
    WHERE active = true
      AND expires_at <= NOW();
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_expired_sessions IS 'Limpa sessões expiradas automaticamente';

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 5: ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policies para user_sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
CREATE POLICY "Users can view own sessions"
    ON public.user_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON public.user_sessions;
CREATE POLICY "Users can insert own sessions"
    ON public.user_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON public.user_sessions;
CREATE POLICY "Users can update own sessions"
    ON public.user_sessions
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policies para user_activity_logs
DROP POLICY IF EXISTS "Users can view own logs" ON public.user_activity_logs;
CREATE POLICY "Users can view own logs"
    ON public.user_activity_logs
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own logs" ON public.user_activity_logs;
CREATE POLICY "Users can insert own logs"
    ON public.user_activity_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 6: GRANTS DE PERMISSÕES
-- ═══════════════════════════════════════════════════════════════════════════

-- Permitir acesso às tabelas
GRANT SELECT, INSERT, UPDATE ON public.user_sessions TO authenticated;
GRANT SELECT, INSERT ON public.user_activity_logs TO authenticated;

-- Permitir execução das funções
GRANT EXECUTE ON FUNCTION public.validate_active_session TO authenticated;
GRANT EXECUTE ON FUNCTION public.terminate_user_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_sessions TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 7: VERIFICAÇÃO FINAL
-- ═══════════════════════════════════════════════════════════════════════════

-- Verificar se as colunas foram adicionadas
DO $$
DECLARE
    v_column_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_column_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name IN (
          'registration_completed',
          'onboarding_completed',
          'dua_ia_balance',
          'dua_coin_balance',
          'account_type'
      );
    
    IF v_column_count = 5 THEN
        RAISE NOTICE '✅ Colunas adicionadas à tabela users com sucesso!';
    ELSE
        RAISE WARNING '⚠️ Algumas colunas podem não ter sido adicionadas. Encontradas: %', v_column_count;
    END IF;
END $$;

-- Verificar se as tabelas foram criadas
DO $$
DECLARE
    v_sessions_exists BOOLEAN;
    v_logs_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_sessions'
    ) INTO v_sessions_exists;
    
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_activity_logs'
    ) INTO v_logs_exists;
    
    IF v_sessions_exists AND v_logs_exists THEN
        RAISE NOTICE '✅ Tabelas user_sessions e user_activity_logs criadas com sucesso!';
    ELSE
        RAISE WARNING '⚠️ Problema ao criar tabelas. Sessions: %, Logs: %', v_sessions_exists, v_logs_exists;
    END IF;
END $$;

-- Verificar funções
DO $$
DECLARE
    v_function_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO v_function_count
    FROM pg_proc
    WHERE proname IN (
        'validate_active_session',
        'terminate_user_sessions',
        'cleanup_expired_sessions'
    );
    
    IF v_function_count = 3 THEN
        RAISE NOTICE '✅ Funções de validação criadas com sucesso!';
    ELSE
        RAISE WARNING '⚠️ Algumas funções podem não ter sido criadas. Encontradas: %', v_function_count;
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- PARTE 8: MENSAGEM FINAL
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ SISTEMA ULTRA RIGOROSO INSTALADO COM SUCESSO!';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximos passos:';
    RAISE NOTICE '1. Verificar se as tabelas foram criadas corretamente';
    RAISE NOTICE '2. Inserir os 170 códigos de acesso';
    RAISE NOTICE '3. Testar o processo de registo completo';
    RAISE NOTICE '4. Ativar o middleware de proteção';
    RAISE NOTICE '';
    RAISE NOTICE 'Tabelas criadas:';
    RAISE NOTICE '  • public.users (atualizada com novas colunas)';
    RAISE NOTICE '  • public.user_sessions (controle de sessões)';
    RAISE NOTICE '  • public.user_activity_logs (auditoria completa)';
    RAISE NOTICE '';
    RAISE NOTICE 'Funções criadas:';
    RAISE NOTICE '  • validate_active_session(user_id)';
    RAISE NOTICE '  • terminate_user_sessions(user_id, reason)';
    RAISE NOTICE '  • cleanup_expired_sessions()';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;
