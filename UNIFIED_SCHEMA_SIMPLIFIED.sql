
-- ============================================================
-- SIMPLIFIED UNIFIED SCHEMA (Execute no Dashboard SQL)
-- ============================================================

-- 1. Adicionar colunas em users (se não existem)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS duaia_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS duacoin_enabled BOOLEAN DEFAULT TRUE;

-- 2. Criar tabela duaia_profiles (perfil DUA IA)
CREATE TABLE IF NOT EXISTS public.duaia_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  conversations_count INT DEFAULT 0,
  messages_count INT DEFAULT 0,
  tokens_used INT DEFAULT 0,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'pt',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Criar tabela duacoin_profiles (perfil DUA COIN)
CREATE TABLE IF NOT EXISTS public.duacoin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(20, 8) DEFAULT 0,
  total_earned DECIMAL(20, 8) DEFAULT 0,
  total_spent DECIMAL(20, 8) DEFAULT 0,
  kyc_status TEXT DEFAULT 'pending',
  wallet_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar RLS
ALTER TABLE public.duaia_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duacoin_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Policies básicas
DROP POLICY IF EXISTS "Users read own duaia" ON public.duaia_profiles;
CREATE POLICY "Users read own duaia"
ON public.duaia_profiles FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own duaia" ON public.duaia_profiles;
CREATE POLICY "Users update own duaia"
ON public.duaia_profiles FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own duacoin" ON public.duacoin_profiles;
CREATE POLICY "Users read own duacoin"
ON public.duacoin_profiles FOR SELECT
USING (auth.uid() = user_id);

-- 6. Trigger auto-criar perfis DUA IA
CREATE OR REPLACE FUNCTION public.auto_create_duaia_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.duaia_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_duaia ON auth.users;
CREATE TRIGGER on_user_created_duaia
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_duaia_profile();

-- 7. Trigger auto-criar perfis DUA COIN
CREATE OR REPLACE FUNCTION public.auto_create_duacoin_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.duacoin_profiles (user_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_duacoin ON auth.users;
CREATE TRIGGER on_user_created_duacoin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_duacoin_profile();

-- 8. Migrar users existentes (criar perfis retroativos)
INSERT INTO public.duaia_profiles (user_id, display_name)
SELECT id, COALESCE(name, email) FROM public.users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.duacoin_profiles (user_id, balance)
SELECT id, 0 FROM public.users
ON CONFLICT (user_id) DO NOTHING;

-- 9. Índices
CREATE INDEX IF NOT EXISTS idx_duaia_profiles_user ON public.duaia_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_duacoin_profiles_user ON public.duacoin_profiles(user_id);

-- 10. Verificação
SELECT 
  'duaia_profiles' as table_name,
  COUNT(*) as total_profiles
FROM public.duaia_profiles
UNION ALL
SELECT 
  'duacoin_profiles' as table_name,
  COUNT(*) as total_profiles
FROM public.duacoin_profiles;
