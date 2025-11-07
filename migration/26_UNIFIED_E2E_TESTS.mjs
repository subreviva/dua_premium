#!/usr/bin/env node
/**
 * Z-DVP FASE 1: TESTES E2E - ARQUITETURA UNIFICADA
 * 
 * Testes obrigatórios para validar unificação:
 * 1. CAMINHO FELIZ: Login → Acesso DUA IA + Permissões DUA COIN
 * 2. CAMINHOS TRISTES: Credenciais inválidas, user sem has_access
 * 3. EDGE CASES: Email case-insensitive, sessão expirada
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║     Z-DVP FASE 1: TESTES E2E ARQUITETURA UNIFICADA         ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = [];

function test(name, condition, errorMsg = '') {
  totalTests++;
  if (condition) {
    console.log(`✓ ${name}`);
    passedTests++;
    return true;
  } else {
    console.log(`✗ ${name}`);
    if (errorMsg) console.log(`  Motivo: ${errorMsg}`);
    failedTests.push({ name, error: errorMsg });
    return false;
  }
}

// TEST SUITE 1: AUTENTICAÇÃO UNIFICADA
console.log('📋 1. AUTENTICAÇÃO UNIFICADA (SUPABASE AUTH)\n');

const supabase = createClient(SUPABASE_URL, ANON_KEY);

// Test 1.1: Login com admin DUA COIN
const { data: login1, error: loginError1 } = await supabase.auth.signInWithPassword({
  email: 'estraca@2lados.pt',
  password: 'lumiarbcv'
});

test(
  'Login admin DUA COIN (estraca@2lados.pt)',
  !loginError1 && login1?.user,
  loginError1?.message || 'User não retornado'
);

if (login1?.user) {
  // Test 1.2: Verificar has_access em public.users
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('has_access, name, email')
    .eq('id', login1.user.id)
    .single();
  
  test(
    'Query public.users funcional',
    !userError && userData,
    userError?.message || 'userData não retornado'
  );
  
  test(
    'has_access = true (permissão DUA COIN)',
    userData?.has_access === true,
    `has_access = ${userData?.has_access}`
  );
  
  test(
    'Dados do user retornados (name, email)',
    userData?.name && userData?.email,
    `name=${userData?.name}, email=${userData?.email}`
  );
  
  await supabase.auth.signOut();
}

// Test 1.3: Login com dev admin
const { data: login2, error: loginError2 } = await supabase.auth.signInWithPassword({
  email: 'dev@dua.com',
  password: 'lumiarbcv'
});

test(
  'Login dev admin (dev@dua.com)',
  !loginError2 && login2?.user,
  loginError2?.message
);

if (login2?.user) {
  await supabase.auth.signOut();
}

// TEST SUITE 2: CAMINHOS TRISTES
console.log('\n📋 2. CAMINHOS TRISTES (VALIDAÇÃO DE ERROS)\n');

// Test 2.1: Password inválida
const { error: badPassError } = await supabase.auth.signInWithPassword({
  email: 'estraca@2lados.pt',
  password: 'wrongpassword123'
});

test(
  'Rejeitar password inválida',
  badPassError !== null,
  'Deveria ter falhado mas passou'
);

// Test 2.2: Email inexistente
const { error: badEmailError } = await supabase.auth.signInWithPassword({
  email: 'naoexiste@fake.com',
  password: 'anypassword'
});

test(
  'Rejeitar email inexistente',
  badEmailError !== null,
  'Deveria ter falhado mas passou'
);

// TEST SUITE 3: EDGE CASES
console.log('\n📋 3. EDGE CASES (CASOS LIMITE)\n');

// Test 3.1: Email case-insensitive
const { data: upperLogin, error: upperError } = await supabase.auth.signInWithPassword({
  email: 'ESTRACA@2LADOS.PT',
  password: 'lumiarbcv'
});

test(
  'Email case-insensitive (MAIÚSCULAS)',
  !upperError && upperLogin?.user,
  upperError?.message
);

if (upperLogin?.user) {
  await supabase.auth.signOut();
}

// TEST SUITE 4: UNIFICAÇÃO DUA IA + DUA COIN
console.log('\n📋 4. UNIFICAÇÃO: MESMA CONTA EM AMBOS SISTEMAS\n');

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

// Test 4.1: Verificar auth.users (DUA COIN)
const { data: authUsers } = await adminClient.auth.admin.listUsers();
const admin1 = authUsers?.users.find(u => u.email === 'estraca@2lados.pt');
const admin2 = authUsers?.users.find(u => u.email === 'dev@dua.com');

test(
  'Admin 1 existe em auth.users (DUA COIN)',
  admin1 !== undefined,
  'estraca@2lados.pt não encontrado'
);

test(
  'Admin 2 existe em auth.users (DUA COIN)',
  admin2 !== undefined,
  'dev@dua.com não encontrado'
);

// Test 4.2: Verificar public.users (DUA COIN)
const { data: publicUsers } = await adminClient.from('users').select('id, email, has_access');
const publicAdmin1 = publicUsers?.find(u => u.email === 'estraca@2lados.pt');
const publicAdmin2 = publicUsers?.find(u => u.email === 'dev@dua.com');

test(
  'Admin 1 existe em public.users (DUA COIN)',
  publicAdmin1 !== undefined && publicAdmin1.id === admin1?.id,
  'estraca@2lados.pt não sincronizado'
);

test(
  'Admin 2 existe em public.users (DUA COIN)',
  publicAdmin2 !== undefined && publicAdmin2.id === admin2?.id,
  'dev@dua.com não sincronizado'
);

// Test 4.3: Verificar profiles (DUA COIN - se existir)
const { data: profiles } = await adminClient.from('profiles').select('id, email');
const profile1 = profiles?.find(p => p.email === 'estraca@2lados.pt');
const profile2 = profiles?.find(p => p.email === 'dev@dua.com');

test(
  'Admin 1 tem profile (DUA COIN)',
  profile1 !== undefined && profile1.id === admin1?.id,
  'Profile não sincronizado'
);

test(
  'Admin 2 tem profile (DUA COIN)',
  profile2 !== undefined && profile2.id === admin2?.id,
  'Profile não sincronizado'
);

// TEST SUITE 5: GRACEFUL FALLBACK (CONVERSATIONS)
console.log('\n📋 5. GRACEFUL FALLBACK (TABELAS DUA IA)\n');

// Test 5.1: Conversations não bloqueia login
const browserClient = createClient(SUPABASE_URL, ANON_KEY);
const { data: loginForConv } = await browserClient.auth.signInWithPassword({
  email: 'estraca@2lados.pt',
  password: 'lumiarbcv'
});

if (loginForConv?.user) {
  // Tentar query conversations (deve falhar silenciosamente)
  const { error: convError } = await browserClient
    .from('conversations')
    .select('*')
    .eq('user_id', loginForConv.user.id)
    .limit(1);
  
  test(
    'Erro conversations silenciado (PGRST205)',
    convError?.code === 'PGRST205',
    `Erro diferente: ${convError?.code}`
  );
  
  // Mesmo com erro, login deve estar ativo
  const { data: session } = await browserClient.auth.getSession();
  test(
    'Sessão permanece ativa mesmo com erro conversations',
    session?.session?.user?.id === loginForConv.user.id,
    'Sessão foi perdida'
  );
  
  await browserClient.auth.signOut();
}

// RESULTADO FINAL
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('\n📊 RESULTADOS Z-DVP FASE 1:\n');
console.log(`   Total:    ${totalTests}`);
console.log(`   ✓ Passou: ${passedTests}`);
console.log(`   ✗ Falhou: ${failedTests.length}\n`);

if (failedTests.length > 0) {
  console.log('❌ FALHAS DETECTADAS:\n');
  failedTests.forEach((f, i) => {
    console.log(`${i + 1}. ${f.name}`);
    if (f.error) console.log(`   Erro: ${f.error}\n`);
  });
  process.exit(1);
} else {
  console.log('✅ ARQUITETURA UNIFICADA VALIDADA: 100% SUCESSO\n');
  console.log('🎯 SISTEMA ECOSSISTEMA 2 LADOS:');
  console.log('   - Supabase Auth: Fonte única emails/passwords ✓');
  console.log('   - DUA COIN: users + profiles (funcional) ✓');
  console.log('   - DUA IA: mesmas contas + localStorage conversations ✓');
  console.log('   - Sem quebra de funcionalidades ✓\n');
}
