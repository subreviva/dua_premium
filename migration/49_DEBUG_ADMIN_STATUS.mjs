#!/usr/bin/env node
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 DEBUG: Verificando status admin de estraca@2lados.pt\n');

async function debugAdminStatus() {
  try {
    // 1. Buscar usuário em auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Erro ao buscar auth users:', authError.message);
      return;
    }

    const adminUser = authUsers.users.find(u => u.email === 'estraca@2lados.pt');
    
    if (!adminUser) {
      console.log('❌ Usuário estraca@2lados.pt NÃO encontrado em auth.users');
      return;
    }

    console.log('✅ Usuário encontrado em auth.users:');
    console.log('   ID:', adminUser.id);
    console.log('   Email:', adminUser.email);
    console.log('   Created:', adminUser.created_at);
    console.log('');

    // 2. Verificar na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', adminUser.id)
      .single();

    if (userError) {
      console.log('⚠️ Erro ao buscar na tabela users:', userError.message);
      console.log('   Código:', userError.code);
      console.log('');
    }

    if (userData) {
      console.log('✅ Dados na tabela users:');
      console.log('   ID:', userData.id);
      console.log('   Email:', userData.email);
      console.log('   Name:', userData.name);
      console.log('   Role:', userData.role);
      console.log('   Full Access:', userData.full_access);
      console.log('   DuaIA Enabled:', userData.duaia_enabled);
      console.log('   DuaCoin Enabled:', userData.duacoin_enabled);
      console.log('');
      
      // Verificar se é super admin
      const isSuperAdmin = userData.role === 'super_admin' && userData.full_access === true;
      console.log(`${isSuperAdmin ? '✅' : '❌'} É Super Admin: ${isSuperAdmin}`);
      console.log('');
    } else {
      console.log('❌ Usuário NÃO existe na tabela users!');
      console.log('   Precisa criar registro na tabela users');
      console.log('');
    }

    // 3. Verificar em todas as tabelas de perfil
    console.log('🔍 Verificando perfis:');
    
    // duaia_profiles
    const { data: duaiaProfile } = await supabase
      .from('duaia_profiles')
      .select('*')
      .eq('user_id', adminUser.id)
      .single();
    
    console.log(`   ${duaiaProfile ? '✅' : '❌'} duaia_profiles: ${duaiaProfile ? 'EXISTS' : 'NÃO EXISTE'}`);

    // duacoin_profiles
    const { data: duacoinProfile } = await supabase
      .from('duacoin_profiles')
      .select('*')
      .eq('user_id', adminUser.id)
      .single();
    
    console.log(`   ${duacoinProfile ? '✅' : '❌'} duacoin_profiles: ${duacoinProfile ? 'EXISTS' : 'NÃO EXISTE'}`);
    console.log('');

    // 4. SOLUÇÃO: Se não existe na tabela users, criar
    if (!userData) {
      console.log('🔧 CRIANDO registro na tabela users...');
      
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: adminUser.id,
            email: 'estraca@2lados.pt',
            name: 'Enio Estraca',
            role: 'super_admin',
            full_access: true,
            duaia_enabled: true,
            duacoin_enabled: true
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao criar usuário:', insertError.message);
      } else {
        console.log('✅ Usuário criado com sucesso na tabela users!');
        console.log('   Role: super_admin');
        console.log('   Full Access: true');
        console.log('');
        console.log('🎉 AGORA o botão admin deve aparecer!');
      }
    } else if (userData.role !== 'super_admin' || userData.full_access !== true) {
      console.log('🔧 ATUALIZANDO permissões...');
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          role: 'super_admin',
          full_access: true,
          duaia_enabled: true,
          duacoin_enabled: true
        })
        .eq('id', adminUser.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar:', updateError.message);
      } else {
        console.log('✅ Permissões atualizadas!');
        console.log('🎉 AGORA o botão admin deve aparecer!');
      }
    } else {
      console.log('✅ Tudo correto! O botão admin DEVE estar visível.');
      console.log('   Se ainda não aparece, force refresh (Ctrl+Shift+R)');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

debugAdminStatus();
