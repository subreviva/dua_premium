#!/usr/bin/env node

// ===================================================
// VERIFICAR ESTRUTURA ATUAL DO SUPABASE
// ===================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function verificarEstrutura() {
  console.log('\n🔍 VERIFICANDO ESTRUTURA DO SUPABASE...\n');

  // Verificar se existe tabela profiles
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .in('table_name', ['profiles', 'duaia_profiles', 'duacoin_profiles', 'users']);

  console.log('📊 Tabelas encontradas:');
  console.log(tables);

  // Verificar colunas da tabela users
  console.log('\n📋 Verificando estrutura de users...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);

  if (users && users.length > 0) {
    console.log('Colunas em users:', Object.keys(users[0]));
  } else {
    console.log('❌ Erro ao buscar users:', usersError);
  }

  // Verificar se existe duaia_profiles
  console.log('\n📋 Verificando estrutura de duaia_profiles...');
  const { data: duaiaProfiles, error: duaiaError } = await supabase
    .from('duaia_profiles')
    .select('*')
    .limit(1);

  if (duaiaProfiles && duaiaProfiles.length > 0) {
    console.log('✅ duaia_profiles existe');
    console.log('Colunas:', Object.keys(duaiaProfiles[0]));
  } else {
    console.log('❌ duaia_profiles não existe ou está vazia:', duaiaError?.message);
  }

  // Verificar se existe duacoin_profiles
  console.log('\n📋 Verificando estrutura de duacoin_profiles...');
  const { data: duacoinProfiles, error: duacoinError } = await supabase
    .from('duacoin_profiles')
    .select('*')
    .limit(1);

  if (duacoinProfiles && duacoinProfiles.length > 0) {
    console.log('✅ duacoin_profiles existe');
    console.log('Colunas:', Object.keys(duacoinProfiles[0]));
  } else {
    console.log('❌ duacoin_profiles não existe ou está vazia:', duacoinError?.message);
  }

  // Verificar se existe tabela transactions
  console.log('\n📋 Verificando tabela transactions...');
  const { data: transactions, error: transError } = await supabase
    .from('transactions')
    .select('*')
    .limit(1);

  if (transactions) {
    console.log('✅ transactions existe');
    if (transactions.length > 0) {
      console.log('Colunas:', Object.keys(transactions[0]));
    }
  } else {
    console.log('❌ transactions não existe:', transError?.message);
  }

  console.log('\n✅ Verificação concluída!\n');
}

verificarEstrutura();
