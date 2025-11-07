-- ════════════════════════════════════════════════════════════════
-- CORRIGIR TABELAS FALTANTES: users e audit_logs
-- ════════════════════════════════════════════════════════════════
-- Data: 7 Novembro 2025
-- Objetivo: Resolver erros 400 e 401
-- ════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- 1. CRIAR TABELA users (se não existir)
-- ────────────────────────────────────────────────────────────────

-- Esta tabela é referenciada no código mas pode não existir
-- O código busca: has_access, subscription_tier, display_name

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  has_access BOOLEAN DEFAULT true,
  subscription_tier TEXT DEFAULT 'free',
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON public.users(subscription_tier);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- ────────────────────────────────────────────────────────────────
-- 2. RLS PARA TABELA users
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- SELECT: Utilizador pode ver seus próprios dados
CREATE POLICY "users_select_own"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- INSERT: Utilizador pode criar seu próprio registro
CREATE POLICY "users_insert_own"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- UPDATE: Utilizador pode atualizar seus próprios dados
CREATE POLICY "users_update_own"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ────────────────────────────────────────────────────────────────
-- 3. CRIAR TABELA audit_logs (se não existir)
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ────────────────────────────────────────────────────────────────
-- 4. RLS PARA TABELA audit_logs
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;

-- SELECT: Apenas utilizadores autenticados podem ver seus próprios logs
CREATE POLICY "audit_logs_select_own"
ON public.audit_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- INSERT: Sistema pode inserir logs (via SERVICE_ROLE)
-- Utilizadores autenticados podem inserir seus próprios logs
CREATE POLICY "audit_logs_insert_own"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- ────────────────────────────────────────────────────────────────
-- 5. POPULAR TABELA users COM DADOS DOS PROFILES EXISTENTES
-- ────────────────────────────────────────────────────────────────

-- Inserir registros na tabela users para todos os utilizadores que já têm profile
INSERT INTO public.users (id, display_name, has_access, subscription_tier)
SELECT 
  p.id,
  COALESCE(p.full_name, p.email) as display_name,
  true as has_access,
  'free' as subscription_tier
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.id = p.id
)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 6. CRIAR FUNÇÃO PARA SYNC AUTOMÁTICO users <-> profiles
-- ────────────────────────────────────────────────────────────────

-- Quando um profile é criado, criar também o registro em users
CREATE OR REPLACE FUNCTION sync_users_on_profile_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, display_name, has_access, subscription_tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.full_name, NEW.email),
    true,
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS profile_insert_sync_users ON public.profiles;
CREATE TRIGGER profile_insert_sync_users
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_users_on_profile_insert();

-- ────────────────────────────────────────────────────────────────
-- 7. VERIFICAR RESULTADO
-- ────────────────────────────────────────────────────────────────

-- Verificar tabelas criadas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_columns
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('users', 'audit_logs')
ORDER BY table_name;

-- Verificar políticas RLS
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('users', 'audit_logs')
ORDER BY tablename, policyname;

-- Verificar registros em users
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN has_access = true THEN 1 END) as users_with_access,
  COUNT(DISTINCT subscription_tier) as tiers
FROM public.users;

-- ════════════════════════════════════════════════════════════════
-- ✅ CORREÇÕES APLICADAS
-- ════════════════════════════════════════════════════════════════
-- 1. ✅ Tabela users criada com campos necessários
-- 2. ✅ RLS configurado para users
-- 3. ✅ Tabela audit_logs criada
-- 4. ✅ RLS configurado para audit_logs  
-- 5. ✅ Dados sincronizados de profiles → users
-- 6. ✅ Trigger automático para manter sync
-- ════════════════════════════════════════════════════════════════
