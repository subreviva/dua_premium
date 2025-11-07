-- ════════════════════════════════════════════════════════════════
-- SQL PARTE 3: IMPORTAR TABELAS DA DUA IA
-- ════════════════════════════════════════════════════════════════
-- Data: 2025-11-07T03:33:55.499Z
-- ════════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────────
-- TABELA: invite_codes
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  used_by UUID REFERENCES auth.users(id),
  credits INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Importar códigos
INSERT INTO public.invite_codes (id, code, active, credits, created_at)
VALUES (
  '17042717-5506-4490-ada8-8027b9d18dd2',
  'UA4T-S9R',
  true,
  30,
  '2025-11-05T16:37:49.557963+00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invite_codes (id, code, active, credits, created_at)
VALUES (
  '21fe48d4-67bf-4c8c-a4bf-6599aaebf969',
  'RP8H-FWS',
  true,
  30,
  '2025-11-05T16:37:49.655235+00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invite_codes (id, code, active, credits, created_at)
VALUES (
  '0cca0c49-c281-4108-9c86-ba0d140d394a',
  'X3JL-36K',
  true,
  30,
  '2025-11-05T16:37:49.738888+00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invite_codes (id, code, active, credits, created_at)
VALUES (
  'ef8138f8-2c20-457e-a837-d53748d65e5b',
  'Z4B9-6RV',
  true,
  30,
  '2025-11-05T16:37:49.812387+00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invite_codes (id, code, active, credits, created_at)
VALUES (
  'b29db14b-ca86-4a5c-b01a-0d14b6bc9d47',
  'VE5P-NE6',
  true,
  30,
  '2025-11-05T16:37:49.875884+00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invite_codes (id, code, active, credits, created_at)
VALUES (
  '0176f34c-733c-4a2c-9a00-0089e47fef20',
  'TKH7-YSK',
  true,
  30,
  '2025-11-05T16:37:49.94256+00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invite_codes (id, code, active, credits, created_at)
VALUES (
  '9f134ba4-0185-49d3-83a0-49074189448a',
  'KNAN-6Z6',
  true,
  30,
  '2025-11-05T16:37:50.026027+00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invite_codes (id, code, active, credits, created_at)
VALUES (
  '41fe2a70-c9e0-4979-ac4b-9bcb19936c19',
  '4F38-MT3',
  true,
  30,
  '2025-11-05T16:37:50.097306+00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invite_codes (id, code, active, credits, created_at)
VALUES (
  '1e399b52-dbe5-410e-8ec0-faaf9f3a5b37',
  'F285-SDY',
  true,
  30,
  '2025-11-05T16:37:50.169563+00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invite_codes (id, code, active, credits, created_at)
VALUES (
  '3d53beec-4a03-4637-8aa9-75f5dbc08429',
  'U775-GCW',
  false,
  30,
  '2025-11-05T16:37:49.430112+00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invite_codes (id, code, active, credits, created_at)
VALUES (
  '4a308c5c-b97a-43eb-ada9-f60a90089199',
  'DEV-ADMIN',
  true,
  999999,
  '2025-11-05T18:20:11.255+00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invite_codes (id, code, active, credits, created_at)
VALUES (
  '2afb6495-bd61-406e-8f76-1e5b2b74f633',
  'PREMIUM-001',
  true,
  500,
  '2025-11-05T18:27:50.014092+00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invite_codes (id, code, active, credits, created_at)
VALUES (
  '77fcd48b-9b5c-4630-9226-2c76df91d06a',
  'PREMIUM-002',
  true,
  500,
  '2025-11-05T18:27:50.1292+00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invite_codes (id, code, active, credits, created_at)
VALUES (
  'a2790a0b-f5f2-47f5-a04a-072083687d00',
  'VIP-BETA-01',
  true,
  1000,
  '2025-11-05T18:27:50.200295+00:00'
)
ON CONFLICT (id) DO NOTHING;


-- ────────────────────────────────────────────────────────────────
-- TABELA: token_packages
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.token_packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  tokens_amount INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  discount_percentage INTEGER DEFAULT 0,
  promotional_price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Importar pacotes
INSERT INTO public.token_packages (name, description, tokens_amount, price, currency, is_active, is_featured, sort_order)
VALUES (
  'Pack Inicial',
  'Perfeito para começar sua jornada criativa',
  100,
  4.99,
  'EUR',
  true,
  false,
  1
);

INSERT INTO public.token_packages (name, description, tokens_amount, price, currency, is_active, is_featured, sort_order)
VALUES (
  'Pack Popular',
  'Melhor custo-benefício para criadores',
  500,
  19.99,
  'EUR',
  true,
  true,
  2
);

INSERT INTO public.token_packages (name, description, tokens_amount, price, currency, is_active, is_featured, sort_order)
VALUES (
  'Pack Profissional',
  'Para criadores avançados e estúdios',
  1000,
  34.99,
  'EUR',
  true,
  false,
  3
);

INSERT INTO public.token_packages (name, description, tokens_amount, price, currency, is_active, is_featured, sort_order)
VALUES (
  'Pack Ultimate',
  'Máxima criatividade sem limites',
  2500,
  79.99,
  'EUR',
  true,
  false,
  4
);

INSERT INTO public.token_packages (name, description, tokens_amount, price, currency, is_active, is_featured, sort_order)
VALUES (
  'Pack Mega',
  'Para estúdios profissionais',
  5000,
  149.99,
  'EUR',
  true,
  false,
  5
);


-- ────────────────────────────────────────────────────────────────
-- TABELA: conversations (estrutura da DUA IA)
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT DEFAULT 'Nova Conversa',
  messages JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  sync_version INTEGER DEFAULT 1,
  deleted_at TIMESTAMPTZ,
  message_count INTEGER,
  search_vector TSVECTOR
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_deleted_at ON public.conversations(deleted_at) WHERE deleted_at IS NULL;


-- ────────────────────────────────────────────────────────────────
-- TABELA: token_usage_log
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.token_usage_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  tokens_used INTEGER NOT NULL,
  content_generated TEXT,
  session_id VARCHAR(255),
  used_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON public.token_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_used_at ON public.token_usage_log(used_at DESC);

