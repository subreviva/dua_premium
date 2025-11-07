
-- ============================================================================
-- CORREÇÃO RLS POLICIES - ELIMINAR RECURSÃO INFINITA
-- ============================================================================

-- 1. DESABILITAR RLS temporariamente
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLICIES EXISTENTES (podem estar causando recursão)
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authentication users only" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.users;
DROP POLICY IF EXISTS "Super admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can delete users" ON public.users;
DROP POLICY IF EXISTS "admin_users_select" ON public.users;
DROP POLICY IF EXISTS "admin_users_insert" ON public.users;
DROP POLICY IF EXISTS "admin_users_update" ON public.users;

-- 3. RECRIAR RLS POLICIES SIMPLES E SEM RECURSÃO
-- Política 1: Usuários podem ler próprios dados (usando auth.uid() diretamente)
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

-- Política 2: Usuários podem atualizar próprios dados
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id);

-- Política 3: Super admins podem ler todos (usando emails hardcoded)
CREATE POLICY "super_admins_select_all" ON public.users
  FOR SELECT 
  USING (
    auth.jwt() ->> 'email' IN ('estraca@2lados.pt', 'dev@dua.com')
  );

-- Política 4: Super admins podem atualizar todos
CREATE POLICY "super_admins_update_all" ON public.users
  FOR UPDATE 
  USING (
    auth.jwt() ->> 'email' IN ('estraca@2lados.pt', 'dev@dua.com')
  );

-- Política 5: Inserção só via auth (novos usuários)
CREATE POLICY "users_insert_auth" ON public.users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 4. REABILITAR RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICAÇÃO: POLICIES ATIVAS
-- ============================================================================
-- Para verificar se as policies foram criadas corretamente:
-- SELECT * FROM pg_policies WHERE tablename = 'users';

