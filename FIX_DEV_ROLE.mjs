#!/usr/bin/env node
/**
 * CORRIGIR ROLE DO dev@dua.com
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('\n🔧 CORRIGINDO ROLE DO dev@dua.com\n');

async function fixDevRole() {
  try {
    // 1. Buscar user
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const devUser = authUsers.users.find(u => u.email === 'dev@dua.com');
    
    if (!devUser) {
      console.log('❌ Usuário dev@dua.com não encontrado');
      return;
    }
    
    console.log(`✅ Usuário encontrado: ${devUser.id}\n`);
    
    // 2. Atualizar role na tabela users
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', devUser.id);
    
    if (updateError) {
      console.log('❌ Erro ao atualizar role:', updateError.message);
      return;
    }
    
    console.log('✅ Role atualizado para: admin\n');
    
    // 3. Verificar
    const { data: userData } = await supabase
      .from('users')
      .select('email, role, has_access')
      .eq('id', devUser.id)
      .single();
    
    console.log('📋 Dados atualizados:');
    console.log(`   Email: ${userData.email}`);
    console.log(`   Role: ${userData.role}`);
    console.log(`   Has Access: ${userData.has_access}\n`);
    
    console.log('🎉 CORREÇÃO COMPLETA!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

fixDevRole();
