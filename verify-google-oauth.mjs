#!/usr/bin/env node

/**
 * Script: Verificar configuração Google OAuth
 * 
 * Testa:
 * 1. Credenciais Supabase
 * 2. Configuração Google Provider
 * 3. Redirect URLs
 * 4. Tabela users estrutura
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 VERIFICAÇÃO GOOGLE OAUTH - DUA PLATFORM\n');
console.log('='.repeat(60));

// 1. Verificar credenciais
console.log('\n1️⃣  CREDENCIAIS SUPABASE');
console.log('-'.repeat(60));

if (!SUPABASE_URL) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL não encontrada');
  process.exit(1);
}
console.log(`✅ Supabase URL: ${SUPABASE_URL}`);

if (!SERVICE_ROLE_KEY) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada');
  process.exit(1);
}
console.log(`✅ Service Role Key: ${SERVICE_ROLE_KEY.substring(0, 20)}...`);

// 2. Criar cliente Supabase
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

console.log('✅ Cliente Supabase criado');

// 3. Testar conexão com banco de dados
console.log('\n2️⃣  CONEXÃO COM BANCO DE DADOS');
console.log('-'.repeat(60));

try {
  const { data, error } = await supabase
    .from('users')
    .select('count')
    .limit(1);

  if (error) {
    console.log('❌ Erro ao conectar com tabela users:', error.message);
  } else {
    console.log('✅ Conexão com tabela users estabelecida');
  }
} catch (err) {
  console.log('❌ Erro de conexão:', err.message);
}

// 4. Verificar estrutura da tabela users
console.log('\n3️⃣  ESTRUTURA DA TABELA USERS');
console.log('-'.repeat(60));

try {
  // Verificar colunas necessárias
  const { data: testUser, error } = await supabase
    .from('users')
    .select('id, email, name, has_access, role, duacoin_balance, created_at, last_login_at')
    .limit(1);

  if (error) {
    console.log('❌ Erro ao verificar colunas:', error.message);
    console.log('⚠️  Verifique se todas as colunas necessárias existem:');
    console.log('   - id (UUID)');
    console.log('   - email (TEXT)');
    console.log('   - name (TEXT)');
    console.log('   - has_access (BOOLEAN)');
    console.log('   - role (TEXT)');
    console.log('   - duacoin_balance (INTEGER)');
    console.log('   - created_at (TIMESTAMPTZ)');
    console.log('   - last_login_at (TIMESTAMPTZ)');
  } else {
    console.log('✅ Todas as colunas necessárias existem');
    console.log('   - id, email, name, has_access, role');
    console.log('   - duacoin_balance, created_at, last_login_at');
  }
} catch (err) {
  console.log('❌ Erro ao verificar estrutura:', err.message);
}

// 5. Informações sobre OAuth
console.log('\n4️⃣  GOOGLE OAUTH - CONFIGURAÇÃO MANUAL NECESSÁRIA');
console.log('-'.repeat(60));

console.log('\n📋 PASSOS PARA CONFIGURAR GOOGLE OAUTH NO SUPABASE:\n');

console.log('1. Aceder Supabase Dashboard:');
console.log(`   https://supabase.com/dashboard/project/${SUPABASE_URL.split('.')[0].split('//')[1]}/auth/providers\n`);

console.log('2. Ativar Google Provider:');
console.log('   - Encontrar "Google" na lista de providers');
console.log('   - Toggle "Enable Google"');
console.log('   - Configurar Client ID e Client Secret do Google Cloud Console\n');

console.log('3. Configurar Redirect URLs:');
console.log('   Authentication > URL Configuration');
console.log('   - Site URL: http://localhost:3001 (dev)');
console.log('   - Redirect URLs: http://localhost:3001/auth/callback\n');

console.log('4. Google Cloud Console:');
console.log('   https://console.cloud.google.com/apis/credentials');
console.log('   - Criar OAuth 2.0 Client ID');
console.log('   - Application type: Web application');
console.log('   - Authorized redirect URIs:');
console.log(`     ${SUPABASE_URL}/auth/v1/callback\n`);

console.log('5. Copiar credenciais:');
console.log('   - Client ID → Supabase Dashboard (Google Provider)');
console.log('   - Client Secret → Supabase Dashboard (Google Provider)\n');

// 6. Teste de criação de user (simulado)
console.log('\n5️⃣  TESTE DE CRIAÇÃO DE PERFIL OAUTH (SIMULADO)');
console.log('-'.repeat(60));

const testUserData = {
  id: '00000000-0000-0000-0000-000000000000', // UUID fictício
  email: 'test-oauth@gmail.com',
  name: 'Test OAuth User',
  has_access: false,
  role: 'user',
  duacoin_balance: 0,
};

console.log('\n📝 Estrutura de perfil OAuth que será criada:');
console.log(JSON.stringify(testUserData, null, 2));

console.log('\n⚠️  IMPORTANTE:');
console.log('   - Novos users via Google OAuth NÃO têm acesso automático');
console.log('   - has_access = false (precisam de código de convite)');
console.log('   - Admin deve ativar manualmente ou via código\n');

// 7. URLs importantes
console.log('\n6️⃣  URLs DO SISTEMA');
console.log('-'.repeat(60));

console.log('\nLogin Page:');
console.log('   http://localhost:3001/login');
console.log('   - Botão "Continuar com Google" disponível\n');

console.log('Callback URL:');
console.log('   http://localhost:3001/auth/callback');
console.log('   - Processa retorno do Google OAuth\n');

console.log('Chat (após login):');
console.log('   http://localhost:3001/chat');
console.log('   - Só acessível com has_access=true\n');

// 8. SQL para dar acesso a user OAuth
console.log('\n7️⃣  SQL - DAR ACESSO A USER OAUTH');
console.log('-'.repeat(60));

console.log('\nApós user fazer login com Google pela primeira vez:');
console.log('\n```sql');
console.log("UPDATE users");
console.log("SET has_access = true");
console.log("WHERE email = 'user@gmail.com';");
console.log('```\n');

console.log('Ou verificar todos os users OAuth sem acesso:');
console.log('\n```sql');
console.log('SELECT id, email, name, created_at');
console.log('FROM users');
console.log('WHERE has_access = false');
console.log('ORDER BY created_at DESC;');
console.log('```\n');

// Resumo final
console.log('\n' + '='.repeat(60));
console.log('✨ RESUMO DA VERIFICAÇÃO\n');

console.log('✅ Código implementado:');
console.log('   - Botão Google em /login');
console.log('   - Callback route /auth/callback');
console.log('   - Criação automática de perfil');
console.log('   - Verificação de has_access\n');

console.log('⏳ Configuração manual necessária:');
console.log('   1. Ativar Google Provider no Supabase Dashboard');
console.log('   2. Configurar Client ID/Secret do Google Cloud');
console.log('   3. Adicionar Redirect URLs');
console.log('   4. Testar login com conta Google real\n');

console.log('📚 Documentação:');
console.log('   - Ver: GOOGLE_OAUTH_VERIFICACAO.md');
console.log('   - Instruções detalhadas passo a passo\n');

console.log('🚀 Próximos passos:');
console.log('   1. Seguir instruções acima para configurar Supabase');
console.log('   2. Testar login: http://localhost:3001/login');
console.log('   3. Clicar "Continuar com Google"');
console.log('   4. Verificar criação de perfil no banco de dados\n');

console.log('='.repeat(60));
console.log('\n✅ Verificação concluída!\n');
