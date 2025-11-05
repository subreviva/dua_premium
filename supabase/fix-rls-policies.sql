-- ============================================
-- CORREÇÃO DE RLS POLICIES
-- Executar no Supabase SQL Editor
-- ============================================

-- 1. REMOVER policies antigas que podem estar causando conflito
DROP POLICY IF EXISTS "Authenticated users can read active codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Service role can manage all codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;

-- ============================================
-- 2. CRIAR POLICIES CORRETAS PARA invite_codes
-- ============================================

-- Policy: TODOS (incluindo anon) podem LER códigos ativos
CREATE POLICY "Anyone can read active codes"
  ON public.invite_codes
  FOR SELECT
  USING (active = true);

-- Policy: APENAS service_role pode INSERT
CREATE POLICY "Only service role can insert codes"
  ON public.invite_codes
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: APENAS service_role pode UPDATE
CREATE POLICY "Only service role can update codes"
  ON public.invite_codes
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: APENAS service_role pode DELETE
CREATE POLICY "Only service role can delete codes"
  ON public.invite_codes
  FOR DELETE
  TO service_role
  USING (true);

-- ============================================
-- 3. CRIAR POLICIES CORRETAS PARA users
-- ============================================

-- Policy: Users podem ler APENAS seu próprio perfil
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users podem UPDATE APENAS seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Service role pode fazer TUDO
CREATE POLICY "Service role full access to users"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 4. VERIFICAR SE RLS ESTÁ ATIVO
-- ============================================

-- Garantir que RLS está ativo em ambas as tabelas
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ✅ POLICIES CORRIGIDAS!
-- ============================================
-- Agora:
-- - Anon PODE ler códigos ativos (necessário para validação)
-- - Anon NÃO PODE criar, atualizar ou deletar códigos
-- - Users autenticados podem ler/atualizar APENAS seu perfil
-- - Service role tem acesso total (para APIs server-side)
-- ============================================
