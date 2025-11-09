-- ===================================================
-- FIX: RLS para VIEW community_posts_with_user
-- ===================================================

-- A VIEW precisa de política RLS para ser acessível
ALTER VIEW public.community_posts_with_user SET (security_invoker = on);

-- Garantir que qualquer um pode ver posts através da view
GRANT SELECT ON public.community_posts_with_user TO anon, authenticated;
