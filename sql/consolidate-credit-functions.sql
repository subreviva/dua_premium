-- ============================================================================
-- CONSOLIDAÇÃO DE FUNÇÕES DE CRÉDITOS - VERSÃO ÚNICA E DEFINITIVA
-- ============================================================================
-- Remove funções duplicadas e mantém apenas as versões seguras com auditoria
-- ============================================================================

-- ============================================================================
-- 1. REMOVER VERSÕES ANTIGAS/SIMPLES
-- ============================================================================

-- Remover versão simples de deduct_servicos_credits (2 params → integer)
DROP FUNCTION IF EXISTS deduct_servicos_credits(uuid, integer);

-- Remover versão simples de add_servicos_credits (2 params → integer)
DROP FUNCTION IF EXISTS add_servicos_credits(uuid, integer);

-- ============================================================================
-- 2. CRIAR/RECRIAR VERSÃO DEFINITIVA: deduct_servicos_credits
-- ============================================================================
-- Versão completa com auditoria e segurança

CREATE OR REPLACE FUNCTION deduct_servicos_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_operation TEXT DEFAULT 'service_usage',
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance_before INTEGER;
  v_balance_after INTEGER;
  v_transaction_id UUID;
BEGIN
  -- ✅ VALIDAÇÃO RIGOROSA
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive: %', p_amount;
  END IF;

  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be NULL';
  END IF;

  -- ✅ OBTER SALDO ATUAL (com lock para evitar race condition)
  SELECT servicos_creditos INTO v_balance_before
  FROM duaia_user_balances
  WHERE user_id = p_user_id
  FOR UPDATE; -- LOCK para transação atômica

  -- ✅ SE USUÁRIO NÃO EXISTE, CRIAR COM 0 CRÉDITOS
  IF v_balance_before IS NULL THEN
    INSERT INTO duaia_user_balances (user_id, servicos_creditos, duacoin_balance)
    VALUES (p_user_id, 0, 0);
    v_balance_before := 0;
  END IF;

  -- ✅ VERIFICAR SE TEM CRÉDITOS SUFICIENTES
  IF v_balance_before < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'insufficient_credits',
      'message', format('Insufficient credits: has %s, needs %s', v_balance_before, p_amount),
      'balance_before', v_balance_before,
      'required', p_amount,
      'deficit', p_amount - v_balance_before
    );
  END IF;

  -- ✅ DEDUZIR CRÉDITOS (ATÔMICO)
  UPDATE duaia_user_balances
  SET 
    servicos_creditos = servicos_creditos - p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING servicos_creditos INTO v_balance_after;

  -- ✅ REGISTRAR TRANSAÇÃO PARA AUDITORIA
  INSERT INTO duaia_transactions (
    user_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    operation,
    description,
    metadata
  ) VALUES (
    p_user_id,
    'debit',
    -p_amount, -- Negativo para débito
    v_balance_before,
    v_balance_after,
    p_operation,
    COALESCE(p_description, format('Credit deduction: %s', p_operation)),
    p_metadata
  ) RETURNING id INTO v_transaction_id;

  -- ✅ RETORNAR RESULTADO COMPLETO
  RETURN jsonb_build_object(
    'success', true,
    'balance_before', v_balance_before,
    'balance_after', v_balance_after,
    'amount_deducted', p_amount,
    'transaction_id', v_transaction_id,
    'operation', p_operation
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'balance_before', v_balance_before
    );
END;
$$;

-- ============================================================================
-- 3. CRIAR/RECRIAR VERSÃO DEFINITIVA: add_servicos_credits
-- ============================================================================
-- Versão completa com auditoria

CREATE OR REPLACE FUNCTION add_servicos_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT DEFAULT 'credit',
  p_description TEXT DEFAULT NULL,
  p_admin_email TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance_before INTEGER;
  v_balance_after INTEGER;
  v_transaction_id UUID;
BEGIN
  -- ✅ VALIDAÇÃO RIGOROSA
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive: %', p_amount;
  END IF;

  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be NULL';
  END IF;

  -- ✅ OBTER SALDO ATUAL (com lock)
  SELECT servicos_creditos INTO v_balance_before
  FROM duaia_user_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- ✅ SE USUÁRIO NÃO EXISTE, CRIAR REGISTRO
  IF v_balance_before IS NULL THEN
    INSERT INTO duaia_user_balances (user_id, servicos_creditos, duacoin_balance)
    VALUES (p_user_id, p_amount, 0)
    RETURNING servicos_creditos INTO v_balance_after;
    v_balance_before := 0;
  ELSE
    -- ✅ ADICIONAR CRÉDITOS (ATÔMICO)
    UPDATE duaia_user_balances
    SET 
      servicos_creditos = servicos_creditos + p_amount,
      updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING servicos_creditos INTO v_balance_after;
  END IF;

  -- ✅ REGISTRAR TRANSAÇÃO PARA AUDITORIA
  INSERT INTO duaia_transactions (
    user_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    description,
    admin_email,
    metadata
  ) VALUES (
    p_user_id,
    p_transaction_type, -- 'credit', 'purchase', 'admin_add', 'refund'
    p_amount, -- Positivo para crédito
    v_balance_before,
    v_balance_after,
    COALESCE(p_description, format('Credit addition: %s', p_transaction_type)),
    p_admin_email,
    p_metadata
  ) RETURNING id INTO v_transaction_id;

  -- ✅ RETORNAR RESULTADO COMPLETO
  RETURN jsonb_build_object(
    'success', true,
    'balance_before', v_balance_before,
    'balance_after', v_balance_after,
    'amount_added', p_amount,
    'transaction_id', v_transaction_id,
    'admin_email', p_admin_email
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- ============================================================================
-- 4. MANTER FUNÇÕES AUXILIARES (já estão corretas)
-- ============================================================================
-- Estas funções não têm duplicatas e estão funcionais:
-- - get_servicos_credits(uuid) → integer
-- - check_servicos_credits(uuid, integer) → jsonb
-- - get_service_cost(text) → integer

-- ============================================================================
-- 5. CRIAR WRAPPER FUNCTIONS PARA RETROCOMPATIBILIDADE
-- ============================================================================
-- Para código que ainda usa a assinatura antiga (2 params)

-- Wrapper para deduct (usa defaults da versão completa)
CREATE OR REPLACE FUNCTION deduct_credits_simple(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Chamar versão completa com defaults
  v_result := deduct_servicos_credits(
    p_user_id,
    p_amount,
    'service_usage', -- default operation
    NULL, -- default description
    '{}'::jsonb -- default metadata
  );

  -- Verificar sucesso
  IF (v_result->>'success')::boolean = false THEN
    RAISE EXCEPTION '%', v_result->>'message';
  END IF;

  -- Retornar novo saldo (compatibilidade com versão antiga)
  RETURN (v_result->>'balance_after')::integer;
END;
$$;

-- Wrapper para add (usa defaults da versão completa)
CREATE OR REPLACE FUNCTION add_credits_simple(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Chamar versão completa com defaults
  v_result := add_servicos_credits(
    p_user_id,
    p_amount,
    'credit', -- default type
    NULL, -- default description
    NULL, -- no admin
    '{}'::jsonb -- default metadata
  );

  -- Verificar sucesso
  IF (v_result->>'success')::boolean = false THEN
    RAISE EXCEPTION '%', v_result->>'error';
  END IF;

  -- Retornar novo saldo
  RETURN (v_result->>'balance_after')::integer;
END;
$$;

-- ============================================================================
-- 6. COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================================================

COMMENT ON FUNCTION deduct_servicos_credits(UUID, INTEGER, TEXT, TEXT, JSONB) IS 
'VERSÃO DEFINITIVA: Deduz créditos com validação rigorosa e auditoria completa. 
Retorna JSONB com {success, balance_before, balance_after, amount_deducted, transaction_id}.
Usa lock (FOR UPDATE) para evitar race conditions.
Registra todas as transações em duaia_transactions.';

COMMENT ON FUNCTION add_servicos_credits(UUID, INTEGER, TEXT, TEXT, TEXT, JSONB) IS 
'VERSÃO DEFINITIVA: Adiciona créditos com validação e auditoria completa.
Retorna JSONB com {success, balance_before, balance_after, amount_added, transaction_id}.
Usa lock (FOR UPDATE) para evitar race conditions.
Registra todas as transações em duaia_transactions.';

COMMENT ON FUNCTION deduct_credits_simple(UUID, INTEGER) IS 
'WRAPPER de retrocompatibilidade - usa deduct_servicos_credits internamente.
Retorna INTEGER (novo saldo) para compatibilidade com código antigo.
RECOMENDADO: Migrar para deduct_servicos_credits(uuid, int, text, text, jsonb).';

COMMENT ON FUNCTION add_credits_simple(UUID, INTEGER) IS 
'WRAPPER de retrocompatibilidade - usa add_servicos_credits internamente.
Retorna INTEGER (novo saldo) para compatibilidade com código antigo.
RECOMENDADO: Migrar para add_servicos_credits(uuid, int, text, text, text, jsonb).';

-- ============================================================================
-- 7. VERIFICAÇÃO FINAL
-- ============================================================================

-- Listar funções de créditos agora consolidadas
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as parameters,
  pg_catalog.pg_get_function_result(p.oid) as return_type,
  obj_description(p.oid) as description
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND (
    p.proname IN ('deduct_servicos_credits', 'add_servicos_credits', 'get_servicos_credits', 'check_servicos_credits')
    OR p.proname LIKE '%credits_simple'
  )
ORDER BY p.proname, p.pronargs;

-- ============================================================================
-- ✅ CONSOLIDAÇÃO COMPLETA!
-- ============================================================================
--
-- FUNÇÕES PRINCIPAIS (USAR ESTAS):
-- 1. deduct_servicos_credits(uuid, int, text, text, jsonb) → jsonb
-- 2. add_servicos_credits(uuid, int, text, text, text, jsonb) → jsonb
-- 3. get_servicos_credits(uuid) → integer
-- 4. check_servicos_credits(uuid, integer) → jsonb
--
-- WRAPPERS DE COMPATIBILIDADE (se necessário):
-- - deduct_credits_simple(uuid, int) → integer
-- - add_credits_simple(uuid, int) → integer
--
-- BENEFÍCIOS:
-- ✅ Sem funções duplicadas
-- ✅ Auditoria completa em duaia_transactions
-- ✅ Validação rigorosa (amount > 0, user_id not null)
-- ✅ Lock (FOR UPDATE) previne race conditions
-- ✅ Retorno JSONB com informação completa
-- ✅ Tratamento de erros com EXCEPTION
-- ✅ Retrocompatibilidade via wrappers
-- ============================================================================
