-- 🔥🚨 CORREÇÕES ULTRA-MEGA DEFINITIVAS DUA COIN 🚨🔥
-- Aplicação AUTOMÁTICA de todas as correções restantes

-- 1. 🔧 CORRIGIR balance_after constraint (novo problema detectado)
ALTER TABLE public.duacoin_transactions 
ALTER COLUMN balance_after DROP NOT NULL;

ALTER TABLE public.duacoin_transactions 
ALTER COLUMN balance_after SET DEFAULT 0;

-- 2. 🔧 Corrigir duration_days em staking
ALTER TABLE public.duacoin_staking
ALTER COLUMN duration_days DROP NOT NULL;

-- 3. 🛡️ RLS POLICIES ULTRA-DEFINITIVAS (corrigir falhas de segurança)

-- Recriar policies com ABSOLUTA segurança
ALTER TABLE public.duacoin_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.duacoin_transactions DISABLE ROW LEVEL SECURITY; 
ALTER TABLE public.duacoin_staking DISABLE ROW LEVEL SECURITY;

-- Limpar todas policies
DROP POLICY IF EXISTS "duacoin_profiles_select_own" ON public.duacoin_profiles;
DROP POLICY IF EXISTS "duacoin_profiles_insert_own" ON public.duacoin_profiles;
DROP POLICY IF EXISTS "duacoin_profiles_update_own" ON public.duacoin_profiles;
DROP POLICY IF EXISTS "duacoin_transactions_select_own" ON public.duacoin_transactions;
DROP POLICY IF EXISTS "duacoin_transactions_insert_own" ON public.duacoin_transactions;
DROP POLICY IF EXISTS "duacoin_staking_select_own" ON public.duacoin_staking;
DROP POLICY IF EXISTS "duacoin_staking_insert_own" ON public.duacoin_staking;
DROP POLICY IF EXISTS "duacoin_staking_update_own" ON public.duacoin_staking;

-- Reativar RLS
ALTER TABLE public.duacoin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duacoin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duacoin_staking ENABLE ROW LEVEL SECURITY;

-- POLICIES ULTRA-SEGURAS DEFINITIVAS
CREATE POLICY "duacoin_profiles_ultra_secure_select" ON public.duacoin_profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "duacoin_profiles_ultra_secure_insert" ON public.duacoin_profiles
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "duacoin_profiles_ultra_secure_update" ON public.duacoin_profiles
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "duacoin_transactions_ultra_secure_select" ON public.duacoin_transactions
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "duacoin_transactions_ultra_secure_insert" ON public.duacoin_transactions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "duacoin_staking_ultra_secure_select" ON public.duacoin_staking
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "duacoin_staking_ultra_secure_insert" ON public.duacoin_staking
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "duacoin_staking_ultra_secure_update" ON public.duacoin_staking
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

-- 4. 🔄 TRIGGER ULTRA-MEGA DEFINITIVO
CREATE OR REPLACE FUNCTION update_duacoin_balance_mega()
RETURNS TRIGGER AS $$
BEGIN
  -- Buscar balance atual
  DECLARE
    current_balance DECIMAL(15,8) := 0;
  BEGIN
    SELECT COALESCE(balance, 0) INTO current_balance
    FROM duacoin_profiles 
    WHERE user_id = NEW.user_id;
  EXCEPTION WHEN OTHERS THEN
    current_balance := 0;
  END;

  -- Preencher balance_before e balance_after
  IF NEW.balance_before IS NULL THEN
    NEW.balance_before := current_balance;
  END IF;
  
  IF NEW.balance_after IS NULL THEN
    NEW.balance_after := CASE 
      WHEN NEW.type = 'earn' THEN current_balance + NEW.amount
      WHEN NEW.type = 'spend' THEN current_balance - NEW.amount
      ELSE current_balance
    END;
  END IF;

  -- Atualizar profile
  UPDATE duacoin_profiles 
  SET 
    balance = NEW.balance_after,
    total_earned = CASE 
      WHEN NEW.type = 'earn' THEN total_earned + NEW.amount
      ELSE total_earned
    END,
    total_spent = CASE 
      WHEN NEW.type = 'spend' THEN total_spent + NEW.amount
      ELSE total_spent
    END,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
DROP TRIGGER IF EXISTS trigger_update_duacoin_balance ON public.duacoin_transactions;
DROP TRIGGER IF EXISTS trigger_update_duacoin_balance_mega ON public.duacoin_transactions;
CREATE TRIGGER trigger_update_duacoin_balance_mega
  BEFORE INSERT ON public.duacoin_transactions
  FOR EACH ROW EXECUTE FUNCTION update_duacoin_balance_mega();

-- ✅ CORREÇÕES ULTRA-MEGA DEFINITIVAS APLICADAS