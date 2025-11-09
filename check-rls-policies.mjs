#!/usr/bin/env node

/**
 * Script para verificar políticas RLS da tabela duaia_conversations
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

console.log('🔍 Verificando políticas RLS da tabela duaia_conversations...\n');

// Cliente com anon key (usuário normal)
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Cliente com service role (bypass RLS)
const supabaseAdmin = SUPABASE_SERVICE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null;

async function testAnonAccess() {
  console.log('📝 Teste 1: Acesso com ANON KEY (sem autenticação)');
  
  const { data, error } = await supabaseAnon
    .from('duaia_conversations')
    .select('id')
    .limit(1);

  if (error) {
    console.error('❌ Erro:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    
    if (error.code === 'PGRST116' || error.message?.includes('RLS')) {
      console.log('\n💡 A tabela TEM RLS ativado (esperado)');
      console.log('   Usuários não autenticados não podem acessar os dados');
    }
  } else {
    console.log('✅ Acesso permitido (sem RLS ou RLS público)');
    console.log('   Dados:', data);
  }
}

async function testAdminAccess() {
  if (!supabaseAdmin) {
    console.log('\n⚠️  Teste 2: PULADO (SUPABASE_SERVICE_ROLE_KEY não configurada)');
    return;
  }

  console.log('\n📝 Teste 2: Acesso com SERVICE ROLE KEY (bypass RLS)');
  
  const { data, error, count } = await supabaseAdmin
    .from('duaia_conversations')
    .select('id, user_id, title, created_at', { count: 'exact' })
    .limit(5);

  if (error) {
    console.error('❌ Erro mesmo com service role:', error);
  } else {
    console.log('✅ Service role tem acesso total');
    console.log(`   Total de conversas na tabela: ${count || 0}`);
    if (data && data.length > 0) {
      console.log('   Exemplo de dados:');
      data.forEach((row, i) => {
        console.log(`   ${i + 1}. ID: ${row.id.substring(0, 8)}... | User: ${row.user_id.substring(0, 8)}... | Title: ${row.title}`);
      });
    } else {
      console.log('   Tabela vazia (sem conversas)');
    }
  }
}

async function testAuthenticatedAccess() {
  console.log('\n📝 Teste 3: Simulando acesso autenticado');
  console.log('   Para testar com usuário real, faça login no app e copie o token da sessão');
  console.log('   Depois execute: export SUPABASE_USER_TOKEN="seu-token-aqui"');
  
  const userToken = process.env.SUPABASE_USER_TOKEN;
  
  if (!userToken) {
    console.log('   ⏭️  PULADO (variável SUPABASE_USER_TOKEN não definida)');
    return;
  }

  const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // Tentar obter user com o token
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(userToken);
  
  if (authError || !user) {
    console.log('   ❌ Token inválido:', authError?.message);
    return;
  }

  console.log(`   ✅ Autenticado como: ${user.email} (${user.id})`);
  
  // Tentar acessar conversas do usuário
  const { data, error } = await supabaseAuth
    .from('duaia_conversations')
    .select('*')
    .eq('user_id', user.id)
    .limit(5);

  if (error) {
    console.log('   ❌ Erro ao acessar conversas:', {
      code: error.code,
      message: error.message,
      hint: error.hint
    });
  } else {
    console.log(`   ✅ Acesso permitido! ${data?.length || 0} conversas encontradas`);
  }
}

async function checkRLSPolicies() {
  if (!supabaseAdmin) {
    console.log('\n⚠️  Verificação de políticas RLS: PULADO (SERVICE_ROLE_KEY necessária)');
    return;
  }

  console.log('\n📝 Teste 4: Verificando políticas RLS existentes');
  
  try {
    const { data, error } = await supabaseAdmin
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'duaia_conversations');

    if (error) {
      console.log('   ⚠️  Não foi possível consultar pg_policies:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log('   ⚠️  NENHUMA política RLS encontrada!');
      console.log('   Isso significa que mesmo com RLS habilitado, não há regras definidas');
      console.log('   Resultado: Ninguém consegue acessar os dados (nem usuários autenticados)');
    } else {
      console.log(`   ✅ ${data.length} política(s) RLS encontrada(s):`);
      data.forEach((policy, i) => {
        console.log(`   ${i + 1}. ${policy.policyname}`);
        console.log(`      Comando: ${policy.cmd}`);
        console.log(`      Roles: ${policy.roles}`);
      });
    }
  } catch (err) {
    console.log('   ⚠️  Erro ao verificar políticas:', err);
  }
}

// Executar todos os testes
async function runTests() {
  await testAnonAccess();
  await testAdminAccess();
  await testAuthenticatedAccess();
  await checkRLSPolicies();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO:');
  console.log('='.repeat(60));
  console.log('Se o erro 400 está ocorrendo, provavelmente:');
  console.log('1. ✅ RLS está HABILITADO (bom para segurança)');
  console.log('2. ❌ As POLÍTICAS RLS estão faltando ou mal configuradas');
  console.log('3. ❌ O usuário não está autenticado ou token inválido');
  console.log('\nSolução: Criar políticas RLS para permitir que usuários');
  console.log('autenticados acessem suas próprias conversas.');
  console.log('='.repeat(60));
}

runTests().then(() => process.exit(0)).catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
