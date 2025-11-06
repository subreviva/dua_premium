-- SQL para configurar o Supabase Storage para avatares
-- Execute este script no SQL Editor do Supabase

-- 1. Criar bucket público para imagens de perfil (se não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB em bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Política de storage: permitir usuários autenticados fazerem upload
DROP POLICY IF EXISTS "Usuários podem fazer upload de suas imagens" ON storage.objects;
CREATE POLICY "Usuários podem fazer upload de suas imagens"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = split_part((storage.filename(name)), '-', 1)
);

-- 3. Política de storage: permitir todos lerem imagens (bucket público)
DROP POLICY IF EXISTS "Qualquer um pode ver imagens públicas" ON storage.objects;
CREATE POLICY "Qualquer um pode ver imagens públicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- 4. Política de storage: permitir usuários deletarem suas próprias imagens
DROP POLICY IF EXISTS "Usuários podem deletar suas imagens" ON storage.objects;
CREATE POLICY "Usuários podem deletar suas imagens"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = split_part((storage.filename(name)), '-', 1)
);

-- 5. Criar tabela users se não existir (com estrutura básica)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  has_access BOOLEAN DEFAULT false,
  invite_code_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Adicionar coluna avatar_url se a tabela já existir (mas sem a coluna)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
  END IF;
END $$;

-- 7. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_avatar_url ON public.users(avatar_url);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 8. Habilitar RLS (Row Level Security) na tabela users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 9. Políticas RLS para tabela users
DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.users;
CREATE POLICY "Usuários podem ver seu próprio perfil"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.users;
CREATE POLICY "Usuários podem atualizar seu próprio perfil"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Sistema pode inserir novos usuários" ON public.users;
CREATE POLICY "Sistema pode inserir novos usuários"
ON public.users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 10. Adicionar comentários
COMMENT ON TABLE public.users IS 'Tabela de perfis de usuários da aplicação DUA';
COMMENT ON COLUMN public.users.avatar_url IS 'URL pública do avatar do usuário (Supabase Storage ou avatar predefinido)';
COMMENT ON COLUMN public.users.username IS 'Username único para URL pública (dua.pt/@username)';
COMMENT ON COLUMN public.users.bio IS 'Biografia do usuário (máximo 200 caracteres)';
