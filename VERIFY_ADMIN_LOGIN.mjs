#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';

const { Client } = pg;

// Supabase config
const supabaseUrl = 'https://nranmngyocaqjwcokcxm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzcxNTIsImV4cCI6MjA3NDE1MzE1Mn0.dFKTXrh2w8FOzcXndyjlVXP-jUaBUxkBZEWLd4UQeTU';

// Credenciais do admin
const ADMIN_EMAIL = 'estraca@2lados.pt';
const ADMIN_PASSWORD = 'lumiarbcv';

console.log('🔐 VERIFICAÇÃO ULTRA RIGOROSA DO ADMIN\n');
console.log('═'.repeat(60));
console.log(`📧 Email: ${ADMIN_EMAIL}`);
console.log(`🔑 Password: ${ADMIN_PASSWORD}`);
console.log('═'.repeat(60) + '\n');

async function verifyAdminLogin() {
  // 1. Verificar no banco de dados diretamente
  console.log('📊 ETAPA 1: Verificação Direta no Banco de Dados\n');
  
  const pgClient = new Client({
    host: 'aws-1-us-east-1.pooler.supabase.com',
    database: 'postgres',
    user: 'postgres.nranmngyocaqjwcokcxm',
    password: 'Lumiarbcv1997.',
    port: 6543,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await pgClient.connect();
    console.log('✅ Conectado ao PostgreSQL\n');

    // Verificar usuário na tabela auth.users
    const authUser = await pgClient.query(`
      SELECT 
        id,
        email,
        email_confirmed_at,
        created_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        encrypted_password IS NOT NULL as has_password
      FROM auth.users
      WHERE email = $1;
    `, [ADMIN_EMAIL]);

    if (authUser.rows.length === 0) {
      console.log('❌ ERRO: Usuário não encontrado em auth.users\n');
      await pgClient.end();
      return false;
    }

    const user = authUser.rows[0];
    console.log('✅ Usuário encontrado em auth.users:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Email Confirmado: ${user.email_confirmed_at ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   Criado em: ${user.created_at}`);
    console.log(`   Último login: ${user.last_sign_in_at || 'Nunca'}`);
    console.log(`   Super Admin: ${user.is_super_admin ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   Possui senha: ${user.has_password ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   App Meta Data: ${JSON.stringify(user.raw_app_meta_data, null, 2)}`);
    console.log(`   User Meta Data: ${JSON.stringify(user.raw_user_meta_data, null, 2)}`);

    // Verificar na tabela public.users
    console.log('\n📋 Verificando em public.users:\n');
    
    const publicUser = await pgClient.query(`
      SELECT 
        id,
        email,
        role,
        name,
        avatar_url,
        created_at,
        updated_at
      FROM public.users
      WHERE email = $1;
    `, [ADMIN_EMAIL]);

    if (publicUser.rows.length === 0) {
      console.log('⚠️  Usuário não encontrado em public.users\n');
    } else {
      const pUser = publicUser.rows[0];
      console.log('✅ Usuário encontrado em public.users:');
      console.log(`   ID: ${pUser.id}`);
      console.log(`   Email: ${pUser.email}`);
      console.log(`   Role: ${pUser.role}`);
      console.log(`   Name: ${pUser.name || 'N/A'}`);
      console.log(`   Avatar: ${pUser.avatar_url || 'N/A'}`);
      console.log(`   Criado: ${pUser.created_at}`);
      console.log(`   Atualizado: ${pUser.updated_at}`);
    }

    await pgClient.end();

    // 2. Testar login via Supabase Client
    console.log('\n\n🔐 ETAPA 2: Teste de Login via Supabase Client\n');
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('Tentando fazer login...\n');

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (loginError) {
      console.log('❌ ERRO NO LOGIN:');
      console.log(`   Mensagem: ${loginError.message}`);
      console.log(`   Status: ${loginError.status}`);
      console.log(`   Código: ${loginError.code || 'N/A'}`);
      console.log(`\n⚠️  POSSÍVEIS CAUSAS:`);
      console.log(`   1. Senha incorreta`);
      console.log(`   2. Email não confirmado`);
      console.log(`   3. Conta desativada`);
      console.log(`   4. Necessário reset de senha`);
      return false;
    }

    console.log('✅ LOGIN REALIZADO COM SUCESSO!\n');
    console.log('📋 Dados da sessão:');
    console.log(`   User ID: ${loginData.user.id}`);
    console.log(`   Email: ${loginData.user.email}`);
    console.log(`   Email Verified: ${loginData.user.email_confirmed_at ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   Role: ${loginData.user.role}`);
    console.log(`\n🎫 Token de Acesso:`);
    console.log(`   Access Token: ${loginData.session.access_token.substring(0, 50)}...`);
    console.log(`   Refresh Token: ${loginData.session.refresh_token.substring(0, 50)}...`);
    console.log(`   Expira em: ${new Date(loginData.session.expires_at * 1000).toLocaleString()}`);

    // 3. Verificar permissões como admin
    console.log('\n\n🔑 ETAPA 3: Verificação de Permissões Admin\n');

    // Tentar acessar dados de outro usuário (teste de admin)
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.log('⚠️  Erro ao listar usuários:');
      console.log(`   ${usersError.message}`);
      console.log(`\n   Possível problema: RLS policies bloqueando acesso admin`);
    } else {
      console.log(`✅ Acesso admin verificado - ${allUsers.length} usuários listados:`);
      allUsers.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.email} (${u.role})`);
      });
    }

    // Fazer logout
    await supabase.auth.signOut();
    console.log('\n✅ Logout realizado com sucesso');

    return true;

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    return false;
  }
}

// Executar verificação
verifyAdminLogin().then(success => {
  console.log('\n\n' + '═'.repeat(60));
  if (success) {
    console.log('✅ VERIFICAÇÃO COMPLETA - LOGIN ADMIN OPERACIONAL');
  } else {
    console.log('❌ VERIFICAÇÃO FALHOU - PROBLEMAS DETECTADOS');
  }
  console.log('═'.repeat(60) + '\n');
  process.exit(success ? 0 : 1);
});
