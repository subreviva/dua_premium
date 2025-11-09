-- ═══════════════════════════════════════════════════════════════
-- INSERÇÃO DOS 170 CÓDIGOS DE ACESSO DUA
-- ═══════════════════════════════════════════════════════════════
-- Executa: Supabase Dashboard > SQL Editor > New Query > Colar > Run
-- ═══════════════════════════════════════════════════════════════

-- 1. Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  CONSTRAINT code_length_check CHECK (char_length(code) >= 6)
);

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_active ON public.invite_codes(active);

-- 3. Ativar RLS
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- 4. Remover policies antigas se existirem
DROP POLICY IF EXISTS "Anyone can read active codes" ON public.invite_codes;
DROP POLICY IF EXISTS "Service role can do everything" ON public.invite_codes;

-- 5. Criar policies corretas
CREATE POLICY "Anyone can read active codes"
  ON public.invite_codes
  FOR SELECT
  USING (active = true);

CREATE POLICY "Service role can do everything"
  ON public.invite_codes
  FOR ALL
  USING (auth.role() = 'service_role');

-- 6. Limpar códigos antigos (OPCIONAL - comentar se quiser manter)
-- DELETE FROM public.invite_codes;

-- 7. INSERIR OS 170 CÓDIGOS DE ACESSO DUA
INSERT INTO public.invite_codes (code, active, created_at) VALUES
('DUA-03BN-9QT', true, now()),
('DUA-044P-OYM', true, now()),
('DUA-09P2-GDD', true, now()),
('DUA-11SF-3GX', true, now()),
('DUA-11UF-1ZR', true, now()),
('DUA-17OL-JNL', true, now()),
('DUA-17Q2-DCZ', true, now()),
('DUA-1AG9-T4T', true, now()),
('DUA-1F71-A68', true, now()),
('DUA-1KVM-WND', true, now()),
('DUA-1WG9-7U7', true, now()),
('DUA-2OZG-PSG', true, now()),
('DUA-2PH0-G3I', true, now()),
('DUA-2TEJ-SK9', true, now()),
('DUA-352J-L4R', true, now()),
('DUA-3CTK-MVZ', true, now()),
('DUA-3E3Z-CR1', true, now()),
('DUA-3FUG-4QE', true, now()),
('DUA-3UKV-FA8', true, now()),
('DUA-44MD-4VD', true, now()),
('DUA-4ASV-JAN', true, now()),
('DUA-4L9D-PR5', true, now()),
('DUA-578K-5QX', true, now()),
('DUA-58FX-ZAP', true, now()),
('DUA-595N-EWJ', true, now()),
('DUA-5DG2-MHJ', true, now()),
('DUA-5GDU-GU4', true, now()),
('DUA-5HX2-OTO', true, now()),
('DUA-5ME0-1UZ', true, now()),
('DUA-5MEO-FFQ', true, now()),
('DUA-5T39-ON3', true, now()),
('DUA-6AAL-KAW', true, now()),
('DUA-6FQ8-0ZR', true, now()),
('DUA-6IXL-JID', true, now()),
('DUA-6SCP-2AR', true, now()),
('DUA-6XTN-9NK', true, now()),
('DUA-6Z1U-9PT', true, now()),
('DUA-7EUY-DZR', true, now()),
('DUA-7F5Q-H6A', true, now()),
('DUA-7FSW-HQH', true, now()),
('DUA-7N7T-LD7', true, now()),
('DUA-8HC5-7SM', true, now()),
('DUA-8NET-YUG', true, now()),
('DUA-8O80-GKM', true, now()),
('DUA-8T1M-4J5', true, now()),
('DUA-9P5N-QG0', true, now()),
('DUA-9S9L-D3W', true, now()),
('DUA-A77V-408', true, now()),
('DUA-A7IE-4G4', true, now()),
('DUA-B5KG-MDT', true, now()),
('DUA-B6OT-18R', true, now()),
('DUA-B7TZ-SRS', true, now()),
('DUA-BISN-J7T', true, now()),
('DUA-CJBX-MVP', true, now()),
('DUA-COPC-B57', true, now()),
('DUA-D164-YBU', true, now()),
('DUA-D5PU-4O2', true, now()),
('DUA-D7ST-NZR', true, now()),
('DUA-DC94-L6M', true, now()),
('DUA-DPOE-8GD', true, now()),
('DUA-DS9H-THR', true, now()),
('DUA-DW7K-F3R', true, now()),
('DUA-DWE8-MUM', true, now()),
('DUA-EZS1-2WZ', true, now()),
('DUA-F1WZ-QN2', true, now()),
('DUA-FS8I-EZT', true, now()),
('DUA-FUG1-XRG', true, now()),
('DUA-G7WJ-FGS', true, now()),
('DUA-GFYE-A04', true, now()),
('DUA-GHVM-R78', true, now()),
('DUA-GKD7-2BR', true, now()),
('DUA-GUFZ-0TT', true, now()),
('DUA-I3BP-FJC', true, now()),
('DUA-ICJH-5CO', true, now()),
('DUA-IFAL-T5L', true, now()),
('DUA-IVZX-8A8', true, now()),
('DUA-J4G2-VLJ', true, now()),
('DUA-JCZK-A5A', true, now()),
('DUA-JDVL-FTY', true, now()),
('DUA-JL3M-FY3', true, now()),
('DUA-JNK9-22G', true, now()),
('DUA-JXC1-Z12', true, now()),
('DUA-JY3R-IOE', true, now()),
('DUA-K5JE-H8K', true, now()),
('DUA-K89W-NE7', true, now()),
('DUA-KAWU-ZWV', true, now()),
('DUA-KJ6G-UCM', true, now()),
('DUA-KON4-TGW', true, now()),
('DUA-KRTT-BMU', true, now()),
('DUA-L8JQ-UX5', true, now()),
('DUA-LA1J-SEW', true, now()),
('DUA-LG12-ZO3', true, now()),
('DUA-LKDW-PIT', true, now()),
('DUA-LO44-C89', true, now()),
('DUA-LOXY-Q41', true, now()),
('DUA-LWOW-T1Y', true, now()),
('DUA-LZMS-6FO', true, now()),
('DUA-MAA6-QIO', true, now()),
('DUA-MDDY-PIW', true, now()),
('DUA-MGP7-MA5', true, now()),
('DUA-MJ45-2XO', true, now()),
('DUA-MLD2-2UM', true, now()),
('DUA-MNVM-LHW', true, now()),
('DUA-MTVV-V38', true, now()),
('DUA-MU56-Z05', true, now()),
('DUA-MUTS-JSV', true, now()),
('DUA-N0AP-HWB', true, now()),
('DUA-N0WJ-XLG', true, now()),
('DUA-N9SE-4C1', true, now()),
('DUA-NJFT-HH8', true, now()),
('DUA-NL2B-7NK', true, now()),
('DUA-NL8B-MJS', true, now()),
('DUA-NORV-63I', true, now()),
('DUA-NVM9-ESS', true, now()),
('DUA-NVYT-G77', true, now()),
('DUA-NWUS-5SG', true, now()),
('DUA-NYB3-4PF', true, now()),
('DUA-O8T0-M9P', true, now()),
('DUA-OLGI-Q24', true, now()),
('DUA-OO81-UP4', true, now()),
('DUA-PC2X-2NY', true, now()),
('DUA-PJ8I-9BN', true, now()),
('DUA-PKQU-6XP', true, now()),
('DUA-Q32A-SW3', true, now()),
('DUA-Q4Q8-18T', true, now()),
('DUA-QF11-UWY', true, now()),
('DUA-QTQ0-RMJ', true, now()),
('DUA-QULD-ZO8', true, now()),
('DUA-R0R9-FTT', true, now()),
('DUA-R9IP-A9A', true, now()),
('DUA-REKC-XIP', true, now()),
('DUA-RM5K-KIQ', true, now()),
('DUA-RO7R-578', true, now()),
('DUA-RYIN-TAC', true, now()),
('DUA-S1HE-BM9', true, now()),
('DUA-S8VM-GCH', true, now()),
('DUA-SS9O-3N5', true, now()),
('DUA-SZY0-37F', true, now()),
('DUA-T8H5-240', true, now()),
('DUA-TH5G-4OB', true, now()),
('DUA-TMGC-L07', true, now()),
('DUA-TQY2-L5H', true, now()),
('DUA-TWT8-4U1', true, now()),
('DUA-TXPY-5KF', true, now()),
('DUA-TZ3L-03T', true, now()),
('DUA-U450-QT6', true, now()),
('DUA-U5YA-J46', true, now()),
('DUA-UI2I-83Y', true, now()),
('DUA-UNSP-K53', true, now()),
('DUA-US35-PBZ', true, now()),
('DUA-UWTP-HHP', true, now()),
('DUA-V3I6-RPH', true, now()),
('DUA-V58K-LF0', true, now()),
('DUA-VB8L-2RB', true, now()),
('DUA-VCJQ-N9F', true, now()),
('DUA-VDY7-A55', true, now()),
('DUA-VI43-SGG', true, now()),
('DUA-VV41-4D5', true, now()),
('DUA-W0E2-3II', true, now()),
('DUA-WEPL-437', true, now()),
('DUA-WZY0-3MJ', true, now()),
('DUA-XDZN-I5I', true, now()),
('DUA-XE2X-W1E', true, now()),
('DUA-XH7J-B6X', true, now()),
('DUA-XYTJ-M6R', true, now()),
('DUA-YC38-04D', true, now()),
('DUA-ZDSQ-45B', true, now()),
('DUA-ZL1Z-CAF', true, now()),
('DUA-ZLJZ-3TH', true, now()),
('DUA-ZPZW-3QS', true, now())
ON CONFLICT (code) DO NOTHING;

-- 8. Verificar inserção
SELECT 
  COUNT(*) as total_codes,
  COUNT(*) FILTER (WHERE active = true) as active_codes,
  COUNT(*) FILTER (WHERE active = false) as used_codes
FROM public.invite_codes;

-- ═══════════════════════════════════════════════════════════════
-- ✅ SCRIPT COMPLETO
-- ═══════════════════════════════════════════════════════════════
-- Após executar, você verá:
-- • total_codes: 170 (todos os códigos)
-- • active_codes: 170 (disponíveis para uso)
-- • used_codes: 0 (nenhum usado ainda)
-- ═══════════════════════════════════════════════════════════════
