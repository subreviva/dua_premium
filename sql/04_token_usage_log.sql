-- 4. Criar tabela de log de uso
CREATE TABLE IF NOT EXISTS token_usage_log (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL,
  tokens_used INTEGER NOT NULL,
  content_generated TEXT,
  session_id VARCHAR(255),
  used_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_action ON token_usage_log(action_type);
CREATE INDEX IF NOT EXISTS idx_token_usage_date ON token_usage_log(used_at DESC);