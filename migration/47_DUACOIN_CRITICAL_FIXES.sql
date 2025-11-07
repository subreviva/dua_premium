-- 🔥🚨 CORREÇÕES CRÍTICAS DUA COIN - ULTRA URGENTE 🚨🔥
-- Executar IMEDIATAMENTE via Supabase Dashboard

-- 1. 🔧 CORRIGIR CONSTRAINT balance_before em duacoin_transactions
ALTER TABLE public.duacoin_transactions 
ALTER COLUMN balance_before DROP NOT NULL;

-- Adicionar valor padrão
ALTER TABLE public.duacoin_transactions 
ALTER COLUMN balance_before SET DEFAULT 0;

-- 2. 🔧 ADICIONAR COLUNAS OPCIONAIS FINANCEIRAS ESSENCIAIS

-- Em duacoin_transactions
ALTER TABLE public.duacoin_transactions 
ADD COLUMN IF NOT EXISTS reference_id TEXT,
ADD COLUMN IF NOT EXISTS fee DECIMAL(15,8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- Em duacoin_staking  
ALTER TABLE public.duacoin_staking
ADD COLUMN IF NOT EXISTS reward_rate DECIMAL(5,4) DEFAULT 0.05,
ADD COLUMN IF NOT EXISTS earned_rewards DECIMAL(15,8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 30;

-- 3. 🛡️ CORRIGIR POLÍTICAS RLS ULTRA-SEGURAS

-- duacoin_profiles - MEGA SEGURO
DROP POLICY IF EXISTS "Users can view own profile" ON public.duacoin_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.duacoin_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.duacoin_profiles;

CREATE POLICY "duacoin_profiles_select_own" ON public.duacoin_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "duacoin_profiles_insert_own" ON public.duacoin_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "duacoin_profiles_update_own" ON public.duacoin_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- duacoin_transactions - ULTRA SEGURO
DROP POLICY IF EXISTS "Users can view own transactions" ON public.duacoin_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.duacoin_transactions;

CREATE POLICY "duacoin_transactions_select_own" ON public.duacoin_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "duacoin_transactions_insert_own" ON public.duacoin_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- duacoin_staking - MÁXIMA SEGURANÇA
DROP POLICY IF EXISTS "Users can view own staking" ON public.duacoin_staking;
DROP POLICY IF EXISTS "Users can insert own staking" ON public.duacoin_staking;
DROP POLICY IF EXISTS "Users can update own staking" ON public.duacoin_staking;

CREATE POLICY "duacoin_staking_select_own" ON public.duacoin_staking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "duacoin_staking_insert_own" ON public.duacoin_staking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "duacoin_staking_update_own" ON public.duacoin_staking
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. 🔄 CRIAR TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA DE BALANCES

CREATE OR REPLACE FUNCTION update_duacoin_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar balance_before se não foi definido
  IF NEW.balance_before IS NULL THEN
    SELECT COALESCE(balance, 0) INTO NEW.balance_before
    FROM duacoin_profiles 
    WHERE user_id = NEW.user_id;
  END IF;

  -- Atualizar profile com novos totais
  UPDATE duacoin_profiles 
  SET 
    balance = CASE 
      WHEN NEW.type = 'earn' THEN balance + NEW.amount
      WHEN NEW.type = 'spend' THEN balance - NEW.amount
      ELSE balance
    END,
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

-- Aplicar trigger
DROP TRIGGER IF EXISTS trigger_update_duacoin_balance ON public.duacoin_transactions;
CREATE TRIGGER trigger_update_duacoin_balance
  BEFORE INSERT ON public.duacoin_transactions
  FOR EACH ROW EXECUTE FUNCTION update_duacoin_balance();

-- 5. 🗑️ REMOVER TABELAS LEGADAS (CUIDADO!)
-- Descomentar apenas se confirmar que não são usadas
-- DROP TABLE IF EXISTS public.transactions;
-- DROP TABLE IF EXISTS public.wallets;

-- ✅ CORREÇÕES CRÍTICAS APLICADAS
-- Execute este SQL via Supabase Dashboard → SQL Editor
-- Depois re-execute: node migration/46_DUACOIN_MODULE_VALIDATION.mjs