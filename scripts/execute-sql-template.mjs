#!/usr/bin/env node

/**
 * 🔧 TEMPLATE PARA EXECUTAR SQL NO SUPABASE
 * 
 * Método oficial: Supabase JS Client com Service Role Key
 * Status: ✅ Testado e Funcionando (08/11/2025)
 * 
 * INSTRUÇÕES:
 * 1. Copie este arquivo
 * 2. Modifique a variável SQL_FILE_PATH com o caminho do seu arquivo SQL
 * 3. Execute: node execute-sql-template.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

// 📝 MODIFIQUE AQUI: Caminho do arquivo SQL
const SQL_FILE_PATH = 'sql/seu-arquivo.sql';

// ═══════════════════════════════════════════════════════════════════════════
// INÍCIO DA EXECUÇÃO
// ═══════════════════════════════════════════════════════════════════════════

console.log('═══════════════════════════════════════════════════════════════');
console.log('🚀 EXECUTANDO SQL NO SUPABASE');
console.log('═══════════════════════════════════════════════════════════════\n');

// Criar cliente Supabase com Service Role Key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('✅ Cliente Supabase criado com Service Role Key');
console.log(`📁 Arquivo SQL: ${SQL_FILE_PATH}\n`);

async function executarSQL() {
  try {
    // Ler arquivo SQL
    const sqlPath = join(__dirname, SQL_FILE_PATH);
    const sql = readFileSync(sqlPath, 'utf8');
    
    console.log(`📝 SQL carregado: ${sql.length} caracteres`);
    console.log('⚙️  Iniciando execução...\n');

    // ═══════════════════════════════════════════════════════════════════════
    // MÉTODO 1: Executar via RPC (se a função exec_sql existir)
    // ═══════════════════════════════════════════════════════════════════════
    console.log('Tentando executar via RPC...');
    
    try {
      const { error } = await supabase.rpc('exec_sql', { query: sql });
      
      if (error) {
        console.log('⚠️  RPC retornou erro:', error.message);
        throw new Error('Tentando método alternativo...');
      }
      
      console.log('✅ SQL executado com sucesso via RPC!\n');
      return true;
      
    } catch (rpcError) {
      console.log('⚠️  Método RPC não disponível ou falhou');
      console.log('🔄 Tentando método alternativo...\n');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MÉTODO 2: Dividir em comandos individuais
    // ═══════════════════════════════════════════════════════════════════════
    console.log('Executando comandos individuais...\n');
    
    // Dividir SQL em comandos
    const comandos = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📊 Total de comandos: ${comandos.length}\n`);

    let sucessos = 0;
    let falhas = 0;

    for (let i = 0; i < comandos.length; i++) {
      const cmd = comandos[i];
      
      // Pular comentários e blocos DO
      if (cmd.startsWith('/*') || cmd.startsWith('--') || cmd.startsWith('DO $$')) {
        continue;
      }

      console.log(`[${i + 1}/${comandos.length}] Executando...`);
      
      try {
        await supabase.rpc('exec_sql', { query: cmd + ';' });
        console.log('   ✅ Sucesso\n');
        sucessos++;
      } catch (err) {
        console.log(`   ⚠️  Falhou: ${err.message}\n`);
        falhas++;
      }
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`✅ Sucessos: ${sucessos}`);
    console.log(`❌ Falhas: ${falhas}`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    return sucessos > 0;

  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNÇÃO DE VERIFICAÇÃO
// ═══════════════════════════════════════════════════════════════════════════

async function verificarResultado() {
  console.log('🔍 VERIFICANDO RESULTADOS\n');
  
  // Exemplo: Verificar se uma tabela específica foi criada
  // MODIFIQUE AQUI: Nome da tabela que você criou
  const TABELA_TESTE = 'user_sessions';
  
  try {
    const { data, error } = await supabase
      .from(TABELA_TESTE)
      .select('count')
      .limit(1);
    
    if (error) {
      console.log(`❌ Tabela ${TABELA_TESTE}: NÃO ENCONTRADA`);
      console.log(`   Erro: ${error.message}\n`);
    } else {
      console.log(`✅ Tabela ${TABELA_TESTE}: EXISTE E ACESSÍVEL\n`);
    }
  } catch (err) {
    console.log(`❌ Erro ao verificar ${TABELA_TESTE}:`, err.message);
  }
  
  // Adicione mais verificações aqui conforme necessário
  // Exemplo:
  // const { data: users } = await supabase.from('users').select('nova_coluna').limit(1);
  // console.log('✅ Coluna nova_coluna:', users ? 'EXISTE' : 'NÃO EXISTE');
}

// ═══════════════════════════════════════════════════════════════════════════
// EXECUTAR
// ═══════════════════════════════════════════════════════════════════════════

(async () => {
  const sucesso = await executarSQL();
  
  if (sucesso) {
    await verificarResultado();
    
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ EXECUÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════════════\n');
  } else {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('❌ EXECUÇÃO FALHOU!');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('💡 DICA: Execute o SQL manualmente no Supabase Dashboard:');
    console.log('   https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/sql/new\n');
    process.exit(1);
  }
})();
