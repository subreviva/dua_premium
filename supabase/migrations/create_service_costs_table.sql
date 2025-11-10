-- Tabela para configurações de custo de créditos por serviço
CREATE TABLE IF NOT EXISTS service_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(100) UNIQUE NOT NULL,
  service_label VARCHAR(200) NOT NULL,
  service_description TEXT,
  credits_cost INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  icon VARCHAR(50),
  category VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_service_costs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_service_costs_updated_at
  BEFORE UPDATE ON service_costs
  FOR EACH ROW
  EXECUTE FUNCTION update_service_costs_updated_at();

-- Inserir serviços padrão com custos iniciais
-- SISTEMA DE CRÉDITOS - VERSÃO FINAL 4.0
-- Todos os Studios: Music, Design, Video, Image, Chat, Live
INSERT INTO service_costs (service_name, service_label, service_description, credits_cost, icon, category) VALUES
  -- MUSIC STUDIO (6 serviços)
  ('music_generate_v5', 'Gerar Música V5', 'Geração de música com IA (última versão)', 6, 'Music', 'music'),
  ('music_add_instrumental', 'Adicionar Instrumental', 'Adicionar faixa instrumental à música', 6, 'Music', 'music'),
  ('music_add_vocals', 'Adicionar Vocais', 'Adicionar vocais à música', 6, 'Mic', 'music'),
  ('music_separate_vocals', 'Separar Vocais', 'Separar vocais e instrumental', 5, 'SplitSquare', 'music'),
  ('music_convert_wav', 'Converter para WAV', 'Converter música para formato WAV', 1, 'FileAudio', 'music'),
  ('music_generate_midi', 'Gerar MIDI', 'Converter música para arquivo MIDI', 1, 'Piano', 'music'),
  
  -- DESIGN STUDIO (16 serviços)
  ('generate_image', 'Gerar Imagem', 'Criar imagem com IA', 4, 'Image', 'design'),
  ('generate_logo', 'Gerar Logo', 'Criar logo profissional', 6, 'Shapes', 'design'),
  ('generate_icon', 'Gerar Ícone', 'Criar ícone personalizado', 4, 'Star', 'design'),
  ('generate_pattern', 'Gerar Padrão', 'Criar padrão decorativo', 4, 'Grid', 'design'),
  ('generate_svg', 'Gerar SVG', 'Criar gráfico vetorial SVG', 6, 'PenTool', 'design'),
  ('edit_image', 'Editar Imagem', 'Editar imagem com IA', 5, 'Edit', 'design'),
  ('remove_background', 'Remover Fundo', 'Remover fundo de imagem', 5, 'Layers', 'design'),
  ('upscale_image', 'Aumentar Resolução', 'Upscale de imagem com IA', 6, 'Maximize', 'design'),
  ('product_mockup', 'Mockup de Produto', 'Criar mockups de produtos', 5, 'Package', 'design'),
  ('generate_variations', 'Gerar Variações', 'Criar variações de design', 8, 'Copy', 'design'),
  ('analyze_image', 'Analisar Imagem', 'Análise de imagem com IA', 2, 'Eye', 'design'),
  ('extract_colors', 'Extrair Cores', 'Extrair paleta de cores', 2, 'Palette', 'design'),
  ('design_trends', 'Tendências Design', 'Sugestões de tendências', 3, 'TrendingUp', 'design'),
  ('design_assistant', 'Assistente Design', 'Chat assistente de design', 1, 'MessageCircle', 'design'),
  ('export_png', 'Exportar PNG', 'Exportar como PNG (GRÁTIS)', 0, 'Download', 'design'),
  ('export_svg', 'Exportar SVG', 'Exportar como SVG (GRÁTIS)', 0, 'Download', 'design'),
  
  -- VIDEO STUDIO (11 serviços)
  ('video_gen4_5s', 'Vídeo Gen4 5s', 'Gerar vídeo 5 segundos (Gen-4 Turbo)', 20, 'Video', 'video'),
  ('video_gen4_10s', 'Vídeo Gen4 10s', 'Gerar vídeo 10 segundos (Gen-4 Turbo)', 40, 'Video', 'video'),
  ('video_gen3a_5s', 'Vídeo Gen3a 5s', 'Gerar vídeo 5 segundos (Gen-3 Alpha Turbo)', 18, 'Film', 'video'),
  ('video_gen3a_10s', 'Vídeo Gen3a 10s', 'Gerar vídeo 10 segundos (Gen-3 Alpha Turbo)', 35, 'Film', 'video'),
  ('video_image_to_video_5s', 'Imagem → Vídeo 5s', 'Converter imagem em vídeo 5 segundos', 18, 'ImagePlay', 'video'),
  ('video_image_to_video_10s', 'Imagem → Vídeo 10s', 'Converter imagem em vídeo 10 segundos', 35, 'ImagePlay', 'video'),
  ('video_to_video', 'Vídeo → Vídeo', 'Transformar/editar vídeo existente', 50, 'Clapperboard', 'video'),
  ('video_act_two', 'Act-Two Performance', 'Animar personagem com áudio', 35, 'Drama', 'video'),
  ('video_upscale_5s', 'Upscale Vídeo 5s', 'Melhorar resolução vídeo 5s', 10, 'Maximize2', 'video'),
  ('video_upscale_10s', 'Upscale Vídeo 10s', 'Melhorar resolução vídeo 10s', 20, 'Maximize2', 'video'),
  ('video_gen4_aleph_5s', 'Vídeo Aleph 5s', 'Vídeo premium Aleph 5s', 60, 'Zap', 'video'),
  
  -- IMAGE STUDIO (4 serviços)
  ('image_fast', 'Imagen Fast 1K', 'Rápida e econômica (~2-3s)', 15, 'Zap', 'image'),
  ('image_standard', 'Imagen Standard 2K', 'Perfeita para web (~5-8s)', 25, 'Image', 'image'),
  ('image_ultra', 'Imagen Ultra 4K', 'Máxima qualidade (~10-15s)', 35, 'Sparkles', 'image'),
  ('image_3', 'Imagen 3', 'Econômico (~5s)', 10, 'ImageIcon', 'image'),
  
  -- CHAT STUDIO (2 serviços)
  ('chat_basic', 'Chat Básico', 'Chat IA básico (GRÁTIS 50/dia)', 0, 'MessageSquare', 'chat'),
  ('chat_advanced', 'Chat Avançado', 'Chat IA avançado com mais contexto', 1, 'MessagesSquare', 'chat'),
  
  -- LIVE STUDIO (2 serviços)
  ('live_audio_1min', 'Áudio Live 1min', 'Processamento áudio ao vivo 1 minuto', 3, 'Radio', 'live'),
  ('live_audio_5min', 'Áudio Live 5min', 'Processamento áudio ao vivo 5 minutos', 13, 'Radio', 'live')
ON CONFLICT (service_name) DO NOTHING;

-- RLS Policies
ALTER TABLE service_costs ENABLE ROW LEVEL SECURITY;

-- Admin pode ler e modificar
CREATE POLICY "Admin can view service costs"
  ON service_costs FOR SELECT
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@dua.pt',
      'subreviva@gmail.com',
      'dev@dua.pt',
      'dev@dua.com'
    )
  );

CREATE POLICY "Admin can update service costs"
  ON service_costs FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@dua.pt',
      'subreviva@gmail.com',
      'dev@dua.pt',
      'dev@dua.com'
    )
  );

CREATE POLICY "Admin can insert service costs"
  ON service_costs FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      'admin@dua.pt',
      'subreviva@gmail.com',
      'dev@dua.pt',
      'dev@dua.com'
    )
  );

-- Usuários autenticados podem apenas ler (para consultar custos antes de usar serviço)
CREATE POLICY "Authenticated users can view service costs"
  ON service_costs FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- Função RPC para obter custo de um serviço específico
CREATE OR REPLACE FUNCTION get_service_cost(p_service_name VARCHAR)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cost INTEGER;
BEGIN
  SELECT credits_cost INTO v_cost
  FROM service_costs
  WHERE service_name = p_service_name
    AND is_active = TRUE;
  
  -- Se não encontrar, retorna custo padrão de 10
  RETURN COALESCE(v_cost, 10);
END;
$$;

-- Função RPC para atualizar custo de serviço (apenas admin)
CREATE OR REPLACE FUNCTION update_service_cost(
  p_service_name VARCHAR,
  p_new_cost INTEGER,
  p_admin_email VARCHAR DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_is_admin BOOLEAN;
  v_old_cost INTEGER;
BEGIN
  -- Verificar se é admin
  SELECT id INTO v_user_id
  FROM users
  WHERE email = COALESCE(p_admin_email, auth.jwt() ->> 'email');
  
  v_is_admin := COALESCE(p_admin_email, auth.jwt() ->> 'email') IN (
    'admin@dua.pt',
    'subreviva@gmail.com',
    'dev@dua.pt',
    'dev@dua.com'
  );
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem alterar custos';
  END IF;
  
  -- Validar custo
  IF p_new_cost < 0 THEN
    RAISE EXCEPTION 'Custo não pode ser negativo';
  END IF;
  
  IF p_new_cost > 1000 THEN
    RAISE EXCEPTION 'Custo muito alto (máximo 1000 créditos)';
  END IF;
  
  -- Obter custo antigo
  SELECT credits_cost INTO v_old_cost
  FROM service_costs
  WHERE service_name = p_service_name;
  
  -- Atualizar
  UPDATE service_costs
  SET 
    credits_cost = p_new_cost,
    updated_by = v_user_id,
    updated_at = NOW()
  WHERE service_name = p_service_name;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Serviço não encontrado: %', p_service_name;
  END IF;
  
  -- Registrar em log de transações (opcional - para auditoria)
  INSERT INTO duaia_transactions (
    user_id,
    transaction_type,
    amount,
    balance_after,
    description,
    metadata,
    status
  ) VALUES (
    v_user_id,
    'system',
    0,
    0,
    format('Admin alterou custo de %s: %s → %s créditos', p_service_name, v_old_cost, p_new_cost),
    jsonb_build_object(
      'action', 'update_service_cost',
      'service_name', p_service_name,
      'old_cost', v_old_cost,
      'new_cost', p_new_cost,
      'admin_email', COALESCE(p_admin_email, auth.jwt() ->> 'email')
    ),
    'completed'
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'service_name', p_service_name,
    'old_cost', v_old_cost,
    'new_cost', p_new_cost,
    'updated_at', NOW()
  );
END;
$$;

-- Índices para performance
CREATE INDEX idx_service_costs_service_name ON service_costs(service_name);
CREATE INDEX idx_service_costs_is_active ON service_costs(is_active);
CREATE INDEX idx_service_costs_category ON service_costs(category);

COMMENT ON TABLE service_costs IS 'Configuração de custos em créditos por serviço';
COMMENT ON COLUMN service_costs.service_name IS 'Nome único do serviço (usado no código)';
COMMENT ON COLUMN service_costs.service_label IS 'Nome amigável exibido na UI';
COMMENT ON COLUMN service_costs.credits_cost IS 'Quantidade de créditos cobrados por uso';
COMMENT ON COLUMN service_costs.is_active IS 'Se o serviço está ativo';
