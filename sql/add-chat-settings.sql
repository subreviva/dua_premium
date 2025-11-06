-- Adicionar coluna chat_settings à tabela users
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar coluna JSONB para armazenar configurações do chat
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS chat_settings JSONB DEFAULT '{
  "theme": "dark",
  "language": "pt",
  "notifications": true,
  "soundEffects": true,
  "autoSaveChats": true,
  "showTimestamps": true,
  "compactMode": false,
  "enterToSend": true
}'::jsonb;

-- 2. Criar índice para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_users_chat_settings ON public.users USING gin(chat_settings);

-- 3. Comentário explicativo
COMMENT ON COLUMN public.users.chat_settings IS 'Configurações personalizadas do chat do usuário (tema, idioma, notificações, etc)';

-- 4. Forçar reload do schema cache
NOTIFY pgrst, 'reload schema';
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';

-- 5. Verificar estrutura
SELECT 
  '✅ Coluna chat_settings adicionada!' as resultado;

SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
  AND column_name = 'chat_settings';
