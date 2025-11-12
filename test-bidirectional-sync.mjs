#!/usr/bin/env node

/**
 * Teste E2E: Sincronização Bidirecional (users → balances)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('🧪 TESTE E2E: Sincronização Bidirecional (users → balances)\n');
console.log('═'.repeat(70));

const TEST_EMAIL = 'dev@dua.com';
const TEST_VALUE = 8888; // Valor único para testar

// ═══════════════════════════════════════════════════════════════
// PASSO 1: Pegar estado inicial
// ═══════════════════════════════════════════════════════════════

console.log('\n📊 PASSO 1: Estado Inicial\n');

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
console.log(`Créditos iniciais (users): ${user.creditos_servicos}`);
console.log(`Créditos iniciais (balances): ${balance.servicos_creditos}`);

const originalCredits = user.creditos_servicos;

// ═══════════════════════════════════════════════════════════════
// PASSO 2: Update manual em users (simular admin panel)
// ═══════════════════════════════════════════════════════════════

console.log('\n\n📊 PASSO 2: Update Manual em users\n');

console.log(`Alterando créditos para ${TEST_VALUE} (via users table)...`);

const { error: updateErr } = await supabase
  .from('users')
  .update({ creditos_servicos: TEST_VALUE })
  .eq('id', user.id);

if (updateErr) {
  console.error('❌ Erro ao atualizar users:', updateErr);
  process.exit(1);
}

console.log('✅ Users table atualizada com sucesso!');

// Aguardar trigger executar (200ms)
console.log('\nAguardando trigger bidirecional executar (200ms)...');
await new Promise(resolve => setTimeout(resolve, 200));

// ═══════════════════════════════════════════════════════════════
// PASSO 3: Verificar sincronização em balances
// ═══════════════════════════════════════════════════════════════

console.log('\n\n📊 PASSO 3: Verificar Sincronização em balances\n');

const { data: balanceAfter, error: balanceAfterErr } = await supabase
  .from('duaia_user_balances')
  .select('servicos_creditos')
  .eq('user_id', user.id)
  .single();

if (balanceAfterErr) {
  console.error('❌ Erro ao buscar balance após update:', balanceAfterErr);
  process.exit(1);
}

console.log(`Créditos esperados em balances: ${TEST_VALUE}`);
console.log(`Créditos reais em balances: ${balanceAfter.servicos_creditos}`);

const triggerWorked = balanceAfter.servicos_creditos === TEST_VALUE;

console.log(`\nTrigger bidirecional (users → balances): ${triggerWorked ? '✅ FUNCIONOU' : '❌ FALHOU'}`);

// ═══════════════════════════════════════════════════════════════
// PASSO 4: Restaurar valor original
// ═══════════════════════════════════════════════════════════════

console.log('\n\n📊 PASSO 4: Restaurar Valor Original\n');

console.log(`Restaurando créditos para ${originalCredits}...`);

const { error: restoreErr } = await supabase
  .from('users')
  .update({ creditos_servicos: originalCredits })
  .eq('id', user.id);

if (restoreErr) {
  console.error('❌ Erro ao restaurar users:', restoreErr);
  process.exit(1);
}

// Aguardar trigger
await new Promise(resolve => setTimeout(resolve, 200));

// Verificar restauração
const { data: balanceFinal } = await supabase
  .from('duaia_user_balances')
  .select('servicos_creditos')
  .eq('user_id', user.id)
  .single();

const { data: userFinal } = await supabase
  .from('users')
  .select('creditos_servicos')
  .eq('id', user.id)
  .single();

console.log(`Créditos finais (users): ${userFinal.creditos_servicos}`);
console.log(`Créditos finais (balances): ${balanceFinal.servicos_creditos}`);

const restored = balanceFinal.servicos_creditos === originalCredits;
const finalSync = userFinal.creditos_servicos === balanceFinal.servicos_creditos;

console.log(`Restauração: ${restored ? '✅ OK' : '❌ FALHOU'}`);
console.log(`Sincronização final: ${finalSync ? '✅ OK' : '❌ FALHOU'}`);

// ═══════════════════════════════════════════════════════════════
// RESULTADO FINAL
// ═══════════════════════════════════════════════════════════════

console.log('\n\n' + '═'.repeat(70));
console.log('📋 RESULTADO DO TESTE - SINCRONIZAÇÃO BIDIRECIONAL');
console.log('═'.repeat(70) + '\n');

const allPassed = triggerWorked && restored && finalSync;

if (allPassed) {
  console.log('✅ TODOS OS TESTES PASSARAM!\n');
  console.log('✅ Update manual em users: OK');
  console.log('✅ Trigger bidirecional (users → balances): OK');
  console.log('✅ Sincronização automática: OK');
  console.log('✅ Restauração: OK');
  console.log('\n🎯 TRIGGERS BIDIRECIONAIS 100% FUNCIONAIS!');
} else {
  console.log('❌ ALGUNS TESTES FALHARAM!\n');
  if (!triggerWorked) console.log('❌ Trigger bidirecional não funcionou');
  if (!restored) console.log('❌ Restauração falhou');
  if (!finalSync) console.log('❌ Sincronização final falhou');
}

console.log('\n' + '═'.repeat(70) + '\n');

process.exit(allPassed ? 0 : 1);
