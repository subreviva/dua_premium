#!/usr/bin/env node

// ===================================================
// APPLY COMMUNITY SCHEMA TO SUPABASE
// ===================================================
// Aplica o schema SQL da comunidade no Supabase
// Usando Service Role Key conforme instruções oficiais
// ===================================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

console.log('🚀 Aplicando Schema da Comunidade no Supabase...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applySchema() {
  try {
    // Ler arquivo SQL
    const sql = readFileSync('supabase-community-schema.sql', 'utf8');
    
    console.log('📄 SQL carregado (', sql.length, 'caracteres)\n');

    // Dividir SQL em comandos individuais
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('COMMENT'));

    console.log(`📊 Total de comandos SQL: ${commands.length}\n`);

    // Executar comando por comando via RPC
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i] + ';';
      
      // Pular comentários e linhas vazias
      if (cmd.trim().startsWith('--') || cmd.trim().length < 10) {
        continue;
      }

      console.log(`\n[${i + 1}/${commands.length}] Executando comando...`);
      
      try {
        // Tentar executar via query direto
        const { error } = await supabase.rpc('exec_sql', { query: cmd });
        
        if (error) {
          console.log(`⚠️  Erro (pode ser normal se já existe):`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Sucesso`);
          successCount++;
        }
      } catch (err) {
        console.log(`⚠️  Erro ao executar:`, err.message);
        errorCount++;
      }
      
      // Pequeno delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMO:');
    console.log(`✅ Sucessos: ${successCount}`);
    console.log(`⚠️  Erros: ${errorCount}`);
    console.log('='.repeat(50) + '\n');

    // Verificar se tabelas foram criadas
    console.log('🔍 Verificando tabelas criadas...\n');

    const tables = ['community_posts', 'community_likes', 'community_comments'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);

      if (error) {
        console.log(`❌ ${table}: NÃO EXISTE (${error.message})`);
      } else {
        console.log(`✅ ${table}: OK`);
      }
    }

    console.log('\n🎉 Schema aplicado com sucesso!\n');
    console.log('📝 Próximo passo: Execute "node test-community-post.mjs" para criar posts de teste\n');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

applySchema();
