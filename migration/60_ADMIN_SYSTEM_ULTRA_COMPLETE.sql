-- 🔥 SQL ADMIN SYSTEM - AUDITORIA E PERMISSÕES ULTRA-COMPLETAS
-- Sistema de logs, auditoria e permissões avançadas para admin

-- ============================================================================
-- FASE 1: CRIAR TABELA DE AUDIT LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'inject_dua', 'delete_user', 'update_user', 'create_user'
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  details JSONB, -- Detalhes da ação (amount, description, old_values, new_values)
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON public.admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.admin_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.admin_audit_logs(action_type);

-- RLS policies (apenas admins veem logs)
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_audit_logs_admin_select" ON public.admin_audit_logs;
CREATE POLICY "admin_audit_logs_admin_select" ON public.admin_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

DROP POLICY IF EXISTS "admin_audit_logs_admin_insert" ON public.admin_audit_logs;
CREATE POLICY "admin_audit_logs_admin_insert" ON public.admin_audit_logs
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- ============================================================================
-- FASE 2: CRIAR TABELA DE ADMIN PERMISSIONS (granular)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_name TEXT NOT NULL, -- 'inject_dua', 'delete_users', 'edit_users', 'view_transactions', etc
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, permission_name)
);

CREATE INDEX IF NOT EXISTS idx_admin_permissions_user ON public.admin_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_active ON public.admin_permissions(is_active);

-- RLS policies
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_permissions_admin_all" ON public.admin_permissions;
CREATE POLICY "admin_permissions_admin_all" ON public.admin_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
      AND (role = 'admin' OR role = 'super_admin')
    )
  );

-- ============================================================================
-- FASE 3: FUNÇÃO PARA REGISTAR LOGS AUTOMATICAMENTE
-- ============================================================================

CREATE OR REPLACE FUNCTION log_admin_action(
  p_admin_user_id UUID,
  p_action_type TEXT,
  p_target_user_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO public.admin_audit_logs (
    admin_user_id,
    action_type,
    target_user_id,
    details
  ) VALUES (
    p_admin_user_id,
    p_action_type,
    p_target_user_id,
    p_details
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FASE 4: FUNÇÃO PARA VERIFICAR PERMISSÕES ADMIN
-- ============================================================================

CREATE OR REPLACE FUNCTION check_admin_permission(
  p_user_id UUID,
  p_permission_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN;
  user_role TEXT;
BEGIN
  -- Buscar role do usuário
  SELECT role INTO user_role
  FROM public.users
  WHERE id = p_user_id;
  
  -- Super admin tem todas as permissões
  IF user_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Verificar permissão específica
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_permissions
    WHERE user_id = p_user_id
    AND permission_name = p_permission_name
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FASE 5: ATRIBUIR PERMISSÕES AO SUPER ADMIN
-- ============================================================================

-- Garantir que super admin tem TODAS as permissões
DO $$
DECLARE
  admin_id UUID;
  permissions TEXT[] := ARRAY[
    'inject_dua',
    'delete_users',
    'edit_users',
    'create_users',
    'view_all_transactions',
    'edit_transactions',
    'delete_transactions',
    'manage_permissions',
    'view_audit_logs',
    'system_settings'
  ];
  perm TEXT;
BEGIN
  -- Buscar super admin
  SELECT id INTO admin_id
  FROM public.users
  WHERE email = 'estraca@2lados.pt';
  
  IF admin_id IS NOT NULL THEN
    -- Inserir todas as permissões
    FOREACH perm IN ARRAY permissions
    LOOP
      INSERT INTO public.admin_permissions (
        user_id,
        permission_name,
        granted_by,
        is_active
      ) VALUES (
        admin_id,
        perm,
        admin_id,
        true
      )
      ON CONFLICT (user_id, permission_name) DO UPDATE
      SET is_active = true;
    END LOOP;
    
    RAISE NOTICE '✅ Permissões atribuídas ao super admin';
  END IF;
END $$;

-- ============================================================================
-- FASE 6: VIEWS ÚTEIS PARA ADMIN
-- ============================================================================

-- View: Estatísticas por utilizador
CREATE OR REPLACE VIEW admin_user_stats AS
SELECT 
  u.id,
  u.email,
  u.role,
  u.created_at,
  u.last_sign_in_at,
  dc.balance as dua_balance,
  dc.total_earned as dua_earned,
  dc.total_spent as dua_spent,
  di.conversations_count as duaia_conversations,
  di.messages_count as duaia_messages,
  (
    SELECT COUNT(*)
    FROM duacoin_transactions dt
    WHERE dt.user_id = u.id
  ) as transaction_count
FROM public.users u
LEFT JOIN duacoin_profiles dc ON dc.user_id = u.id
LEFT JOIN duaia_profiles di ON di.user_id = u.id
ORDER BY u.created_at DESC;

-- View: Top utilizadores por DUA
CREATE OR REPLACE VIEW admin_top_dua_holders AS
SELECT 
  u.email,
  dc.balance,
  dc.total_earned,
  dc.total_spent,
  dc.updated_at as last_transaction
FROM duacoin_profiles dc
JOIN users u ON u.id = dc.user_id
ORDER BY dc.balance DESC
LIMIT 100;

-- View: Transações suspeitas (alto valor)
CREATE OR REPLACE VIEW admin_suspicious_transactions AS
SELECT 
  dt.id,
  dt.created_at,
  u.email,
  dt.type,
  dt.amount,
  dt.status,
  dt.description,
  dt.balance_before,
  dt.balance_after
FROM duacoin_transactions dt
JOIN users u ON u.id = dt.user_id
WHERE dt.amount > 1000 -- Transações acima de 1000 DUA
ORDER BY dt.created_at DESC;

-- ============================================================================
-- FASE 7: TRIGGER PARA LOG AUTOMÁTICO DE MUDANÇAS EM USERS
-- ============================================================================

CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log quando role ou permissões mudam
  IF (TG_OP = 'UPDATE' AND (
    OLD.role != NEW.role OR
    OLD.full_access != NEW.full_access OR
    OLD.duaia_enabled != NEW.duaia_enabled OR
    OLD.duacoin_enabled != NEW.duacoin_enabled
  )) THEN
    INSERT INTO admin_audit_logs (
      admin_user_id,
      action_type,
      target_user_id,
      details
    ) VALUES (
      COALESCE(auth.uid(), NEW.id), -- Se não houver auth, assume self-update
      'update_user',
      NEW.id,
      jsonb_build_object(
        'old_role', OLD.role,
        'new_role', NEW.role,
        'old_full_access', OLD.full_access,
        'new_full_access', NEW.full_access,
        'old_duaia_enabled', OLD.duaia_enabled,
        'new_duaia_enabled', NEW.duaia_enabled,
        'old_duacoin_enabled', OLD.duacoin_enabled,
        'new_duacoin_enabled', NEW.duacoin_enabled
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_user_changes ON public.users;
CREATE TRIGGER trigger_log_user_changes
  AFTER UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION log_user_changes();

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar tabelas criadas
SELECT 
  '✅ ADMIN TABLES' as check_type,
  COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('admin_audit_logs', 'admin_permissions');

-- Verificar permissões do super admin
SELECT 
  '✅ SUPER ADMIN PERMISSIONS' as check_type,
  u.email,
  COUNT(ap.id) as permission_count
FROM users u
LEFT JOIN admin_permissions ap ON ap.user_id = u.id AND ap.is_active = true
WHERE u.email = 'estraca@2lados.pt'
GROUP BY u.email;

-- Verificar views criadas
SELECT 
  '✅ ADMIN VIEWS' as check_type,
  COUNT(*) as view_count
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE 'admin_%';

-- ============================================================================
-- 🎉 SISTEMA ADMIN COMPLETO - 100% READY
-- ============================================================================
-- Após executar:
-- 1. Sistema de audit logs ativo
-- 2. Permissões granulares configuradas
-- 3. Super admin com todas as permissões
-- 4. Triggers de log automático ativos
-- 5. Views úteis para gestão
-- ============================================================================
