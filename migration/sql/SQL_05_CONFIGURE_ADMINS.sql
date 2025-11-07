-- ════════════════════════════════════════════════════════════════
-- SQL ADMIN: CONFIGURAR estraca@2lados.pt COMO ADMIN
-- ════════════════════════════════════════════════════════════════
-- Data: 7 Novembro 2025
-- Objetivo: Garantir que estraca@2lados.pt é ADMIN em ambas as plataformas
-- UUID: 345bb6b6-7e47-40db-bbbe-e9fe4836f682
-- ════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────
-- 1. ATUALIZAR METADATA NA AUTH.USERS (via API)
-- ────────────────────────────────────────────────────────────────
-- NOTA: Este update deve ser feito via supabase.auth.admin.updateUserById()
-- porque auth.users não permite UPDATE direto via SQL

-- Executar via script Node.js:
-- await supabase.auth.admin.updateUserById(
--   '345bb6b6-7e47-40db-bbbe-e9fe4836f682',
--   {
--     user_metadata: {
--       role: 'admin',
--       name: 'Estraca Admin',
--       is_super_admin: true
--     },
--     app_metadata: {
--       role: 'admin',
--       roles: ['admin', 'super_admin']
--     }
--   }
-- )

-- ────────────────────────────────────────────────────────────────
-- 2. ATUALIZAR PROFILE COM ROLE ADMIN
-- ────────────────────────────────────────────────────────────────

UPDATE public.profiles SET
  role = 'admin',
  full_name = 'Estraca Admin',
  updated_at = NOW()
WHERE id = '345bb6b6-7e47-40db-bbbe-e9fe4836f682';

-- ────────────────────────────────────────────────────────────────
-- 3. CRIAR/ATUALIZAR NA TABELA USERS COM PERMISSÕES ADMIN
-- ────────────────────────────────────────────────────────────────

INSERT INTO public.users (
  id, 
  email, 
  display_name, 
  has_access, 
  subscription_tier, 
  total_tokens,
  role,
  is_admin,
  created_at
)
VALUES (
  '345bb6b6-7e47-40db-bbbe-e9fe4836f682',
  'estraca@2lados.pt',
  'Estraca Admin',
  true,
  'premium',
  999999,
  'admin',
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  has_access = true,
  subscription_tier = 'premium',
  role = 'admin',
  is_admin = true,
  total_tokens = GREATEST(public.users.total_tokens, 999999),
  updated_at = NOW();

-- ────────────────────────────────────────────────────────────────
-- 4. CRIAR TABELA ADMIN_PERMISSIONS (se não existir)
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  can_manage_users BOOLEAN DEFAULT true,
  can_manage_content BOOLEAN DEFAULT true,
  can_manage_billing BOOLEAN DEFAULT true,
  can_view_analytics BOOLEAN DEFAULT true,
  can_manage_settings BOOLEAN DEFAULT true,
  can_access_api BOOLEAN DEFAULT true,
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_admin_permissions_user_id ON public.admin_permissions(user_id);

-- RLS: Apenas admins podem ver permissões
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_permissions_select" ON public.admin_permissions;
CREATE POLICY "admin_permissions_select"
ON public.admin_permissions FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR 
  EXISTS (
    SELECT 1 FROM public.admin_permissions ap 
    WHERE ap.user_id = auth.uid() AND ap.is_super_admin = true
  )
);

-- ────────────────────────────────────────────────────────────────
-- 5. INSERIR PERMISSÕES ADMIN PARA estraca@2lados.pt
-- ────────────────────────────────────────────────────────────────

INSERT INTO public.admin_permissions (
  user_id,
  can_manage_users,
  can_manage_content,
  can_manage_billing,
  can_view_analytics,
  can_manage_settings,
  can_access_api,
  is_super_admin
)
VALUES (
  '345bb6b6-7e47-40db-bbbe-e9fe4836f682',
  true,  -- Pode gerenciar utilizadores
  true,  -- Pode gerenciar conteúdo
  true,  -- Pode gerenciar billing/pagamentos
  true,  -- Pode ver analytics
  true,  -- Pode gerenciar configurações
  true,  -- Pode acessar API
  true   -- É super admin (acesso total)
)
ON CONFLICT (user_id) DO UPDATE SET
  can_manage_users = true,
  can_manage_content = true,
  can_manage_billing = true,
  can_view_analytics = true,
  can_manage_settings = true,
  can_access_api = true,
  is_super_admin = true,
  updated_at = NOW();

-- ────────────────────────────────────────────────────────────────
-- 6. TAMBÉM CONFIGURAR dev@dua.com COMO SUPER ADMIN
-- ────────────────────────────────────────────────────────────────

-- Atualizar profile
UPDATE public.profiles SET
  role = 'admin'
WHERE id = '22b7436c-41be-4332-859e-9d2315bcfe1f';

-- Atualizar users
UPDATE public.users SET
  role = 'admin',
  is_admin = true,
  subscription_tier = 'premium'
WHERE id = '22b7436c-41be-4332-859e-9d2315bcfe1f';

-- Inserir permissões
INSERT INTO public.admin_permissions (
  user_id,
  can_manage_users,
  can_manage_content,
  can_manage_billing,
  can_view_analytics,
  can_manage_settings,
  can_access_api,
  is_super_admin
)
VALUES (
  '22b7436c-41be-4332-859e-9d2315bcfe1f',
  true, true, true, true, true, true, true
)
ON CONFLICT (user_id) DO UPDATE SET
  can_manage_users = true,
  can_manage_content = true,
  can_manage_billing = true,
  can_view_analytics = true,
  can_manage_settings = true,
  can_access_api = true,
  is_super_admin = true,
  updated_at = NOW();

-- ────────────────────────────────────────────────────────────────
-- 7. ADICIONAR COLUNA role E is_admin NA TABELA users (se não existir)
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.users 
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Criar índice para busca rápida de admins
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ────────────────────────────────────────────────────────────────
-- 8. ADICIONAR COLUNA role NA TABELA profiles (se não existir)
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ────────────────────────────────────────────────────────────────
-- 9. VERIFICAR CONFIGURAÇÃO
-- ────────────────────────────────────────────────────────────────

-- Verificar admins configurados
SELECT 
  p.id,
  p.email,
  p.role as profile_role,
  u.role as users_role,
  u.is_admin,
  ap.is_super_admin,
  ap.can_manage_users,
  u.total_tokens
FROM public.profiles p
LEFT JOIN public.users u ON u.id = p.id
LEFT JOIN public.admin_permissions ap ON ap.user_id = p.id
WHERE p.role = 'admin' OR u.is_admin = true OR ap.is_super_admin = true
ORDER BY p.email;

-- ════════════════════════════════════════════════════════════════
-- ✅ CONFIGURAÇÃO ADMIN APLICADA
-- ════════════════════════════════════════════════════════════════
-- 1. ✅ estraca@2lados.pt configurado como SUPER ADMIN
-- 2. ✅ dev@dua.com também configurado como SUPER ADMIN
-- 3. ✅ Tabela admin_permissions criada
-- 4. ✅ Colunas role e is_admin adicionadas
-- 5. ✅ RLS configurado para segurança
-- 6. ✅ Ambos têm acesso total aos painéis administrativos
-- ════════════════════════════════════════════════════════════════

-- NOTA IMPORTANTE:
-- Para completar a configuração, executar também via Admin API:
-- 
-- await supabase.auth.admin.updateUserById(
--   '345bb6b6-7e47-40db-bbbe-e9fe4836f682',
--   {
--     user_metadata: { role: 'admin', is_super_admin: true },
--     app_metadata: { role: 'admin', roles: ['admin', 'super_admin'] }
--   }
-- )
