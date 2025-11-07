#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

console.log('🔍 Descobrindo password correta para estraca@2lados.pt...\n');

// Testar várias possibilidades conhecidas
const possiblePasswords = [
  'Lumiarbcv1997.',
  'Estraca2025@DUA',
  'lumiarbcv1997.',
  'lumiarbcv',
  'Lumiarbcv',
  'Lumiarbcv1997',
  'estraca123',
  'admin123'
];

const testEmail = 'estraca@2lados.pt';

async function testPassword(email, password) {
  const testClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data, error } = await testClient.auth.signInWithPassword({ email, password });
  if (!error && data.user) {
    await testClient.auth.signOut();
    return true;
  }
  return false;
}

async function main() {
  // Primeiro verificar se user existe no auth
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Erro ao listar usuários:', error.message);
    process.exit(1);
  }
  
  const user = users.find(u => u.email === testEmail);
  
  if (!user) {
    console.log('❌ Usuário não encontrado no auth');
    process.exit(1);
  }
  
  console.log(`✅ Usuário existe: ${user.email}`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Tem password? ${user.encrypted_password ? 'SIM' : 'NÃO'}\n`);
  
  if (!user.encrypted_password) {
    console.log('⚠️  Usuário sem password configurada');
    console.log('🔧 Configurando password agora...\n');
    
    const newPassword = 'Estraca2025@DUA';
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
      email_confirm: true
    });
    
    if (updateError) {
      console.error('❌ Erro ao configurar password:', updateError.message);
      process.exit(1);
    }
    
    console.log('✅ Password configurada com sucesso!');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${newPassword}\n`);
    process.exit(0);
  }
  
  // Testar passwords conhecidas
  console.log('🧪 Testando passwords conhecidas...\n');
  
  for (const pwd of possiblePasswords) {
    const works = await testPassword(testEmail, pwd);
    if (works) {
      console.log(`✅ PASSWORD ENCONTRADA: ${pwd}\n`);
      process.exit(0);
    } else {
      console.log(`✗ ${pwd}`);
    }
  }
  
  console.log('\n❌ Nenhuma password conhecida funcionou');
  console.log('🔧 Resetando para password conhecida...\n');
  
  const newPassword = 'Estraca2025@DUA';
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true
  });
  
  if (updateError) {
    console.error('❌ Erro ao resetar password:', updateError.message);
    process.exit(1);
  }
  
  console.log('✅ Password resetada com sucesso!');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Password: ${newPassword}\n`);
}

main().catch(err => {
  console.error('❌ ERRO:', err);
  process.exit(1);
});
