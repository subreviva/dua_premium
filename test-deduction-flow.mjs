#!/usr/bin/env node

/**
 * Teste E2E: Deduction Flow Completo
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('🧪 TESTE E2E: Deduction Flow\n');
console.log('═'.repeat(70));

// ═══════════════════════════════════════════════════════════════
// PASSO 1: Pegar estado inicial
// ═══════════════════════════════════════════════════════════════

console.log('\n📊 PASSO 1: Estado Inicial\n');

const TEST_EMAIL = 'dev@dua.com';

const { data: user, error: userErr } = await supabase
  .from('users')
  .select('id, email, creditos_servicos')
  .eq('email', TEST_EMAIL)
  .single();

if (userErr) {
  console.error('❌ Erro ao buscar user:', userErr);
  process.exit(1);
}

const { data: balance, error: balanceErr } = await supabase
  .from('duaia_user_balances')
  .select('servicos_creditos')
  .eq('user_id', user.id)
  .single();

if (balanceErr) {
  console.error('❌ Erro ao buscar balance:', balanceErr);
  process.exit(1);
}

console.log(`User: ${user.email}`);
console.log(`Créditos (users table): ${user.creditos_servicos}`);
console.log(`Créditos (balances table): ${balance.servicos_creditos}`);

const initialSync = user.creditos_servicos === balance.servicos_creditos;
console.log(`Status inicial: ${initialSync ? '✅ SYNC' : '❌ DESYNC'}`);

if (!initialSync) {
  console.error('\n❌ ERRO: Tabelas não estão sincronizadas no início!');
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════════
// PASSO 2: Deduzir créditos via RPC (como sistema real)
// ═══════════════════════════════════════════════════════════════

console.log('\n\n📊 PASSO 2: Deduzir Créditos (via RPC)\n');

const DEDUCTION_AMOUNT = 3;

console.log(`Deduzindo ${DEDUCTION_AMOUNT} créditos...`);

const { data: txId, error: deductErr } = await supabase.rpc('deduct_servicos_credits', {
  p_user_id: user.id,
  p_amount: DEDUCTION_AMOUNT,
  p_operation: 'TEST_E2E',
  p_description: 'Teste E2E de deduction flow',
  p_metadata: JSON.stringify({ 
    test: true, 
    timestamp: new Date().toISOString()
  })
});

if (deductErr) {
  console.error('❌ Erro ao deduzir créditos:', deductErr);
  process.exit(1);
}

console.log(`✅ Deduction executada com sucesso!`);
console.log(`Transaction ID: ${txId}`);

// Aguardar trigger executar (200ms para garantir)
console.log('\nAguardando trigger executar (200ms)...');
await new Promise(resolve => setTimeout(resolve, 200));

// ═══════════════════════════════════════════════════════════════
// PASSO 3: Verificar estado após deduction
// ═══════════════════════════════════════════════════════════════

console.log('\n\n📊 PASSO 3: Verificar Estado Após Deduction\n');

const { data: userAfter, error: userAfterErr } = await supabase
  .from('users')
  .select('creditos_servicos')
  .eq('id', user.id)
  .single();

if (userAfterErr) {
  console.error('❌ Erro ao buscar user após deduction:', userAfterErr);
  process.exit(1);
}

const { data: balanceAfter, error: balanceAfterErr } = await supabase
  .from('duaia_user_balances')
  .select('servicos_creditos')
  .eq('user_id', user.id)
  .single();

if (balanceAfterErr) {
  console.error('❌ Erro ao buscar balance após deduction:', balanceAfterErr);
  process.exit(1);
}

const expectedCredits = balance.servicos_creditos - DEDUCTION_AMOUNT;

console.log(`Créditos esperados: ${expectedCredits}`);
console.log(`Créditos (users table): ${userAfter.creditos_servicos}`);
console.log(`Créditos (balances table): ${balanceAfter.servicos_creditos}`);

const afterSync = userAfter.creditos_servicos === balanceAfter.servicos_creditos;
const correctDeduction = balanceAfter.servicos_creditos === expectedCredits;

console.log(`\nStatus após deduction: ${afterSync ? '✅ SYNC' : '❌ DESYNC'}`);
console.log(`Deduction correto: ${correctDeduction ? '✅ SIM' : '❌ NÃO'}`);

// ═══════════════════════════════════════════════════════════════
// PASSO 4: Restaurar créditos
// ═══════════════════════════════════════════════════════════════

console.log('\n\n📊 PASSO 4: Restaurar Créditos\n');

console.log(`Adicionando ${DEDUCTION_AMOUNT} créditos de volta...`);

const { data: restoreTxId, error: restoreErr } = await supabase.rpc('add_servicos_credits', {
  p_user_id: user.id,
  p_amount: DEDUCTION_AMOUNT,
  p_transaction_type: 'refund',
  p_description: 'Teste E2E - Restauração',
  p_admin_email: null,
  p_metadata: JSON.stringify({ 
    test: true, 
    restore: true,
    original_tx: txId 
  })
});

if (restoreErr) {
  console.error('❌ Erro ao restaurar créditos:', restoreErr);
  process.exit(1);
}

console.log(`✅ Créditos restaurados!`);
console.log(`Restore Transaction ID: ${restoreTxId}`);

// Aguardar trigger
await new Promise(resolve => setTimeout(resolve, 200));

// Verificar restauração
const { data: userFinal } = await supabase
  .from('users')
  .select('creditos_servicos')
  .eq('id', user.id)
  .single();

const { data: balanceFinal } = await supabase
  .from('duaia_user_balances')
  .select('servicos_creditos')
  .eq('user_id', user.id)
  .single();

console.log(`\nCréditos finais (users): ${userFinal.creditos_servicos}`);
console.log(`Créditos finais (balances): ${balanceFinal.servicos_creditos}`);

const finalSync = userFinal.creditos_servicos === balanceFinal.servicos_creditos;
const restoredCorrectly = balanceFinal.servicos_creditos === balance.servicos_creditos;

console.log(`Status final: ${finalSync ? '✅ SYNC' : '❌ DESYNC'}`);
console.log(`Restauração correta: ${restoredCorrectly ? '✅ SIM' : '❌ NÃO'}`);

// ═══════════════════════════════════════════════════════════════
// RESULTADO FINAL
// ═══════════════════════════════════════════════════════════════

console.log('\n\n' + '═'.repeat(70));
console.log('📋 RESULTADO DO TESTE E2E - DEDUCTION FLOW');
console.log('═'.repeat(70) + '\n');

const allPassed = initialSync && afterSync && correctDeduction && finalSync && restoredCorrectly;

if (allPassed) {
  console.log('✅ TODOS OS TESTES PASSARAM!\n');
  console.log('✅ Sincronização inicial: OK');
  console.log('✅ Deduction via RPC: OK');
  console.log('✅ Trigger automático (balances → users): OK');
  console.log('✅ Valores corretos após deduction: OK');
  console.log('✅ Restauração de créditos: OK');
  console.log('✅ Sincronização final: OK');
  console.log('\n🎯 SISTEMA DE CRÉDITOS 100% FUNCIONAL!');
} else {
  console.log('❌ ALGUNS TESTES FALHARAM!\n');
  if (!initialSync) console.log('❌ Sincronização inicial falhou');
  if (!correctDeduction) console.log('❌ Deduction incorreto');
  if (!afterSync) console.log('❌ Trigger não sincronizou após deduction');
  if (!finalSync) console.log('❌ Sincronização final falhou');
  if (!restoredCorrectly) console.log('❌ Restauração incorreta');
}

console.log('\n' + '═'.repeat(70) + '\n');

process.exit(allPassed ? 0 : 1);
