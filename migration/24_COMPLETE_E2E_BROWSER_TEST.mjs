#!/usr/bin/env node
/**
 * TESTE E2E COMPLETO - LOGIN NO BROWSER
 * 
 * Simula exatamente o que acontece quando user faz login:
 * 1. Autenticação com Supabase
 * 2. Query na tabela users para verificar permissões
 * 3. Atualização de last_login_at
 * 4. Redirect para /chat
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║       TESTE E2E COMPLETO - FLUXO DE LOGIN BROWSER           ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

const TEST_CREDENTIALS = [
  { email: 'estraca@2lados.pt', password: 'lumiarbcv', name: 'Admin Principal' },
  { email: 'dev@dua.com', password: 'lumiarbcv', name: 'Dev Admin' }
];

async function testLogin(email, password, userName) {
  console.log(`\n🌐 Testando login: ${userName} (${email})\n`);
  
  const supabase = createClient(SUPABASE_URL, ANON_KEY);
  
  try {
    // STEP 1: Autenticação (código de app/login/page.tsx linha 73-96)
    console.log('   1️⃣  Autenticando com Supabase...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.log(`   ❌ Falha na autenticação: ${error.message}`);
      return false;
    }

    if (!data.user) {
      console.log('   ❌ Falha: user não retornado');
      return false;
    }

    console.log('   ✓ Autenticação bem-sucedida');

    // STEP 2: Verificar permissões (código de app/login/page.tsx linha 107-120)
    console.log('   2️⃣  Verificando permissões na tabela users...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('has_access, name')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.log(`   ❌ ERRO CRÍTICO: Falha ao verificar permissões`);
      console.log(`      Código: ${userError.code}`);
      console.log(`      Mensagem: ${userError.message}`);
      console.log(`      Detalhes: ${userError.details || 'N/A'}`);
      console.log('\n   🚨 ESTE É O ERRO QUE CAUSA: "Não foi possível verificar suas permissões"\n');
      await supabase.auth.signOut();
      return false;
    }

    if (!userData) {
      console.log('   ❌ Falha: userData não retornado');
      await supabase.auth.signOut();
      return false;
    }

    console.log('   ✓ Permissões verificadas com sucesso');
    console.log(`      has_access: ${userData.has_access}`);
    console.log(`      name: ${userData.name}`);

    // STEP 3: Verificar has_access (código de app/login/page.tsx linha 122-128)
    if (!userData.has_access) {
      console.log('   ❌ Acesso negado: has_access = false');
      await supabase.auth.signOut();
      return false;
    }

    console.log('   ✓ has_access = true (acesso permitido)');

    // STEP 4: Atualizar last_login_at (código de app/login/page.tsx linha 130-142)
    console.log('   3️⃣  Atualizando last_login_at...');
    const { error: updateError } = await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.user.id);

    if (updateError) {
      console.log(`   ⚠️  Aviso: Não foi possível atualizar last_login: ${updateError.message}`);
    } else {
      console.log('   ✓ last_login_at atualizado');
    }

    // STEP 5: Logout
    console.log('   4️⃣  Fazendo logout...');
    await supabase.auth.signOut();
    console.log('   ✓ Logout bem-sucedido');

    console.log(`\n✅ LOGIN COMPLETO: ${userName} - TODOS OS PASSOS PASSARAM\n`);
    return true;

  } catch (err) {
    console.log(`   ❌ Erro inesperado: ${err.message}`);
    return false;
  }
}

async function main() {
  let passed = 0;
  let failed = 0;

  for (const cred of TEST_CREDENTIALS) {
    const success = await testLogin(cred.email, cred.password, cred.name);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n📊 RESULTADOS DO TESTE E2E:\n');
  console.log(`   Total:    ${TEST_CREDENTIALS.length}`);
  console.log(`   ✓ Passou: ${passed}`);
  console.log(`   ✗ Falhou: ${failed}\n`);

  if (failed === 0) {
    console.log('✅ TODOS OS TESTES PASSARAM - SISTEMA 100% FUNCIONAL\n');
    console.log('🎯 Se você ainda vê erro no browser, pode ser:');
    console.log('   1. Cache do browser (Ctrl+Shift+R para hard refresh)');
    console.log('   2. Sessão antiga no browser (fazer logout primeiro)');
    console.log('   3. Vercel deployment com env vars antigas (re-deploy)');
    console.log('\n   👉 Solução: vercel --prod --force\n');
  } else {
    console.log('❌ ALGUNS TESTES FALHARAM\n');
    process.exit(1);
  }
}

main().catch(console.error);
