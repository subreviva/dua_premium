-- ============================================
-- SOLUÇÃO RADICAL: Forçar RLS com FORCE ROW LEVEL SECURITY
-- ============================================

-- Esta é a solução mais forte do PostgreSQL
-- FORCE RLS garante que até o owner da tabela respeita RLS

-- Passo 1: Garantir que RLS está habilitado
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Passo 2: FORÇAR RLS (importante!)
ALTER TABLE public.invite_codes FORCE ROW LEVEL SECURITY;

-- Passo 3: Remover TODAS as policies de DELETE
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'invite_codes' 
          AND cmd = 'DELETE'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.invite_codes', pol.policyname);
        RAISE NOTICE 'Removida policy: %', pol.policyname;
    END LOOP;
END $$;

-- Passo 4: Criar policy DELETE restrita APENAS para service_role
CREATE POLICY "service_role_only_delete"
  ON public.invite_codes
  AS RESTRICTIVE  -- IMPORTANTE: RESTRICTIVE força combinação com outras policies
  FOR DELETE
  TO service_role
  USING (true);

-- Passo 5: Criar policy que bloqueia DELETE para todos os outros
CREATE POLICY "block_delete_for_others"
  ON public.invite_codes
  FOR DELETE
  TO public, anon, authenticated
  USING (false);  -- SEMPRE FALSE = SEMPRE BLOQUEADO

-- Verificação
SELECT 
    tablename,
    policyname,
    cmd,
    roles::text,
    permissive,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'invite_codes'
  AND cmd = 'DELETE'
ORDER BY policyname;

-- Verificar FORCE RLS
SELECT 
    tablename,
    rowsecurity as "RLS Enabled",
    relforcerowsecurity as "FORCE RLS"
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public' 
  AND tablename = 'invite_codes';
