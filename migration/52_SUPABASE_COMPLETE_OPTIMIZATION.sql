-- 🔥🚀 CORREÇÕES COMPLETAS SUPABASE - OTIMIZAÇÃO TOTAL 🚀🔥
-- Execute no Supabase Dashboard → SQL Editor

-- ====================================================================
-- FASE 1: ADICIONAR COLUNAS DE ADMINISTRAÇÃO
-- ====================================================================

-- 1.1 Adicionar coluna role
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 1.2 Adicionar coluna full_access
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS full_access BOOLEAN DEFAULT false;

-- 1.3 Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- 1.4 Configurar estraca@2lados.pt como SUPER ADMIN
UPDATE public.users 
SET 
  role = 'super_admin',
  full_access = true,
  duaia_enabled = true,
  duacoin_enabled = true
WHERE email = 'estraca@2lados.pt';

-- ====================================================================
-- FASE 2: RENOMEAR TABELAS LEGADAS (evitar conflitos)
-- ====================================================================

-- 2.1 Renomear profiles → legacy_profiles
ALTER TABLE IF EXISTS public.profiles 
RENAME TO legacy_profiles;

-- 2.2 Renomear transactions → legacy_transactions
ALTER TABLE IF EXISTS public.transactions 
RENAME TO legacy_transactions;

-- 2.3 Renomear wallets → legacy_wallets
ALTER TABLE IF EXISTS public.wallets 
RENAME TO legacy_wallets;

-- 2.4 Adicionar comentários explicativos
COMMENT ON TABLE public.legacy_profiles IS 
  'Tabela legada - mantida para histórico. Use duaia_profiles/duacoin_profiles';

COMMENT ON TABLE public.legacy_transactions IS 
  'Tabela legada - mantida para histórico. Use duacoin_transactions';

COMMENT ON TABLE public.legacy_wallets IS 
  'Tabela legada - mantida para histórico. Dados migrados para duacoin_profiles';

-- ====================================================================
-- FASE 3: OTIMIZAÇÕES DE PERFORMANCE
-- ====================================================================

-- 3.1 Índices para duaia_conversations
CREATE INDEX IF NOT EXISTS idx_duaia_conversations_user 
  ON public.duaia_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_duaia_conversations_updated 
  ON public.duaia_conversations(updated_at DESC);

-- 3.2 Índices para duaia_messages
CREATE INDEX IF NOT EXISTS idx_duaia_messages_conversation 
  ON public.duaia_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_duaia_messages_created 
  ON public.duaia_messages(created_at DESC);

-- 3.3 Índices para duacoin_transactions
CREATE INDEX IF NOT EXISTS idx_duacoin_transactions_user 
  ON public.duacoin_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_duacoin_transactions_type 
  ON public.duacoin_transactions(type);

CREATE INDEX IF NOT EXISTS idx_duacoin_transactions_created 
  ON public.duacoin_transactions(created_at DESC);

-- 3.4 Índices para duacoin_staking
CREATE INDEX IF NOT EXISTS idx_duacoin_staking_user 
  ON public.duacoin_staking(user_id);

CREATE INDEX IF NOT EXISTS idx_duacoin_staking_status 
  ON public.duacoin_staking(status);

-- ====================================================================
-- FASE 4: CONSTRAINTS E VALIDAÇÕES
-- ====================================================================

-- 4.1 Check constraints para duacoin_transactions
ALTER TABLE public.duacoin_transactions
DROP CONSTRAINT IF EXISTS check_transaction_amount_positive;

ALTER TABLE public.duacoin_transactions
ADD CONSTRAINT check_transaction_amount_positive 
CHECK (amount > 0);

-- 4.2 Check constraints para duacoin_profiles
ALTER TABLE public.duacoin_profiles
DROP CONSTRAINT IF EXISTS check_balance_non_negative;

ALTER TABLE public.duacoin_profiles
ADD CONSTRAINT check_balance_non_negative 
CHECK (balance >= 0);

ALTER TABLE public.duacoin_profiles
DROP CONSTRAINT IF EXISTS check_totals_non_negative;

ALTER TABLE public.duacoin_profiles
ADD CONSTRAINT check_totals_non_negative 
CHECK (total_earned >= 0 AND total_spent >= 0);

-- 4.3 Check constraints para duacoin_staking
ALTER TABLE public.duacoin_staking
DROP CONSTRAINT IF EXISTS check_staking_amount_positive;

ALTER TABLE public.duacoin_staking
ADD CONSTRAINT check_staking_amount_positive 
CHECK (amount > 0);

-- ====================================================================
-- FASE 5: FUNÇÕES AUXILIARES
-- ====================================================================

-- 5.1 Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id 
    AND (role = 'admin' OR role = 'super_admin')
    AND full_access = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.2 Função para obter saldo DUA COIN
CREATE OR REPLACE FUNCTION get_duacoin_balance(user_id UUID)
RETURNS DECIMAL(15,8) AS $$
DECLARE
  user_balance DECIMAL(15,8);
BEGIN
  SELECT COALESCE(balance, 0) INTO user_balance
  FROM public.duacoin_profiles
  WHERE duacoin_profiles.user_id = get_duacoin_balance.user_id;
  
  RETURN COALESCE(user_balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.3 Função para estatísticas DUA IA
CREATE OR REPLACE FUNCTION get_duaia_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'conversations_count', COALESCE(conversations_count, 0),
    'messages_count', COALESCE(messages_count, 0),
    'tokens_used', COALESCE(tokens_used, 0)
  ) INTO stats
  FROM public.duaia_profiles
  WHERE duaia_profiles.user_id = get_duaia_stats.user_id;
  
  RETURN COALESCE(stats, '{"conversations_count":0,"messages_count":0,"tokens_used":0}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- FASE 6: VIEWS ÚTEIS
-- ====================================================================

-- 6.1 View para dashboard admin
CREATE OR REPLACE VIEW admin_dashboard AS
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.full_access,
  u.duaia_enabled,
  u.duacoin_enabled,
  dp.conversations_count,
  dp.messages_count,
  dp.tokens_used,
  dcp.balance as duacoin_balance,
  dcp.total_earned,
  dcp.total_spent,
  u.created_at,
  u.last_login_at
FROM public.users u
LEFT JOIN public.duaia_profiles dp ON u.id = dp.user_id
LEFT JOIN public.duacoin_profiles dcp ON u.id = dcp.user_id;

-- 6.2 View para estatísticas financeiras
CREATE OR REPLACE VIEW duacoin_statistics AS
SELECT 
  COUNT(DISTINCT user_id) as total_users,
  SUM(balance) as total_balance,
  SUM(total_earned) as total_earned,
  SUM(total_spent) as total_spent,
  AVG(balance) as avg_balance
FROM public.duacoin_profiles;

-- 6.3 View para atividade recente
CREATE OR REPLACE VIEW recent_activity AS
SELECT 
  'duaia_message' as activity_type,
  dm.user_id,
  u.email,
  dm.created_at
FROM public.duaia_messages dm
JOIN public.users u ON dm.user_id = u.id
UNION ALL
SELECT 
  'duacoin_transaction' as activity_type,
  dt.user_id,
  u.email,
  dt.created_at
FROM public.duacoin_transactions dt
JOIN public.users u ON dt.user_id = u.id
ORDER BY created_at DESC
LIMIT 100;

-- ====================================================================
-- VERIFICAÇÃO FINAL
-- ====================================================================

-- Verificar super admin
SELECT 
  '✅ SUPER ADMIN CONFIGURADO' as status,
  email, 
  role, 
  full_access 
FROM public.users 
WHERE role = 'super_admin';

-- Verificar tabelas legadas renomeadas
SELECT 
  '✅ TABELAS LEGADAS RENOMEADAS' as status,
  COUNT(*) as total_legacy_tables
FROM information_schema.tables
WHERE table_schema = 'public' 
AND table_name LIKE 'legacy_%';

-- Estatísticas gerais
SELECT 
  '📊 ESTATÍSTICAS' as status,
  (SELECT COUNT(*) FROM public.users) as total_users,
  (SELECT COUNT(*) FROM public.duaia_profiles) as duaia_profiles,
  (SELECT COUNT(*) FROM public.duacoin_profiles) as duacoin_profiles,
  (SELECT COUNT(*) FROM public.duaia_conversations) as conversations,
  (SELECT COUNT(*) FROM public.duacoin_transactions) as transactions;

-- ✅ CORREÇÕES COMPLETAS APLICADAS!
-- Score esperado: 100% após executar este SQL