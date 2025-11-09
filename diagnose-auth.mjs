#!/usr/bin/env node

/**
 * Script de diagnóstico de autenticação
 * Verifica se o usuário está autenticado e se consegue acessar a tabela
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 DIAGNÓSTICO DE AUTENTICAÇÃO\n');
console.log('=' .repeat(70));

async function diagnose() {
  // 1. Verificar sessão atual
  console.log('\n1️⃣  Verificando sessão atual...');
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.log('   ❌ Erro ao obter sessão:', sessionError.message);
    console.log('\n💡 PROBLEMA: Não há sessão ativa');
    console.log('   SOLUÇÃO: Faça login no aplicativo primeiro');
    return;
  }

  if (!session) {
    console.log('   ⚠️  Nenhuma sessão ativa');
    console.log('\n💡 PROBLEMA: Usuário não está autenticado');
    console.log('   SOLUÇÃO: Faça login no aplicativo (email/password ou Google OAuth)');
    console.log('\n📝 Para testar com token específico:');
    console.log('   1. Faça login no app');
    console.log('   2. Abra DevTools > Application > Local Storage');
    console.log('   3. Copie o valor de "sb-access-token"');
    console.log('   4. Execute: export SUPABASE_USER_TOKEN="seu-token-aqui"');
    console.log('   5. Execute este script novamente');
    return;
  }

  console.log('   ✅ Sessão ativa encontrada!');
  console.log(`   📧 Email: ${session.user.email}`);
  console.log(`   🆔 User ID: ${session.user.id}`);
  console.log(`   ⏰ Expira em: ${new Date(session.expires_at * 1000).toLocaleString()}`);

  // 2. Testar acesso à tabela
  console.log('\n2️⃣  Testando acesso à tabela duaia_conversations...');
  
  const { data, error } = await supabase
    .from('duaia_conversations')
    .select('id, title, created_at')
    .eq('user_id', session.user.id)
    .limit(5);

  if (error) {
    console.log('   ❌ ERRO ao acessar tabela:');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Código: ${error.code}`);
    console.log(`   Mensagem: ${error.message}`);
    console.log(`   Detalhes: ${error.details}`);
    console.log(`   Hint: ${error.hint}`);
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (error.code === 'PGRST116' || error.message?.includes('RLS')) {
      console.log('\n💡 PROBLEMA: RLS está bloqueando o acesso');
      console.log('   CAUSA: Políticas RLS não estão configuradas ou incorretas');
      console.log('   SOLUÇÃO: Execute o arquivo CREATE_RLS_POLICIES.sql no Supabase SQL Editor');
      console.log('\n📋 Passos:');
      console.log('   1. Abra Supabase Dashboard');
      console.log('   2. Vá em SQL Editor');
      console.log('   3. Cole o conteúdo de CREATE_RLS_POLICIES.sql');
      console.log('   4. Execute (Run)');
      console.log('   5. Teste novamente');
    } else if (error.code === 'PGRST205') {
      console.log('\n💡 PROBLEMA: Tabela não existe');
      console.log('   SOLUÇÃO: Execute a migration para criar a tabela');
    } else {
      console.log('\n💡 PROBLEMA DESCONHECIDO');
      console.log('   Verifique os logs acima para mais detalhes');
    }
    return;
  }

  console.log('   ✅ Acesso permitido!');
  console.log(`   📊 Conversas encontradas: ${data?.length || 0}`);
  
  if (data && data.length > 0) {
    console.log('\n   Conversas:');
    data.forEach((conv, i) => {
      console.log(`   ${i + 1}. ${conv.title} (${new Date(conv.created_at).toLocaleDateString()})`);
    });
  } else {
    console.log('   (Nenhuma conversa salva ainda)');
  }

  // 3. Testar INSERT
  console.log('\n3️⃣  Testando permissão de INSERT...');
  
  const testConv = {
    id: `test-${Date.now()}`,
    user_id: session.user.id,
    title: 'Teste de RLS',
    messages: [{ role: 'user', content: 'teste' }],
    sync_version: 1
  };

  const { error: insertError } = await supabase
    .from('duaia_conversations')
    .insert(testConv);

  if (insertError) {
    console.log('   ❌ ERRO ao inserir:', insertError.message);
    console.log('   💡 Política INSERT pode estar faltando');
  } else {
    console.log('   ✅ INSERT permitido!');
    
    // Limpar teste
    await supabase
      .from('duaia_conversations')
      .delete()
      .eq('id', testConv.id);
    console.log('   🧹 Registro de teste removido');
  }

  console.log('\n' + '=' .repeat(70));
  console.log('✅ DIAGNÓSTICO COMPLETO!');
  console.log('=' .repeat(70));
}

diagnose().catch(err => {
  console.error('\n❌ Erro fatal:', err);
  process.exit(1);
});
