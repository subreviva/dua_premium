#!/usr/bin/env node
/**
 * TESTE: Validar Unified Schema
 */
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false }}
);

console.log('\n🧪 TESTE: UNIFIED SCHEMA VALIDATION\n');

// 1. Verificar tabelas existem
console.log('1️⃣ Verificando tabelas...\n');

const tables = ['duaia_profiles', 'duacoin_profiles'];
for (const table of tables) {
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .limit(1);
  
  if (error) {
    console.log(`   ❌ ${table}: NÃO EXISTE ou SEM ACESSO`);
    console.log(`      Erro: ${error.message}`);
  } else {
    console.log(`   ✅ ${table}: OK`);
  }
}

// 2. Contar perfis
console.log('\n2️⃣ Contando perfis...\n');

const { data: duaiaCount } = await supabase
  .from('duaia_profiles')
  .select('id', { count: 'exact', head: true });

const { data: duacoinCount } = await supabase
  .from('duacoin_profiles')
  .select('id', { count: 'exact', head: true });

console.log(`   DUA IA profiles: ${duaiaCount || 0}`);
console.log(`   DUA COIN profiles: ${duacoinCount || 0}`);

// 3. Testar trigger criando user
console.log('\n3️⃣ Testando trigger (criar test user)...\n');

const testEmail = `test.${Date.now()}@zdvp.test`;
const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
  email: testEmail,
  password: 'test123456',
  email_confirm: true
});

if (authError) {
  console.log('   ❌ Erro ao criar test user:', authError.message);
} else {
  console.log('   ✅ Test user criado:', authUser.user.id);
  
  // Aguardar triggers executarem
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Verificar se perfis foram criados automaticamente
  const { data: duaiaProfile } = await supabase
    .from('duaia_profiles')
    .select('*')
    .eq('user_id', authUser.user.id)
    .single();
  
  const { data: duacoinProfile } = await supabase
    .from('duacoin_profiles')
    .select('*')
    .eq('user_id', authUser.user.id)
    .single();
  
  if (duaiaProfile) {
    console.log('   ✅ DUA IA profile AUTO-CRIADO');
  } else {
    console.log('   ❌ DUA IA profile NÃO foi criado (trigger falhou)');
  }
  
  if (duacoinProfile) {
    console.log('   ✅ DUA COIN profile AUTO-CRIADO');
  } else {
    console.log('   ❌ DUA COIN profile NÃO foi criado (trigger falhou)');
  }
  
  // Limpar test user
  await supabase.auth.admin.deleteUser(authUser.user.id);
  console.log('   🧹 Test user removido');
}

console.log('\n✅ VALIDAÇÃO COMPLETA\n');
