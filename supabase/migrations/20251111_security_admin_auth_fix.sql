-- ═══════════════════════════════════════════════════════════════════════════
-- 🔐 CORREÇÃO CRÍTICA DE SEGURANÇA - ADMIN AUTH & RLS
-- ═══════════════════════════════════════════════════════════════════════════
-- Data: 2025-11-11
-- Objetivo: Corrigir policies permissivas e sincronização admin
-- ═══════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- PASSO 1: Remover policies muito permissivas
-- ────────────────────────────────────────────────────────────────────────────

-- Remover policy que permite PUBLIC fazer ALL em admin_accounts
DROP POLICY IF EXISTS "admin_accounts_access" ON admin_accounts;

-- Remover policy muito permissiva de superadmin_all
DROP POLICY IF EXISTS "superadmin_all" ON users;

-- ────────────────────────────────────────────────────────────────────────────
-- PASSO 2: Criar policies seguras para admin_accounts
-- ────────────────────────────────────────────────────────────────────────────

-- NOVA: Apenas o próprio admin ou super admins podem atualizar
CREATE POLICY "admin_can_update_own_account" ON admin_accounts
  FOR UPDATE
  USING (
    auth.uid() = id
    OR
    EXISTS (
      SELECT 1 FROM admin_accounts
      WHERE admin_accounts.id = auth.uid()
      AND permissions->>'super_admin' = 'true'
    )
  );

-- NOVA: Apenas super admins podem deletar admins
CREATE POLICY "super_admin_can_delete" ON admin_accounts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_accounts
      WHERE admin_accounts.id = auth.uid()
      AND permissions->>'super_admin' = 'true'
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- PASSO 3: Criar função de sincronização users.role <-> admin_accounts
-- ────────────────────────────────────────────────────────────────────────────

-- Função para sincronizar role de admin_accounts para users
CREATE OR REPLACE FUNCTION sync_admin_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Se foi inserido ou atualizado em admin_accounts, atualizar users.role
  UPDATE users
  SET role = CASE
    WHEN NEW.permissions->>'super_admin' = 'true' THEN 'super_admin'
    ELSE 'admin'
  END
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para manter sincronização automática
DROP TRIGGER IF EXISTS sync_admin_role_trigger ON admin_accounts;
CREATE TRIGGER sync_admin_role_trigger
AFTER INSERT OR UPDATE ON admin_accounts
FOR EACH ROW
EXECUTE FUNCTION sync_admin_role();

-- ────────────────────────────────────────────────────────────────────────────
-- PASSO 4: Sincronizar dados existentes
-- ────────────────────────────────────────────────────────────────────────────

-- Corrigir info@2lados.pt (tem admin_accounts mas users.role = 'user')
UPDATE users
SET role = 'admin'
WHERE id = '0728689d-cd48-436e-85ef-84d6341448bb'
AND role != 'admin';

-- Criar admin_account para dev@dua.com (tem users.role mas sem admin_accounts)
INSERT INTO admin_accounts (id, role, permissions)
SELECT 
  id,
  'admin',
  '{"full_access": true, "manage_users": true, "manage_coins": true}'::jsonb
FROM users
WHERE email = 'dev@dua.com'
AND NOT EXISTS (
  SELECT 1 FROM admin_accounts WHERE admin_accounts.id = users.id
);

-- ────────────────────────────────────────────────────────────────────────────
-- PASSO 5: Adicionar policy segura para users (substituindo superadmin_all)
-- ────────────────────────────────────────────────────────────────────────────

-- Admins podem ver todos os users (para painel admin)
CREATE POLICY "admin_can_view_all_users" ON users
  FOR SELECT
  USING (
    auth.uid() = id
    OR
    EXISTS (
      SELECT 1 FROM admin_accounts
      WHERE admin_accounts.id = auth.uid()
    )
  );

-- Admins podem atualizar qualquer user
CREATE POLICY "admin_can_update_users" ON users
  FOR UPDATE
  USING (
    auth.uid() = id
    OR
    EXISTS (
      SELECT 1 FROM admin_accounts
      WHERE admin_accounts.id = auth.uid()
    )
  );

-- Apenas super admins podem deletar users
CREATE POLICY "super_admin_can_delete_users" ON users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_accounts
      WHERE admin_accounts.id = auth.uid()
      AND permissions->>'super_admin' = 'true'
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- COMENTÁRIOS E AUDITORIA
-- ────────────────────────────────────────────────────────────────────────────

COMMENT ON FUNCTION sync_admin_role() IS 
'Mantém sincronização automática entre admin_accounts.role e users.role';

COMMENT ON TRIGGER sync_admin_role_trigger ON admin_accounts IS 
'Trigger que atualiza users.role quando admin_accounts muda';

-- ═══════════════════════════════════════════════════════════════════════════
-- FIM DA MIGRAÇÃO
-- ═══════════════════════════════════════════════════════════════════════════
