#!/usr/bin/env node
/**
 * CRIAÇÃO RIGOROSA: TABELAS VIA OPERAÇÕES PERMITIDAS
 * 
 * Como DDL não funciona via API, vou:
 * 1. Criar tabelas usando Supabase Client Library (schema builder)
 * 2. Validar CADA operação
 * 3. NUNCA assumir nada
 * 4. Reportar EXATAMENTE o que falta
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\./)[1];

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

console.log('\n🔍 DIAGNÓSTICO RIGOROSO: ESTADO ATUAL\n');
console.log('═══════════════════════════════════════\n');

// Lista de TODAS as tabelas necessárias
const REQUIRED_TABLES = [
  'duaia_profiles',
  'duaia_conversations',
  'duaia_messages',
  'duaia_projects',
  'duacoin_profiles',
  'duacoin_transactions',
  'duacoin_staking'
];

const REQUIRED_COLUMNS_USERS = [
  'duaia_enabled',
  'duacoin_enabled'
];

const REQUIRED_TRIGGERS = [
  'on_user_created_duaia',
  'on_user_created_duacoin'
];

const REQUIRED_FUNCTIONS = [
  'create_duaia_profile',
  'create_duacoin_profile'
];

console.log('1️⃣ VERIFICANDO TABELAS EXISTENTES\n');

const existingTables = [];
const missingTables = [];

for (const table of REQUIRED_TABLES) {
  const { data, error } = await supabase.from(table).select('id').limit(0);
  
  if (error) {
    if (error.code === '42P01' || error.message.includes('not find')) {
      console.log(`   ❌ ${table} - NÃO EXISTE`);
      missingTables.push(table);
    } else if (error.code === '42501') {
      console.log(`   ✅ ${table} - EXISTE (RLS ativo)`);
      existingTables.push(table);
    } else {
      console.log(`   ⚠️  ${table} - ERRO: ${error.code} ${error.message}`);
      missingTables.push(table);
    }
  } else {
    console.log(`   ✅ ${table} - EXISTE`);
    existingTables.push(table);
  }
}

console.log('\n2️⃣ VERIFICANDO COLUNAS DA TABELA USERS\n');

const { data: usersData, error: usersError } = await supabase
  .from('users')
  .select('*')
  .limit(1);

const existingColumns = [];
const missingColumns = [];

if (usersData && usersData[0]) {
  const userColumns = Object.keys(usersData[0]);
  
  for (const col of REQUIRED_COLUMNS_USERS) {
    if (userColumns.includes(col)) {
      console.log(`   ✅ users.${col} - EXISTE`);
      existingColumns.push(col);
    } else {
      console.log(`   ❌ users.${col} - NÃO EXISTE`);
      missingColumns.push(col);
    }
  }
} else {
  console.log(`   ❌ Não foi possível verificar colunas: ${usersError?.message}`);
  missingColumns.push(...REQUIRED_COLUMNS_USERS);
}

console.log('\n3️⃣ VERIFICANDO AUTH.USERS (fonte de dados)\n');

const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

if (authError) {
  console.log(`   ❌ Erro ao listar users: ${authError.message}`);
} else {
  console.log(`   ✅ Total de users em auth.users: ${users.length}`);
  console.log(`   Emails:`);
  users.forEach(u => console.log(`      - ${u.email}`));
}

console.log('\n4️⃣ VERIFICANDO DADOS EXISTENTES\n');

const { data: publicUsers, error: publicError } = await supabase
  .from('users')
  .select('id, email, duaia_enabled, duacoin_enabled')
  .limit(10);

if (publicError) {
  console.log(`   ❌ Erro ao ler public.users: ${publicError.message}`);
} else {
  console.log(`   ✅ Total de users em public.users: ${publicUsers.length}`);
  
  if (missingColumns.length === 0) {
    publicUsers.forEach(u => {
      console.log(`      ${u.email}: DUA IA=${u.duaia_enabled ?? 'NULL'}, DUA COIN=${u.duacoin_enabled ?? 'NULL'}`);
    });
  }
}

console.log('\n═══════════════════════════════════════\n');
console.log('📋 RESUMO RIGOROSO\n');

console.log(`✅ Tabelas existentes: ${existingTables.length}/${REQUIRED_TABLES.length}`);
if (existingTables.length > 0) {
  existingTables.forEach(t => console.log(`   ✓ ${t}`));
}

console.log(`\n❌ Tabelas faltando: ${missingTables.length}/${REQUIRED_TABLES.length}`);
if (missingTables.length > 0) {
  missingTables.forEach(t => console.log(`   ✗ ${t}`));
}

console.log(`\n✅ Colunas existentes: ${existingColumns.length}/${REQUIRED_COLUMNS_USERS.length}`);
if (existingColumns.length > 0) {
  existingColumns.forEach(c => console.log(`   ✓ users.${c}`));
}

console.log(`\n❌ Colunas faltando: ${missingColumns.length}/${REQUIRED_COLUMNS_USERS.length}`);
if (missingColumns.length > 0) {
  missingColumns.forEach(c => console.log(`   ✗ users.${c}`));
}

console.log('\n═══════════════════════════════════════\n');

if (missingTables.length > 0 || missingColumns.length > 0) {
  console.log('⚠️  AÇÃO MANUAL NECESSÁRIA\n');
  console.log('SDK do Supabase NÃO permite criar tabelas (apenas ler/escrever dados)');
  console.log('DDL (CREATE TABLE, ALTER TABLE) só funciona via SQL Editor\n');
  
  console.log('📋 INSTRUÇÕES EXATAS:\n');
  console.log('1. Abrir: https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new');
  console.log('2. Copiar TUDO de: UNIFIED_SCHEMA_SIMPLIFIED.sql');
  console.log('3. Colar no SQL Editor');
  console.log('4. Clicar "RUN" (botão verde ou Ctrl+Enter)');
  console.log('5. Aguardar mensagem de sucesso');
  console.log('6. Voltar aqui e executar: node migration/43_VALIDATE_SCHEMA.mjs');
  console.log();
  
  console.log('📄 Conteúdo do SQL (primeiras linhas):');
  console.log('─────────────────────────────────────');
  
  const fs = await import('fs');
  const sql = fs.readFileSync('UNIFIED_SCHEMA_SIMPLIFIED.sql', 'utf-8');
  const lines = sql.split('\n').slice(0, 20);
  lines.forEach(line => console.log(line));
  console.log('... (resto do arquivo)');
  console.log('─────────────────────────────────────');
  console.log();
  
  console.log('⚠️  NÃO POSSO CONTINUAR SEM AS TABELAS CRIADAS');
  console.log('   Todas as próximas operações dependem delas');
  console.log();
  
  process.exit(1);
  
} else {
  console.log('✅ SCHEMA COMPLETO!\n');
  console.log('Todas as tabelas e colunas necessárias existem');
  console.log('Próximo passo: Validar triggers e RLS policies');
  console.log();
  console.log('Executar: node migration/40_TEST_UNIFIED_SCHEMA.mjs');
  console.log();
}
