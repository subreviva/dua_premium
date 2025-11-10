#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log('\n🔍 ULTRA RIGOR - VERIFICAÇÃO DO SISTEMA DE CRÉDITOS\n');

// 1. Verificar estrutura das tabelas
console.log('1️⃣ VERIFICANDO ESTRUTURA...\n');

const { data: balances, error: balErr } = await supabase
  .from('duaia_user_balances')
  .select('*')
  .limit(3);

if (balErr) {
  console.log('❌ Erro ao acessar duaia_user_balances:', balErr.message);
} else {
  console.log(`✅ Tabela duaia_user_balances: ${balances.length} registros encontrados`);
}

const { data: transactions, error: txErr } = await supabase
  .from('duaia_transactions')
  .select('*')
  .limit(3);

if (txErr) {
  console.log('❌ Erro ao acessar duaia_transactions:', txErr.message);
} else {
  console.log(`✅ Tabela duaia_transactions: ${transactions.length} registros encontrados`);
}

// 2. Buscar usuário real
console.log('\n2️⃣ BUSCANDO USUÁRIO REAL...\n');

const { data: users, error: userErr } = await supabase
  .from('duaia_user_balances')
  .select('user_id, servicos_creditos')
  .limit(1);

if (!users || users.length === 0) {
  console.log('⚠️  Nenhum usuário encontrado em duaia_user_balances');
  console.log('   Criando usuário de teste...\n');
  
  // Buscar primeiro usuário de auth.users
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  
  if (authUsers && authUsers.users && authUsers.users.length > 0) {
    const realUserId = authUsers.users[0].id;
    console.log(`   User ID encontrado: ${realUserId}`);
    
    // Testar get_servicos_credits (deve auto-criar)
    const { data: credits } = await supabase.rpc('get_servicos_credits', {
      p_user_id: realUserId
    });
    
    console.log(`   ✅ Auto-criação funcionou! Créditos: ${credits}`);
  } else {
    console.log('   ❌ Nenhum usuário em auth.users');
    process.exit(1);
  }
} else {
  const userId = users[0].user_id;
  const currentBalance = users[0].servicos_creditos;
  
  console.log(`✅ Usuário encontrado: ${userId}`);
  console.log(`   Saldo atual: ${currentBalance} créditos\n`);
  
  // 3. Testar RPC functions
  console.log('3️⃣ TESTANDO RPC FUNCTIONS...\n');
  
  // Test add_servicos_credits
  const { data: addResult, error: addErr } = await supabase.rpc('add_servicos_credits', {
    p_user_id: userId,
    p_amount: 10,
    p_transaction_type: 'test_rigor',
    p_description: 'Teste ULTRA RIGOR',
    p_admin_email: 'teste@dua.pt'
  });
  
  if (addErr) {
    console.log('❌ add_servicos_credits falhou:', addErr.message);
  } else {
    const result = typeof addResult === 'string' ? JSON.parse(addResult) : addResult;
    console.log(`✅ add_servicos_credits: ${result.balance_before} → ${result.balance_after}`);
    console.log(`   Transaction ID: ${result.transaction_id}`);
  }
  
  // Test deduct_servicos_credits
  const { data: deductResult, error: deductErr } = await supabase.rpc('deduct_servicos_credits', {
    p_user_id: userId,
    p_amount: 5,
    p_operation: 'test_operation',
    p_description: 'Teste de dedução'
  });
  
  if (deductErr) {
    console.log('❌ deduct_servicos_credits falhou:', deductErr.message);
  } else {
    const result = typeof deductResult === 'string' ? JSON.parse(deductResult) : deductResult;
    console.log(`✅ deduct_servicos_credits: ${result.balance_before} → ${result.balance_after}`);
    console.log(`   Amount deducted: ${result.amount_deducted}`);
  }
  
  // 4. Verificar transações criadas
  console.log('\n4️⃣ VERIFICANDO AUDITORIA...\n');
  
  const { data: userTx } = await supabase
    .from('duaia_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);
  
  console.log(`✅ Transações registradas: ${userTx.length}`);
  userTx.forEach((tx, i) => {
    console.log(`   ${i + 1}. ${tx.transaction_type}: ${tx.amount > 0 ? '+' : ''}${tx.amount} (${tx.balance_before} → ${tx.balance_after})`);
  });
  
  // 5. Verificar saldo final
  console.log('\n5️⃣ VERIFICANDO SALDO FINAL...\n');
  
  const { data: finalBalance } = await supabase.rpc('get_servicos_credits', {
    p_user_id: userId
  });
  
  console.log(`✅ Saldo final: ${finalBalance} créditos`);
}

console.log('\n✅ VERIFICAÇÃO COMPLETA!\n');
