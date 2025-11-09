#!/usr/bin/env node

// ===================================================
// VERIFICAR ESTRUTURA DUA COIN NO SUPABASE
// ===================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('🔍 VERIFICANDO ESTRUTURA DUA COIN NO SUPABASE\n');

async function verificarEstrutura() {
  // 1. Verificar tabela users
  console.log('📋 1. Verificando tabela USERS...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (usersError) {
    console.log('❌ Erro ao acessar users:', usersError.message);
  } else {
    console.log('✅ Tabela users existe');
    console.log('   Colunas:', Object.keys(users[0] || {}));
  }

  // 2. Verificar tabela duaia_profiles
  console.log('\n📋 2. Verificando tabela DUAIA_PROFILES...');
  const { data: duaiaProfiles, error: duaiaError } = await supabase
    .from('duaia_profiles')
    .select('*')
    .limit(1);
  
  if (duaiaError) {
    console.log('❌ Tabela duaia_profiles NÃO existe:', duaiaError.message);
  } else {
    console.log('✅ Tabela duaia_profiles existe');
    console.log('   Colunas:', Object.keys(duaiaProfiles[0] || {}));
  }

  // 3. Verificar tabela duacoin_profiles
  console.log('\n📋 3. Verificando tabela DUACOIN_PROFILES...');
  const { data: duacoinProfiles, error: duacoinError } = await supabase
    .from('duacoin_profiles')
    .select('*')
    .limit(1);
  
  if (duacoinError) {
    console.log('❌ Tabela duacoin_profiles NÃO existe:', duacoinError.message);
  } else {
    console.log('✅ Tabela duacoin_profiles existe');
    console.log('   Colunas:', Object.keys(duacoinProfiles[0] || {}));
  }

  // 4. Verificar se users tem saldo_dua e creditos_servicos
  console.log('\n📋 4. Verificando colunas de CRÉDITOS em users...');
  const { data: usersWithCredits } = await supabase
    .from('users')
    .select('id, email, saldo_dua, creditos_servicos')
    .limit(1);
  
  if (usersWithCredits && usersWithCredits[0]) {
    const user = usersWithCredits[0];
    if ('saldo_dua' in user) {
      console.log('✅ Coluna saldo_dua existe');
    } else {
      console.log('❌ Coluna saldo_dua NÃO existe');
    }
    
    if ('creditos_servicos' in user) {
      console.log('✅ Coluna creditos_servicos existe');
    } else {
      console.log('❌ Coluna creditos_servicos NÃO existe');
    }
  }

  // 5. Verificar tabela transactions
  console.log('\n📋 5. Verificando tabela TRANSACTIONS...');
  const { data: transactions, error: transError } = await supabase
    .from('transactions')
    .select('*')
    .limit(1);
  
  if (transError) {
    console.log('❌ Tabela transactions NÃO existe:', transError.message);
  } else {
    console.log('✅ Tabela transactions existe');
    console.log('   Colunas:', Object.keys(transactions[0] || {}));
  }

  // 6. Contar usuários
  console.log('\n📊 6. Estatísticas...');
  const { count: userCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });
  
  console.log(`   Total de usuários: ${userCount || 0}`);

  // 7. Verificar estrutura de integração DUA Coin
  console.log('\n🔗 7. Verificando INTEGRAÇÃO DUA COIN...');
  
  if (duacoinProfiles && duacoinProfiles[0]) {
    const hasSaldoDua = 'balance' in duacoinProfiles[0];
    console.log(`   ${hasSaldoDua ? '✅' : '❌'} duacoin_profiles.balance (saldo DUA Coin)`);
    console.log(`   Estrutura DUA Coin: ${JSON.stringify(duacoinProfiles[0], null, 2)}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📝 RESUMO DA ESTRUTURA:');
  console.log('='.repeat(60));
  
  console.log('\n🎯 MODELO ATUAL:');
  console.log('   • users - tabela principal de utilizadores');
  console.log('   • duaia_profiles - perfil DUA IA (conversas, mensagens)');
  console.log('   • duacoin_profiles - perfil DUA COIN (balance, wallet)');
  
  console.log('\n💡 INTEGRAÇÃO NECESSÁRIA:');
  console.log('   1. Adicionar saldo_dua e creditos_servicos em users');
  console.log('   2. Sincronizar saldo_dua com duacoin_profiles.balance');
  console.log('   3. Criar tabela transactions para auditoria');
  console.log('   4. SSO compartilhado entre DUA IA e DUA Coin');
  
  console.log('\n✨ PRÓXIMOS PASSOS:');
  console.log('   1. Execute o schema-creditos-dua.sql no Supabase Dashboard');
  console.log('   2. Implemente API de compra de créditos');
  console.log('   3. Crie páginas /dashboard-ia e /loja-creditos');
  console.log('   4. Implemente consumo de créditos nos estúdios');
  
  console.log('\n');
}

verificarEstrutura();
