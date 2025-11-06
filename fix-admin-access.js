#!/usr/bin/env node

/**
 * 🔧 FIX ADMIN ACCESS - Resolver problema de acesso ao painel admin
 * 
 * Problemas identificados:
 * 1. Email dev@dua.com pode não existir no banco
 * 2. Usuário pode não ter has_access = true
 * 3. Painel admin pode não estar detectando corretamente
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!');
  console.log('\n📝 Configure no .env.local:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://gocjbfcztorfswlkkjqi.supabase.co');
  console.log('SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAILS = [
  'admin@dua.pt',
  'subreviva@gmail.com', 
  'dev@dua.pt',
  'dev@dua.com'
];

async function fixAdminAccess() {
  console.log('🔧 INICIANDO CORREÇÃO DE ACESSO ADMIN\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // 1. Verificar se os admins existem
  console.log('📋 PASSO 1: Verificando admins no banco...\n');
  
  for (const email of ADMIN_EMAILS) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code === 'PGRST116') {
      console.log(`   ⚠️  ${email} - NÃO EXISTE`);
      console.log(`   💡 Crie a conta em: /acesso ou /registo\n`);
    } else if (user) {
      console.log(`   ✅ ${email} - EXISTE`);
      console.log(`      ID: ${user.id}`);
      console.log(`      has_access: ${user.has_access}`);
      console.log(`      subscription_tier: ${user.subscription_tier}`);
      console.log(`      total_tokens: ${user.total_tokens || 0}\n`);

      // 2. Corrigir has_access se necessário
      if (!user.has_access) {
        console.log(`   🔧 Ativando has_access para ${email}...`);
        const { error: updateError } = await supabase
          .from('users')
          .update({ has_access: true })
          .eq('id', user.id);

        if (updateError) {
          console.log(`   ❌ Erro ao atualizar: ${updateError.message}\n`);
        } else {
          console.log(`   ✅ has_access ativado!\n`);
        }
      }

      // 3. Dar tokens iniciais se zero
      if (!user.total_tokens || user.total_tokens === 0) {
        console.log(`   🔧 Injetando 10000 tokens iniciais para ${email}...`);
        const { error: rpcError } = await supabase.rpc('inject_tokens', {
          user_id: user.id,
          tokens_amount: 10000
        });

        if (rpcError) {
          console.log(`   ❌ Erro ao injetar tokens: ${rpcError.message}\n`);
        } else {
          console.log(`   ✅ 10000 tokens adicionados!\n`);
        }
      }
    }
  }

  // 4. Verificar total de usuários
  console.log('\n📊 PASSO 2: Estatísticas do banco...\n');
  const { data: allUsers, error: usersError } = await supabase
    .from('users')
    .select('*');

  if (usersError) {
    console.log(`   ❌ Erro ao buscar usuários: ${usersError.message}\n`);
  } else {
    console.log(`   👥 Total de usuários: ${allUsers.length}`);
    console.log(`   🔓 Com acesso: ${allUsers.filter(u => u.has_access).length}`);
    console.log(`   🔒 Sem acesso: ${allUsers.filter(u => !u.has_access).length}`);
    console.log(`   ⭐ Premium: ${allUsers.filter(u => u.subscription_tier !== 'free').length}\n`);
  }

  // 5. Instruções finais
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('✅ CORREÇÃO COMPLETA!\n');
  console.log('📋 PRÓXIMOS PASSOS:\n');
  console.log('1. Faça login com um dos emails admin:');
  ADMIN_EMAILS.forEach(email => console.log(`   • ${email}`));
  console.log('\n2. Acesse o painel admin em:');
  console.log('   👉 http://localhost:3000/profile');
  console.log('   👉 http://localhost:3000/admin-new');
  console.log('\n3. Se o painel não aparecer:');
  console.log('   • Verifique o console do browser (F12)');
  console.log('   • Confirme que o email no Supabase está correto');
  console.log('   • Limpe o cache e faça logout/login novamente\n');
}

fixAdminAccess().catch(console.error);
