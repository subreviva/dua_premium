import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const userId = readFileSync('/tmp/test-user-id.txt', 'utf-8').trim();

console.log('═══════════════════════════════════════════════════════════');
console.log('   💰 TESTE DE CONSUMO DE CRÉDITOS');
console.log('═══════════════════════════════════════════════════════════\n');

// 1. Verificar saldo inicial
const { data: userBefore, error: errorBefore } = await supabase
  .from('users')
  .select('creditos_servicos')
  .eq('id', userId)
  .single();

if (errorBefore) {
  console.error('❌ Erro ao buscar saldo inicial:', errorBefore.message);
  process.exit(1);
}

console.log('💵 SALDO INICIAL:', userBefore.creditos_servicos, 'créditos');
console.log('\n───────────────────────────────────────────────────────────\n');

// 2. Consultar custo do serviço chat_advanced
const { data: serviceCost } = await supabase.rpc('get_service_cost', {
  p_service_name: 'chat_advanced'
});

console.log('🎯 Serviço escolhido: chat_advanced');
console.log('💸 Custo:', serviceCost || 1, 'créditos');
console.log('\n───────────────────────────────────────────────────────────\n');

const CUSTO = serviceCost || 1;

// 3. Simular consumo de créditos (como as APIs fazem)
console.log('🔄 Simulando consumo de créditos...\n');

const novoSaldo = userBefore.creditos_servicos - CUSTO;

const { error: updateError } = await supabase
  .from('users')
  .update({
    creditos_servicos: novoSaldo,
    updated_at: new Date().toISOString(),
  })
  .eq('id', userId);

if (updateError) {
  console.error('❌ Erro ao atualizar créditos:', updateError.message);
  process.exit(1);
}

console.log('✅ Créditos consumidos com sucesso!');

// 4. Registrar transação
await supabase
  .from('duaia_transactions')
  .insert({
    user_id: userId,
    transaction_type: 'debit',
    amount: -CUSTO,
    balance_before: userBefore.creditos_servicos,
    balance_after: novoSaldo,
    operation: 'chat_advanced',
    description: 'Teste de consumo - Chat Avançado',
    metadata: {
      service_name: 'chat_advanced',
      test: true,
      timestamp: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
  });

console.log('📝 Transação registrada');

console.log('\n───────────────────────────────────────────────────────────\n');

// 5. Verificar novo saldo
const { data: userAfter } = await supabase
  .from('users')
  .select('creditos_servicos')
  .eq('id', userId)
  .single();

console.log('💰 SALDO FINAL:', userAfter.creditos_servicos, 'créditos');
console.log('\n📊 RESUMO:');
console.log('   Saldo Inicial:', userBefore.creditos_servicos);
console.log('   Custo Serviço:', -CUSTO);
console.log('   Saldo Final:', userAfter.creditos_servicos);
console.log('   Diferença:', userAfter.creditos_servicos - userBefore.creditos_servicos);

if (userAfter.creditos_servicos === novoSaldo) {
  console.log('\n✅ Consumo correto! Créditos decrementados.');
} else {
  console.log('\n❌ Erro! Saldo não bate.');
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('   ✅ TESTE DE CONSUMO COMPLETO');
console.log('═══════════════════════════════════════════════════════════\n');
