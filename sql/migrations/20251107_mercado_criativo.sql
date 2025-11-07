-- =====================================================
-- DUA CREATIVE MARKET - Database Schema
-- =====================================================
-- Criado: 2025-11-07
-- Descrição: Sistema de marketplace para conteúdos digitais
-- =====================================================

-- 1. Criar tabela de itens do mercado
CREATE TABLE IF NOT EXISTS mercado_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL CHECK (categoria IN ('beat', 'imagem', 'quadro', 'video', 'arte', 'capa', 'template', 'outro')),
  preco INTEGER NOT NULL CHECK (preco >= 0),
  ficheiro_url TEXT NOT NULL,
  preview_url TEXT,
  downloads INTEGER DEFAULT 0,
  vendas INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de compras/transações
CREATE TABLE IF NOT EXISTS mercado_compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES mercado_itens(id) ON DELETE CASCADE,
  comprador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendedor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preco_pago INTEGER NOT NULL,
  download_url TEXT NOT NULL,
  comprado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(item_id, comprador_id) -- Prevenir compras duplicadas
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_mercado_itens_user_id ON mercado_itens(user_id);
CREATE INDEX IF NOT EXISTS idx_mercado_itens_categoria ON mercado_itens(categoria);
CREATE INDEX IF NOT EXISTS idx_mercado_itens_criado_em ON mercado_itens(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_mercado_itens_ativo ON mercado_itens(ativo) WHERE ativo = TRUE;
CREATE INDEX IF NOT EXISTS idx_mercado_compras_comprador ON mercado_compras(comprador_id);
CREATE INDEX IF NOT EXISTS idx_mercado_compras_vendedor ON mercado_compras(vendedor_id);

-- 4. Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_mercado_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar trigger para atualizar timestamp
DROP TRIGGER IF EXISTS mercado_itens_updated_at ON mercado_itens;
CREATE TRIGGER mercado_itens_updated_at
  BEFORE UPDATE ON mercado_itens
  FOR EACH ROW
  EXECUTE FUNCTION update_mercado_updated_at();

-- 6. Row Level Security (RLS)
ALTER TABLE mercado_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercado_compras ENABLE ROW LEVEL SECURITY;

-- Políticas para mercado_itens
DROP POLICY IF EXISTS "Itens públicos são visíveis para todos" ON mercado_itens;
CREATE POLICY "Itens públicos são visíveis para todos"
  ON mercado_itens FOR SELECT
  USING (ativo = TRUE);

DROP POLICY IF EXISTS "Utilizadores podem criar itens" ON mercado_itens;
CREATE POLICY "Utilizadores podem criar itens"
  ON mercado_itens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Criadores podem editar seus itens" ON mercado_itens;
CREATE POLICY "Criadores podem editar seus itens"
  ON mercado_itens FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Criadores podem deletar seus itens" ON mercado_itens;
CREATE POLICY "Criadores podem deletar seus itens"
  ON mercado_itens FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para mercado_compras
DROP POLICY IF EXISTS "Utilizadores veem suas compras" ON mercado_compras;
CREATE POLICY "Utilizadores veem suas compras"
  ON mercado_compras FOR SELECT
  USING (auth.uid() = comprador_id OR auth.uid() = vendedor_id);

DROP POLICY IF EXISTS "Sistema pode criar compras" ON mercado_compras;
CREATE POLICY "Sistema pode criar compras"
  ON mercado_compras FOR INSERT
  WITH CHECK (auth.uid() = comprador_id);

-- 7. Função para processar compra
CREATE OR REPLACE FUNCTION processar_compra_mercado(
  p_item_id UUID,
  p_comprador_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item mercado_itens%ROWTYPE;
  v_comprador users%ROWTYPE;
  v_compra_id UUID;
  v_resultado JSON;
BEGIN
  -- Verificar se item existe e está ativo
  SELECT * INTO v_item FROM mercado_itens WHERE id = p_item_id AND ativo = TRUE;
  IF NOT FOUND THEN
    RETURN json_build_object(
      'sucesso', FALSE,
      'erro', 'Item não encontrado ou inativo'
    );
  END IF;

  -- Verificar se não é o próprio vendedor
  IF v_item.user_id = p_comprador_id THEN
    RETURN json_build_object(
      'sucesso', FALSE,
      'erro', 'Não pode comprar o seu próprio item'
    );
  END IF;

  -- Verificar se já comprou
  IF EXISTS (SELECT 1 FROM mercado_compras WHERE item_id = p_item_id AND comprador_id = p_comprador_id) THEN
    RETURN json_build_object(
      'sucesso', FALSE,
      'erro', 'Já comprou este item'
    );
  END IF;

  -- Buscar dados do comprador
  SELECT * INTO v_comprador FROM users WHERE id = p_comprador_id;
  IF NOT FOUND THEN
    RETURN json_build_object(
      'sucesso', FALSE,
      'erro', 'Comprador não encontrado'
    );
  END IF;

  -- Verificar créditos
  IF v_comprador.credits < v_item.preco THEN
    RETURN json_build_object(
      'sucesso', FALSE,
      'erro', 'Créditos insuficientes',
      'creditos_atuais', v_comprador.credits,
      'preco_item', v_item.preco
    );
  END IF;

  -- Debitar créditos do comprador
  UPDATE users 
  SET credits = credits - v_item.preco 
  WHERE id = p_comprador_id;

  -- Creditar vendedor
  UPDATE users 
  SET credits = credits + v_item.preco 
  WHERE id = v_item.user_id;

  -- Criar registro de compra
  INSERT INTO mercado_compras (item_id, comprador_id, vendedor_id, preco_pago, download_url)
  VALUES (p_item_id, p_comprador_id, v_item.user_id, v_item.preco, v_item.ficheiro_url)
  RETURNING id INTO v_compra_id;

  -- Atualizar estatísticas do item
  UPDATE mercado_itens 
  SET vendas = vendas + 1, downloads = downloads + 1
  WHERE id = p_item_id;

  -- Retornar sucesso
  RETURN json_build_object(
    'sucesso', TRUE,
    'compra_id', v_compra_id,
    'download_url', v_item.ficheiro_url,
    'preco_pago', v_item.preco
  );
END;
$$;

-- 8. Função para listar itens do mercado com informações do vendedor
CREATE OR REPLACE FUNCTION listar_itens_mercado(
  p_categoria TEXT DEFAULT NULL,
  p_limite INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  titulo TEXT,
  descricao TEXT,
  categoria TEXT,
  preco INTEGER,
  preview_url TEXT,
  downloads INTEGER,
  vendas INTEGER,
  criado_em TIMESTAMP WITH TIME ZONE,
  vendedor_nome TEXT,
  vendedor_avatar TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mi.id,
    mi.titulo,
    mi.descricao,
    mi.categoria,
    mi.preco,
    mi.preview_url,
    mi.downloads,
    mi.vendas,
    mi.criado_em,
    u.full_name as vendedor_nome,
    u.avatar_url as vendedor_avatar
  FROM mercado_itens mi
  JOIN users u ON mi.user_id = u.id
  WHERE mi.ativo = TRUE
    AND (p_categoria IS NULL OR mi.categoria = p_categoria)
  ORDER BY mi.criado_em DESC
  LIMIT p_limite
  OFFSET p_offset;
END;
$$;

-- 9. Comentários para documentação
COMMENT ON TABLE mercado_itens IS 'Tabela de itens publicados no DUA Creative Market';
COMMENT ON TABLE mercado_compras IS 'Tabela de transações/compras realizadas no mercado';
COMMENT ON FUNCTION processar_compra_mercado IS 'Processa uma compra verificando créditos e transferindo valores';
COMMENT ON FUNCTION listar_itens_mercado IS 'Lista itens do mercado com informações do vendedor';

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================
