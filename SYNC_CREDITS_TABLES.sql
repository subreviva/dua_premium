-- ═══════════════════════════════════════════════════════════════
-- 🔧 SINCRONIZAR CRÉDITOS: users ↔ duaia_user_balances
-- ═══════════════════════════════════════════════════════════════
-- 
-- PROBLEMA:
--   Sistema usa 2 tabelas para créditos:
--   - users.creditos_servicos (DISPLAY - navbar, home)
--   - duaia_user_balances.servicos_creditos (DESCONTO - APIs)
--   
--   Quando desconta, apenas atualiza duaia_user_balances
--   Display fica desatualizado (mostra 150, mas real é 96)
-- 
-- SOLUÇÃO:
--   Trigger que sincroniza automaticamente:
--   duaia_user_balances.servicos_creditos → users.creditos_servicos
-- 
-- @created 2025-11-12
-- @author DUA IA - Ultra Rigoroso System
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- PASSO 1: Sincronizar valores atuais (one-time fix)
-- ═══════════════════════════════════════════════════════════════

-- Atualizar users.creditos_servicos com valores de duaia_user_balances
UPDATE users u
SET 
  creditos_servicos = b.servicos_creditos,
  updated_at = NOW()
FROM duaia_user_balances b
WHERE u.id = b.user_id
  AND (u.creditos_servicos IS NULL OR u.creditos_servicos != b.servicos_creditos);

-- Resultado esperado: X rows affected (users que estavam dessincronizados)

-- ═══════════════════════════════════════════════════════════════
-- PASSO 2: Criar função de sincronização automática
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION sync_credits_to_users()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando duaia_user_balances.servicos_creditos muda,
  -- atualizar automaticamente users.creditos_servicos
  UPDATE users
  SET 
    creditos_servicos = NEW.servicos_creditos,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- PASSO 3: Criar trigger para sincronização automática
-- ═══════════════════════════════════════════════════════════════

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS sync_credits_after_update ON duaia_user_balances;
DROP TRIGGER IF EXISTS sync_credits_after_insert ON duaia_user_balances;

-- Trigger: Sincronizar após UPDATE
CREATE TRIGGER sync_credits_after_update
  AFTER UPDATE OF servicos_creditos ON duaia_user_balances
  FOR EACH ROW
  WHEN (OLD.servicos_creditos IS DISTINCT FROM NEW.servicos_creditos)
  EXECUTE FUNCTION sync_credits_to_users();

-- Trigger: Sincronizar após INSERT
CREATE TRIGGER sync_credits_after_insert
  AFTER INSERT ON duaia_user_balances
  FOR EACH ROW
  EXECUTE FUNCTION sync_credits_to_users();

-- ═══════════════════════════════════════════════════════════════
-- PASSO 4: Criar função inversa (users → duaia_user_balances)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION sync_credits_to_balances()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando users.creditos_servicos muda manualmente,
  -- sincronizar para duaia_user_balances
  INSERT INTO duaia_user_balances (
    user_id,
    servicos_creditos,
    duacoin_balance
  )
  VALUES (
    NEW.id,
    NEW.creditos_servicos,
    0
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    servicos_creditos = EXCLUDED.servicos_creditos,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- PASSO 5: Criar trigger bidirecional (users → duaia_user_balances)
-- ═══════════════════════════════════════════════════════════════

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS sync_credits_from_users ON users;

-- Trigger: Sincronizar de users para duaia_user_balances
CREATE TRIGGER sync_credits_from_users
  AFTER INSERT OR UPDATE OF creditos_servicos ON users
  FOR EACH ROW
  WHEN (NEW.creditos_servicos IS NOT NULL)
  EXECUTE FUNCTION sync_credits_to_balances();

-- ═══════════════════════════════════════════════════════════════
-- COMENTÁRIOS: Documentar funções
-- ═══════════════════════════════════════════════════════════════

COMMENT ON FUNCTION sync_credits_to_users() IS 
'Trigger: Sincroniza créditos de duaia_user_balances para users (display).
Mantém ambas tabelas em sync automaticamente.';

COMMENT ON FUNCTION sync_credits_to_balances() IS 
'Trigger: Sincroniza créditos de users para duaia_user_balances (desconto).
Sincronização bidirecional para garantir consistência.';

-- ═══════════════════════════════════════════════════════════════
-- TESTE: Verificar sincronização
-- ═══════════════════════════════════════════════════════════════

-- Para testar:
-- 1. Atualizar duaia_user_balances:
--    UPDATE duaia_user_balances 
--    SET servicos_creditos = 100 
--    WHERE user_id = 'ALGUM_USER_ID';
--
-- 2. Verificar se users foi atualizado:
--    SELECT id, email, creditos_servicos 
--    FROM users 
--    WHERE id = 'ALGUM_USER_ID';
--
-- 3. Atualizar users:
--    UPDATE users 
--    SET creditos_servicos = 200 
--    WHERE id = 'ALGUM_USER_ID';
--
-- 4. Verificar se duaia_user_balances foi atualizado:
--    SELECT user_id, servicos_creditos 
--    FROM duaia_user_balances 
--    WHERE user_id = 'ALGUM_USER_ID';

-- ═══════════════════════════════════════════════════════════════
-- VERIFICAÇÃO: Mostrar users dessincronizados (antes do fix)
-- ═══════════════════════════════════════════════════════════════

SELECT 
  u.email,
  u.creditos_servicos AS users_credits,
  b.servicos_creditos AS balances_credits,
  u.creditos_servicos - b.servicos_creditos AS difference
FROM users u
LEFT JOIN duaia_user_balances b ON u.id = b.user_id
WHERE u.creditos_servicos != b.servicos_creditos
   OR (u.creditos_servicos IS NOT NULL AND b.servicos_creditos IS NULL)
   OR (u.creditos_servicos IS NULL AND b.servicos_creditos IS NOT NULL)
ORDER BY difference DESC;
