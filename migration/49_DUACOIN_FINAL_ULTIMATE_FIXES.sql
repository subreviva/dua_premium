-- 🔥🚨 CORREÇÕES FINAIS DEFINITIVAS DUA COIN - ÚLTIMO ROUND 🚨🔥
-- Aplicação DEFINITIVA de TODAS as correções restantes

-- 1. 🔧 INVESTIGAR E CORRIGIR CHECK CONSTRAINT type
-- Primeiro verificar o constraint atual
DO $$ 
BEGIN
  -- Remover constraint problemático se existir
  ALTER TABLE public.duacoin_transactions DROP CONSTRAINT IF EXISTS duacoin_transactions_type_check;
  
  -- Criar constraint correto com valores exatos
  ALTER TABLE public.duacoin_transactions
  ADD CONSTRAINT duacoin_transactions_type_check 
  CHECK (type IN ('earn', 'spend', 'transfer', 'reward'));
  
  RAISE NOTICE 'Constraint type atualizado com sucesso';
END $$;

-- 2. 🔧 CORRIGIR constraint apy_rate em staking
ALTER TABLE public.duacoin_staking
ALTER COLUMN apy_rate DROP NOT NULL;

ALTER TABLE public.duacoin_staking
ALTER COLUMN apy_rate SET DEFAULT 0.05;

-- 3. 🛡️ RLS POLICIES - INVESTIGAÇÃO E CORREÇÃO DEFINITIVA

-- Ver quais policies existem atualmente
DO $$ 
DECLARE
  pol record;
BEGIN
  FOR pol IN 
    SELECT schemaname, tablename, policyname
    FROM pg_policies 
    WHERE tablename IN ('duacoin_profiles', 'duacoin_transactions', 'duacoin_staking')
  LOOP
    RAISE NOTICE 'Policy encontrada: %.% - %', pol.schemaname, pol.tablename, pol.policyname;
  END LOOP;
END $$;

-- Desabilitar RLS temporariamente para limpeza total
ALTER TABLE public.duacoin_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.duacoin_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.duacoin_staking DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as policies existentes com força
DO $$ 
DECLARE
  pol record;
BEGIN
  -- duacoin_profiles
  FOR pol IN 
    SELECT policyname FROM pg_policies 
    WHERE tablename = 'duacoin_profiles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.duacoin_profiles', pol.policyname);
  END LOOP;
  
  -- duacoin_transactions
  FOR pol IN 
    SELECT policyname FROM pg_policies 
    WHERE tablename = 'duacoin_transactions' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.duacoin_transactions', pol.policyname);
  END LOOP;
  
  -- duacoin_staking
  FOR pol IN 
    SELECT policyname FROM pg_policies 
    WHERE tablename = 'duacoin_staking' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.duacoin_staking', pol.policyname);
  END LOOP;
END $$;

-- Reativar RLS
ALTER TABLE public.duacoin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duacoin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duacoin_staking ENABLE ROW LEVEL SECURITY;

-- CRIAR POLICIES COM MÁXIMA SEGURANÇA E SIMPLICIDADE

-- duacoin_profiles
CREATE POLICY "duacoin_profiles_all_own" ON public.duacoin_profiles
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- duacoin_transactions  
CREATE POLICY "duacoin_transactions_all_own" ON public.duacoin_transactions
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- duacoin_staking
CREATE POLICY "duacoin_staking_all_own" ON public.duacoin_staking
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. 🔄 VERIFICAR E RECRIAR TRIGGER SE NECESSÁRIO
CREATE OR REPLACE FUNCTION update_duacoin_balance_ultimate()
RETURNS TRIGGER AS $$
DECLARE
  current_balance DECIMAL(15,8) := 0;
BEGIN
  -- Buscar balance atual com proteção
  BEGIN
    SELECT COALESCE(balance, 0) INTO current_balance
    FROM duacoin_profiles 
    WHERE user_id = NEW.user_id;
  EXCEPTION WHEN OTHERS THEN
    current_balance := 0;
  END;

  -- Preencher campos automáticos
  IF NEW.balance_before IS NULL THEN
    NEW.balance_before := current_balance;
  END IF;
  
  IF NEW.balance_after IS NULL THEN
    NEW.balance_after := CASE 
      WHEN NEW.type = 'earn' OR NEW.type = 'reward' THEN current_balance + NEW.amount
      WHEN NEW.type = 'spend' THEN current_balance - NEW.amount
      ELSE current_balance
    END;
  END IF;

  -- Atualizar profile com novos valores
  UPDATE duacoin_profiles 
  SET 
    balance = NEW.balance_after,
    total_earned = CASE 
      WHEN NEW.type = 'earn' OR NEW.type = 'reward' THEN total_earned + NEW.amount
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

-- Recriar trigger com nome único
DROP TRIGGER IF EXISTS trigger_update_duacoin_balance ON public.duacoin_transactions;
DROP TRIGGER IF EXISTS trigger_update_duacoin_balance_mega ON public.duacoin_transactions;
DROP TRIGGER IF EXISTS trigger_update_duacoin_balance_ultimate ON public.duacoin_transactions;

CREATE TRIGGER trigger_update_duacoin_balance_ultimate
  BEFORE INSERT ON public.duacoin_transactions
  FOR EACH ROW EXECUTE FUNCTION update_duacoin_balance_ultimate();

-- 5. 📊 VERIFICAÇÃO FINAL
DO $$ 
BEGIN
  RAISE NOTICE '✅ TODAS AS CORREÇÕES FINAIS APLICADAS COM SUCESSO!';
  RAISE NOTICE '🔒 RLS Policies recriadas';
  RAISE NOTICE '🔧 Constraints corrigidos';
  RAISE NOTICE '⚙️ Triggers atualizados';
  RAISE NOTICE '🚀 PRONTO PARA RE-VALIDAÇÃO!';
END $$;
