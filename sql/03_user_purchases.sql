-- 3. Criar tabela de compras
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_status ON user_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_user_purchases_date ON user_purchases(purchased_at DESC);