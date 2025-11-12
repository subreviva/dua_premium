#!/usr/bin/env node

/**
 * Debug: Investigar problema na RPC mark_invite_code_as_used
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('🔍 DEBUG: Investigando RPC mark_invite_code_as_used\n');

// Pegar user real
const { data: testUser } = await supabase
  .from('users')
  .select('id, email')
  .limit(1)
  .single();

console.log(`User de teste: ${testUser.email} (${testUser.id})\n`);

// Criar código
const testCode = `DEBUG-${Date.now().toString(36).toUpperCase()}`;

await supabase.from('invite_codes').insert({ code: testCode, active: true });
console.log(`✅ Código criado: ${testCode}\n`);

// === TENTATIVA 1: Marcar como usado ===
console.log('═'.repeat(60));
console.log('TENTATIVA 1: User1 marca código');
console.log('═'.repeat(60));

const result1 = await supabase.rpc('mark_invite_code_as_used', {
  p_code: testCode,
  p_user_id: testUser.id
});

console.log('Resultado:',  JSON.stringify(result1.data, null, 2));

// Verificar estado do código
const { data: afterFirst } = await supabase
  .from('invite_codes')
  .select('*')
  .eq('code', testCode)
  .single();

console.log('\nEstado do código após tentativa 1:');
console.log(`  active: ${afterFirst.active}`);
console.log(`  used_by: ${afterFirst.used_by}`);
console.log(`  used_at: ${afterFirst.used_at}`);

// === TENTATIVA 2: Tentar reusar (deve falhar) ===
console.log('\n' + '═'.repeat(60));
console.log('TENTATIVA 2: User1 tenta usar NOVAMENTE (deve falhar)');
console.log('═'.repeat(60));

const result2 = await supabase.rpc('mark_invite_code_as_used', {
  p_code: testCode,
  p_user_id: testUser.id
});

console.log('Resultado:', JSON.stringify(result2.data, null, 2));

// Verificar estado do código
const { data: afterSecond } = await supabase
  .from('invite_codes')
  .select('*')
  .eq('code', testCode)
  .single();

console.log('\nEstado do código após tentativa 2:');
console.log(`  active: ${afterSecond.active}`);
console.log(`  used_by: ${afterSecond.used_by}`);
console.log(`  used_at: ${afterSecond.used_at}`);

// Comparar
if (afterFirst.used_at === afterSecond.used_at) {
  console.log('\n✅ CORRETO: used_at não mudou (código não foi reusado)');
} else {
  console.log('\n❌ PROBLEMA: used_at mudou (código foi marcado novamente!)');
}

if (result2.data?.success === false) {
  console.log('✅ CORRETO: RPC retornou success: false');
} else {
  console.log('❌ PROBLEMA: RPC retornou success: true (deveria ser false)');
}

// Limpar
await supabase.from('invite_codes').delete().eq('code', testCode);
console.log(`\n🧹 Código ${testCode} removido`);
