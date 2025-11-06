-- SCRIPT SIMPLES PARA LIMPAR E RECRIAR POLÍTICAS
-- Execute este se o erro "policy already exists" aparecer

-- 1. REMOVER TODAS AS POLÍTICAS (todas variações possíveis)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'users'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.users';
        RAISE NOTICE 'Política removida: %', r.policyname;
    END LOOP;
END $$;

-- 2. CRIAR POLÍTICAS NOVAS
CREATE POLICY "users_select_policy"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "users_insert_policy"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_policy"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. FORÇAR RELOAD DO SCHEMA CACHE 3X
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';

-- 4. VERIFICAR POLÍTICAS CRIADAS
SELECT 
  '✅ Políticas RLS Criadas:' as resultado;

SELECT 
  policyname as "Política",
  cmd as "Comando"
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'users'
ORDER BY policyname;

-- MENSAGEM FINAL
SELECT '🎉 POLÍTICAS RECRIADAS! Aguarde 5 segundos e tente salvar o perfil novamente.' as mensagem;
