-- Adicionar coluna welcome_email_sent na tabela users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT false;

-- Adicionar comentário
COMMENT ON COLUMN public.users.welcome_email_sent IS 'Indica se o email de boas-vindas foi enviado';

-- Criar índice para queries mais rápidas
CREATE INDEX IF NOT EXISTS idx_users_welcome_email_sent ON public.users(welcome_email_sent);
CREATE INDEX IF NOT EXISTS idx_users_welcome_seen ON public.users(welcome_seen);
