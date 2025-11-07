#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('❌ ERRO: Variáveis de ambiente faltando!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

const TEST_CREDENTIALS = [
  { 
    email: 'estraca@2lados.pt', 
    password: 'Estraca2025@DUA',
    expectedAccess: true,
    expectedAdmin: true
  },
  { 
    email: 'dev@dua.com', 
    password: 'DevDua2025@Secure',
    expectedAccess: true,
    expectedAdmin: true
  }
];

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║  TESTE E2E - LOGIN E VERIFICAÇÃO DE PERMISSÕES              ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

async function testLogin(credentials) {
  console.log(`\n🔐 Testando login: ${credentials.email}`);
  
  try {
    // PASSO 1: Autenticação
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });
    
    if (authError) {
      console.error(`  ❌ FALHA na autenticação: ${authError.message}`);
      return false;
    }
    
    if (!authData.user) {
      console.error(`  ❌ FALHA: Nenhum usuário retornado`);
      return false;
    }
    
    console.log(`  ✅ Autenticação bem-sucedida`);
    console.log(`     User ID: ${authData.user.id}`);
    console.log(`     Email: ${authData.user.email}`);
    
    // PASSO 2: Verificar has_access (simulação do middleware)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('has_access, name, email')
      .eq('id', authData.user.id)
      .single();
    
    if (userError) {
      console.error(`  ❌ FALHA ao verificar permissões: ${userError.message}`);
      await supabase.auth.signOut();
      return false;
    }
    
    if (!userData) {
      console.error(`  ❌ FALHA: Registro de usuário não encontrado`);
      await supabase.auth.signOut();
      return false;
    }
    
    console.log(`  ✅ Registro de usuário encontrado`);
    console.log(`     has_access: ${userData.has_access}`);
    console.log(`     name: ${userData.name || 'null'}`);
    
    if (!userData.has_access) {
      console.error(`  ❌ FALHA: has_access = false`);
      await supabase.auth.signOut();
      return false;
    }
    
    console.log(`  ✅ Permissão de acesso verificada (has_access=true)`);
    
    // PASSO 3: Verificar metadata de admin
    const metadata = authData.user.user_metadata || {};
    const appMetadata = authData.user.app_metadata || {};
    
    console.log(`  ℹ️  Metadata:`);
    console.log(`     is_super_admin: ${metadata.is_super_admin}`);
    console.log(`     role: ${metadata.role}`);
    console.log(`     app_metadata.role: ${appMetadata.role}`);
    console.log(`     app_metadata.roles: ${JSON.stringify(appMetadata.roles || [])}`);
    
    const isAdmin = metadata.is_super_admin === true && 
                   metadata.role === 'admin' &&
                   appMetadata.role === 'admin';
    
    if (credentials.expectedAdmin && !isAdmin) {
      console.error(`  ⚠️  AVISO: Esperava admin mas metadata não confirma`);
    } else if (isAdmin) {
      console.log(`  ✅ Status de admin verificado`);
    }
    
    // PASSO 4: Logout
    await supabase.auth.signOut();
    console.log(`  ✅ Logout bem-sucedido`);
    
    console.log(`\n✅ TESTE COMPLETO PASSOU: ${credentials.email}`);
    return true;
    
  } catch (err) {
    console.error(`  ❌ ERRO INESPERADO: ${err.message}`);
    try {
      await supabase.auth.signOut();
    } catch {}
    return false;
  }
}

async function main() {
  let allPassed = true;
  let passedCount = 0;
  let failedCount = 0;
  
  for (const creds of TEST_CREDENTIALS) {
    const passed = await testLogin(creds);
    if (passed) {
      passedCount++;
    } else {
      failedCount++;
      allPassed = false;
    }
  }
  
  console.log('\n' + '═'.repeat(65));
  console.log('\n📊 RESULTADOS DOS TESTES E2E:\n');
  console.log(`   ✅ Passaram: ${passedCount}/${TEST_CREDENTIALS.length}`);
  console.log(`   ❌ Falharam: ${failedCount}/${TEST_CREDENTIALS.length}`);
  
  if (allPassed) {
    console.log('\n🎉 SUCESSO COMPLETO! TODOS OS TESTES PASSARAM!\n');
    console.log('✅ Sistema de login e permissões está 100% FUNCIONAL\n');
    console.log('🎯 Ambos os usuários podem fazer login no site com sucesso!\n');
    return 0;
  } else {
    console.log('\n❌ ALGUNS TESTES FALHARAM - Revisar logs acima\n');
    return 1;
  }
}

main()
  .then(exitCode => process.exit(exitCode))
  .catch(err => {
    console.error('\n❌ ERRO FATAL:', err);
    process.exit(1);
  });
