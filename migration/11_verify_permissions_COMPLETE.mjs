#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ ERRO: Variáveis de ambiente faltando!');
  console.error('Necessário: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const ADMINS = [
  { 
    email: 'estraca@2lados.pt', 
    id: '345bb6b6-7e47-40db-bbbe-e9fe4836f682',
    name: 'Estraca Admin',
    has_access: true
  },
  { 
    email: 'dev@dua.com', 
    id: '22b7436c-41be-4332-859e-9d2315bcfe1f',
    name: 'Developer Admin',
    has_access: true
  }
];

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║  VERIFICAÇÃO E CORREÇÃO COMPLETA DE PERMISSÕES               ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

async function main() {
  let allSuccess = true;

  for (const admin of ADMINS) {
    console.log(`\n🔍 Verificando ${admin.email}...`);
    
    // 1. Verificar metadata Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(admin.id);
    
    if (authError || !authUser.user) {
      console.error(`  ❌ Erro ao buscar auth user:`, authError?.message);
      allSuccess = false;
      continue;
    }
    
    console.log(`  ✅ Auth user encontrado`);
    console.log(`     Email: ${authUser.user.email}`);
    console.log(`     ID: ${authUser.user.id}`);
    
    const metadata = authUser.user.user_metadata || {};
    const appMetadata = authUser.user.app_metadata || {};
    
    console.log(`     is_super_admin: ${metadata.is_super_admin || 'undefined'}`);
    console.log(`     role: ${metadata.role || 'undefined'}`);
    console.log(`     app_metadata.role: ${appMetadata.role || 'undefined'}`);
    
    // 2. Verificar tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', admin.id)
      .single();
    
    if (userError) {
      console.error(`  ⚠️  Erro ao buscar users:`, userError.message);
      
      // Tentar inserir
      console.log(`  🔧 Tentando inserir na tabela users...`);
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: admin.id,
          email: admin.email,
          name: admin.name,
          has_access: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error(`  ❌ Falha ao inserir:`, insertError.message);
        allSuccess = false;
      } else {
        console.log(`  ✅ Inserido na tabela users com has_access=true`);
      }
    } else {
      console.log(`  ✅ Registro na tabela users encontrado`);
      console.log(`     has_access: ${userData.has_access}`);
      console.log(`     name: ${userData.name || 'null'}`);
      console.log(`     email: ${userData.email}`);
      
      // Verificar e corrigir has_access
      if (!userData.has_access) {
        console.log(`  🔧 Corrigindo has_access para true...`);
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            has_access: true,
            name: admin.name,
            updated_at: new Date().toISOString()
          })
          .eq('id', admin.id);
        
        if (updateError) {
          console.error(`  ❌ Falha ao atualizar:`, updateError.message);
          allSuccess = false;
        } else {
          console.log(`  ✅ has_access atualizado para true`);
        }
      }
    }
    
    // 3. Verificar e corrigir metadata se necessário
    if (!metadata.is_super_admin || metadata.role !== 'admin') {
      console.log(`  🔧 Corrigindo metadata de admin...`);
      
      const updatePayload = {
        user_metadata: {
          ...metadata,
          role: 'admin',
          is_super_admin: true,
          name: admin.name,
          email_verified: true,
          admin_since: metadata.admin_since || new Date().toISOString()
        },
        app_metadata: {
          ...appMetadata,
          role: 'admin',
          roles: ['admin', 'super_admin'],
          permissions: [
            'manage_users',
            'manage_content',
            'manage_billing',
            'view_analytics',
            'manage_settings',
            'access_api'
          ]
        }
      };
      
      if (admin.email === 'estraca@2lados.pt' && !metadata.dua_balance) {
        updatePayload.user_metadata.dua_balance = 1000000;
      }
      
      const { error: metaUpdateError } = await supabase.auth.admin.updateUserById(
        admin.id,
        updatePayload
      );
      
      if (metaUpdateError) {
        console.error(`  ❌ Falha ao atualizar metadata:`, metaUpdateError.message);
        allSuccess = false;
      } else {
        console.log(`  ✅ Metadata de admin atualizado`);
      }
    }
    
    console.log(`\n✅ ${admin.email} - Verificação completa`);
  }
  
  console.log('\n' + '─'.repeat(65));
  
  if (allSuccess) {
    console.log('\n✅ TODOS OS ADMINS CONFIGURADOS CORRETAMENTE!\n');
    console.log('🎯 PRÓXIMOS PASSOS:');
    console.log('   1. Testar login com estraca@2lados.pt');
    console.log('   2. Testar login com dev@dua.com');
    console.log('   3. Verificar acesso ao painel admin\n');
  } else {
    console.log('\n⚠️  ALGUNS PROBLEMAS FORAM ENCONTRADOS');
    console.log('   Revise os logs acima para detalhes\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\n❌ ERRO FATAL:', err);
  process.exit(1);
});
