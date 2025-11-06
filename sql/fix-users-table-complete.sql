-- SQL para corrigir completamente a tabela users e resolver erro de schema cache
-- Execute este script no SQL Editor do Supabase

-- 1. IMPORTANTE: Primeiro, vamos garantir que a tabela existe com TODAS as colunas necessárias
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  username TEXT,
  bio TEXT,
  avatar_url TEXT,
  has_access BOOLEAN DEFAULT false,
  invite_code_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Adicionar colunas que podem estar faltando (caso a tabela já existisse)
DO $$ 
BEGIN
  -- Adicionar coluna 'name' se não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'name'
  ) THEN
    ALTER TABLE public.users ADD COLUMN name TEXT;
    RAISE NOTICE 'Coluna name adicionada';
  END IF;

  -- Adicionar coluna 'username' se não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'username'
  ) THEN
    ALTER TABLE public.users ADD COLUMN username TEXT;
    RAISE NOTICE 'Coluna username adicionada';
  END IF;

  -- Adicionar coluna 'bio' se não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'bio'
  ) THEN
    ALTER TABLE public.users ADD COLUMN bio TEXT;
    RAISE NOTICE 'Coluna bio adicionada';
  END IF;

  -- Adicionar coluna 'avatar_url' se não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
    RAISE NOTICE 'Coluna avatar_url adicionada';
  END IF;

  -- Adicionar coluna 'has_access' se não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'has_access'
  ) THEN
    ALTER TABLE public.users ADD COLUMN has_access BOOLEAN DEFAULT false;
    RAISE NOTICE 'Coluna has_access adicionada';
  END IF;

  -- Adicionar coluna 'invite_code_used' se não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'invite_code_used'
  ) THEN
    ALTER TABLE public.users ADD COLUMN invite_code_used TEXT;
    RAISE NOTICE 'Coluna invite_code_used adicionada';
  END IF;

  -- Adicionar coluna 'created_at' se não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Coluna created_at adicionada';
  END IF;

  -- Adicionar coluna 'updated_at' se não existir
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE 'Coluna updated_at adicionada';
  END IF;
END $$;

-- 3. Adicionar constraint UNIQUE no username (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_username_key' 
    AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_username_key UNIQUE (username);
    RAISE NOTICE 'Constraint UNIQUE adicionada ao username';
  END IF;
END $$;

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_avatar_url ON public.users(avatar_url);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 6. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.users;
DROP POLICY IF EXISTS "Sistema pode inserir novos usuários" ON public.users;

-- 7. Criar políticas RLS atualizadas
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Sistema pode inserir novos usuários"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 8. Criar função para auto-update do updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Remover trigger antigo se existir
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;

-- 10. Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. Adicionar comentários para documentação
COMMENT ON TABLE public.users IS 'Tabela de perfis de usuários da aplicação DUA';
COMMENT ON COLUMN public.users.id IS 'ID do usuário (referência a auth.users)';
COMMENT ON COLUMN public.users.email IS 'Email do usuário (sincronizado com auth.users)';
COMMENT ON COLUMN public.users.name IS 'Nome completo do usuário';
COMMENT ON COLUMN public.users.username IS 'Username único para URL pública (dua.pt/@username)';
COMMENT ON COLUMN public.users.bio IS 'Biografia do usuário (máximo 200 caracteres)';
COMMENT ON COLUMN public.users.avatar_url IS 'URL pública do avatar do usuário (Supabase Storage ou avatar predefinido)';
COMMENT ON COLUMN public.users.has_access IS 'Indica se o usuário tem acesso à plataforma';
COMMENT ON COLUMN public.users.invite_code_used IS 'Código de convite usado no registro';
COMMENT ON COLUMN public.users.created_at IS 'Data de criação do perfil';
COMMENT ON COLUMN public.users.updated_at IS 'Data da última atualização (auto-atualizado por trigger)';

-- 12. FORÇAR REFRESH DO SCHEMA CACHE (Supabase PostgREST)
NOTIFY pgrst, 'reload schema';

-- 13. Verificar estrutura final da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;
