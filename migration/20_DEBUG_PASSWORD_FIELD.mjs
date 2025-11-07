#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log('🔍 Debug: Verificando campo encrypted_password...\n');

const adminId = '345bb6b6-7e47-40db-bbbe-e9fe4836f682';

const { data, error } = await supabase.auth.admin.getUserById(adminId);

if (error) {
  console.error('Erro:', error.message);
  process.exit(1);
}

console.log('User object keys:', Object.keys(data.user));
console.log('\nUser object:');
console.log(JSON.stringify(data.user, null, 2));

// Testar login real
console.log('\n🧪 Testando login real...\n');
const testClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data: loginData, error: loginError } = await testClient.auth.signInWithPassword({
  email: 'estraca@2lados.pt',
  password: 'Estraca2025@DUA'
});

if (loginError) {
  console.log('✗ Login falhou:', loginError.message);
} else {
  console.log('✓ Login FUNCIONOU!');
  await testClient.auth.signOut();
}
