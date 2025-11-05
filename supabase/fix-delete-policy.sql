-- ============================================
-- CORREÇÃO CRÍTICA: Bloquear DELETE de códigos
-- ============================================

-- Esta policy DEVE existir para bloquear anon/authenticated de deletar códigos
-- Apenas service_role pode deletar códigos

-- Primeiro: Dropar a policy se já existir
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Only service role can delete codes" ON public.invite_codes;
END $$;

-- Segundo: Criar a policy que bloqueia DELETE para todos exceto service_role
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'invite_codes' 
        AND policyname = 'Only service role can delete codes'
    ) THEN
        CREATE POLICY "Only service role can delete codes"
          ON public.invite_codes
          FOR DELETE
          TO service_role
          USING (true);
    END IF;
END $$;

-- IMPORTANTE: Sem esta policy, QUALQUER USUÁRIO pode deletar códigos!
-- Com esta policy, apenas o service_role (usado em scripts administrativos) pode deletar

-- Verificar policies existentes:
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    roles, 
    cmd,
    CASE 
        WHEN cmd = 'DELETE' THEN '🔴 DELETE'
        WHEN cmd = 'SELECT' THEN '🟢 SELECT'
        WHEN cmd = 'INSERT' THEN '🟡 INSERT'
        WHEN cmd = 'UPDATE' THEN '🟠 UPDATE'
        ELSE cmd
    END as operation
FROM pg_policies 
WHERE tablename = 'invite_codes' 
ORDER BY cmd, policyname;
