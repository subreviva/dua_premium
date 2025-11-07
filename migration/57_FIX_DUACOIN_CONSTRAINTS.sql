-- 🔥 CORREÇÃO URGENTE: DUA COIN CONSTRAINTS
-- Problema: duacoin_transactions_type_check está a bloquear inserts
-- Problema: duacoin_staking.apy_rate é NOT NULL mas deveria ser opcional

-- ============================================================================
-- FIX 1: Remover constraint type_check problemático e recriar corretamente
-- ============================================================================
ALTER TABLE public.duacoin_transactions 
  DROP CONSTRAINT IF EXISTS duacoin_transactions_type_check;

-- Recriar constraint com valores corretos: earn, spend, transfer
ALTER TABLE public.duacoin_transactions
  ADD CONSTRAINT duacoin_transactions_type_check 
  CHECK (type IN ('earn', 'spend', 'transfer', 'reward', 'staking', 'unstaking'));

-- ============================================================================
-- FIX 2: Corrigir coluna apy_rate em duacoin_staking
-- ============================================================================
ALTER TABLE public.duacoin_staking
  ALTER COLUMN apy_rate DROP NOT NULL,
  ALTER COLUMN apy_rate SET DEFAULT 5.0;

-- Adicionar apy_rate se não existir
ALTER TABLE public.duacoin_staking
  ADD COLUMN IF NOT EXISTS apy_rate DECIMAL(5,2) DEFAULT 5.0;

-- ============================================================================
-- FIX 3: Garantir que balance_before e balance_after aceitam NULL
-- ============================================================================
ALTER TABLE public.duacoin_transactions
  ALTER COLUMN balance_before DROP NOT NULL,
  ALTER COLUMN balance_after DROP NOT NULL;

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
SELECT 
  '✅ FIX APLICADO' as status,
  'duacoin_transactions type_check corrigido' as fix1,
  'duacoin_staking apy_rate agora opcional' as fix2;
