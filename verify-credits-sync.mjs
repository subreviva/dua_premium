#!/usr/bin/env node

/**
 * Verificação rápida: sincronização de créditos
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('🔍 Verificando sincronização de créditos...\n');

// Pegar usuários de teste
const { data: users, error: usersErr } = await supabase
  .from('users')
  .select('id, email, creditos_servicos')
  .in('email', [
    'carlosamigodomiguel@gmail.com',
    'tiagolucena@gmail.com',
    'estraca@2lados.pt',
    'dev@dua.com'
  ]);

if (usersErr) {
  console.error('❌ Erro ao buscar users:', usersErr);
  process.exit(1);
}

// Pegar balances
const { data: balances, error: balancesErr } = await supabase
  .from('duaia_user_balances')
  .select('user_id, servicos_creditos')
  .in('user_id', users.map(u => u.id));

if (balancesErr) {
  console.error('❌ Erro ao buscar balances:', balancesErr);
  process.exit(1);
}

// Merge e comparar
const results = users.map(u => {
  const balance = balances.find(b => b.user_id === u.id);
  const isSync = u.creditos_servicos === balance?.servicos_creditos;
  
  return {
    email: u.email,
    users_credits: u.creditos_servicos,
    balances_credits: balance?.servicos_creditos || 'N/A',
    status: isSync ? '✅ SYNC' : '❌ DESYNC'
  };
});

console.table(results);

const allSync = results.every(r => r.status === '✅ SYNC');

console.log('\n' + '═'.repeat(70));
if (allSync) {
  console.log('✅ SUCESSO! Todas as tabelas estão sincronizadas!');
  console.log('✅ SQL triggers foram aplicados corretamente!');
} else {
  console.log('⚠️  Algumas tabelas ainda não estão sincronizadas.');
  console.log('ℹ️  Isso pode significar que os triggers ainda não executaram.');
}
console.log('═'.repeat(70) + '\n');

process.exit(allSync ? 0 : 1);
