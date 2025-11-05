-- ============================================
-- CORREÇÃO FINAL: Bloquear DELETE completamente
-- ============================================

-- IMPORTANTE: Em PostgreSQL RLS, se não houver policy para um role,
-- o comportamento padrão depende se existem policies para aquela operação.
-- 
-- Estratégia: Criar policy que PERMITE DELETE apenas para service_role
-- e como RLS está habilitado, todos os outros roles serão bloqueados.

-- Dropar todas as policies de DELETE existentes
DROP POLICY IF EXISTS "Only service role can delete codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Service role full access to codes" ON public.invite_codes;

-- Criar a policy que permite DELETE APENAS para service_role
CREATE POLICY "service_role_delete_only"
  ON public.invite_codes
  FOR DELETE
  TO service_role
  USING (true);

-- Verificar se RLS está habilitado (deve estar)
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- IMPORTANTE: Com RLS habilitado e apenas 1 policy de DELETE restrita a service_role,
-- todos os outros roles (public, anon, authenticated) NÃO poderão deletar!

-- Verificar todas as policies:
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    roles::text as roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'invite_codes' 
ORDER BY cmd, policyname;
