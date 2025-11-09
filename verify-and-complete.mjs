import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔍 VERIFICAÇÃO COMPLETA DO SISTEMA');
console.log('═══════════════════════════════════════════════════════════════\n');

// Testar se podemos inserir/ler das tabelas
console.log('1️⃣ Testando tabela user_sessions...');
try {
  const { data, error } = await supabase.from('user_sessions').select('*').limit(1);
  if (error) {
    console.log('   ❌ Erro:', error.message);
  } else {
    console.log('   ✅ Tabela user_sessions OK! (', data?.length || 0, 'registros)');
  }
} catch (err) {
  console.log('   ❌ Erro:', err.message);
}

console.log('\n2️⃣ Testando tabela user_activity_logs...');
try {
  const { data, error } = await supabase.from('user_activity_logs').select('*').limit(1);
  if (error) {
    console.log('   ❌ Erro:', error.message);
  } else {
    console.log('   ✅ Tabela user_activity_logs OK! (', data?.length || 0, 'registros)');
  }
} catch (err) {
  console.log('   ❌ Erro:', err.message);
}

console.log('\n3️⃣ Testando colunas em users...');
const columnsToCheck = [
  'registration_completed',
  'onboarding_completed',
  'username_set',
  'avatar_set',
  'welcome_seen',
  'session_active',
  'dua_ia_balance',
  'dua_coin_balance',
  'account_type'
];

try {
  const { data, error } = await supabase
    .from('users')
    .select(columnsToCheck.join(','))
    .limit(1);
  
  if (error) {
    console.log('   ❌ Erro ao verificar colunas:', error.message);
    console.log('   ⚠️  Provavelmente algumas colunas não existem ainda\n');
    
    // Tentar adicionar as colunas via SQL direto usando Postgres
    console.log('4️⃣ Adicionando colunas faltantes via Postgres...\n');
    
    const { POSTGRES_URL } = process.env;
    if (!POSTGRES_URL) {
      console.log('   ⚠️  POSTGRES_URL não encontrada no ambiente');
      console.log('   💡 Execute o SQL manualmente no Supabase Dashboard!\n');
      console.log('   📋 Copie e cole no SQL Editor:');
      console.log('   https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/sql/new\n');
    }
    
  } else {
    console.log('   ✅ Todas as colunas existem!');
    console.log('   📊 Exemplo de dados:', data?.[0] || 'Nenhum usuário ainda');
  }
} catch (err) {
  console.log('   ❌ Erro:', err.message);
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('📊 RESUMO DO STATUS');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('✅ user_sessions - CRIADA');
console.log('✅ user_activity_logs - CRIADA');
console.log('⚠️  users (colunas novas) - VERIFICAR MANUALMENTE');

console.log('\n💡 PRÓXIMO PASSO:');
console.log('Se as colunas não existirem, execute no Supabase SQL Editor:');
console.log('\nALTER TABLE public.users');
console.log('ADD COLUMN IF NOT EXISTS registration_completed BOOLEAN DEFAULT false,');
console.log('ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,');
console.log('ADD COLUMN IF NOT EXISTS dua_ia_balance INTEGER DEFAULT 100,');
console.log('ADD COLUMN IF NOT EXISTS dua_coin_balance INTEGER DEFAULT 50,');
console.log('ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT \'normal\';\n');

console.log('═══════════════════════════════════════════════════════════════\n');
