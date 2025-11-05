-- ============================================
-- DIAGNÓSTICO + CORREÇÃO: DELETE Policy
-- ============================================

-- PARTE 1: DIAGNÓSTICO - Ver policies atuais
SELECT '📋 POLICIES ATUAIS:' as info;
SELECT 
    policyname,
    cmd,
    roles::text,
    CASE 
        WHEN roles::text LIKE '%service_role%' THEN '🔐 Service Role Only'
        WHEN roles::text LIKE '%anon%' THEN '⚠️ Anon tem acesso'
        WHEN roles::text LIKE '%authenticated%' THEN '🟡 Authenticated'
        ELSE roles::text
    END as access_level
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'invite_codes'
  AND cmd = 'DELETE'
ORDER BY policyname;

-- PARTE 2: LIMPEZA - Remover TODAS as policies de DELETE
SELECT '🧹 LIMPANDO POLICIES DE DELETE...' as info;

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
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- PARTE 3: CRIAÇÃO - Policy restritiva de DELETE
SELECT '✅ CRIANDO NOVA POLICY...' as info;

CREATE POLICY "restrict_delete_to_service_role"
  ON public.invite_codes
  FOR DELETE
  TO service_role
  USING (true);

-- PARTE 4: GARANTIR RLS ATIVO
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- PARTE 5: VERIFICAÇÃO FINAL
SELECT '🔍 VERIFICAÇÃO FINAL:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles::text as allowed_roles,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'invite_codes'
ORDER BY cmd, policyname;

SELECT '✅ CONCLUÍDO! Agora apenas service_role pode deletar códigos.' as status;
