
-- Criar tabela invite_codes
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  CONSTRAINT code_length_check CHECK (char_length(code) >= 6)
);

-- Index para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_active ON public.invite_codes(active);

-- RLS Policies
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Qualquer um pode ler códigos ativos
CREATE POLICY "Anyone can read active codes"
  ON public.invite_codes
  FOR SELECT
  USING (active = true);

-- Policy: Service role pode fazer tudo
CREATE POLICY "Service role can do everything"
  ON public.invite_codes
  FOR ALL
  USING (auth.role() = 'service_role');
