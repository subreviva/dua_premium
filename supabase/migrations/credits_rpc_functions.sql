-- ═══════════════════════════════════════════════════════════════════════════
-- 💳 FUNÇÕES RPC PARA SISTEMA DE CRÉDITOS DUA
-- ═══════════════════════════════════════════════════════════════════════════
-- 
-- REQUISITOS:
-- 1. Tabela duaia_user_balances deve existir com coluna servicos_creditos
-- 2. Tabela duaia_transactions deve existir
-- 
-- USAGE:
-- SELECT deduct_servicos_credits('user-uuid', 10);
-- SELECT add_servicos_credits('user-uuid', 10);
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- 💸 DEDUZIR CRÉDITOS (TRANSAÇÃO ATÔMICA)
-- ───────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION deduct_servicos_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Validação
  IF p_amount < 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Atualizar saldo (ATOMIC)
  UPDATE duaia_user_balances
  SET 
    servicos_creditos = servicos_creditos - p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING servicos_creditos INTO v_new_balance;

  -- Se usuário não existe, criar registro
  IF v_new_balance IS NULL THEN
    INSERT INTO duaia_user_balances (user_id, servicos_creditos, duacoin_balance)
    VALUES (p_user_id, -p_amount, 0)
    RETURNING servicos_creditos INTO v_new_balance;
  END IF;

  -- Verificar se ficou negativo (não deveria acontecer se checkCredits foi chamado)
  IF v_new_balance < 0 THEN
    RAISE WARNING 'Balance went negative for user %: %', p_user_id, v_new_balance;
  END IF;

  RETURN v_new_balance;
END;
$$;

-- ───────────────────────────────────────────────────────────────────────────
-- 🔄 ADICIONAR CRÉDITOS (REEMBOLSO OU COMPRA)
-- ───────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION add_servicos_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Validação
  IF p_amount < 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Atualizar saldo (ATOMIC)
  UPDATE duaia_user_balances
  SET 
    servicos_creditos = servicos_creditos + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING servicos_creditos INTO v_new_balance;

  -- Se usuário não existe, criar registro
  IF v_new_balance IS NULL THEN
    INSERT INTO duaia_user_balances (user_id, servicos_creditos, duacoin_balance)
    VALUES (p_user_id, p_amount, 0)
    RETURNING servicos_creditos INTO v_new_balance;
  END IF;

  RETURN v_new_balance;
END;
$$;

-- ───────────────────────────────────────────────────────────────────────────
-- 📊 OBTER SALDO ATUAL
-- ───────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_servicos_credits(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT servicos_creditos INTO v_balance
  FROM duaia_user_balances
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_balance, 0);
END;
$$;

-- ───────────────────────────────────────────────────────────────────────────
-- 🎁 GRANT PERMISSIONS
-- ───────────────────────────────────────────────────────────────────────────
-- Permitir que service role execute as funções
GRANT EXECUTE ON FUNCTION deduct_servicos_credits(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION add_servicos_credits(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_servicos_credits(UUID) TO service_role;

-- ───────────────────────────────────────────────────────────────────────────
-- ✅ TESTE DAS FUNÇÕES
-- ───────────────────────────────────────────────────────────────────────────
-- Descomentar para testar (substituir UUID do usuário)
/*
-- Adicionar 100 créditos
SELECT add_servicos_credits('user-uuid-here', 100);

-- Verificar saldo
SELECT get_servicos_credits('user-uuid-here');

-- Deduzir 30 créditos
SELECT deduct_servicos_credits('user-uuid-here', 30);

-- Verificar novo saldo (deve ser 70)
SELECT get_servicos_credits('user-uuid-here');
*/
