-- ════════════════════════════════════════════════════════════════
-- MIGRAÇÃO DUA IA → DUA COIN - VERSÃO SIMPLIFICADA E ROBUSTA
-- ════════════════════════════════════════════════════════════════
-- Data: 7 Novembro 2025
-- Método: Direto e seguro, sem assunções sobre estrutura
-- ════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- 1. ATUALIZAR dev@dua.com (999,999 créditos)
-- ────────────────────────────────────────────────────────────────

-- Tentar atualizar na tabela users (se existir total_tokens)
UPDATE public.users 
SET 
  total_tokens = 999999,
  updated_at = NOW()
WHERE email = 'dev@dua.com';

-- Se users não tiver o utilizador, inserir
INSERT INTO public.users (id, email, display_name, total_tokens, has_access, created_at)
SELECT 
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  'dev@dua.com',
  'Developer Admin',
  999999,
  true,
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE email = 'dev@dua.com'
);

-- Tentar atualizar profile também (se existir coluna credits)
UPDATE public.profiles 
SET updated_at = NOW()
WHERE id = '22b7436c-41be-4332-859e-9d2315bcfe1f';

-- ────────────────────────────────────────────────────────────────
-- 2. ATUALIZAR estracaofficial@gmail.com (60 créditos)
-- ────────────────────────────────────────────────────────────────

-- Atualizar na tabela users
UPDATE public.users 
SET 
  total_tokens = 60,
  updated_at = NOW()
WHERE email = 'estracaofficial@gmail.com';

-- Inserir se não existir
INSERT INTO public.users (id, email, display_name, total_tokens, has_access, created_at)
SELECT 
  '3606c797-0eb8-4fdb-a150-50d51ffaf460',
  'estracaofficial@gmail.com',
  'Usuário',
  60,
  true,
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE email = 'estracaofficial@gmail.com'
);

-- ────────────────────────────────────────────────────────────────
-- 3. VERIFICAÇÃO
-- ────────────────────────────────────────────────────────────────

-- Mostrar resultado final
SELECT email, total_tokens, has_access FROM public.users 
WHERE email IN ('dev@dua.com', 'estracaofficial@gmail.com')
ORDER BY email;

-- ════════════════════════════════════════════════════════════════
-- ✅ MERGE SIMPLIFICADO COMPLETO
-- ════════════════════════════════════════════════════════════════
