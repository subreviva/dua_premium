-- Migration: Create invite_codes table
-- Description: Tabela para códigos de convite tipo Sora early access
-- Author: DUA System
-- Date: 2025-01-05

-- ============================================
-- 1. CREATE TABLE: invite_codes
-- ============================================

CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  credits INTEGER DEFAULT 30 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Constraints
  CONSTRAINT code_length_check CHECK (char_length(code) >= 6),
  CONSTRAINT credits_positive_check CHECK (credits >= 0)
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

-- Index para buscas rápidas por código
CREATE INDEX IF NOT EXISTS idx_invite_codes_code 
  ON public.invite_codes(code);

-- Index para filtrar códigos ativos
CREATE INDEX IF NOT EXISTS idx_invite_codes_active 
  ON public.invite_codes(active) 
  WHERE active = true;

-- Index para ver quem usou o código
CREATE INDEX IF NOT EXISTS idx_invite_codes_used_by 
  ON public.invite_codes(used_by) 
  WHERE used_by IS NOT NULL;

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Ativar RLS na tabela
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Qualquer pessoa autenticada pode ler códigos ativos (para validação)
-- Mas NÃO vê quem usou nem códigos inativos
CREATE POLICY "Authenticated users can read active codes"
  ON public.invite_codes
  FOR SELECT
  TO authenticated
  USING (active = true);

-- Policy: Apenas service_role pode inserir/atualizar códigos
-- (via API route com service key ou CLI)
CREATE POLICY "Service role can manage all codes"
  ON public.invite_codes
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 4. COMMENTS (Documentação)
-- ============================================

COMMENT ON TABLE public.invite_codes IS 
  'Códigos de convite para acesso early access tipo Sora/Suno';

COMMENT ON COLUMN public.invite_codes.code IS 
  'Código único de convite (min 6 caracteres)';

COMMENT ON COLUMN public.invite_codes.active IS 
  'Se false, código já foi usado ou desativado';

COMMENT ON COLUMN public.invite_codes.used_by IS 
  'UUID do user que usou este código (null se não usado)';

COMMENT ON COLUMN public.invite_codes.credits IS 
  'Quantidade de créditos que este código concede';
