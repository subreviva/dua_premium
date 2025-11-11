-- =====================================================
-- SCHEMA ULTRA RIGOROSO - SISTEMA DE CRÉDITOS
-- =====================================================
-- Este script cria/atualiza toda a estrutura necessária
-- para o sistema de créditos funcionar 100%
-- =====================================================

-- 1. ADICIONAR COLUNAS NA TABELA USERS
-- =====================================================

-- Coluna de créditos principais
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 150 CHECK (credits >= 0);

-- Coluna de créditos DUA IA (separado se necessário)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS duaia_credits INTEGER DEFAULT 0 CHECK (duaia_credits >= 0);

-- Coluna de saldo DUA Coin
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS duacoin_balance DECIMAL(18, 8) DEFAULT 0 CHECK (duacoin_balance >= 0);

-- Coluna de código de acesso
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS access_code TEXT UNIQUE;

-- Coluna de email verificado
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Colunas de onboarding/welcome
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS welcome_seen BOOLEAN DEFAULT false;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT false;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Comentários nas colunas
COMMENT ON COLUMN public.users.credits IS 'Créditos principais do usuário para usar nos estúdios';
COMMENT ON COLUMN public.users.duaia_credits IS 'Créditos específicos para DUA IA';
COMMENT ON COLUMN public.users.duacoin_balance IS 'Saldo de DUA Coin do usuário';
COMMENT ON COLUMN public.users.access_code IS 'Código único de acesso do usuário';
COMMENT ON COLUMN public.users.email_verified IS 'Indica se o email foi verificado';
COMMENT ON COLUMN public.users.welcome_seen IS 'Indica se o usuário viu a tela de boas-vindas';
COMMENT ON COLUMN public.users.welcome_email_sent IS 'Indica se o email de boas-vindas foi enviado';
COMMENT ON COLUMN public.users.onboarding_completed IS 'Indica se o usuário completou o onboarding';

-- 2. CRIAR TABELA DE TRANSAÇÕES DE CRÉDITOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus', 'transfer')),
  description TEXT,
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentário na tabela
COMMENT ON TABLE public.credit_transactions IS 'Histórico de todas as transações de créditos dos usuários';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_created ON public.credit_transactions(user_id, created_at DESC);

-- Índices na tabela users para créditos
CREATE INDEX IF NOT EXISTS idx_users_credits ON public.users(credits);
CREATE INDEX IF NOT EXISTS idx_users_access_code ON public.users(access_code) WHERE access_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_welcome_seen ON public.users(welcome_seen) WHERE welcome_seen = false;
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON public.users(email_verified) WHERE email_verified = true;

-- 3. CRIAR FUNÇÃO PARA ATUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para credit_transactions
DROP TRIGGER IF EXISTS update_credit_transactions_updated_at ON public.credit_transactions;
CREATE TRIGGER update_credit_transactions_updated_at
  BEFORE UPDATE ON public.credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. CRIAR FUNÇÃO PARA REGISTRAR TRANSAÇÃO DE CRÉDITOS
-- =====================================================

CREATE OR REPLACE FUNCTION public.register_credit_transaction(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_current_credits INTEGER;
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Buscar créditos atuais
  SELECT credits INTO v_current_credits
  FROM public.users
  WHERE id = p_user_id
  FOR UPDATE; -- Lock para evitar race conditions
  
  IF v_current_credits IS NULL THEN
    RAISE EXCEPTION 'Usuário não encontrado';
  END IF;
  
  -- Calcular novo saldo
  v_new_balance := v_current_credits + p_amount;
  
  -- Verificar se saldo não fica negativo
  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Saldo insuficiente. Créditos atuais: %, tentativa: %', v_current_credits, p_amount;
  END IF;
  
  -- Atualizar créditos do usuário
  UPDATE public.users
  SET credits = v_new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Registrar transação
  INSERT INTO public.credit_transactions (user_id, amount, type, description, balance_after, metadata)
  VALUES (p_user_id, p_amount, p_type, p_description, v_new_balance, p_metadata)
  RETURNING id INTO v_transaction_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Comentário na função
COMMENT ON FUNCTION public.register_credit_transaction IS 'Registra uma transação de créditos com proteção contra race conditions';

-- 5. CRIAR TABELA DE PACOTES DE CRÉDITOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  price_eur DECIMAL(10, 2) NOT NULL CHECK (price_eur > 0),
  price_usd DECIMAL(10, 2) NOT NULL CHECK (price_usd > 0),
  discount_percent INTEGER DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stripe_price_id TEXT,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comentário na tabela
COMMENT ON TABLE public.credit_packages IS 'Pacotes de créditos disponíveis para compra';

-- Índice
CREATE INDEX IF NOT EXISTS idx_credit_packages_active ON public.credit_packages(is_active) WHERE is_active = true;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_credit_packages_updated_at ON public.credit_packages;
CREATE TRIGGER update_credit_packages_updated_at
  BEFORE UPDATE ON public.credit_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. INSERIR PACOTES PADRÃO
-- =====================================================

INSERT INTO public.credit_packages (name, credits, price_eur, price_usd, discount_percent, is_popular, description)
VALUES
  ('Starter', 100, 9.99, 10.99, 0, false, 'Pacote inicial para começar'),
  ('Pro', 500, 39.99, 44.99, 20, true, 'Mais popular - Melhor custo-benefício'),
  ('Ultimate', 1500, 99.99, 109.99, 33, false, 'Máximo de créditos com maior desconto')
ON CONFLICT DO NOTHING;

-- 7. CRIAR VISUALIZAÇÃO PARA SALDO DE USUÁRIOS
-- =====================================================

CREATE OR REPLACE VIEW public.user_balances AS
SELECT 
  u.id,
  u.email,
  u.name,
  u.credits,
  u.duaia_credits,
  u.duacoin_balance,
  COALESCE(SUM(CASE WHEN ct.type = 'purchase' THEN ct.amount ELSE 0 END), 0) as total_purchased,
  COALESCE(SUM(CASE WHEN ct.type = 'usage' THEN ABS(ct.amount) ELSE 0 END), 0) as total_used,
  COUNT(ct.id) as total_transactions,
  u.created_at,
  u.updated_at
FROM public.users u
LEFT JOIN public.credit_transactions ct ON u.id = ct.user_id
GROUP BY u.id, u.email, u.name, u.credits, u.duaia_credits, u.duacoin_balance, u.created_at, u.updated_at;

-- Comentário na view
COMMENT ON VIEW public.user_balances IS 'Visão consolidada dos saldos e estatísticas de créditos dos usuários';

-- 8. POLÍTICAS RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

-- Políticas para credit_transactions
DROP POLICY IF EXISTS "Usuários podem ver suas próprias transações" ON public.credit_transactions;
CREATE POLICY "Usuários podem ver suas próprias transações"
  ON public.credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role pode inserir transações" ON public.credit_transactions;
CREATE POLICY "Service role pode inserir transações"
  ON public.credit_transactions
  FOR INSERT
  WITH CHECK (true);

-- Políticas para credit_packages
DROP POLICY IF EXISTS "Pacotes são públicos" ON public.credit_packages;
CREATE POLICY "Pacotes são públicos"
  ON public.credit_packages
  FOR SELECT
  USING (is_active = true);

-- =====================================================
-- 8.1. POLÍTICAS PARA admin_accounts (FIX ERRO 406)
-- =====================================================

-- Criar tabela admin_accounts se não existir
CREATE TABLE IF NOT EXISTS public.admin_accounts (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.admin_accounts IS 'Contas de administradores do sistema';

-- Habilitar RLS em admin_accounts
ALTER TABLE public.admin_accounts ENABLE ROW LEVEL SECURITY;

-- Policy para SELECT: Qualquer usuário pode consultar, mas RLS filtra
-- Se não for admin, retorna vazio (sem erro 406)
DROP POLICY IF EXISTS "admin_can_view_own_account" ON public.admin_accounts;
DROP POLICY IF EXISTS "authenticated_can_check_admin" ON public.admin_accounts;
CREATE POLICY "users_can_check_admin_status"
  ON public.admin_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy para UPDATE: Admins podem atualizar sua própria conta
DROP POLICY IF EXISTS "admin_can_update_own_account" ON public.admin_accounts;
CREATE POLICY "admin_can_update_own_account"
  ON public.admin_accounts
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy para INSERT: Service role pode criar admins
DROP POLICY IF EXISTS "service_role_can_create_admins" ON public.admin_accounts;
CREATE POLICY "service_role_can_create_admins"
  ON public.admin_accounts
  FOR INSERT
  WITH CHECK (true);

-- 9. GRANTS DE PERMISSÕES
-- =====================================================

-- Permissões para tabelas
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT SELECT ON public.credit_packages TO authenticated;
GRANT SELECT ON public.user_balances TO authenticated;
GRANT SELECT ON public.admin_accounts TO authenticated;

-- Permissões para função
GRANT EXECUTE ON FUNCTION public.register_credit_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_credit_transaction TO service_role;

-- 10. CRIAR FUNÇÃO PARA ATUALIZAR CRÉDITOS (MAIS SIMPLES)
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_user_credits(
  p_user_id UUID,
  p_new_credits INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validação
  IF p_new_credits < 0 THEN
    RAISE EXCEPTION 'Créditos não podem ser negativos';
  END IF;
  
  -- Atualizar
  UPDATE public.users
  SET credits = p_new_credits,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.update_user_credits IS 'Atualiza créditos do usuário com validação';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Verificar instalação
DO $$
BEGIN
  RAISE NOTICE '✅ Schema de créditos aplicado com sucesso!';
  RAISE NOTICE '📊 Tabelas criadas: users (atualizada), credit_transactions, credit_packages';
  RAISE NOTICE '🔧 Funções criadas: register_credit_transaction, update_user_credits';
  RAISE NOTICE '👁️ View criada: user_balances';
  RAISE NOTICE '🔒 RLS habilitado e políticas aplicadas';
END $$;
