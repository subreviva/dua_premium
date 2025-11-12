-- ═══════════════════════════════════════════════════════════════════════════
-- 🎵 ADICIONAR SERVIÇOS DE MÚSICA FALTANTES
-- ═══════════════════════════════════════════════════════════════════════════
-- 
-- Adiciona todos os modelos de geração de música e serviços de stems
-- 
-- NOVOS SERVIÇOS:
-- - music_generate_v3_5: Modelo V3.5 (6 créditos)
-- - music_generate_v4: Modelo V4 (6 créditos)
-- - music_generate_v4_5: Modelo V4.5 (6 créditos)
-- - music_generate_v4_5_plus: Modelo V4.5 Plus (6 créditos)
-- - music_extend: Estender música (6 créditos)
-- - music_stems_2: Separação 2-stem (vocal/instrumental) (5 créditos)
-- - music_stems_12: Separação 12-stem (completa) (8 créditos)
-- 
-- @created 2025-11-12
-- @author DUA IA Team
-- ═══════════════════════════════════════════════════════════════════════════

-- Inserir novos serviços de música
INSERT INTO service_costs (service_name, service_label, service_description, credits_cost, icon, category) VALUES
  -- MODELOS DE GERAÇÃO
  ('music_generate_v3_5', 'Gerar Música V3.5', 'Geração de música com modelo V3.5', 6, 'Music', 'music'),
  ('music_generate_v4', 'Gerar Música V4', 'Geração de música com modelo V4', 6, 'Music', 'music'),
  ('music_generate_v4_5', 'Gerar Música V4.5', 'Geração de música com modelo V4.5', 6, 'Music', 'music'),
  ('music_generate_v4_5_plus', 'Gerar Música V4.5 Plus', 'Geração de música com modelo V4.5 Plus', 6, 'Music', 'music'),
  
  -- EXTEND
  ('music_extend', 'Estender Música', 'Estender duração da música existente', 6, 'ArrowRightCircle', 'music'),
  
  -- STEMS SEPARATION
  ('music_stems_2', 'Separar Stems (2-stem)', 'Separação básica: vocal + instrumental', 5, 'SplitSquare', 'music'),
  ('music_stems_12', 'Separar Stems (12-stem)', 'Separação completa: 12 faixas individuais', 8, 'Layers', 'music')
ON CONFLICT (service_name) DO UPDATE SET
  service_label = EXCLUDED.service_label,
  service_description = EXCLUDED.service_description,
  credits_cost = EXCLUDED.credits_cost,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  updated_at = NOW();

-- Comentários explicativos
COMMENT ON TABLE service_costs IS 'Custos de créditos para cada serviço da plataforma DUA IA';

-- Verificar inserção
SELECT 
  service_name,
  service_label,
  credits_cost,
  category
FROM service_costs
WHERE category = 'music'
ORDER BY credits_cost DESC, service_name;
