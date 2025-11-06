-- SQL para Sistema de Segurança Avançado
-- Execute este script no SQL Editor do Supabase

-- 1. Tabela de tentativas de login (Rate Limiting)
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON public.login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON public.login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON public.login_attempts(attempted_at);

-- 2. Tabela de histórico de sessões
CREATE TABLE IF NOT EXISTS public.sessions_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT, -- mobile, desktop, tablet
  browser TEXT,
  os TEXT,
  location_country TEXT,
  location_city TEXT,
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  logout_type TEXT -- manual, timeout, forced
);

CREATE INDEX IF NOT EXISTS idx_sessions_history_user_id ON public.sessions_history(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_history_is_active ON public.sessions_history(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_history_session_start ON public.sessions_history(session_start);

-- 4. Adicionar colunas de segurança à tabela users
DO $$ 
BEGIN
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_ip TEXT;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMPTZ;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
END $$;

-- 5. Criar índices para novas colunas
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON public.users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON public.users(last_login_at);
CREATE INDEX IF NOT EXISTS idx_users_account_locked_until ON public.users(account_locked_until);

-- 3. Habilitar RLS nas novas tabelas
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions_history ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para login_attempts (apenas admin e sistema)
DROP POLICY IF EXISTS "Admin pode ver todas tentativas" ON public.login_attempts;
CREATE POLICY "Admin pode ver todas tentativas"
ON public.login_attempts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND email IN ('admin@dua.pt', 'subreviva@gmail.com', 'dev@dua.pt', 'dev@dua.com')
  )
);

DROP POLICY IF EXISTS "Sistema pode inserir tentativas" ON public.login_attempts;
CREATE POLICY "Sistema pode inserir tentativas"
ON public.login_attempts FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 5. Políticas RLS para sessions_history
DROP POLICY IF EXISTS "Usuário pode ver suas sessões" ON public.sessions_history;
CREATE POLICY "Usuário pode ver suas sessões"
ON public.sessions_history FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Sistema pode inserir sessões" ON public.sessions_history;
CREATE POLICY "Sistema pode inserir sessões"
ON public.sessions_history FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Usuário pode atualizar suas sessões" ON public.sessions_history;
CREATE POLICY "Usuário pode atualizar suas sessões"
ON public.sessions_history FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. Função para limpar tentativas antigas (> 24h)
CREATE OR REPLACE FUNCTION clean_old_login_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.login_attempts
  WHERE attempted_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- 11. Função para limpar tokens expirados (removida - tabela não existe neste script)

-- 12. Função para verificar rate limit (5 tentativas em 15min)
CREATE OR REPLACE FUNCTION check_rate_limit(p_email TEXT, p_ip TEXT)
RETURNS TABLE(is_allowed BOOLEAN, attempts_count INTEGER, wait_minutes INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempts INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  v_window_start := NOW() - INTERVAL '15 minutes';
  
  SELECT COUNT(*) INTO v_attempts
  FROM public.login_attempts
  WHERE (email = p_email OR ip_address = p_ip)
  AND success = false
  AND attempted_at >= v_window_start;
  
  IF v_attempts >= 5 THEN
    RETURN QUERY SELECT false, v_attempts, 15;
  ELSE
    RETURN QUERY SELECT true, v_attempts, 0;
  END IF;
END;
$$;

-- 13. Função para registrar tentativa de login
CREATE OR REPLACE FUNCTION log_login_attempt(
  p_email TEXT,
  p_ip TEXT,
  p_user_agent TEXT,
  p_success BOOLEAN,
  p_error TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempt_id UUID;
BEGIN
  INSERT INTO public.login_attempts (
    email,
    ip_address,
    user_agent,
    success,
    error_message
  ) VALUES (
    p_email,
    p_ip,
    p_user_agent,
    p_success,
    p_error
  )
  RETURNING id INTO v_attempt_id;
  
  -- Se sucesso, limpar tentativas antigas deste email
  IF p_success THEN
    DELETE FROM public.login_attempts
    WHERE email = p_email
    AND success = false
    AND id != v_attempt_id;
  END IF;
  
  RETURN v_attempt_id;
END;
$$;

-- 14. Comentários
COMMENT ON TABLE public.login_attempts IS 'Histórico de tentativas de login para rate limiting';
COMMENT ON TABLE public.sessions_history IS 'Histórico de sessões de usuários com detalhes de dispositivo';

COMMENT ON COLUMN public.users.email_verified IS 'Se o email do usuário foi verificado';
COMMENT ON COLUMN public.users.last_login_at IS 'Data/hora do último login bem-sucedido';
COMMENT ON COLUMN public.users.failed_login_attempts IS 'Contador de tentativas falhadas consecutivas';
COMMENT ON COLUMN public.users.account_locked_until IS 'Data/hora até quando a conta está bloqueada';
COMMENT ON COLUMN public.users.two_factor_enabled IS 'Se autenticação de 2 fatores está ativa';
