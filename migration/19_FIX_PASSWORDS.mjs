#!/usr/bin/env node
/**
 * CORREÇÃO AUTOMÁTICA: Configurar passwords permanentes para admins
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const ADMINS = [
  { email: 'estraca@2lados.pt', password: 'Estraca2025@DUA', id: '345bb6b6-7e47-40db-bbbe-e9fe4836f682' },
  { email: 'dev@dua.com', password: 'DevDua2025@Secure', id: '22b7436c-41be-4332-859e-9d2315bcfe1f' }
];

console.log('🔧 Configurando passwords permanentes para admins...\n');

async function configurePassword(admin) {
  const { data, error } = await supabase.auth.admin.updateUserById(admin.id, {
    password: admin.password,
    email_confirm: true
  });
  
  if (error) {
    console.log(`✗ ${admin.email}: ${error.message}`);
    return false;
  }
  
  console.log(`✓ ${admin.email}: Password configurada`);
  return true;
}

async function main() {
  let allSuccess = true;
  
  for (const admin of ADMINS) {
    const success = await configurePassword(admin);
    if (!success) allSuccess = false;
  }
  
  if (!allSuccess) {
    console.log('\n❌ Algumas passwords falharam');
    process.exit(1);
  }
  
  console.log('\n✅ Todas as passwords configuradas com sucesso\n');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ ERRO:', err);
  process.exit(1);
});
