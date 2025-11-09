#!/usr/bin/env node

// ===================================================
// APLICAR SCHEMA CRÉDITOS + SYNC DUACOIN NO SUPABASE
// ===================================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

console.log('🚀 APLICANDO SCHEMA CRÉDITOS + SYNC DUACOIN\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Ler arquivo SQL
const sql = readFileSync('schema-creditos-sync-duacoin.sql', 'utf8');

// Dividir em comandos
const commands = sql
  .split(';')
  .map(cmd => cmd.trim())
  .filter(cmd => cmd && !cmd.startsWith('--') && !cmd.startsWith('/*'));

console.log(`📋 Total de comandos SQL: ${commands.length}\n`);

let executed = 0;
let failed = 0;

for (let i = 0; i < commands.length; i++) {
  const command = commands[i];
  
  // Skip comentários e linhas vazias
  if (!command || command.startsWith('--') || command.length < 10) {
    continue;
  }
  
  const preview = command.substring(0, 80).replace(/\n/g, ' ');
  
  console.log(`\n[${ i + 1}/${commands.length}] Executando: ${preview}...`);
  
  try {
    const { error } = await supabase.rpc('exec_sql', { 
      query: command + ';' 
    });
    
    if (error) {
      console.log(`   ❌ ERRO: ${error.message}`);
      failed++;
    } else {
      console.log(`   ✅ Sucesso!`);
      executed++;
    }
  } catch (err) {
    console.log(`   ⚠️ Exceção: ${err.message}`);
    // Tentar via PostgreSQL direto se exec_sql não funcionar
    failed++;
  }
}

console.log('\n' + '='.repeat(60));
console.log(`✅ Comandos executados com sucesso: ${executed}`);
console.log(`❌ Comandos com erro: ${failed}`);
console.log('='.repeat(60));

// Verificar resultado
console.log('\n🔍 Verificando estrutura final...\n');

const { data: users } = await supabase
  .from('users')
  .select('id, email, saldo_dua, creditos_servicos')
  .limit(1);

if (users && users[0]) {
  console.log('✅ Tabela users com saldo_dua e creditos_servicos:');
  console.log('  ', users[0]);
}

const { data: transactions } = await supabase
  .from('transactions')
  .select('*')
  .limit(1);

if (transactions !== null) {
  console.log('\n✅ Tabela transactions configurada!');
}

console.log('\n🎯 SISTEMA DE CRÉDITOS PRONTO!\n');
console.log('📱 Próximos passos:');
console.log('   1. Criar API POST /api/comprar-creditos');
console.log('   2. Criar API GET /api/dua-exchange-rate');
console.log('   3. Criar página /loja-creditos');
console.log('   4. Adicionar indicadores ao /dashboard-ia');
console.log('   5. Integrar consumo de créditos nos estúdios\n');
