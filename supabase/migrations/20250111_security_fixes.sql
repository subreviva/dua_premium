-- ═══════════════════════════════════════════════════════════════════════════
-- CORREÇÕES DE SEGURANÇA CRÍTICAS - MÁXIMO RIGOR
-- Data: 11 Novembro 2025
-- Ação: Corrigir problemas encontrados pelo Supabase Linter SEM DESTRUIR DADOS
-- ═══════════════════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 1. PROTEGER VIEWS QUE EXPÕEM auth.users
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1.1. REVOGAR acesso público às views de admin
REVOKE ALL ON public.admin_user_stats FROM anon, authenticated;
REVOKE ALL ON public.admin_suspicious_transactions FROM anon, authenticated;
REVOKE ALL ON public.admin_top_dua_holders FROM anon, authenticated;
REVOKE ALL ON public.email_queue_stats FROM anon, authenticated;
REVOKE ALL ON public.user_balance_summary FROM anon, authenticated;

-- 1.2. PERMITIR apenas para service_role (super admin)
GRANT SELECT ON public.admin_user_stats TO service_role;
GRANT SELECT ON public.admin_suspicious_transactions TO service_role;
GRANT SELECT ON public.admin_top_dua_holders TO service_role;
GRANT SELECT ON public.email_queue_stats TO service_role;
GRANT SELECT ON public.user_balance_summary TO service_role;

-- 1.3. RECRIAR community_posts_with_user SEM auth.users
DROP VIEW IF EXISTS public.community_posts_with_user CASCADE;

CREATE OR REPLACE VIEW public.community_posts_with_user
WITH (security_invoker = true) AS
SELECT 
  cp.id,
  cp.user_id,
  cp.type,
  cp.title,
  cp.description,
  cp.media_url,
  cp.thumbnail_url,
  cp.likes_count,
  cp.views_count,
  cp.shares_count,
  cp.is_featured,
  cp.created_at,
  cp.updated_at,
  -- ✅ SEGURO: Buscar dados de users (tabela pública), NÃO de auth.users
  u.name as user_name,
  u.username as user_username,
  u.avatar_url as user_avatar_url
FROM public.community_posts cp
LEFT JOIN public.users u ON cp.user_id = u.id;

-- Permitir leitura pública (dados já vêm de tabela pública)
GRANT SELECT ON public.community_posts_with_user TO anon, authenticated;

COMMENT ON VIEW public.community_posts_with_user IS 
'View segura de posts da comunidade - USA public.users em vez de auth.users';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 2. CORRIGIR SECURITY DEFINER em v_market_products_public
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Recriar com SECURITY INVOKER (mais seguro)
DROP VIEW IF EXISTS public.v_market_products_public CASCADE;

CREATE OR REPLACE VIEW public.v_market_products_public
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  description,
  price_dua,
  type,
  rarity,
  image_url,
  stock,
  available,
  created_at,
  updated_at
FROM public.market_products
WHERE available = true
  AND stock > 0;

GRANT SELECT ON public.v_market_products_public TO anon, authenticated;

COMMENT ON VIEW public.v_market_products_public IS 
'View pública de produtos do mercado - SECURITY INVOKER para segurança';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 3. HABILITAR RLS em creative_scholarships
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE public.creative_scholarships ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver APENAS suas próprias bolsas
DROP POLICY IF EXISTS "Users can view own scholarships" ON public.creative_scholarships;
CREATE POLICY "Users can view own scholarships"
  ON public.creative_scholarships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Política: Admins podem ver todas
DROP POLICY IF EXISTS "Admins can view all scholarships" ON public.creative_scholarships;
CREATE POLICY "Admins can view all scholarships"
  ON public.creative_scholarships
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid()
        AND (is_admin = true OR account_type = 'admin')
    )
  );

-- Política: Usuários podem criar suas próprias bolsas
DROP POLICY IF EXISTS "Users can create own scholarships" ON public.creative_scholarships;
CREATE POLICY "Users can create own scholarships"
  ON public.creative_scholarships
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias bolsas
DROP POLICY IF EXISTS "Users can update own scholarships" ON public.creative_scholarships;
CREATE POLICY "Users can update own scholarships"
  ON public.creative_scholarships
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.creative_scholarships IS 
'Tabela de bolsas criativas - RLS HABILITADO para proteção';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 4. CORRIGIR search_path em FUNÇÕES CRÍTICAS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 4.1. update_artist_current_amount
CREATE OR REPLACE FUNCTION public.update_artist_current_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.music_requests
  SET current_amount = (
    SELECT COALESCE(SUM(amount), 0)
    FROM public.music_contributions
    WHERE request_id = NEW.request_id
  )
  WHERE id = NEW.request_id;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_artist_current_amount IS 
'Atualiza valor atual de contribuições - SEARCH_PATH FIXO para segurança';

-- 4.2. touch_updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.touch_updated_at IS 
'Atualiza updated_at automaticamente - SEARCH_PATH FIXO';

-- 4.3. log_login_attempt
CREATE OR REPLACE FUNCTION public.log_login_attempt(
  p_email TEXT,
  p_success BOOLEAN,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.login_attempts (
    email,
    success,
    ip_address,
    user_agent,
    attempted_at
  ) VALUES (
    p_email,
    p_success,
    p_ip_address,
    p_user_agent,
    NOW()
  );
END;
$$;

COMMENT ON FUNCTION public.log_login_attempt IS 
'Registra tentativas de login - SEARCH_PATH FIXO para segurança';

-- 4.4. increment_view_count
CREATE OR REPLACE FUNCTION public.increment_view_count(post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.community_posts
  SET views_count = views_count + 1
  WHERE id = post_id;
END;
$$;

COMMENT ON FUNCTION public.increment_view_count IS 
'Incrementa contador de views - SEARCH_PATH FIXO';

-- 4.5. increment_likes_count
CREATE OR REPLACE FUNCTION public.increment_likes_count(post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.community_posts
  SET likes_count = likes_count + 1
  WHERE id = post_id;
END;
$$;

-- 4.6. decrement_likes_count
CREATE OR REPLACE FUNCTION public.decrement_likes_count(post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.community_posts
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = post_id;
END;
$$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- 5. VERIFICAÇÕES FINAIS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Verificar RLS em tabelas críticas
DO $$
DECLARE
  tables_without_rls TEXT[];
BEGIN
  SELECT array_agg(tablename)
  INTO tables_without_rls
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT IN (
      SELECT tablename
      FROM pg_tables t
      JOIN pg_class c ON c.relname = t.tablename
      WHERE c.relrowsecurity = true
        AND t.schemaname = 'public'
    )
    AND tablename IN (
      'users', 'community_posts', 'community_likes', 
      'community_comments', 'duaia_user_balances', 
      'duacoin_transactions', 'creative_scholarships'
    );
  
  IF array_length(tables_without_rls, 1) > 0 THEN
    RAISE WARNING 'Tabelas SEM RLS: %', tables_without_rls;
  ELSE
    RAISE NOTICE '✅ Todas as tabelas críticas têm RLS habilitado';
  END IF;
END;
$$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- RESUMO DAS CORREÇÕES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT 
  '✅ CORREÇÕES APLICADAS COM SUCESSO' as status,
  jsonb_build_object(
    'views_protegidas', 5,
    'views_recriadas_seguras', 2,
    'rls_habilitado', 'creative_scholarships',
    'funcoes_corrigidas', 6,
    'search_path_fixado', true
  ) as detalhes;
