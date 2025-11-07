#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ ERRO: Variáveis de ambiente faltando!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const ADMINS = [
  { 
    email: 'estraca@2lados.pt', 
    password: 'Estraca2025@DUA',
    id: '345bb6b6-7e47-40db-bbbe-e9fe4836f682'
  },
  { 
    email: 'dev@dua.com', 
    password: 'DevDua2025@Secure',
    id: '22b7436c-41be-4332-859e-9d2315bcfe1f'
  }
];

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║  RESETAR E CONFIGURAR PASSWORDS DOS ADMINS                  ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

async function resetPassword(admin) {
  console.log(`\n🔧 Configurando password para ${admin.email}...`);
  
  try {
    // Atualizar password usando Admin API
    const { data, error } = await supabase.auth.admin.updateUserById(
      admin.id,
      { 
        password: admin.password,
        email_confirm: true  // Confirmar email automaticamente
      }
    );
    
    if (error) {
      console.error(`  ❌ FALHA ao atualizar password: ${error.message}`);
      return false;
    }
    
    console.log(`  ✅ Password configurado com sucesso`);
    console.log(`     Email: ${data.user.email}`);
    console.log(`     ID: ${data.user.id}`);
    console.log(`     Password: ${admin.password}`);
    
    return true;
  } catch (err) {
    console.error(`  ❌ ERRO: ${err.message}`);
    return false;
  }
}

async function main() {
  let allSuccess = true;
  
  for (const admin of ADMINS) {
    const success = await resetPassword(admin);
    if (!success) {
      allSuccess = false;
    }
  }
  
  console.log('\n' + '─'.repeat(65));
  
  if (allSuccess) {
    console.log('\n✅ PASSWORDS CONFIGURADOS COM SUCESSO!\n');
    console.log('📋 CREDENCIAIS DE LOGIN:\n');
    ADMINS.forEach(admin => {
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: ${admin.password}\n`);
    });
    console.log('🎯 Agora execute: node migration/12_test_login_E2E.mjs\n');
    return 0;
  } else {
    console.log('\n❌ ALGUNS PROBLEMAS OCORRERAM\n');
    return 1;
  }
}

main()
  .then(exitCode => process.exit(exitCode))
  .catch(err => {
    console.error('\n❌ ERRO FATAL:', err);
    process.exit(1);
  });
