#!/usr/bin/env node

/**
 * 💰 DAR 100 CRÉDITOS PARA TODOS OS USUÁRIOS
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

console.log('💰 DISTRIBUINDO 100 CRÉDITOS PARA TODOS OS USUÁRIOS\n');
console.log('═'.repeat(80));

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function darCreditos() {
  // Pegar todos os usuários
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.log('❌ Erro ao listar usuários:', authError.message);
    process.exit(1);
  }

  console.log(`\n✅ Encontrados ${authUsers.users.length} usuários\n`);

  let atualizados = 0;
  let criados = 0;
  let erros = 0;

  for (const user of authUsers.users) {
    console.log(`📝 Processando: ${user.email}`);

    // Verificar se já tem registro
    const { data: existingBalance } = await supabase
      .from('duaia_user_balances')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (existingBalance) {
      // Atualizar para 100 créditos
      const { error: updateError } = await supabase
        .from('duaia_user_balances')
        .update({ 
          servicos_creditos: 100,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.log(`   ❌ Erro ao atualizar: ${updateError.message}`);
        erros++;
      } else {
        console.log(`   ✅ Atualizado para 100 créditos (tinha ${existingBalance.servicos_creditos})`);
        atualizados++;
      }
    } else {
      // Criar novo registro com 100 créditos
      const { error: insertError } = await supabase
        .from('duaia_user_balances')
        .insert({
          user_id: user.id,
          servicos_creditos: 100,
          duacoin_balance: 0
        });

      if (insertError) {
        console.log(`   ❌ Erro ao criar: ${insertError.message}`);
        erros++;
      } else {
        console.log(`   ✅ Criado com 100 créditos`);
        criados++;
      }
    }
  }

  console.log('\n' + '═'.repeat(80));
  console.log('📊 RESUMO');
  console.log('═'.repeat(80));
  console.log(`✅ Atualizados: ${atualizados}`);
  console.log(`✅ Criados: ${criados}`);
  console.log(`❌ Erros: ${erros}`);
  console.log(`📦 Total: ${authUsers.users.length}`);
  console.log('');

  if (erros === 0) {
    console.log('🎉 SUCESSO! Todos os usuários agora têm 100 créditos!');
    console.log('');
    console.log('📝 Próximos passos:');
    console.log('1. Recarregar a página do Music Studio');
    console.log('2. Tentar gerar música novamente');
    console.log('3. NÃO deve mais dar erro 402');
  } else {
    console.log('⚠️ Alguns usuários não foram atualizados. Verifique os erros acima.');
  }

  console.log('');
}

darCreditos().catch(err => {
  console.error('\n❌ ERRO FATAL:', err);
  process.exit(1);
});
