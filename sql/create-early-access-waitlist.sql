-- ============================================================
-- EARLY ACCESS WAITLIST - Sistema de Subscrição
-- ============================================================
-- Esta tabela armazena os utilizadores que se registam
-- para acesso antecipado enquanto a plataforma está em fase
-- de convite apenas.
-- ============================================================

-- 1. Criar tabela de subscribers (waitlist)
CREATE TABLE IF NOT EXISTS public.early_access_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  
  -- Status do subscriber
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'invited', 'registered')),
  
  -- Metadados
  source TEXT DEFAULT 'website', -- website, referral, etc
  referral_code TEXT, -- código de quem referiu
  
  -- Informações de tracking
  ip_address TEXT,
  user_agent TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Preferências
  newsletter_consent BOOLEAN DEFAULT true,
  marketing_consent BOOLEAN DEFAULT false,
  
  -- Datas importantes
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  invited_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ,
  
  -- Notas internas
  internal_notes TEXT,
  priority_level INT DEFAULT 0, -- 0=normal, 1=high, 2=urgent
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_early_access_email ON public.early_access_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_early_access_status ON public.early_access_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_early_access_subscribed ON public.early_access_subscribers(subscribed_at DESC);
CREATE INDEX IF NOT EXISTS idx_early_access_priority ON public.early_access_subscribers(priority_level DESC, subscribed_at);

-- RLS: Apenas leitura pública para verificar se email já existe
ALTER TABLE public.early_access_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can check email existence" ON public.early_access_subscribers;
CREATE POLICY "Anyone can check email existence"
ON public.early_access_subscribers
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.early_access_subscribers;
CREATE POLICY "Anyone can subscribe"
ON public.early_access_subscribers
FOR INSERT
WITH CHECK (true);

-- Admins podem ver e editar tudo
DROP POLICY IF EXISTS "Admins full access subscribers" ON public.early_access_subscribers;
CREATE POLICY "Admins full access subscribers"
ON public.early_access_subscribers
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================================
-- 2. Função para contar subscribers
-- ============================================================
CREATE OR REPLACE FUNCTION public.count_early_access_subscribers()
RETURNS TABLE (
  total BIGINT,
  waiting BIGINT,
  invited BIGINT,
  registered BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total,
    COUNT(*) FILTER (WHERE status = 'waiting')::BIGINT AS waiting,
    COUNT(*) FILTER (WHERE status = 'invited')::BIGINT AS invited,
    COUNT(*) FILTER (WHERE status = 'registered')::BIGINT AS registered
  FROM public.early_access_subscribers;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 3. Trigger para atualizar updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_early_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_early_access_updated_at ON public.early_access_subscribers;
CREATE TRIGGER trigger_early_access_updated_at
  BEFORE UPDATE ON public.early_access_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_early_access_updated_at();

-- ============================================================
-- 4. Função para marcar subscriber como convidado
-- ============================================================
CREATE OR REPLACE FUNCTION public.mark_subscriber_as_invited(subscriber_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  updated_count INT;
BEGIN
  UPDATE public.early_access_subscribers
  SET 
    status = 'invited',
    invited_at = NOW()
  WHERE 
    email = subscriber_email
    AND status = 'waiting';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. Função para migrar subscriber para user
-- ============================================================
CREATE OR REPLACE FUNCTION public.migrate_subscriber_to_user(
  subscriber_email TEXT,
  user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  updated_count INT;
BEGIN
  UPDATE public.early_access_subscribers
  SET 
    status = 'registered',
    registered_at = NOW()
  WHERE 
    email = subscriber_email;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- GRANTS (permissões)
-- ============================================================
GRANT SELECT, INSERT ON public.early_access_subscribers TO anon;
GRANT SELECT, INSERT ON public.early_access_subscribers TO authenticated;
GRANT ALL ON public.early_access_subscribers TO service_role;

GRANT EXECUTE ON FUNCTION public.count_early_access_subscribers() TO anon;
GRANT EXECUTE ON FUNCTION public.count_early_access_subscribers() TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_subscriber_as_invited(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.migrate_subscriber_to_user(TEXT, UUID) TO service_role;

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
-- SELECT * FROM public.early_access_subscribers ORDER BY subscribed_at DESC;
-- SELECT * FROM public.count_early_access_subscribers();
