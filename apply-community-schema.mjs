#!/usr/bin/env node

/**
 * Script para aplicar o schema da comunidade no Supabase
 * Executa: node apply-community-schema.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✅' : '❌');
  process.exit(1);
}

// Criar cliente Supabase com Service Role Key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applySQLSchema() {
  console.log('🚀 Aplicando schema da comunidade...\n');

  try {
    // Ler arquivo SQL
    const sqlPath = join(__dirname, 'supabase-community-schema.sql');
    const sql = readFileSync(sqlPath, 'utf-8');

    console.log('📄 SQL carregado:', sqlPath);
    console.log('📏 Tamanho:', sql.length, 'caracteres\n');

    // Nota: A biblioteca @supabase/supabase-js não tem método direto para executar SQL raw
    // Você precisa executar isso manualmente no Supabase SQL Editor
    
    console.log('⚠️  ATENÇÃO: Execute o SQL manualmente');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('1. Abra o Supabase Dashboard:');
    console.log(`   ${SUPABASE_URL.replace('.supabase.co', '.supabase.co')}\n`);
    console.log('2. Vá para "SQL Editor"');
    console.log('3. Clique em "New Query"');
    console.log('4. Cole o conteúdo de: supabase-community-schema.sql');
    console.log('5. Clique em "Run" (Ctrl+Enter)\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Verificar se as tabelas já existem
    console.log('🔍 Verificando tabelas existentes...\n');

    const { data: posts, error: postsError } = await supabase
      .from('community_posts')
      .select('count', { count: 'exact', head: true });

    const { data: likes, error: likesError } = await supabase
      .from('community_likes')
      .select('count', { count: 'exact', head: true });

    const { data: comments, error: commentsError } = await supabase
      .from('community_comments')
      .select('count', { count: 'exact', head: true });

    if (!postsError) {
      console.log('✅ community_posts existe');
    } else {
      console.log('❌ community_posts não encontrada:', postsError.message);
    }

    if (!likesError) {
      console.log('✅ community_likes existe');
    } else {
      console.log('❌ community_likes não encontrada:', likesError.message);
    }

    if (!commentsError) {
      console.log('✅ community_comments existe');
    } else {
      console.log('❌ community_comments não encontrada:', commentsError.message);
    }

    if (!postsError && !likesError && !commentsError) {
      console.log('\n🎉 Schema da comunidade já está aplicado!');
      console.log('✅ Todas as tabelas estão prontas para uso\n');
    } else {
      console.log('\n⚠️  Algumas tabelas precisam ser criadas');
      console.log('   Execute o SQL manualmente no Supabase SQL Editor\n');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

applySQLSchema();
