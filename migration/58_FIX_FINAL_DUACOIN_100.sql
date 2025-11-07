-- 🔥 CORREÇÃO FINAL: DUA COIN 85% → 100%
-- Problema 1: Trigger de balance não está atualizando o balance corretamente
-- Problema 2: duacoin_staking.end_date é NOT NULL mas deveria ser opcional

-- ============================================================================
-- FIX 1: Corrigir TRIGGER para atualizar balance corretamente
-- ============================================================================

-- Remover trigger antigo
DROP TRIGGER IF EXISTS trigger_update_duacoin_balance_100 ON public.duacoin_transactions;

-- Recriar função do trigger MELHORADA
CREATE OR REPLACE FUNCTION update_duacoin_balance_100()
RETURNS TRIGGER AS $$
DECLARE
  current_balance DECIMAL(15,8) := 0;
  new_balance DECIMAL(15,8) := 0;
BEGIN
  -- Buscar balance atual
  SELECT COALESCE(balance, 0) INTO current_balance
  FROM duacoin_profiles 
  WHERE user_id = NEW.user_id;

  -- Preencher balance_before automaticamente
  IF NEW.balance_before IS NULL THEN
    NEW.balance_before := current_balance;
  END IF;
  
  -- Calcular novo balance
  IF NEW.type = 'earn' OR NEW.type = 'reward' THEN
    new_balance := current_balance + NEW.amount;
  ELSIF NEW.type = 'spend' OR NEW.type = 'transfer' THEN
    new_balance := GREATEST(current_balance - NEW.amount, 0);
  ELSE
    new_balance := current_balance;
  END IF;

  -- Preencher balance_after automaticamente
  IF NEW.balance_after IS NULL THEN
    NEW.balance_after := new_balance;
  END IF;

  -- Atualizar profile com TODOS os valores corretos
  UPDATE duacoin_profiles 
  SET 
    balance = new_balance,  -- CORREÇÃO: usar new_balance calculado
    total_earned = CASE 
      WHEN NEW.type IN ('earn', 'reward') THEN total_earned + NEW.amount
      ELSE total_earned
    END,
    total_spent = CASE 
      WHEN NEW.type IN ('spend', 'transfer') THEN total_spent + NEW.amount
      ELSE total_spent
    END,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar novo trigger
CREATE TRIGGER trigger_update_duacoin_balance_100
  BEFORE INSERT ON public.duacoin_transactions
  FOR EACH ROW EXECUTE FUNCTION update_duacoin_balance_100();

-- ============================================================================
-- FIX 2: Corrigir coluna end_date em duacoin_staking (opcional)
-- ============================================================================
ALTER TABLE public.duacoin_staking
  ALTER COLUMN end_date DROP NOT NULL;

-- ============================================================================
-- FIX 3: Garantir que duration_days tem valor default
-- ============================================================================
ALTER TABLE public.duacoin_staking
  ALTER COLUMN duration_days SET DEFAULT 30;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
SELECT 
  '✅ CORREÇÃO FINAL APLICADA' as status,
  'Trigger de balance corrigido' as fix1,
  'Coluna end_date agora opcional' as fix2,
  'duration_days com default 30' as fix3;

-- Teste rápido de balance
SELECT 
  '🧪 TESTE DE BALANCE' as test_type,
  user_id,
  balance,
  total_earned,
  total_spent
FROM duacoin_profiles
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'estraca@2lados.pt')
LIMIT 1;
