-- ===================================================
-- SCHEMA CRÉDITOS DUA IA COM SYNC DUACOIN
-- Sistema unificado com sincronização automática
-- ===================================================

-- ===================================================
-- 1. POPULAR TABELA TRANSACTIONS (estava vazia)
-- ===================================================

-- Adicionar colunas se não existirem
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('purchase', 'service_usage', 'refund', 'bonus', 'transfer')),
ADD COLUMN IF NOT EXISTS amount_dua DECIMAL(20, 8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_creditos INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ===================================================
-- 2. CRIAR FUNÇÃO DE SINCRONIZAÇÃO USERS ↔️ DUACOIN_PROFILES
-- ===================================================

-- Função para sincronizar saldo_dua → duacoin_profiles.balance
CREATE OR REPLACE FUNCTION sync_saldo_to_duacoin()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando saldo_dua mudar em users, atualiza balance em duacoin_profiles
  UPDATE public.duacoin_profiles
  SET 
    balance = NEW.saldo_dua,
    updated_at = NOW()
  WHERE user_id = NEW.id;
  
  -- Se não existir perfil DUA Coin, criar
  IF NOT FOUND THEN
    INSERT INTO public.duacoin_profiles (user_id, balance)
    VALUES (NEW.id, NEW.saldo_dua)
    ON CONFLICT (user_id) DO UPDATE
    SET balance = NEW.saldo_dua;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para sincronizar duacoin_profiles.balance → saldo_dua
CREATE OR REPLACE FUNCTION sync_duacoin_to_saldo()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando balance mudar em duacoin_profiles, atualiza saldo_dua em users
  UPDATE public.users
  SET 
    saldo_dua = NEW.balance,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================
-- 3. CRIAR TRIGGERS DE SINCRONIZAÇÃO BIDIRECIONAL
-- ===================================================

-- Trigger: users.saldo_dua → duacoin_profiles.balance
DROP TRIGGER IF EXISTS trigger_sync_saldo_to_duacoin ON public.users;
CREATE TRIGGER trigger_sync_saldo_to_duacoin
  AFTER UPDATE OF saldo_dua ON public.users
  FOR EACH ROW
  WHEN (OLD.saldo_dua IS DISTINCT FROM NEW.saldo_dua)
  EXECUTE FUNCTION sync_saldo_to_duacoin();

-- Trigger: duacoin_profiles.balance → users.saldo_dua
DROP TRIGGER IF EXISTS trigger_sync_duacoin_to_saldo ON public.duacoin_profiles;
CREATE TRIGGER trigger_sync_duacoin_to_saldo
  AFTER UPDATE OF balance ON public.duacoin_profiles
  FOR EACH ROW
  WHEN (OLD.balance IS DISTINCT FROM NEW.balance)
  EXECUTE FUNCTION sync_duacoin_to_saldo();

-- ===================================================
-- 4. SINCRONIZAR DADOS EXISTENTES (one-time)
-- ===================================================

-- Copiar balance de duacoin_profiles → saldo_dua (source of truth inicial)
UPDATE public.users u
SET saldo_dua = COALESCE(dp.balance, 0)
FROM public.duacoin_profiles dp
WHERE u.id = dp.user_id
  AND (u.saldo_dua IS NULL OR u.saldo_dua = 0);

-- ===================================================
-- 5. FUNÇÃO PARA COMPRAR CRÉDITOS (ATÔMICA)
-- ===================================================

CREATE OR REPLACE FUNCTION comprar_creditos(
  p_user_id UUID,
  p_amount_eur DECIMAL,
  p_exchange_rate DECIMAL,
  p_creditos INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_custo_dua DECIMAL(20, 8);
  v_saldo_atual DECIMAL(20, 8);
  v_transaction_id UUID;
BEGIN
  -- Calcular custo em DUA
  v_custo_dua := p_amount_eur * p_exchange_rate;
  
  -- Verificar saldo
  SELECT saldo_dua INTO v_saldo_atual
  FROM public.users
  WHERE id = p_user_id;
  
  IF v_saldo_atual < v_custo_dua THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Saldo insuficiente',
      'saldo_necessario', v_custo_dua,
      'saldo_atual', v_saldo_atual
    );
  END IF;
  
  -- Debitar DUA e creditar créditos de serviço (ATÔMICO)
  UPDATE public.users
  SET 
    saldo_dua = saldo_dua - v_custo_dua,
    creditos_servicos = creditos_servicos + p_creditos,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Registrar transação
  INSERT INTO public.transactions (
    user_id,
    source_type,
    amount_dua,
    amount_creditos,
    description,
    metadata,
    status
  )
  VALUES (
    p_user_id,
    'purchase',
    -v_custo_dua,
    p_creditos,
    'Compra de créditos de serviço',
    jsonb_build_object(
      'amount_eur', p_amount_eur,
      'exchange_rate', p_exchange_rate,
      'timestamp', NOW()
    ),
    'completed'
  )
  RETURNING id INTO v_transaction_id;
  
  -- Retornar sucesso
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'saldo_dua_restante', v_saldo_atual - v_custo_dua,
    'creditos_total', (SELECT creditos_servicos FROM users WHERE id = p_user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================
-- 6. FUNÇÃO PARA CONSUMIR CRÉDITOS (ATÔMICA)
-- ===================================================

CREATE OR REPLACE FUNCTION consumir_creditos(
  p_user_id UUID,
  p_creditos INTEGER,
  p_service_type VARCHAR,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
  v_creditos_atuais INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Verificar saldo de créditos
  SELECT creditos_servicos INTO v_creditos_atuais
  FROM public.users
  WHERE id = p_user_id;
  
  IF v_creditos_atuais < p_creditos THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Créditos insuficientes',
      'creditos_necessarios', p_creditos,
      'creditos_atuais', v_creditos_atuais
    );
  END IF;
  
  -- Debitar créditos (ATÔMICO)
  UPDATE public.users
  SET 
    creditos_servicos = creditos_servicos - p_creditos,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Registrar transação
  INSERT INTO public.transactions (
    user_id,
    source_type,
    amount_dua,
    amount_creditos,
    description,
    metadata,
    status
  )
  VALUES (
    p_user_id,
    'service_usage',
    0,
    -p_creditos,
    'Consumo de serviço: ' || p_service_type,
    p_metadata,
    'completed'
  )
  RETURNING id INTO v_transaction_id;
  
  -- Retornar sucesso
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'creditos_restantes', v_creditos_atuais - p_creditos
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================
-- 7. ÍNDICES PARA PERFORMANCE
-- ===================================================

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_source_type ON public.transactions(source_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON public.transactions(user_id, source_type);

-- ===================================================
-- 8. RLS POLICIES
-- ===================================================

-- Transactions: usuários veem apenas suas próprias transações
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own transactions" ON public.transactions;
CREATE POLICY "Users read own transactions"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System insert transactions" ON public.transactions;
CREATE POLICY "System insert transactions"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ===================================================
-- 9. VIEW PARA DASHBOARD
-- ===================================================

CREATE OR REPLACE VIEW user_balance_summary AS
SELECT 
  u.id,
  u.email,
  u.saldo_dua,
  u.creditos_servicos,
  dp.balance AS duacoin_balance,
  dp.total_earned,
  dp.total_spent,
  COUNT(DISTINCT t.id) AS total_transactions,
  COALESCE(SUM(CASE WHEN t.source_type = 'purchase' THEN t.amount_creditos ELSE 0 END), 0) AS total_creditos_comprados,
  COALESCE(SUM(CASE WHEN t.source_type = 'service_usage' THEN ABS(t.amount_creditos) ELSE 0 END), 0) AS total_creditos_consumidos
FROM public.users u
LEFT JOIN public.duacoin_profiles dp ON u.id = dp.user_id
LEFT JOIN public.transactions t ON u.id = t.user_id
GROUP BY u.id, u.email, u.saldo_dua, u.creditos_servicos, dp.balance, dp.total_earned, dp.total_spent;

-- ===================================================
-- 10. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ===================================================

COMMENT ON FUNCTION sync_saldo_to_duacoin() IS 'Sincroniza users.saldo_dua → duacoin_profiles.balance automaticamente';
COMMENT ON FUNCTION sync_duacoin_to_saldo() IS 'Sincroniza duacoin_profiles.balance → users.saldo_dua automaticamente';
COMMENT ON FUNCTION comprar_creditos IS 'Compra créditos de serviço usando DUA (transação atômica)';
COMMENT ON FUNCTION consumir_creditos IS 'Consome créditos ao usar serviços DUA IA (transação atômica)';
COMMENT ON VIEW user_balance_summary IS 'View consolidada com saldos e estatísticas de transações';

-- ===================================================
-- ✅ SCHEMA COMPLETO E PRONTO PARA USO
-- ===================================================

-- COMO USAR:
--
-- 1. Comprar créditos:
--    SELECT comprar_creditos(
--      'user-uuid'::uuid,
--      10.00,  -- EUR
--      0.0476, -- Exchange rate (1 EUR = 21 DUA)
--      1000    -- Créditos
--    );
--
-- 2. Consumir créditos:
--    SELECT consumir_creditos(
--      'user-uuid'::uuid,
--      50,     -- Créditos
--      'music_generation',
--      '{"model": "suno", "duration": 30}'::jsonb
--    );
--
-- 3. Ver saldo:
--    SELECT * FROM user_balance_summary WHERE id = 'user-uuid';
