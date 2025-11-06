-- ╔═══════════════════════════════════════════════════════════╗
-- ║  SCRIPT SQL CONSOLIDADO - SISTEMA COMPLETO DUA           ║
-- ║  Execute este arquivo no Supabase SQL Editor             ║
-- ║  https://app.supabase.com/project/gocjbfcztorfswlkkjqi  ║
-- ╚═══════════════════════════════════════════════════════════╝

-- ============================================================
-- PARTE 1: EXPANDIR TABELA USERS COM PERFIL E TOKENS
-- ============================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_tokens INTEGER DEFAULT 100;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) DEFAULT 'public';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_projects INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_generated_content INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;

-- ============================================================
-- PARTE 2: CRIAR TABELA DE PACOTES DE TOKENS
-- ============================================================

CREATE TABLE IF NOT EXISTS token_packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  tokens_amount INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  discount_percentage INTEGER DEFAULT 0,
  promotional_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir pacotes padrão
INSERT INTO token_packages (name, description, tokens_amount, price, is_featured, sort_order)
VALUES 
  ('Pack Inicial', 'Perfeito para começar sua jornada criativa', 100, 4.99, false, 1),
  ('Pack Popular', 'Melhor custo-benefício para criadores', 500, 19.99, true, 2),
  ('Pack Profissional', 'Para criadores avançados e estúdios', 1000, 34.99, false, 3),
  ('Pack Ultimate', 'Máxima criatividade sem limites', 2500, 79.99, false, 4),
  ('Pack Mega', 'Para estúdios profissionais', 5000, 149.99, false, 5)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- PARTE 3: CRIAR TABELA DE COMPRAS
-- ============================================================

CREATE TABLE IF NOT EXISTS user_purchases (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_name VARCHAR(100) NOT NULL,
  tokens_amount INTEGER NOT NULL,
  price_paid DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  payment_method VARCHAR(50) DEFAULT 'stripe',
  payment_status VARCHAR(20) DEFAULT 'pending',
  transaction_id VARCHAR(255),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'))
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_status ON user_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_user_purchases_date ON user_purchases(purchased_at DESC);

-- ============================================================
-- PARTE 4: CRIAR TABELA DE LOG DE USO DE TOKENS
-- ============================================================

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

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_action ON token_usage_log(action_type);
CREATE INDEX IF NOT EXISTS idx_token_usage_date ON token_usage_log(used_at DESC);

-- ============================================================
-- PARTE 5: CONFIGURAR ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE token_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_usage_log ENABLE ROW LEVEL SECURITY;

-- Políticas para token_packages (todos podem ver pacotes ativos)
DROP POLICY IF EXISTS "Anyone can view active packages" ON token_packages;
CREATE POLICY "Anyone can view active packages" ON token_packages
  FOR SELECT USING (is_active = true);

-- Políticas para user_purchases (usuários só veem suas compras)
DROP POLICY IF EXISTS "Users can view own purchases" ON user_purchases;
CREATE POLICY "Users can view own purchases" ON user_purchases
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own purchases" ON user_purchases;
CREATE POLICY "Users can insert own purchases" ON user_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para token_usage_log (usuários só veem seu uso)
DROP POLICY IF EXISTS "Users can view own usage" ON token_usage_log;
CREATE POLICY "Users can view own usage" ON token_usage_log
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can log usage" ON token_usage_log;
CREATE POLICY "System can log usage" ON token_usage_log
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- PARTE 6: CRIAR FUNÇÕES E TRIGGERS AUTOMÁTICOS
-- ============================================================

-- Função para processar compras de tokens
CREATE OR REPLACE FUNCTION process_token_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Quando uma compra é completada, adicionar tokens ao usuário
  IF NEW.payment_status = 'completed' AND (OLD IS NULL OR OLD.payment_status != 'completed') THEN
    UPDATE users 
    SET 
      total_tokens = total_tokens + NEW.tokens_amount,
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para processar compras
DROP TRIGGER IF EXISTS process_token_purchase_trigger ON user_purchases;
CREATE TRIGGER process_token_purchase_trigger
  AFTER INSERT OR UPDATE ON user_purchases
  FOR EACH ROW
  EXECUTE FUNCTION process_token_purchase();

-- Função para registrar uso de tokens
CREATE OR REPLACE FUNCTION record_token_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contadores no perfil do usuário
  UPDATE users 
  SET 
    tokens_used = tokens_used + NEW.tokens_used,
    total_generated_content = total_generated_content + 1,
    updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para uso de tokens
DROP TRIGGER IF EXISTS record_token_usage_trigger ON token_usage_log;
CREATE TRIGGER record_token_usage_trigger
  AFTER INSERT ON token_usage_log
  FOR EACH ROW
  EXECUTE FUNCTION record_token_usage();

-- ============================================================
-- PARTE 7: ATUALIZAR USUÁRIOS EXISTENTES
-- ============================================================

UPDATE users 
SET 
  full_name = COALESCE(full_name, 'Usuário'),
  total_tokens = COALESCE(total_tokens, 100),
  tokens_used = COALESCE(tokens_used, 0),
  subscription_tier = COALESCE(subscription_tier, 'free'),
  profile_visibility = COALESCE(profile_visibility, 'public'),
  email_notifications = COALESCE(email_notifications, true),
  push_notifications = COALESCE(push_notifications, true),
  marketing_emails = COALESCE(marketing_emails, false),
  total_projects = COALESCE(total_projects, 0),
  total_generated_content = COALESCE(total_generated_content, 0)
WHERE full_name IS NULL OR total_tokens IS NULL;

-- ============================================================
-- VERIFICAÇÕES FINAIS
-- ============================================================

-- Verificar quantos usuários foram atualizados
DO $$
DECLARE
  total_users INTEGER;
  users_with_tokens INTEGER;
  packages_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM users;
  SELECT COUNT(*) INTO users_with_tokens FROM users WHERE total_tokens > 0;
  SELECT COUNT(*) INTO packages_count FROM token_packages WHERE is_active = true;
  
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'VERIFICAÇÃO FINAL:';
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'Total de usuários: %', total_users;
  RAISE NOTICE 'Usuários com tokens: %', users_with_tokens;
  RAISE NOTICE 'Pacotes ativos: %', packages_count;
  RAISE NOTICE '====================================================';
  RAISE NOTICE 'INSTALAÇÃO COMPLETA COM SUCESSO!';
  RAISE NOTICE '====================================================';
END $$;

-- Verificar tabelas criadas
SELECT 
  'token_packages' as tabela,
  COUNT(*) as registros
FROM token_packages
UNION ALL
SELECT 
  'users com tokens' as tabela,
  COUNT(*) as registros
FROM users WHERE total_tokens > 0;

-- ============================================================
-- FUNÇÃO PARA INJETAR TOKENS (ADMIN)
-- ============================================================

CREATE OR REPLACE FUNCTION inject_tokens(
  user_id UUID,
  tokens_amount INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar total de tokens do usuário
  UPDATE users
  SET 
    total_tokens = total_tokens + tokens_amount,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Registrar no log de uso (com valor negativo para indicar crédito)
  INSERT INTO token_usage_log (user_id, tokens_used, action_type, description)
  VALUES (user_id, -tokens_amount, 'admin_injection', 'Tokens injetados pelo administrador');
  
  RAISE NOTICE 'Tokens injetados com sucesso: % tokens para usuário %', tokens_amount, user_id;
END;
$$;

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================