#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://gocjbfcztorfswlkkjqi.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY2piZmN6dG9yZnN3bGtranFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4NjM1NSwiZXhwIjoyMDc3ODYyMzU1fQ.dKGt8xCd9sxG7yM5gGJKT0C8N0aPzKvvLGTQE0MQHAQ'

const log = {
  info: (m) => console.log(`\x1b[34m📋 ${m}\x1b[0m`),
  success: (m) => console.log(`\x1b[32m✅ ${m}\x1b[0m`),
  warn: (m) => console.log(`\x1b[33m⚠️  ${m}\x1b[0m`),
  error: (m) => console.log(`\x1b[31m❌ ${m}\x1b[0m`)
}

async function run() {
  console.log('\n🛒 DUA CREATIVE MARKET - Setup Simplificado')
  console.log('==========================================\n')

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  })

  // 1. Criar tabela mercado_itens
  log.info('Criando tabela mercado_itens...')
  try {
    await supabase.rpc('exec', {
      query: `
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
          criado_em TIMESTAMPTZ DEFAULT NOW(),
          atualizado_em TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_mercado_itens_user ON mercado_itens(user_id);
        CREATE INDEX IF NOT EXISTS idx_mercado_itens_categoria ON mercado_itens(categoria);
        CREATE INDEX IF NOT EXISTS idx_mercado_itens_ativo ON mercado_itens(ativo);
      `
    })
    log.success('Tabela mercado_itens criada!')
  } catch (err) {
    if (err.message?.includes('already exists')) {
      log.warn('Tabela mercado_itens já existe')
    } else {
      log.error(`Erro: ${err.message}`)
    }
  }

  // 2. Criar tabela mercado_compras
  log.info('Criando tabela mercado_compras...')
  try {
    await supabase.rpc('exec', {
      query: `
        CREATE TABLE IF NOT EXISTS mercado_compras (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          item_id UUID NOT NULL REFERENCES mercado_itens(id) ON DELETE CASCADE,
          comprador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          vendedor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          preco_pago INTEGER NOT NULL,
          download_url TEXT NOT NULL,
          comprado_em TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(item_id, comprador_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_mercado_compras_comprador ON mercado_compras(comprador_id);
        CREATE INDEX IF NOT EXISTS idx_mercado_compras_vendedor ON mercado_compras(vendedor_id);
      `
    })
    log.success('Tabela mercado_compras criada!')
  } catch (err) {
    if (err.message?.includes('already exists')) {
      log.warn('Tabela mercado_compras já existe')
    } else {
      log.error(`Erro: ${err.message}`)
    }
  }

  // 3. Criar função processar_compra_mercado
  log.info('Criando função processar_compra_mercado...')
  try {
    await supabase.rpc('exec', {
      query: `
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
          
          RETURN json_build_object(
            'sucesso', TRUE,
            'compra_id', v_compra_id,
            'download_url', v_item.ficheiro_url,
            'preco_pago', v_item.preco
          );
        END;
        $$;
      `
    })
    log.success('Função processar_compra_mercado criada!')
  } catch (err) {
    log.warn(`Função: ${err.message}`)
  }

  // 4. Criar função listar_itens_mercado
  log.info('Criando função listar_itens_mercado...')
  try {
    await supabase.rpc('exec', {
      query: `
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
          ficheiro_url TEXT,
          preview_url TEXT,
          downloads INTEGER,
          vendas INTEGER,
          criado_em TIMESTAMPTZ,
          vendedor_id UUID,
          vendedor_nome TEXT,
          vendedor_avatar TEXT
        )
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            mi.id,
            mi.titulo,
            mi.descricao,
            mi.categoria,
            mi.preco,
            mi.ficheiro_url,
            mi.preview_url,
            mi.downloads,
            mi.vendas,
            mi.criado_em,
            u.id AS vendedor_id,
            u.full_name AS vendedor_nome,
            u.avatar_url AS vendedor_avatar
          FROM mercado_itens mi
          JOIN users u ON mi.user_id = u.id
          WHERE mi.ativo = TRUE
            AND (p_categoria IS NULL OR mi.categoria = p_categoria)
          ORDER BY mi.criado_em DESC
          LIMIT p_limite
          OFFSET p_offset;
        END;
        $$;
      `
    })
    log.success('Função listar_itens_mercado criada!')
  } catch (err) {
    log.warn(`Função: ${err.message}`)
  }

  // 5. Ativar RLS
  log.info('Ativando Row Level Security...')
  try {
    await supabase.rpc('exec', {
      query: `
        ALTER TABLE mercado_itens ENABLE ROW LEVEL SECURITY;
        ALTER TABLE mercado_compras ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "mercado_itens_select" ON mercado_itens;
        CREATE POLICY "mercado_itens_select" ON mercado_itens FOR SELECT USING (ativo = TRUE);
        
        DROP POLICY IF EXISTS "mercado_itens_insert" ON mercado_itens;
        CREATE POLICY "mercado_itens_insert" ON mercado_itens FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "mercado_itens_update" ON mercado_itens;
        CREATE POLICY "mercado_itens_update" ON mercado_itens FOR UPDATE USING (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "mercado_itens_delete" ON mercado_itens;
        CREATE POLICY "mercado_itens_delete" ON mercado_itens FOR DELETE USING (auth.uid() = user_id);
        
        DROP POLICY IF EXISTS "mercado_compras_select" ON mercado_compras;
        CREATE POLICY "mercado_compras_select" ON mercado_compras FOR SELECT USING (auth.uid() = comprador_id OR auth.uid() = vendedor_id);
      `
    })
    log.success('RLS ativado!')
  } catch (err) {
    log.warn(`RLS: ${err.message}`)
  }

  // 6. Criar bucket
  log.info('Criando bucket "mercado"...')
  try {
    const { error } = await supabase.storage.createBucket('mercado', { 
      public: true,
      fileSizeLimit: 52428800
    })
    
    if (error && !error.message?.includes('already exists')) {
      throw error
    }
    log.success('Bucket "mercado" pronto!')
  } catch (err) {
    if (err.message?.includes('already exists')) {
      log.warn('Bucket já existe')
    } else {
      log.error(`Bucket: ${err.message}`)
    }
  }

  // 7. Verificar
  log.info('Verificando instalação...')
  const { data: itens } = await supabase.from('mercado_itens').select('count')
  const { data: compras } = await supabase.from('mercado_compras').select('count')
  
  if (itens) log.success('✓ Tabela mercado_itens acessível')
  if (compras) log.success('✓ Tabela mercado_compras acessível')

  console.log('\n' + '='.repeat(50))
  log.success('Setup completo!')
  console.log('\n📋 Próximos passos:')
  console.log('1. npm run dev')
  console.log('2. http://localhost:3000/mercado')
  console.log('3. Login + Publicar Conteúdo\n')
}

run().catch(err => {
  console.error('Erro:', err.message)
  process.exit(1)
})
