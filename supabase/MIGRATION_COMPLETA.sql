-- ============================================
-- MIGRATION COMPLETA - Sistema de Acesso por Código
-- Execute este SQL no Supabase SQL Editor
-- URL: https://app.supabase.com/project/gocjbfcztorfswlkkjqi/sql/new
-- ============================================

-- ============================================
-- PARTE 1: TABELA invite_codes
-- ============================================

CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  credits INTEGER DEFAULT 30 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Constraints
  CONSTRAINT code_length_check CHECK (char_length(code) >= 6),
  CONSTRAINT credits_positive_check CHECK (credits >= 0)
);

-- Indexes para invite_codes
CREATE INDEX IF NOT EXISTS idx_invite_codes_code 
  ON public.invite_codes(code);

CREATE INDEX IF NOT EXISTS idx_invite_codes_active 
  ON public.invite_codes(active) 
  WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_invite_codes_used_by 
  ON public.invite_codes(used_by) 
  WHERE used_by IS NOT NULL;

-- RLS para invite_codes
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read active codes"
  ON public.invite_codes
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Service role can manage all codes"
  ON public.invite_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PARTE 2: TABELA users
-- ============================================

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

-- Indexes para users
CREATE INDEX IF NOT EXISTS idx_users_email 
  ON public.users(email);

CREATE INDEX IF NOT EXISTS idx_users_has_access 
  ON public.users(has_access) 
  WHERE has_access = true;

CREATE INDEX IF NOT EXISTS idx_users_invite_code 
  ON public.users(invite_code_used) 
  WHERE invite_code_used IS NOT NULL;

-- ============================================
-- PARTE 3: FUNÇÕES E TRIGGERS
-- ============================================

-- Função: Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função: Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, credits, has_access)
  VALUES (
    NEW.id, 
    NEW.email,
    30,
    false
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
-- PARTE 4: RLS POLICIES para users
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage all users"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PARTE 5: PERMISSIONS
-- ============================================

GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- ============================================
-- ✅ MIGRATION COMPLETA!
-- ============================================
-- Próximo passo: Gerar códigos com:
-- node scripts/generate-code.js 5
-- ============================================
