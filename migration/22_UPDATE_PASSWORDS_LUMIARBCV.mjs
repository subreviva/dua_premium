#!/usr/bin/env node
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║       ATUALIZAR PASSWORDS PARA "lumiarbcv"                  ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

const ADMINS = [
  { email: 'estraca@2lados.pt', password: 'lumiarbcv' },
  { email: 'dev@dua.com', password: 'lumiarbcv' }
];

async function updatePasswords() {
  console.log('🔄 Atualizando passwords...\n');

  for (const admin of ADMINS) {
    try {
      // 1. Get user ID
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        console.error(`❌ Erro ao buscar ${admin.email}:`, listError.message);
        continue;
      }

      const user = users.users.find(u => u.email === admin.email);
      
      if (!user) {
        console.error(`❌ Usuário não encontrado: ${admin.email}`);
        continue;
      }

      // 2. Update password
      const { data, error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: admin.password }
      );

      if (updateError) {
        console.error(`❌ Erro ao atualizar ${admin.email}:`, updateError.message);
        continue;
      }

      console.log(`✅ Password atualizada: ${admin.email}`);

      // 3. Test login
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: admin.email,
        password: admin.password
      });

      if (loginError) {
        console.error(`   ⚠️  AVISO: Login test falhou: ${loginError.message}`);
      } else {
        console.log(`   ✓ Login test passou: ${admin.email}`);
        // Logout
        await supabase.auth.signOut();
      }

    } catch (err) {
      console.error(`❌ Erro inesperado com ${admin.email}:`, err.message);
    }

    console.log('');
  }
}

async function main() {
  await updatePasswords();
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n✅ PASSWORDS ATUALIZADAS PARA "lumiarbcv"\n');
  console.log('📝 Credenciais:');
  console.log('   Email: estraca@2lados.pt | Password: lumiarbcv');
  console.log('   Email: dev@dua.com       | Password: lumiarbcv\n');
}

main().catch(console.error);
