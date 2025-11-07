-- 🔥 ADICIONAR COLUNAS DE ADMIN NA TABELA USERS
-- Execute no Supabase Dashboard → SQL Editor

-- 1. Adicionar coluna role se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'role') THEN
    ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END $$;

-- 2. Adicionar coluna full_access se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'full_access') THEN
    ALTER TABLE public.users ADD COLUMN full_access BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 3. Atualizar estraca@2lados.pt para super_admin
UPDATE public.users 
SET 
  role = 'super_admin',
  full_access = true,
  duaia_enabled = true,
  duacoin_enabled = true
WHERE email = 'estraca@2lados.pt';

-- 4. Verificar resultado
SELECT 
  id, 
  email, 
  name, 
  role, 
  full_access, 
  duaia_enabled, 
  duacoin_enabled 
FROM public.users 
WHERE email = 'estraca@2lados.pt';

-- ✅ Depois de executar, faça refresh na página (Ctrl+Shift+R)