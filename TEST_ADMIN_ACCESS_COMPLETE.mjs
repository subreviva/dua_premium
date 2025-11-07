#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nranmngyocaqjwcokcxm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzcxNTIsImV4cCI6MjA3NDE1MzE1Mn0.dFKTXrh2w8FOzcXndyjlVXP-jUaBUxkBZEWLd4UQeTU';

const ADMIN_EMAIL = 'estraca@2lados.pt';
const ADMIN_PASSWORD = 'lumiarbcv';

console.log('🧪 TESTE COMPLETO DE ACESSO ADMIN\n');
console.log('═'.repeat(70) + '\n');

async function testAdminAccess() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // 1. Login
    console.log('🔐 ETAPA 1: Login\n');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (loginError) {
      console.error('❌ Erro no login:', loginError.message);
      return;
    }

    console.log('✅ Login realizado com sucesso!');
    console.log(`   Email: ${loginData.user.email}`);
    console.log(`   ID: ${loginData.user.id}\n`);

    // 2. Verificar role no banco
    console.log('🔍 ETAPA 2: Verificar Role no Banco\n');

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, role, name')
      .eq('id', loginData.user.id)
      .single();

    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError.message);
      return;
    }

    console.log('✅ Dados do usuário:');
    console.log(`   Email: ${userData.email}`);
    console.log(`   Role: ${userData.role}`);
    console.log(`   Name: ${userData.name}`);
    
    const isAdmin = ['admin', 'super_admin'].includes(userData.role);
    console.log(`   É Admin? ${isAdmin ? '✅ SIM' : '❌ NÃO'}\n`);

    if (!isAdmin) {
      console.error('❌ Usuário não tem role de admin!');
      return;
    }

    // 3. Testar acesso a todos os usuários
    console.log('📊 ETAPA 3: Testar Acesso a Todos Usuários\n');

    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Erro ao listar usuários:', usersError.message);
      console.log('\n⚠️  PROBLEMA: RLS pode estar bloqueando acesso admin');
    } else {
      console.log(`✅ Listagem de usuários bem-sucedida!`);
      console.log(`   Total: ${allUsers.length} usuários\n`);
      
      console.log('📋 Usuários:');
      allUsers.forEach((u, i) => {
        const roleIcon = ['admin', 'super_admin'].includes(u.role) ? '👑' : '👤';
        console.log(`   ${i + 1}. ${roleIcon} ${u.email} (${u.role})`);
      });
    }

    // 4. Testar função is_admin() via RPC
    console.log('\n\n⚡ ETAPA 4: Testar Função is_admin()\n');

    const { data: isAdminResult, error: rpcError } = await supabase.rpc('is_admin');

    if (rpcError) {
      console.error('❌ Erro ao chamar is_admin():', rpcError.message);
    } else {
      console.log(`✅ Função is_admin() retornou: ${isAdminResult ? '✅ TRUE' : '❌ FALSE'}`);
    }

    // 5. Testar acesso a tabelas DUA IA
    console.log('\n\n🤖 ETAPA 5: Testar Acesso DUA IA\n');

    const { data: duaiaProfiles, error: duaiaError } = await supabase
      .from('duaia_profiles')
      .select('user_id, display_name')
      .limit(5);

    if (duaiaError) {
      console.error('❌ Erro ao acessar duaia_profiles:', duaiaError.message);
    } else {
      console.log(`✅ Acesso a duaia_profiles OK!`);
      console.log(`   Registros: ${duaiaProfiles.length}`);
    }

    // 6. Testar acesso a tabelas DUA COIN
    console.log('\n\n💰 ETAPA 6: Testar Acesso DUA COIN\n');

    const { data: duacoinProfiles, error: duacoinError } = await supabase
      .from('duacoin_profiles')
      .select('user_id, balance')
      .limit(5);

    if (duacoinError) {
      console.error('❌ Erro ao acessar duacoin_profiles:', duacoinError.message);
    } else {
      console.log(`✅ Acesso a duacoin_profiles OK!`);
      console.log(`   Registros: ${duacoinProfiles.length}`);
    }

    // 7. Resumo final
    console.log('\n\n' + '═'.repeat(70));
    console.log('📊 RESUMO DO TESTE\n');
    
    const tests = [
      { name: 'Login', status: !loginError },
      { name: 'Role Admin Verificado', status: isAdmin },
      { name: 'Listagem de Usuários', status: !usersError },
      { name: 'Função is_admin()', status: !rpcError && isAdminResult },
      { name: 'Acesso DUA IA', status: !duaiaError },
      { name: 'Acesso DUA COIN', status: !duacoinError }
    ];

    tests.forEach(test => {
      const icon = test.status ? '✅' : '❌';
      console.log(`${icon} ${test.name}`);
    });

    const allPassed = tests.every(t => t.status);
    console.log('\n' + '═'.repeat(70));
    
    if (allPassed) {
      console.log('🎉 TODOS OS TESTES PASSARAM - ADMIN 100% FUNCIONAL');
    } else {
      console.log('⚠️  ALGUNS TESTES FALHARAM - VERIFICAR ERROS ACIMA');
    }
    
    console.log('═'.repeat(70) + '\n');

    // Logout
    await supabase.auth.signOut();
    console.log('✅ Logout realizado\n');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

testAdminAccess();
