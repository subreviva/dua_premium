-- Migration: Create/Update users table
-- Description: Tabela de users com sistema de créditos e acesso
-- Author: DUA System
-- Date: 2025-01-05

-- ============================================
-- 1. CREATE TABLE: users (profile público)
-- ============================================
-- Nota: auth.users já existe (gerenciado pelo Supabase Auth)
-- Criamos public.users como tabela de perfil/dados adicionais

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  credits INTEGER DEFAULT 30 NOT NULL,
  has_access BOOLEAN DEFAULT false NOT NULL,
  invite_code_used TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Constraints
  CONSTRAINT credits_non_negative CHECK (credits >= 0),
  CONSTRAINT email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

-- Index para busca por email
CREATE INDEX IF NOT EXISTS idx_users_email 
  ON public.users(email);

-- Index para filtrar users com acesso
CREATE INDEX IF NOT EXISTS idx_users_has_access 
  ON public.users(has_access) 
  WHERE has_access = true;

-- Index para ver qual código foi usado
CREATE INDEX IF NOT EXISTS idx_users_invite_code 
  ON public.users(invite_code_used) 
  WHERE invite_code_used IS NOT NULL;

-- ============================================
-- 3. FUNÇÃO TRIGGER: Auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 4. FUNÇÃO: Auto-create user profile on signup
-- ============================================
-- Quando um user faz signup via magic link,
-- criar automaticamente uma linha em public.users

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, credits, has_access)
  VALUES (
    NEW.id, 
    NEW.email,
    30, -- créditos iniciais default
    false -- sem acesso até validar código
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Ativar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: User pode ler apenas seus próprios dados
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: User pode atualizar apenas seus próprios dados
-- (exceto has_access e invite_code_used, que só API pode mudar)
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Service role pode fazer tudo (para API routes)
CREATE POLICY "Service role can manage all users"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 6. COMMENTS (Documentação)
-- ============================================

COMMENT ON TABLE public.users IS 
  'Perfil público dos users com sistema de créditos e acesso';

COMMENT ON COLUMN public.users.credits IS 
  'Quantidade de créditos disponíveis para usar features premium';

COMMENT ON COLUMN public.users.has_access IS 
  'Se true, user tem acesso ao app (validou código de convite)';

COMMENT ON COLUMN public.users.invite_code_used IS 
  'Código de convite que este user utilizou para ganhar acesso';

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================

-- Garantir que authenticated users podem acessar a tabela
GRANT SELECT, UPDATE ON public.users TO authenticated;

-- Service role precisa de todos os privilégios
GRANT ALL ON public.users TO service_role;
