
-- ============================================================
-- ADICIONAR COLUNAS FALTANTES: subscription_tier, display_name, last_login
-- ============================================================

-- Adicionar subscription_tier (default: 'free')
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

-- Adicionar display_name (opcional)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Adicionar last_login (renomear de last_login_at ou criar)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='last_login') THEN
    -- Se last_login_at existe, renomear
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='users' AND column_name='last_login_at') THEN
      ALTER TABLE public.users RENAME COLUMN last_login_at TO last_login;
    ELSE
      -- Se não existe, criar nova
      ALTER TABLE public.users ADD COLUMN last_login TIMESTAMPTZ;
    END IF;
  END IF;
END $$;

-- Verificar colunas criadas
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('subscription_tier', 'display_name', 'last_login')
ORDER BY column_name;
