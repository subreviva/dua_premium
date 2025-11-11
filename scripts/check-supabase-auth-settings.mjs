import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('�� Verificando configurações Supabase Auth...\n');

// Listar últimos users criados
const { data: users, error } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 5
});

if (error) {
  console.error('❌ Erro:', error);
  process.exit(1);
}

console.log('📋 Últimos users criados:', users.users.length);

users.users.forEach((user, i) => {
  console.log(`\n${i + 1}. User ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Email confirmed: ${user.email_confirmed_at ? '✅ SIM' : '❌ NÃO'}`);
  console.log(`   Created: ${user.created_at}`);
  console.log(`   Metadata:`, user.user_metadata);
});
