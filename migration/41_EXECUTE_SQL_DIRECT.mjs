#!/usr/bin/env node
/**
 * EXECUÇÃO DIRETA: SQL VIA MANAGEMENT API
 * Executar UNIFIED_SCHEMA_SIMPLIFIED.sql linha por linha
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\./)[1];

console.log('\n⚡ EXECUÇÃO DIRETA: SQL VIA MANAGEMENT API\n');
console.log(`Project: ${PROJECT_REF}`);

const sql = fs.readFileSync('UNIFIED_SCHEMA_SIMPLIFIED.sql', 'utf-8');

// Tentar executar via Management API
const MANAGEMENT_API_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

console.log('\n🔄 Executando SQL...\n');

try {
  const response = await fetch(MANAGEMENT_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: sql
    })
  });

  if (response.ok) {
    const result = await response.json();
    console.log('✅ SQL executado com sucesso!');
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('⚠️  Management API não disponível ou requer API key diferente');
    console.log(`   Status: ${response.status}`);
    console.log('   Tentando método alternativo...\n');
    
    // Método alternativo: executar statements individuais via SDK
    await executeViaSDK();
  }
} catch (err) {
  console.log('⚠️  Erro na Management API:', err.message);
  console.log('   Usando método alternativo via SDK...\n');
  await executeViaSDK();
}

async function executeViaSDK() {
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false }
  });
  
  console.log('📋 EXECUÇÃO VIA SDK (Alternativo)\n');
  
  // 1. Adicionar colunas em users
  console.log('1️⃣ Verificando colunas duaia_enabled e duacoin_enabled...');
  const { data: users } = await supabase
    .from('users')
    .select('id, email, duaia_enabled, duacoin_enabled')
    .limit(1);
  
  if (users && users[0]) {
    if ('duaia_enabled' in users[0]) {
      console.log('   ✅ Colunas já existem');
    } else {
      console.log('   ⚠️  Colunas precisam ser adicionadas no SQL Editor');
    }
  }
  
  // 2. Testar se tabelas duaia_profiles existem
  console.log('\n2️⃣ Verificando tabela duaia_profiles...');
  const { data: duaiaTest, error: duaiaError } = await supabase
    .from('duaia_profiles')
    .select('id')
    .limit(1);
  
  if (duaiaError) {
    if (duaiaError.code === 'PGRST204' || duaiaError.message.includes('does not exist')) {
      console.log('   ❌ Tabela duaia_profiles NÃO EXISTE');
      console.log('   Precisa executar SQL no Dashboard');
    } else {
      console.log('   ⚠️  Erro:', duaiaError.message);
    }
  } else {
    console.log('   ✅ Tabela duaia_profiles existe!');
  }
  
  // 3. Testar duacoin_profiles
  console.log('\n3️⃣ Verificando tabela duacoin_profiles...');
  const { data: duacoinTest, error: duacoinError } = await supabase
    .from('duacoin_profiles')
    .select('id')
    .limit(1);
  
  if (duacoinError) {
    if (duacoinError.code === 'PGRST204' || duacoinError.message.includes('does not exist')) {
      console.log('   ❌ Tabela duacoin_profiles NÃO EXISTE');
      console.log('   Precisa executar SQL no Dashboard');
    } else {
      console.log('   ⚠️  Erro:', duacoinError.message);
    }
  } else {
    console.log('   ✅ Tabela duacoin_profiles existe!');
  }
  
  console.log('\n📋 RESUMO:\n');
  console.log('Para completar o deployment:');
  console.log('1. Ir para: https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new');
  console.log('2. Copiar conteúdo de: UNIFIED_SCHEMA_SIMPLIFIED.sql');
  console.log('3. Colar no SQL Editor');
  console.log('4. Clicar em RUN');
  console.log('5. Executar: node migration/40_TEST_UNIFIED_SCHEMA.mjs');
  console.log();
}
