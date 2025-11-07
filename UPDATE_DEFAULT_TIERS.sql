
-- Atualizar todos os users existentes para subscription_tier = 'free'
UPDATE public.users
SET subscription_tier = 'free'
WHERE subscription_tier IS NULL;
