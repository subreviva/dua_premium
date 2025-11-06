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
CREATE POLICY "Usuários podem fazer upload de suas imagens"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  (storage.foldername(name))[1] = 'avatars' AND
  auth.uid()::text = split_part((storage.filename(name)), '-', 1)
);

-- 3. Política de storage: permitir todos lerem imagens (bucket público)
CREATE POLICY "Qualquer um pode ver imagens públicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- 4. Política de storage: permitir usuários deletarem suas próprias imagens
CREATE POLICY "Usuários podem deletar suas imagens"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = split_part((storage.filename(name)), '-', 1)
);

-- 5. Adicionar coluna avatar_url na tabela users (se não existir)
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 6. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_avatar_url ON users(avatar_url);

-- 7. Adicionar comentários
COMMENT ON COLUMN users.avatar_url IS 'URL pública do avatar do usuário (Supabase Storage ou avatar predefinido)';
