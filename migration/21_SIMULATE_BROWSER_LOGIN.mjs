#!/usr/bin/env node
/**
 * TESTE FINAL: Login manual simulado via browser
 * Simula exatamente o fluxo da página /login
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║       SIMULAÇÃO DE LOGIN MANUAL (FLUXO BROWSER)             ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

async function simulateLogin(email, password) {
  console.log(`\n🌐 Simulando login: ${email}\n`);
  
  // Criar client exatamente como na página
  const supabase = createClient(supabaseUrl, anonKey);
  
  // 1. Validação client-side (como no form)
  if (!email || !email.includes("@")) {
    console.log('  ✗ Validação falhou: Email inválido');
    return false;
  }
  
  if (!password || password.length < 6) {
    console.log('  ✗ Validação falhou: Password deve ter no mínimo 6 caracteres');
    return false;
  }
  
  console.log('  ✓ Validação client-side passou');
  
  // 2. Login com Supabase Auth (exatamente como app/login/page.tsx)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase(),
    password: password,
  });
  
  if (error) {
    const errorMessage = error.message === "Invalid login credentials" 
      ? "Email ou password incorretos" 
      : error.message;
    console.log(`  ✗ Autenticação falhou: ${errorMessage}`);
    return false;
  }
  
  if (!data.user) {
    console.log('  ✗ Nenhum usuário retornado');
    return false;
  }
  
  console.log(`  ✓ Autenticação bem-sucedida: ${data.user.email}`);
  
  // 3. Verificar has_access (como na página)
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('has_access, name')
    .eq('id', data.user.id)
    .single();
  
  if (userError || !userData) {
    console.log(`  ✗ Erro ao verificar permissões: ${userError?.message || 'userData null'}`);
    await supabase.auth.signOut();
    return false;
  }
  
  console.log(`  ✓ Dados do usuário encontrados`);
  console.log(`    - has_access: ${userData.has_access}`);
  console.log(`    - name: ${userData.name || 'null'}`);
  
  if (!userData.has_access) {
    console.log('  ✗ Acesso negado: has_access=false');
    await supabase.auth.signOut();
    return false;
  }
  
  console.log('  ✓ Permissão de acesso verificada');
  
  // 4. Simular update de last_login
  await supabase
    .from('users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', data.user.id);
  
  console.log('  ✓ last_login_at atualizado');
  
  // 5. Logout
  await supabase.auth.signOut();
  console.log('  ✓ Logout bem-sucedido');
  
  console.log(`\n✅ LOGIN COMPLETO SIMULADO COM SUCESSO: ${email}\n`);
  return true;
}

async function main() {
  const scenarios = [
    { email: 'estraca@2lados.pt', password: 'lumiarbcv' },
    { email: 'dev@dua.com', password: 'lumiarbcv' },
    { email: 'ESTRACA@2LADOS.PT', password: 'lumiarbcv' }, // Uppercase test
  ];
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const scenario of scenarios) {
    totalTests++;
    const success = await simulateLogin(scenario.email, scenario.password);
    if (success) passedTests++;
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n📊 RESULTADOS DA SIMULAÇÃO:\n');
  console.log(`   Total:    ${totalTests}`);
  console.log(`   ✓ Passou: ${passedTests}`);
  console.log(`   ✗ Falhou: ${totalTests - passedTests}\n`);
  
  if (passedTests === totalTests) {
    console.log('✅ TODOS OS LOGINS FUNCIONAM PERFEITAMENTE\n');
    console.log('🎯 Sistema pronto para uso em produção\n');
    process.exit(0);
  } else {
    console.log('❌ ALGUNS LOGINS FALHARAM\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('❌ ERRO FATAL:', err);
  process.exit(1);
});
