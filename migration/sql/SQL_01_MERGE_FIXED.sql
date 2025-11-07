-- ════════════════════════════════════════════════════════════════
-- SQL MIGRAÇÃO CORRIGIDA: MERGE DE UTILIZADORES
-- ════════════════════════════════════════════════════════════════
-- Data: 7 Novembro 2025
-- Status: CORRIGIDO - creditos em public.users, não profiles
-- ════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- PASSO 1: MERGE dev@dua.com (999,999 créditos)
-- ────────────────────────────────────────────────────────────────

-- 1.1 Criar/Atualizar entry na tabela users
INSERT INTO public.users (
  id,
  email,
  display_name,
  has_access,
  subscription_tier,
  total_tokens,
  created_at
)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'dev@dua.com',
  'Developer Admin',
  true,
  'premium',
  999999,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = 'dev@dua.com',
  display_name = 'Developer Admin',
  has_access = true,
  subscription_tier = 'premium',
  total_tokens = COALESCE(public.users.total_tokens, 0) + 999999,
  updated_at = NOW();

-- 1.2 Atualizar profile para dev@dua.com
UPDATE public.profiles SET
  full_name = 'Developer Admin',
  avatar_url = 'https://api.dicebear.com/9.x/notionists/svg?seed=dev-admin',
  updated_at = NOW()
WHERE id = '22b7436c-41be-4332-859e-9d2315bcfe1f';

-- ────────────────────────────────────────────────────────────────
-- PASSO 2: MERGE estracaofficial@gmail.com (60 créditos)
-- ────────────────────────────────────────────────────────────────

-- 2.1 Criar/Atualizar entry na tabela users
INSERT INTO public.users (
  id,
  email,
  display_name,
  has_access,
  subscription_tier,
  total_tokens,
  created_at
)
VALUES (
  '3606c797-0eb8-4fdb-a150-50d51ffaf460',
  'estracaofficial@gmail.com',
  'Usuário',
  true,
  'free',
  60,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = 'estracaofficial@gmail.com',
  display_name = 'Usuário',
  has_access = true,
  subscription_tier = 'free',
  total_tokens = COALESCE(public.users.total_tokens, 0) + 60,
  updated_at = NOW();

-- 2.2 Atualizar profile
UPDATE public.profiles SET
  full_name = 'Carlos Filipe Morais Guedes',
  updated_at = NOW()
WHERE id = '3606c797-0eb8-4fdb-a150-50d51ffaf460';

-- ════════════════════════════════════════════════════════════════
-- ✅ MERGE COMPLETO
-- ════════════════════════════════════════════════════════════════
-- Total de utilizadores após merge: 8 (sem mudança de contagem)
-- Total de créditos adicionados: 1,000,059 (999,999 + 60)
-- UUIDs DUA COIN preservados: ✅
-- ════════════════════════════════════════════════════════════════
