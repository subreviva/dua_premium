-- ============================================================
-- CORREÇÃO URGENTE: RLS POLICIES PARA TABELA USERS
-- ============================================================
-- Erro: "Não foi possível verificar suas permissões"
-- Causa: Users autenticados não conseguem ler public.users
-- Solução: Criar policies que permitem leitura/escrita própria
-- ============================================================

-- 1. Habilitar RLS (se ainda não estiver)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Policy para SELECT (ler próprios dados)
CREATE POLICY IF NOT EXISTS "Users can read own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- 3. Policy para UPDATE (atualizar próprios dados)
CREATE POLICY IF NOT EXISTS "Users can update own data"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

-- 4. Verificar policies criadas
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
WHERE tablename = 'users';
