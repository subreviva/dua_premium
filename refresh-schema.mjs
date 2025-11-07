#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gocjbfcztorfswlkkjqi.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY2piZmN6dG9yZnN3bGtranFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4NjM1NSwiZXhwIjoyMDc3ODYyMzU1fQ.dKGt8xCd9sxG7yM5gGJKT0C8N0aPzKvvLGTQE0MQHAQ'

async function refresh() {
  console.log('🔄 Forçando refresh do schema cache...\n')
  
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  })

  // Método 1: NOTIFY para recarregar schema
  try {
    await supabase.rpc('exec', {
      query: `NOTIFY pgrst, 'reload schema';`
    })
    console.log('✅ NOTIFY enviado')
  } catch (err) {
    console.log('⚠️ NOTIFY:', err.message)
  }

  // Método 2: Recriar as tabelas forçando
  try {
    await supabase.rpc('exec', {
      query: `
        -- Dropar e recriar para forçar refresh
        DROP TABLE IF EXISTS mercado_compras CASCADE;
        DROP TABLE IF NOT EXISTS mercado_itens CASCADE;
        
        -- Recriar mercado_itens
        CREATE TABLE mercado_itens (
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
          criado_em TIMESTAMPTZ DEFAULT NOW(),
          atualizado_em TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Recriar mercado_compras
        CREATE TABLE mercado_compras (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          item_id UUID NOT NULL REFERENCES mercado_itens(id) ON DELETE CASCADE,
          comprador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          vendedor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          preco_pago INTEGER NOT NULL,
          download_url TEXT NOT NULL,
          comprado_em TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(item_id, comprador_id)
        );
        
        -- Indexes
        CREATE INDEX idx_mercado_itens_user ON mercado_itens(user_id);
        CREATE INDEX idx_mercado_itens_categoria ON mercado_itens(categoria);
        CREATE INDEX idx_mercado_itens_ativo ON mercado_itens(ativo);
        CREATE INDEX idx_mercado_compras_comprador ON mercado_compras(comprador_id);
        CREATE INDEX idx_mercado_compras_vendedor ON mercado_compras(vendedor_id);
        
        -- RLS
        ALTER TABLE mercado_itens ENABLE ROW LEVEL SECURITY;
        ALTER TABLE mercado_compras ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "mercado_itens_select" ON mercado_itens FOR SELECT USING (ativo = TRUE);
        CREATE POLICY "mercado_itens_insert" ON mercado_itens FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "mercado_itens_update" ON mercado_itens FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "mercado_itens_delete" ON mercado_itens FOR DELETE USING (auth.uid() = user_id);
        CREATE POLICY "mercado_compras_select" ON mercado_compras FOR SELECT USING (auth.uid() = comprador_id OR auth.uid() = vendedor_id);
      `
    })
    console.log('✅ Tabelas recriadas')
  } catch (err) {
    console.log('⚠️ Recriar:', err.message)
  }

  // Método 3: Recriar funções
  try {
    await supabase.rpc('exec', {
      query: `
        CREATE OR REPLACE FUNCTION processar_compra_mercado(p_item_id UUID, p_comprador_id UUID)
        RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
        DECLARE
          v_item mercado_itens%ROWTYPE;
          v_comprador users%ROWTYPE;
          v_compra_id UUID;
        BEGIN
          SELECT * INTO v_item FROM mercado_itens WHERE id = p_item_id AND ativo = TRUE;
          IF NOT FOUND THEN
            RETURN json_build_object('sucesso', FALSE, 'erro', 'Item não encontrado');
          END IF;
          IF v_item.user_id = p_comprador_id THEN
            RETURN json_build_object('sucesso', FALSE, 'erro', 'Não pode comprar o próprio item');
          END IF;
          IF EXISTS (SELECT 1 FROM mercado_compras WHERE item_id = p_item_id AND comprador_id = p_comprador_id) THEN
            RETURN json_build_object('sucesso', FALSE, 'erro', 'Item já foi comprado');
          END IF;
          SELECT * INTO v_comprador FROM users WHERE id = p_comprador_id;
          IF v_comprador.dua_coins < v_item.preco THEN
            RETURN json_build_object('sucesso', FALSE, 'erro', 'Créditos insuficientes');
          END IF;
          UPDATE users SET dua_coins = dua_coins - v_item.preco WHERE id = p_comprador_id;
          UPDATE users SET dua_coins = dua_coins + v_item.preco WHERE id = v_item.user_id;
          INSERT INTO mercado_compras (item_id, comprador_id, vendedor_id, preco_pago, download_url)
          VALUES (p_item_id, p_comprador_id, v_item.user_id, v_item.preco, v_item.ficheiro_url)
          RETURNING id INTO v_compra_id;
          UPDATE mercado_itens SET downloads = downloads + 1, vendas = vendas + 1 WHERE id = p_item_id;
          RETURN json_build_object('sucesso', TRUE, 'compra_id', v_compra_id, 'download_url', v_item.ficheiro_url, 'preco_pago', v_item.preco);
        END;
        $$;
        
        CREATE OR REPLACE FUNCTION listar_itens_mercado(p_categoria TEXT DEFAULT NULL, p_limite INTEGER DEFAULT 50, p_offset INTEGER DEFAULT 0)
        RETURNS TABLE (id UUID, titulo TEXT, descricao TEXT, categoria TEXT, preco INTEGER, ficheiro_url TEXT, preview_url TEXT, downloads INTEGER, vendas INTEGER, criado_em TIMESTAMPTZ, vendedor_id UUID, vendedor_nome TEXT, vendedor_avatar TEXT)
        LANGUAGE plpgsql AS $$
        BEGIN
          RETURN QUERY
          SELECT mi.id, mi.titulo, mi.descricao, mi.categoria, mi.preco, mi.ficheiro_url, mi.preview_url, mi.downloads, mi.vendas, mi.criado_em,
            u.id AS vendedor_id, u.full_name AS vendedor_nome, u.avatar_url AS vendedor_avatar
          FROM mercado_itens mi
          JOIN users u ON mi.user_id = u.id
          WHERE mi.ativo = TRUE AND (p_categoria IS NULL OR mi.categoria = p_categoria)
          ORDER BY mi.criado_em DESC
          LIMIT p_limite OFFSET p_offset;
        END;
        $$;
      `
    })
    console.log('✅ Funções recriadas')
  } catch (err) {
    console.log('⚠️ Funções:', err.message)
  }

  console.log('\n✅ Refresh completo! Aguarde 5 segundos e teste novamente.\n')
}

refresh().catch(console.error)
