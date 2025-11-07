#!/usr/bin/env node
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║       DIAGNÓSTICO COMPLETO - ERRO DE PERMISSÕES             ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// Test 1: Variáveis de ambiente
console.log('📋 1. VARIÁVEIS DE AMBIENTE\n');
console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL ? '✓ Configurada' : '✗ Faltando'}`);
console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${ANON_KEY ? '✓ Configurada' : '✗ Faltando'}`);
console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${SERVICE_KEY ? '✓ Configurada' : '✗ Faltando'}`);

if (!SUPABASE_URL || !ANON_KEY || !SERVICE_KEY) {
  console.log('\n❌ ERRO: Variáveis de ambiente não configuradas');
  process.exit(1);
}

console.log(`\n   URL: ${SUPABASE_URL}`);

// Test 2: Login e verificação com ANON_KEY (simula browser)
console.log('\n🔐 2. SIMULAÇÃO DE LOGIN BROWSER (ANON_KEY)\n');

const browserClient = createClient(SUPABASE_URL, ANON_KEY);

try {
  const { data: loginData, error: loginError } = await browserClient.auth.signInWithPassword({
    email: 'estraca@2lados.pt',
    password: 'lumiarbcv'
  });

  if (loginError) {
    console.log(`   ✗ Login falhou: ${loginError.message}`);
  } else {
    console.log(`   ✓ Login bem-sucedido: ${loginData.user.email}`);
    
    // ESTE É O PONTO CRÍTICO - Simula o código em app/login/page.tsx
    console.log('\n   📊 Tentando query na tabela users (como no código)...\n');
    
    const { data: userData, error: userError } = await browserClient
      .from('users')
      .select('has_access, name')
      .eq('id', loginData.user.id)
      .single();

    if (userError) {
      console.log(`   ❌ ERRO CRÍTICO: Query falhou`);
      console.log(`      Código: ${userError.code}`);
      console.log(`      Mensagem: ${userError.message}`);
      console.log(`      Detalhes: ${userError.details || 'N/A'}`);
      console.log(`      Hint: ${userError.hint || 'N/A'}`);
      
      if (userError.code === 'PGRST116') {
        console.log('\n   💡 DIAGNÓSTICO: Row Level Security (RLS) bloqueando acesso');
        console.log('      O user autenticado não tem permissão para ler a tabela users');
      } else if (userError.code === '42501') {
        console.log('\n   💡 DIAGNÓSTICO: Permissão insuficiente');
        console.log('      RLS policies não permitem leitura da própria linha');
      }
    } else {
      console.log(`   ✓ Query bem-sucedida`);
      console.log(`      has_access: ${userData.has_access}`);
      console.log(`      name: ${userData.name}`);
    }
    
    await browserClient.auth.signOut();
  }
} catch (err) {
  console.log(`   ❌ Erro inesperado: ${err.message}`);
}

// Test 3: Verificar RLS policies com SERVICE_KEY
console.log('\n🛡️  3. VERIFICAÇÃO RLS POLICIES (SERVICE_KEY)\n');

const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

try {
  // Listar users
  const { data: users, error: usersError } = await adminClient
    .from('users')
    .select('id, email, has_access')
    .limit(5);

  if (usersError) {
    console.log(`   ✗ Não foi possível listar users: ${usersError.message}`);
  } else {
    console.log(`   ✓ Tabela users acessível via SERVICE_KEY`);
    console.log(`   Total de users: ${users.length}`);
  }

  // Test: Tentar query como se fosse o user (RLS)
  console.log('\n   📝 Testando RLS policy para leitura própria...\n');
  
  const { data: authUsers } = await adminClient.auth.admin.listUsers();
  const testUser = authUsers.users.find(u => u.email === 'estraca@2lados.pt');
  
  if (testUser) {
    // Simular query com RLS (sem SERVICE_KEY bypass)
    const regularClient = createClient(SUPABASE_URL, ANON_KEY);
    const { error: signInError } = await regularClient.auth.signInWithPassword({
      email: 'estraca@2lados.pt',
      password: 'lumiarbcv'
    });
    
    if (!signInError) {
      const { data: rlsTest, error: rlsError } = await regularClient
        .from('users')
        .select('has_access')
        .eq('id', testUser.id)
        .single();
      
      if (rlsError) {
        console.log(`   ❌ RLS bloqueou acesso: ${rlsError.code} - ${rlsError.message}`);
        console.log('\n   🔧 SOLUÇÃO NECESSÁRIA:');
        console.log('      Criar RLS policy: CREATE POLICY "Users can read own data"');
        console.log('      ON public.users FOR SELECT');
        console.log('      USING (auth.uid() = id);');
      } else {
        console.log(`   ✓ RLS permite leitura própria`);
      }
      
      await regularClient.auth.signOut();
    }
  }

} catch (err) {
  console.log(`   ❌ Erro: ${err.message}`);
}

console.log('\n═══════════════════════════════════════════════════════════════\n');
console.log('✅ DIAGNÓSTICO COMPLETO\n');
console.log('Se viu "RLS bloqueou acesso", o problema é RLS policy faltando.\n');
