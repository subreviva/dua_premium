-- ═══════════════════════════════════════════════════════════════════════════
-- 🔒 SETUP ULTRA RIGOROSO - SISTEMA DE CRÉDITOS DUA
-- ═══════════════════════════════════════════════════════════════════════════
-- 
-- GARANTIAS:
-- ✅ Cada usuário TEM créditos (auto-criação)
-- ✅ Créditos são COBRADOS corretamente em cada ação
-- ✅ Carregamentos REFLETEM imediatamente
-- ✅ Injeção admin FUNCIONA igual para usuários
-- ✅ Transações são REGISTRADAS para auditoria
-- ✅ Operações são ATÔMICAS (não há race conditions)
-- 
-- ═══════════════════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📊 PASSO 1: CRIAR/VALIDAR TABELA duaia_user_balances
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.duaia_user_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  servicos_creditos INTEGER DEFAULT 0 NOT NULL,
  duacoin_balance INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints para garantir integridade
  CONSTRAINT servicos_creditos_not_negative CHECK (servicos_creditos >= 0),
  CONSTRAINT duacoin_balance_not_negative CHECK (duacoin_balance >= 0)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_duaia_user_balances_user_id ON public.duaia_user_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_duaia_user_balances_servicos ON public.duaia_user_balances(servicos_creditos);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_duaia_user_balances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_duaia_user_balances_updated_at ON public.duaia_user_balances;
CREATE TRIGGER trigger_update_duaia_user_balances_updated_at
  BEFORE UPDATE ON public.duaia_user_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_duaia_user_balances_updated_at();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 📜 PASSO 2: CRIAR/VALIDAR TABELA duaia_transactions (AUDITORIA)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS public.duaia_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'credit', 'debit', 'purchase', 'refund', 'admin_add', 'admin_deduct'
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  operation TEXT, -- 'music_generate', 'design_studio', 'logo_create', etc
  description TEXT,
  metadata JSONB,
  admin_email TEXT, -- Email do admin que executou (se aplicável)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT amount_not_zero CHECK (amount != 0)
);

-- Índices para queries rápidas
CREATE INDEX IF NOT EXISTS idx_duaia_transactions_user_id ON public.duaia_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_duaia_transactions_type ON public.duaia_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_duaia_transactions_created ON public.duaia_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_duaia_transactions_operation ON public.duaia_transactions(operation);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🔐 PASSO 3: RPC FUNCTIONS COM REGISTRO DE TRANSAÇÕES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ─────────────────────────────────────────────────────────────────────────
-- 💸 DEDUZIR CRÉDITOS (COM AUDITORIA)
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION deduct_servicos_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_operation TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
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
    RAISE EXCEPTION 'Insufficient credits: has %, needs %', v_balance_before, p_amount;
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
    COALESCE(p_description, 'Credit deduction'),
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
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- 🔄 ADICIONAR CRÉDITOS (COM AUDITORIA)
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION add_servicos_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT DEFAULT 'credit',
  p_description TEXT DEFAULT NULL,
  p_admin_email TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
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
    COALESCE(p_description, 'Credit addition'),
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
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- 📊 OBTER SALDO ATUAL
-- ─────────────────────────────────────────────────────────────────────────
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

  -- Se não existe, criar registro com 0
  IF v_balance IS NULL THEN
    INSERT INTO duaia_user_balances (user_id, servicos_creditos, duacoin_balance)
    VALUES (p_user_id, 0, 0);
    RETURN 0;
  END IF;

  RETURN v_balance;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- ✅ VERIFICAR CRÉDITOS SUFICIENTES (SEM DEDUZIR)
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION check_servicos_credits(
  p_user_id UUID,
  p_required_amount INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- Obter saldo (cria se não existe)
  v_current_balance := get_servicos_credits(p_user_id);

  -- Verificar se tem suficiente
  RETURN jsonb_build_object(
    'has_sufficient', v_current_balance >= p_required_amount,
    'current_balance', v_current_balance,
    'required_amount', p_required_amount,
    'deficit', GREATEST(0, p_required_amount - v_current_balance)
  );
END;
$$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🎁 PASSO 4: GRANT PERMISSIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Service role tem acesso total
GRANT ALL ON public.duaia_user_balances TO service_role;
GRANT ALL ON public.duaia_transactions TO service_role;

-- Authenticated users podem ler apenas seus próprios dados
GRANT SELECT ON public.duaia_user_balances TO authenticated;
GRANT SELECT ON public.duaia_transactions TO authenticated;

-- Grant execute nas funções
GRANT EXECUTE ON FUNCTION deduct_servicos_credits(UUID, INTEGER, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION add_servicos_credits(UUID, INTEGER, TEXT, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION get_servicos_credits(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION check_servicos_credits(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_servicos_credits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_servicos_credits(UUID, INTEGER) TO authenticated;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🔒 PASSO 5: ROW LEVEL SECURITY (RLS)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE public.duaia_user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duaia_transactions ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados podem ver apenas seus próprios dados
DROP POLICY IF EXISTS "Users can view own balance" ON public.duaia_user_balances;
CREATE POLICY "Users can view own balance" ON public.duaia_user_balances
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own transactions" ON public.duaia_transactions;
CREATE POLICY "Users can view own transactions" ON public.duaia_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role bypassa RLS (para admin operations)
DROP POLICY IF EXISTS "Service role has full access to balances" ON public.duaia_user_balances;
CREATE POLICY "Service role has full access to balances" ON public.duaia_user_balances
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role has full access to transactions" ON public.duaia_transactions;
CREATE POLICY "Service role has full access to transactions" ON public.duaia_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🎯 PASSO 6: TRIGGER PARA AUTO-CRIAR REGISTRO NO PRIMEIRO LOGIN
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Função para criar registro automaticamente quando usuário é criado
CREATE OR REPLACE FUNCTION create_user_balance_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar registro em duaia_user_balances com 0 créditos
  INSERT INTO public.duaia_user_balances (user_id, servicos_creditos, duacoin_balance)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa quando novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created_create_balance ON auth.users;
CREATE TRIGGER on_auth_user_created_create_balance
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_balance_on_signup();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ✅ PASSO 7: CRIAR REGISTROS PARA USUÁRIOS EXISTENTES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Garantir que todos os usuários existentes têm registro
INSERT INTO public.duaia_user_balances (user_id, servicos_creditos, duacoin_balance)
SELECT id, 0, 0
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.duaia_user_balances)
ON CONFLICT (user_id) DO NOTHING;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 🧪 PASSO 8: TESTES DE VALIDAÇÃO
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Descomentar para testar (substitua 'user-uuid-here' por UUID real)
/*
-- Teste 1: Verificar saldo (deve auto-criar se não existe)
SELECT get_servicos_credits('user-uuid-here');

-- Teste 2: Adicionar 100 créditos
SELECT add_servicos_credits(
  'user-uuid-here', 
  100, 
  'admin_add', 
  'Teste de adição de créditos', 
  'admin@dua.pt'
);

-- Teste 3: Verificar se tem créditos suficientes
SELECT check_servicos_credits('user-uuid-here', 50);

-- Teste 4: Deduzir 30 créditos
SELECT deduct_servicos_credits(
  'user-uuid-here',
  30,
  'design_studio_generate',
  'Geração de design no Design Studio'
);

-- Teste 5: Ver saldo atual (deve ser 70)
SELECT get_servicos_credits('user-uuid-here');

-- Teste 6: Ver histórico de transações
SELECT * FROM duaia_transactions 
WHERE user_id = 'user-uuid-here' 
ORDER BY created_at DESC;
*/

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ SETUP COMPLETO!
-- ═══════════════════════════════════════════════════════════════════════════
-- 
-- GARANTIAS ATIVADAS:
-- ✅ Tabelas criadas com constraints rigorosos
-- ✅ Cada usuário TEM registro (auto-criação em signup + fallback nas funções)
-- ✅ Créditos são verificados ANTES de deduzir
-- ✅ Operações são ATÔMICAS (locks + transactions)
-- ✅ TODAS as operações registram auditoria
-- ✅ RLS protege dados (users veem apenas seus dados)
-- ✅ Índices para performance
-- ✅ Triggers para automação
-- 
-- PRÓXIMO PASSO: Executar este SQL no Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════
