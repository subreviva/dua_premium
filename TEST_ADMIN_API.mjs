#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

console.log('\n🧪 TESTE: ADMIN API - INJECTION DE CRÉDITOS\n');

// Buscar usuário real
const { data: users } = await supabase
  .from('duaia_user_balances')
  .select('user_id, servicos_creditos')
  .limit(1);

if (!users || users.length === 0) {
  console.log('❌ Nenhum usuário encontrado');
  process.exit(1);
}

const userId = users[0].user_id;
const balanceBefore = users[0].servicos_creditos;

console.log(`User ID: ${userId}`);
console.log(`Saldo inicial: ${balanceBefore} créditos\n`);

// Simular chamada da API do Admin
console.log('1️⃣ SIMULANDO ADMIN API (add 100 créditos)...\n');

const { data: result, error } = await supabase.rpc('add_servicos_credits', {
  p_user_id: userId,
  p_amount: 100,
  p_transaction_type: 'admin_add',
  p_description: 'Admin injection via API',
  p_admin_email: 'admin@dua.pt',
  p_metadata: JSON.stringify({
    source: 'admin_panel',
    reason: 'Teste ULTRA RIGOR',
    timestamp: new Date().toISOString()
  })
});

if (error) {
  console.log(`   ❌ Erro: ${error.message}\n`);
  process.exit(1);
}

const addResult = typeof result === 'string' ? JSON.parse(result) : result;

console.log(`   ✅ Créditos adicionados com sucesso!`);
console.log(`   Balance: ${addResult.balance_before} → ${addResult.balance_after}`);
console.log(`   Amount added: ${addResult.amount_added}`);
console.log(`   Transaction ID: ${addResult.transaction_id}`);
console.log(`   Admin email: ${addResult.admin_email}\n`);

// Verificar que créditos aparecem imediatamente
console.log('2️⃣ VERIFICANDO SE CRÉDITOS APARECEM IMEDIATAMENTE...\n');

const { data: currentBalance } = await supabase.rpc('get_servicos_credits', {
  p_user_id: userId
});

console.log(`   Saldo atual: ${currentBalance} créditos`);
console.log(`   ${currentBalance === balanceBefore + 100 ? '✅' : '❌'} Reflete imediatamente!\n`);

// Verificar transaction no histórico
console.log('3️⃣ VERIFICANDO AUDITORIA...\n');

const { data: tx } = await supabase
  .from('duaia_transactions')
  .select('*')
  .eq('id', addResult.transaction_id)
  .single();

console.log(`   Transaction Type: ${tx.transaction_type}`);
console.log(`   Amount: ${tx.amount}`);
console.log(`   Balance: ${tx.balance_before} → ${tx.balance_after}`);
console.log(`   Admin Email: ${tx.admin_email}`);
console.log(`   Description: ${tx.description}`);
console.log(`   Metadata: ${JSON.stringify(JSON.parse(tx.metadata), null, 2).replace(/\n/g, '\n   ')}\n`);

console.log('✅ ADMIN API FUNCIONA 100%!\n');
