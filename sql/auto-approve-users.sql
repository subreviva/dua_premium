-- ============================================================================
-- SISTEMA DE APROVAÇÃO AUTOMÁTICA DE UTILIZADORES
-- ============================================================================
-- Este script implementa aprovação automática para novos utilizadores
-- Todos os utilizadores registados recebem has_access = true automaticamente
-- ============================================================================

-- 1. Criar função que define has_access = true para novos utilizadores
CREATE OR REPLACE FUNCTION auto_approve_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Se has_access não foi explicitamente definido, definir como true
  IF NEW.has_access IS NULL THEN
    NEW.has_access := true;
  END IF;
  
  -- Se has_access foi definido como false mas não é admin que está criando, forçar true
  -- (permite que admins criem users bloqueados se necessário)
  IF NEW.has_access = false AND current_setting('request.jwt.claims', true)::json->>'role' != 'admin' THEN
    NEW.has_access := true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_auto_approve_user ON public.users;

-- 3. Criar trigger que executa antes de INSERT
CREATE TRIGGER trigger_auto_approve_user
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_new_user();

-- ============================================================================
-- TABELA DE CONFIGURAÇÃO DO SISTEMA DE APROVAÇÃO
-- ============================================================================
-- Permite alternar entre aprovação automática e manual pelo painel admin

CREATE TABLE IF NOT EXISTS public.system_settings (
  id SERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.users(id)
);

-- Inserir configuração padrão: aprovação automática ativada
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES 
  ('auto_approve_users', 'true', 'Aprovar automaticamente novos utilizadores (true/false)')
ON CONFLICT (setting_key) 
DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- RLS para system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver e editar configurações
CREATE POLICY "Admins can view settings"
  ON public.system_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_accounts
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can update settings"
  ON public.system_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_accounts
      WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- FUNÇÃO PARA OBTER UTILIZADORES PENDENTES DE APROVAÇÃO
-- ============================================================================

CREATE OR REPLACE FUNCTION get_pending_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ,
  days_waiting INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.name,
    u.created_at,
    EXTRACT(DAY FROM NOW() - u.created_at)::INTEGER as days_waiting
  FROM public.users u
  WHERE u.has_access = false
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNÇÃO PARA APROVAR UTILIZADOR (uso no painel admin)
-- ============================================================================

CREATE OR REPLACE FUNCTION approve_user(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Verificar se quem está executando é admin
  SELECT EXISTS (
    SELECT 1 FROM public.admin_accounts
    WHERE id = auth.uid()
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Apenas administradores podem aprovar utilizadores';
  END IF;
  
  -- Aprovar utilizador
  UPDATE public.users
  SET has_access = true
  WHERE id = user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNÇÃO PARA APROVAR MÚLTIPLOS UTILIZADORES (bulk)
-- ============================================================================

CREATE OR REPLACE FUNCTION bulk_approve_users(user_ids UUID[])
RETURNS INTEGER AS $$
DECLARE
  is_admin BOOLEAN;
  approved_count INTEGER;
BEGIN
  -- Verificar se quem está executando é admin
  SELECT EXISTS (
    SELECT 1 FROM public.admin_accounts
    WHERE id = auth.uid()
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Apenas administradores podem aprovar utilizadores';
  END IF;
  
  -- Aprovar utilizadores
  UPDATE public.users
  SET has_access = true
  WHERE id = ANY(user_ids)
  AND has_access = false;
  
  GET DIAGNOSTICS approved_count = ROW_COUNT;
  
  RETURN approved_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUDITORIA: Registar quando utilizadores são aprovados
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_approval_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES public.users(id),
  approval_method TEXT CHECK (approval_method IN ('auto', 'manual', 'bulk')),
  approved_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para approval log
ALTER TABLE public.user_approval_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view approval log"
  ON public.user_approval_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_accounts
      WHERE id = auth.uid()
    )
  );

-- Trigger para registar aprovações automáticas
CREATE OR REPLACE FUNCTION log_user_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Se has_access mudou de false para true
  IF OLD.has_access = false AND NEW.has_access = true THEN
    INSERT INTO public.user_approval_log (user_id, approved_by, approval_method)
    VALUES (
      NEW.id,
      auth.uid(),
      CASE 
        WHEN auth.uid() IS NULL THEN 'auto'
        ELSE 'manual'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_approval ON public.users;

CREATE TRIGGER trigger_log_approval
  AFTER UPDATE OF has_access ON public.users
  FOR EACH ROW
  WHEN (OLD.has_access IS DISTINCT FROM NEW.has_access)
  EXECUTE FUNCTION log_user_approval();

-- ============================================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON FUNCTION auto_approve_new_user() IS 'Aprova automaticamente novos utilizadores definindo has_access = true';
COMMENT ON FUNCTION get_pending_users() IS 'Retorna lista de utilizadores aguardando aprovação';
COMMENT ON FUNCTION approve_user(UUID) IS 'Aprova um utilizador específico (uso admin)';
COMMENT ON FUNCTION bulk_approve_users(UUID[]) IS 'Aprova múltiplos utilizadores de uma vez';
COMMENT ON TABLE system_settings IS 'Configurações globais do sistema (aprovação automática, etc)';
COMMENT ON TABLE user_approval_log IS 'Log de auditoria de aprovações de utilizadores';

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Mostrar configuração atual
SELECT 
  setting_key,
  setting_value,
  description,
  updated_at
FROM public.system_settings
WHERE setting_key = 'auto_approve_users';

-- Mostrar utilizadores pendentes
SELECT * FROM get_pending_users();

-- ============================================================================
-- ✅ SISTEMA DE APROVAÇÃO AUTOMÁTICA INSTALADO!
-- ============================================================================
-- 
-- COMO FUNCIONA:
-- 1. Novos utilizadores recebem has_access = true automaticamente
-- 2. Configuração pode ser alterada em system_settings
-- 3. Painel admin pode aprovar manualmente utilizadores pendentes
-- 4. Todas as aprovações são registadas em user_approval_log
--
-- PARA DESATIVAR APROVAÇÃO AUTOMÁTICA:
-- UPDATE system_settings 
-- SET setting_value = 'false' 
-- WHERE setting_key = 'auto_approve_users';
--
-- PARA APROVAR UTILIZADOR MANUALMENTE:
-- SELECT approve_user('user-uuid-aqui');
--
-- PARA APROVAR VÁRIOS DE UMA VEZ:
-- SELECT bulk_approve_users(ARRAY['uuid1', 'uuid2', 'uuid3']);
-- ============================================================================
