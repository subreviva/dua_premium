-- 🔥 SQL CRÍTICO PARA EXECUÇÃO MANUAL - COPIAR TUDO E EXECUTAR
-- Supabase Dashboard → SQL Editor
-- https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/sql

-- ============================================================================
-- FASE 1: ADMIN SETUP (CRÍTICO)
-- ============================================================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_access BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Configurar Super Admin
UPDATE public.users 
SET 
  role = 'super_admin',
  full_access = true,
  duaia_enabled = true,
  duacoin_enabled = true
WHERE email = 'estraca@2lados.pt';

-- ============================================================================
-- FASE 2: RENOMEAR TABELAS LEGADAS
-- ============================================================================
ALTER TABLE IF EXISTS public.profiles RENAME TO legacy_profiles;
ALTER TABLE IF EXISTS public.transactions RENAME TO legacy_transactions;
ALTER TABLE IF EXISTS public.wallets RENAME TO legacy_wallets;

-- ============================================================================
-- FASE 3: ÍNDICES DE PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_duaia_conversations_user ON public.duaia_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_duaia_conversations_updated ON public.duaia_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_duaia_messages_conversation ON public.duaia_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_duaia_messages_created ON public.duaia_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_duacoin_transactions_user ON public.duacoin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_duacoin_transactions_type ON public.duacoin_transactions(type);
CREATE INDEX IF NOT EXISTS idx_duacoin_transactions_created ON public.duacoin_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_duacoin_staking_user ON public.duacoin_staking(user_id);
CREATE INDEX IF NOT EXISTS idx_duacoin_staking_status ON public.duacoin_staking(status);

-- ============================================================================
-- FASE 4: CONSTRAINTS FINANCEIROS
-- ============================================================================
ALTER TABLE public.duacoin_transactions DROP CONSTRAINT IF EXISTS check_transaction_amount_positive;
ALTER TABLE public.duacoin_transactions ADD CONSTRAINT check_transaction_amount_positive CHECK (amount > 0);

ALTER TABLE public.duacoin_profiles DROP CONSTRAINT IF EXISTS check_balance_non_negative;
ALTER TABLE public.duacoin_profiles ADD CONSTRAINT check_balance_non_negative CHECK (balance >= 0);

ALTER TABLE public.duacoin_profiles DROP CONSTRAINT IF EXISTS check_totals_non_negative;
ALTER TABLE public.duacoin_profiles ADD CONSTRAINT check_totals_non_negative CHECK (total_earned >= 0 AND total_spent >= 0);

ALTER TABLE public.duacoin_staking DROP CONSTRAINT IF EXISTS check_staking_amount_positive;
ALTER TABLE public.duacoin_staking ADD CONSTRAINT check_staking_amount_positive CHECK (amount > 0);

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
SELECT 
  '✅ SUPER ADMIN' as status,
  email, 
  role, 
  full_access,
  duaia_enabled,
  duacoin_enabled
FROM public.users 
WHERE email = 'estraca@2lados.pt';

-- ✅ APÓS EXECUTAR, RECARREGUE A PÁGINA (Ctrl+Shift+R) E FAÇA LOGOUT/LOGIN