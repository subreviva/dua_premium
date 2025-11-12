#!/usr/bin/env node

/**
 * 🔍 DIAGNÓSTICO COMPLETO - Verificar estado do banco de dados
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

console.log('🔍 DIAGNÓSTICO DO BANCO DE DADOS\n');
console.log('═'.repeat(80));

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function diagnosticar() {
  console.log('\n1️⃣ Verificando estrutura da tabela USERS');
  console.log('─'.repeat(80));
  
  // Verificar se tabela users existe
  const { data: userSample, error: userError } = await supabase
    .from('users')
    .select('*')
    .limit(1);

  if (userError) {
    console.log('❌ Erro ao verificar users:', userError.message);
  } else {
    console.log('✅ Tabela users existe');
    if (userSample && userSample.length > 0) {
      console.log('   Colunas encontradas:', Object.keys(userSample[0]).join(', '));
    }
  }

  console.log('\n2️⃣ Verificando tabela DUAIA_USER_BALANCES');
  console.log('─'.repeat(80));
  
  const { data: balances, error: balancesError } = await supabase
    .from('duaia_user_balances')
    .select('*')
    .limit(10);

  if (balancesError) {
    console.log('❌ ERRO CRÍTICO: Tabela duaia_user_balances não acessível!');
    console.log('   Erro:', balancesError.message);
    console.log('   Código:', balancesError.code);
  } else {
    console.log('✅ Tabela duaia_user_balances existe');
    console.log(`   Total de registros: ${balances?.length || 0}`);
    if (balances && balances.length > 0) {
      console.log('   Primeiros registros:');
      balances.forEach((b, i) => {
        console.log(`   ${i + 1}. User: ${b.user_id} | Créditos: ${b.servicos_creditos} | DuaCoin: ${b.duacoin_balance}`);
      });
    } else {
      console.log('   ⚠️ NENHUM usuário tem créditos registrados!');
    }
  }

  console.log('\n3️⃣ Verificando usuários logados');
  console.log('─'.repeat(80));
  
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.log('❌ Erro ao listar usuários:', authError.message);
  } else {
    console.log(`✅ Total de usuários cadastrados: ${authUsers.users.length}`);
    if (authUsers.users.length > 0) {
      console.log('\n   Lista de usuários:');
      for (const user of authUsers.users.slice(0, 5)) {
        console.log(`   • ${user.email} (ID: ${user.id})`);
        
        // Verificar se tem registro em duaia_user_balances
        const { data: userBalance } = await supabase
          .from('duaia_user_balances')
          .select('servicos_creditos, duacoin_balance')
          .eq('user_id', user.id)
          .single();

        if (userBalance) {
          console.log(`     ✅ Créditos: ${userBalance.servicos_creditos} | DuaCoin: ${userBalance.duacoin_balance}`);
        } else {
          console.log(`     ❌ SEM REGISTRO em duaia_user_balances!`);
        }
      }
    }
  }

  console.log('\n4️⃣ Verificando políticas RLS');
  console.log('─'.repeat(80));
  console.log('⚠️ Pulando verificação de políticas (requer acesso direto ao PostgreSQL)');


  console.log('\n5️⃣ Testando INSERT em duaia_user_balances');
  console.log('─'.repeat(80));
  
  // Pegar primeiro usuário que não tem balance
  if (authUsers && authUsers.users.length > 0) {
    const testUser = authUsers.users[0];
    console.log(`Tentando criar balance para ${testUser.email}...`);
    
    const { data: insertResult, error: insertError } = await supabase
      .from('duaia_user_balances')
      .upsert({
        user_id: testUser.id,
        servicos_creditos: 100,
        duacoin_balance: 0
      }, {
        onConflict: 'user_id'
      })
      .select();

    if (insertError) {
      console.log('❌ ERRO ao inserir:', insertError.message);
      console.log('   Código:', insertError.code);
      console.log('   Detalhes:', insertError.details);
    } else {
      console.log('✅ INSERT bem-sucedido!');
      console.log('   Resultado:', JSON.stringify(insertResult, null, 2));
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log('📊 RESUMO DO DIAGNÓSTICO');
  console.log('═'.repeat(80));

  let problemas = [];

  if (balancesError) {
    problemas.push('❌ Tabela duaia_user_balances inacessível');
  }

  if (balances && balances.length === 0) {
    problemas.push('⚠️ Nenhum usuário tem créditos registrados');
  }

  if (authUsers && authUsers.users.length > 0) {
    let semBalance = 0;
    for (const user of authUsers.users) {
      const { data } = await supabase
        .from('duaia_user_balances')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      if (!data) semBalance++;
    }
    if (semBalance > 0) {
      problemas.push(`⚠️ ${semBalance} usuários sem registro em duaia_user_balances`);
    }
  }

  if (problemas.length === 0) {
    console.log('✅ Nenhum problema encontrado!');
    console.log('   O erro 402 pode ser outro motivo (verificar logs da API)');
  } else {
    console.log('🚨 PROBLEMAS ENCONTRADOS:\n');
    problemas.forEach(p => console.log(`   ${p}`));
    
    console.log('\n💡 SOLUÇÃO:');
    console.log('   Execute o script de correção para criar registros faltantes');
  }

  console.log('\n✅ Diagnóstico concluído!\n');
}

diagnosticar().catch(err => {
  console.error('\n❌ ERRO FATAL:', err);
  process.exit(1);
});
