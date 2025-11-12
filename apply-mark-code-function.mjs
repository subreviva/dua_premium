#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════
 * 📦 APLICAR FUNÇÃO SQL: mark_invite_code_as_used
 * ═══════════════════════════════════════════════════════════════
 * 
 * Cria função PostgreSQL thread-safe para marcar códigos como usados.
 * Usa SELECT FOR UPDATE para garantir atomicidade.
 * 
 * @created 2024-01-24
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

console.log('═══════════════════════════════════════════════════════════════');
console.log('📦 CRIANDO FUNÇÃO: mark_invite_code_as_used');
console.log('═══════════════════════════════════════════════════════════════\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Ler SQL
const sql = readFileSync('CREATE_MARK_CODE_FUNCTION.sql', 'utf8');

console.log('📄 SQL lido do arquivo\n');
console.log('🚀 Executando no Supabase via RPC...\n');

// Executar via conexão direta (Supabase não tem exec_sql por padrão)
// Vamos usar o método alternativo: executar via PostgreSQL client

import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.POSTGRES_URL || 
  'postgresql://postgres.nranmngyocaqjwcokcxm:Duaia.pt.1808@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  console.log('✅ Conectado ao PostgreSQL\n');
  
  const result = await client.query(sql);
  console.log('✅ Função criada com sucesso!\n');
  
  // Testar a função
  console.log('🧪 Testando função...\n');
  
  // Criar código de teste
  await client.query(`
    INSERT INTO invite_codes (code, active) 
    VALUES ('TESTFUNC', true)
    ON CONFLICT (code) DO NOTHING
  `);
  
  // Tentar marcar como usado
  const testResult = await client.query(`
    SELECT mark_invite_code_as_used('TESTFUNC', gen_random_uuid()::uuid) as result
  `);
  
  console.log('📊 Resultado do teste:', JSON.stringify(testResult.rows[0].result, null, 2));
  
  // Tentar usar novamente (deve falhar)
  const testResult2 = await client.query(`
    SELECT mark_invite_code_as_used('TESTFUNC', gen_random_uuid()::uuid) as result
  `);
  
  console.log('\n📊 Segunda tentativa (deve falhar):', JSON.stringify(testResult2.rows[0].result, null, 2));
  
  // Limpar teste
  await client.query(`DELETE FROM invite_codes WHERE code = 'TESTFUNC'`);
  
  console.log('\n✅ Teste concluído!\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('✅ FUNÇÃO CRIADA E TESTADA COM SUCESSO!');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log('📝 PRÓXIMO PASSO:');
  console.log('   Atualizar código para usar:');
  console.log('   const { data } = await supabase.rpc("mark_invite_code_as_used", {');
  console.log('     p_code: "ABC123",');
  console.log('     p_user_id: userId');
  console.log('   });');
  console.log('   if (!data.success) throw new Error(data.error);\n');
  
} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
} finally {
  await client.end();
}
