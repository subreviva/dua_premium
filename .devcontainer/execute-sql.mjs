#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔧 EXECUTE SQL - Executar SQL via Supabase Management API
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Executa SQL diretamente no Supabase usando:
 * 1. Se disponível: DATABASE_URL via pg (postgres client)
 * 2. Senão: Supabase Management API (requer SUPABASE_ACCESS_TOKEN)
 * 3. Senão: Imprime SQL para copiar manualmente
 * 
 * Uso:
 *   node .devcontainer/execute-sql.mjs --file schema.sql
 *   node .devcontainer/execute-sql.mjs --sql "SELECT * FROM users LIMIT 1;"
 */

import { readFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Carregar .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let value = match[2].trim();
    // Remove aspas
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || '';
const PROJECT_REF = env.SUPABASE_PROJECT_REF || 'nranmngyocaqjwcokcxm';
const DATABASE_URL = env.DATABASE_URL || '';
const SUPABASE_ACCESS_TOKEN = env.SUPABASE_ACCESS_TOKEN || '';

// Parse argumentos
const args = process.argv.slice(2);
let sqlContent = '';

if (args[0] === '--file' && args[1]) {
  sqlContent = readFileSync(args[1], 'utf-8');
  console.log(`📝 Executando SQL do arquivo: ${args[1]}`);
} else if (args[0] === '--sql' && args[1]) {
  sqlContent = args[1];
  console.log('📝 Executando SQL inline...');
} else {
  console.error('❌ Uso: node execute-sql.mjs --file <arquivo.sql>');
  console.error('   ou: node execute-sql.mjs --sql "SELECT ..."');
  process.exit(1);
}

// Validar SQL básico
if (!/select|insert|update|delete|create|alter|drop|grant|revoke/i.test(sqlContent)) {
  console.warn('⚠️  SQL não parece conter comandos válidos');
}

console.log(`🚀 Executando SQL no Supabase (${PROJECT_REF})...`);
console.log('─'.repeat(60));
console.log(sqlContent.substring(0, 200) + (sqlContent.length > 200 ? '...' : ''));
console.log('─'.repeat(60));

// Método 1: DATABASE_URL (melhor, direto)
if (DATABASE_URL) {
  console.log('✅ Usando DATABASE_URL (conexão direta PostgreSQL)');
  
  try {
    const { default: pg } = await import('pg');
    const client = new pg.Client({ connectionString: DATABASE_URL });
    
    await client.connect();
    console.log('🔗 Conectado ao PostgreSQL');
    
    const result = await client.query(sqlContent);
    console.log('✅ SQL executado com sucesso!');
    
    if (result.rows && result.rows.length > 0) {
      console.log(`📊 Resultado: ${result.rows.length} linhas`);
      console.log(JSON.stringify(result.rows.slice(0, 3), null, 2));
    } else if (result.rowCount !== undefined) {
      console.log(`📊 Linhas afetadas: ${result.rowCount}`);
    }
    
    await client.end();
    
    // Sincronizar schema após execução
    console.log('\n🔄 Sincronizando schema local...');
    await syncSchema();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar SQL:', error.message);
    
    // Se falhar, tentar via psql CLI
    console.log('\n🔄 Tentando via psql CLI...');
    try {
      const tempFile = `/tmp/sql_${Date.now()}.sql`;
      writeFileSync(tempFile, sqlContent);
      
      const { stdout, stderr } = await execAsync(`psql "${DATABASE_URL}" -f ${tempFile}`);
      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);
      
      console.log('✅ SQL executado via psql!');
      await syncSchema();
      process.exit(0);
    } catch (psqlError) {
      console.error('❌ psql também falhou:', psqlError.message);
    }
  }
}

// Método 2: Supabase Management API (requer token)
if (SUPABASE_ACCESS_TOKEN) {
  console.log('⚠️  DATABASE_URL não disponível');
  console.log('🔄 Tentando via Supabase Management API...');
  
  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sqlContent })
      }
    );
    
    if (!response.ok) {
      throw new Error(`API retornou ${response.status}: ${await response.text()}`);
    }
    
    const result = await response.json();
    console.log('✅ SQL executado via Management API!');
    console.log(JSON.stringify(result, null, 2));
    
    await syncSchema();
    process.exit(0);
  } catch (apiError) {
    console.error('❌ Management API falhou:', apiError.message);
  }
}

// Método 3: Fallback - imprimir para execução manual
console.error('\n⚠️  Não foi possível executar automaticamente.');
console.error('📋 Execute manualmente no Supabase Dashboard > SQL Editor:');
console.error('🔗 https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new');
console.error('\n SQL a executar:');
console.error('─'.repeat(80));
console.error(sqlContent);
console.error('─'.repeat(80));

console.error('\n💡 Para habilitar execução automática:');
console.error('1. Adicione DATABASE_URL ao .env.local (Vercel > Settings > Environment Variables)');
console.error('   Formato: postgresql://postgres:[PASSWORD]@db.' + PROJECT_REF + '.supabase.co:5432/postgres');
console.error('2. Execute: vercel env pull .env.local');
console.error('3. Ou adicione SUPABASE_ACCESS_TOKEN (dashboard > Settings > API)');

process.exit(1);

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Sincronizar schema local após executar SQL
// ─────────────────────────────────────────────────────────────────────────────
async function syncSchema() {
  console.log('🔄 Atualizando schema local e tipos TypeScript...');
  
  try {
    // Pull schema (requer supabase CLI linkado)
    const { stdout: pullOut } = await execAsync(
      `supabase db pull --project-ref ${PROJECT_REF} 2>&1 || echo "supabase db pull falhou"`
    );
    if (pullOut.includes('falhou')) {
      console.warn('⚠️  Não foi possível executar supabase db pull (CLI não linkado)');
    } else {
      console.log('✅ Schema atualizado em supabase/schema.sql');
    }
    
    // Generate types
    const { stdout: typesOut } = await execAsync(
      `supabase gen types typescript --project-id ${PROJECT_REF} > src/lib/supabase.types.ts 2>&1 || echo "gen types falhou"`
    );
    if (typesOut.includes('falhou')) {
      console.warn('⚠️  Não foi possível gerar tipos TypeScript');
    } else {
      console.log('✅ Tipos TypeScript atualizados em src/lib/supabase.types.ts');
    }
  } catch (syncError) {
    console.warn('⚠️  Sincronização parcial:', syncError.message);
    console.warn('Execute manualmente: bash .devcontainer/sync-env.sh');
  }
}
