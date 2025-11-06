-- SCRIPT PARA PERMITIR ADMINS SALVAREM PERFIL
-- Execute este script no SQL Editor do Supabase

-- 1. Criar registro na tabela users para os admins (se não existir)
DO $$
DECLARE
  admin_emails TEXT[] := ARRAY[
    'admin@dua.pt',
    'subreviva@gmail.com',
    'dev@dua.pt',
    'dev@dua.com'
  ];
  admin_email TEXT;
  admin_user RECORD;
BEGIN
  FOREACH admin_email IN ARRAY admin_emails
  LOOP
    -- Buscar o usuário no auth.users
    SELECT id, email INTO admin_user
    FROM auth.users
    WHERE email = admin_email;
    
    IF FOUND THEN
      -- Inserir ou atualizar na tabela public.users
      INSERT INTO public.users (id, email, has_access, created_at, updated_at)
      VALUES (admin_user.id, admin_user.email, true, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE
      SET 
        email = EXCLUDED.email,
        has_access = true,
        updated_at = NOW();
      
      RAISE NOTICE '✅ Admin % configurado na tabela users', admin_email;
    ELSE
      RAISE NOTICE '⚠️  Admin % não encontrado em auth.users', admin_email;
    END IF;
  END LOOP;
END $$;

-- 2. Garantir que todas as colunas existem
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS has_access BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS invite_code_used TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. DROPAR TODAS AS POLÍTICAS
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
        RAISE NOTICE '🗑️  Política removida: %', r.policyname;
    END LOOP;
END $$;

-- 5. CRIAR POLÍTICAS PERMISSIVAS (permite admins)
CREATE POLICY "users_select_policy"
ON public.users FOR SELECT
TO authenticated
USING (true); -- Todos podem ver (temporário)

CREATE POLICY "users_insert_policy"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id); -- Só pode inserir próprio registro

CREATE POLICY "users_update_policy"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id) -- Só pode atualizar próprio registro
WITH CHECK (auth.uid() = id);

-- 6. Criar tabela audit_logs (se não existir)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. RLS e políticas para audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
CREATE POLICY "audit_logs_select"
ON public.audit_logs FOR SELECT
TO authenticated
USING (false); -- Ninguém vê (só dashboard)

DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_insert"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (true); -- Todos podem inserir logs

-- 8. FORÇAR RELOAD DO SCHEMA CACHE (3x)
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';

-- 9. Verificar admins na tabela users
SELECT 
  '👑 ADMINS CADASTRADOS NA TABELA USERS:' as titulo;

SELECT 
  email,
  name,
  has_access as "Admin?",
  created_at as "Data Cadastro"
FROM public.users
WHERE email IN ('admin@dua.pt', 'subreviva@gmail.com', 'dev@dua.pt', 'dev@dua.com')
ORDER BY email;

-- 10. Verificar políticas
SELECT 
  '🔒 POLÍTICAS RLS CRIADAS:' as titulo;

SELECT 
  policyname as "Política",
  cmd as "Comando"
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'users'
ORDER BY policyname;

-- MENSAGEM FINAL
SELECT '✅ PRONTO! Admins podem salvar perfil agora. Aguarde 5 segundos e teste.' as resultado;
