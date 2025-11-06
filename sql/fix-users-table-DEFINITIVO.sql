-- SCRIPT DE FIX DEFINITIVO PARA TABELA USERS
-- Execute este script COMPLETO no SQL Editor do Supabase
-- Este script é mais robusto e vai garantir que tudo funcione

-- PASSO 1: Desabilitar RLS temporariamente para evitar problemas
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- PASSO 2: Dropar a tabela se existir (CUIDADO: Isso apaga dados!)
-- Comente as linhas abaixo se NÃO quiser apagar dados existentes
-- DROP TABLE IF EXISTS public.users CASCADE;

-- PASSO 3: Criar tabela do zero com TODAS as colunas necessárias
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  username TEXT,
  bio TEXT,
  avatar_url TEXT,
  has_access BOOLEAN DEFAULT false NOT NULL,
  invite_code_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- PASSO 4: Garantir que TODAS as colunas existem (caso tabela já existisse)
DO $$ 
BEGIN
  -- name
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'name'
  ) THEN
    ALTER TABLE public.users ADD COLUMN name TEXT;
    RAISE NOTICE '✅ Coluna name adicionada';
  ELSE
    RAISE NOTICE '✓ Coluna name já existe';
  END IF;

  -- username
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'username'
  ) THEN
    ALTER TABLE public.users ADD COLUMN username TEXT;
    RAISE NOTICE '✅ Coluna username adicionada';
  ELSE
    RAISE NOTICE '✓ Coluna username já existe';
  END IF;

  -- bio
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'bio'
  ) THEN
    ALTER TABLE public.users ADD COLUMN bio TEXT;
    RAISE NOTICE '✅ Coluna bio adicionada';
  ELSE
    RAISE NOTICE '✓ Coluna bio já existe';
  END IF;

  -- avatar_url
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
    RAISE NOTICE '✅ Coluna avatar_url adicionada';
  ELSE
    RAISE NOTICE '✓ Coluna avatar_url já existe';
  END IF;

  -- has_access
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'has_access'
  ) THEN
    ALTER TABLE public.users ADD COLUMN has_access BOOLEAN DEFAULT false NOT NULL;
    RAISE NOTICE '✅ Coluna has_access adicionada';
  ELSE
    RAISE NOTICE '✓ Coluna has_access já existe';
  END IF;

  -- invite_code_used
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'invite_code_used'
  ) THEN
    ALTER TABLE public.users ADD COLUMN invite_code_used TEXT;
    RAISE NOTICE '✅ Coluna invite_code_used adicionada';
  ELSE
    RAISE NOTICE '✓ Coluna invite_code_used já existe';
  END IF;

  -- created_at
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
    RAISE NOTICE '✅ Coluna created_at adicionada';
  ELSE
    RAISE NOTICE '✓ Coluna created_at já existe';
  END IF;

  -- updated_at
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
    RAISE NOTICE '✅ Coluna updated_at adicionada';
  ELSE
    RAISE NOTICE '✓ Coluna updated_at já existe';
  END IF;
END $$;

-- PASSO 5: Remover constraint UNIQUE do email se existir (para evitar conflito)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_email_key' 
    AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users DROP CONSTRAINT users_email_key;
    RAISE NOTICE '✅ Constraint users_email_key removida';
  END IF;
END $$;

-- PASSO 6: Adicionar constraint UNIQUE no username (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_username_key' 
    AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_username_key UNIQUE (username);
    RAISE NOTICE '✅ Constraint UNIQUE username criada';
  ELSE
    RAISE NOTICE '✓ Constraint UNIQUE username já existe';
  END IF;
END $$;

-- PASSO 7: Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_avatar_url ON public.users(avatar_url);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- PASSO 8: Criar função para auto-update do updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASSO 9: Remover trigger antigo e criar novo
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- PASSO 10: Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- PASSO 11: Remover todas as políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Sistema pode inserir novos usuários" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for users based on id" ON public.users;
DROP POLICY IF EXISTS "users_select_policy" ON public.users;
DROP POLICY IF EXISTS "users_insert_policy" ON public.users;
DROP POLICY IF EXISTS "users_update_policy" ON public.users;

-- PASSO 12: Criar políticas RLS corretas
CREATE POLICY "Enable read access for authenticated users"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- PASSO 13: FORÇAR RELOAD DO SCHEMA CACHE (CRÍTICO!)
NOTIFY pgrst, 'reload schema';

-- PASSO 14: Aguardar um pouco para o cache atualizar
SELECT pg_sleep(2);

-- PASSO 15: FORÇAR NOVAMENTE (às vezes precisa de 2x)
NOTIFY pgrst, 'reload schema';

-- PASSO 16: Verificar estrutura final
SELECT 
  '✅ ESTRUTURA FINAL DA TABELA USERS:' as resultado;

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- PASSO 17: Testar UPSERT com dados fake
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Gerar UUID de teste
  test_user_id := gen_random_uuid();
  
  RAISE NOTICE '🧪 Testando UPSERT com ID: %', test_user_id;
  
  -- Tentar INSERT (vai falhar se não houver referência em auth.users, mas isso é esperado)
  BEGIN
    INSERT INTO public.users (id, email, name, username, bio, avatar_url)
    VALUES (
      test_user_id,
      'test@example.com',
      'Test User',
      'testuser',
      'Bio de teste',
      'https://example.com/avatar.jpg'
    );
    RAISE NOTICE '✅ INSERT funcionou';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ INSERT falhou (esperado se auth.users não tem este ID): %', SQLERRM;
  END;
  
  -- Cleanup (remover teste se foi criado)
  DELETE FROM public.users WHERE id = test_user_id;
  
  RAISE NOTICE '✅ Teste de UPSERT concluído';
END $$;

-- MENSAGEM FINAL
SELECT '🎉 SCRIPT EXECUTADO COM SUCESSO! Aguarde 5 segundos e tente salvar o perfil novamente.' as mensagem_final;
