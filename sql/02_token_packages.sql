-- 2. Criar tabela de pacotes de tokens
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