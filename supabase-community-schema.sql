-- ===================================================
-- COMMUNITY SYSTEM - SUPABASE SCHEMA
-- ===================================================
-- Sistema completo para comunidade DUA
-- Imagens e Música no Firebase Storage
-- Metadata, Likes e Comentários no Supabase
-- ===================================================

-- ===================================================
-- 1. TABELA: community_posts
-- ===================================================
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'music')),
    title TEXT NOT NULL,
    description TEXT,
    media_url TEXT NOT NULL, -- URL pública do Firebase Storage
    firebase_path TEXT NOT NULL, -- Path completo no Firebase (para deletar)
    thumbnail_url TEXT, -- Thumbnail para músicas
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.community_posts IS 'Publicações da comunidade (imagens e músicas)';
COMMENT ON COLUMN public.community_posts.media_url IS 'URL pública do Firebase Storage';
COMMENT ON COLUMN public.community_posts.firebase_path IS 'Path completo no Firebase para permitir exclusão';

-- ===================================================
-- 2. TABELA: community_likes
-- ===================================================
CREATE TABLE IF NOT EXISTS public.community_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id) -- Previne likes duplicados
);

COMMENT ON TABLE public.community_likes IS 'Sistema de likes para publicações';

-- ===================================================
-- 3. TABELA: community_comments
-- ===================================================
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.community_comments IS 'Comentários nas publicações';

-- ===================================================
-- 4. ÍNDICES PARA PERFORMANCE
-- ===================================================
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON public.community_posts(type);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_likes_post_id ON public.community_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_user_id ON public.community_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_user_id ON public.community_comments(user_id);

-- ===================================================
-- 5. FUNÇÕES PARA AUTO-INCREMENTO DE CONTADORES
-- ===================================================

-- Função para atualizar likes_count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.community_posts
        SET likes_count = likes_count + 1
        WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.community_posts
        SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar comments_count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.community_posts
        SET comments_count = comments_count + 1
        WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.community_posts
        SET comments_count = GREATEST(comments_count - 1, 0)
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================
-- 6. TRIGGERS
-- ===================================================

-- Trigger para likes
DROP TRIGGER IF EXISTS trigger_update_likes_count ON public.community_likes;
CREATE TRIGGER trigger_update_likes_count
AFTER INSERT OR DELETE ON public.community_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Trigger para comments
DROP TRIGGER IF EXISTS trigger_update_comments_count ON public.community_comments;
CREATE TRIGGER trigger_update_comments_count
AFTER INSERT OR DELETE ON public.community_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Trigger para updated_at em posts
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_posts_updated_at ON public.community_posts;
CREATE TRIGGER trigger_update_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_comments_updated_at ON public.community_comments;
CREATE TRIGGER trigger_update_comments_updated_at
BEFORE UPDATE ON public.community_comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ===================================================

-- Habilitar RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- Políticas para community_posts
DROP POLICY IF EXISTS "Anyone can view posts" ON public.community_posts;
CREATE POLICY "Anyone can view posts" 
ON public.community_posts FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.community_posts;
CREATE POLICY "Authenticated users can create posts" 
ON public.community_posts FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON public.community_posts;
CREATE POLICY "Users can update own posts" 
ON public.community_posts FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.community_posts;
CREATE POLICY "Users can delete own posts" 
ON public.community_posts FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para community_likes
DROP POLICY IF EXISTS "Anyone can view likes" ON public.community_likes;
CREATE POLICY "Anyone can view likes" 
ON public.community_likes FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Authenticated users can like" ON public.community_likes;
CREATE POLICY "Authenticated users can like" 
ON public.community_likes FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike" ON public.community_likes;
CREATE POLICY "Users can unlike" 
ON public.community_likes FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para community_comments
DROP POLICY IF EXISTS "Anyone can view comments" ON public.community_comments;
CREATE POLICY "Anyone can view comments" 
ON public.community_comments FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Authenticated users can comment" ON public.community_comments;
CREATE POLICY "Authenticated users can comment" 
ON public.community_comments FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON public.community_comments;
CREATE POLICY "Users can update own comments" 
ON public.community_comments FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.community_comments;
CREATE POLICY "Users can delete own comments" 
ON public.community_comments FOR DELETE 
USING (auth.uid() = user_id);

-- ===================================================
-- 8. VIEW: Posts com informação do usuário
-- ===================================================
CREATE OR REPLACE VIEW public.community_posts_with_user AS
SELECT 
    p.*,
    u.email as user_email,
    u.raw_user_meta_data->>'name' as user_name,
    u.raw_user_meta_data->>'avatar_url' as user_avatar
FROM public.community_posts p
LEFT JOIN auth.users u ON p.user_id = u.id
ORDER BY p.created_at DESC;

COMMENT ON VIEW public.community_posts_with_user IS 'Posts com informação básica do usuário para exibição';

-- ===================================================
-- DONE: Schema completo criado!
-- ===================================================
-- Execute este SQL no Supabase SQL Editor
-- Depois execute o script Node.js para popular dados de teste
-- ===================================================
