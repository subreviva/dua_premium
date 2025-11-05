-- 5. Configurar Row Level Security
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