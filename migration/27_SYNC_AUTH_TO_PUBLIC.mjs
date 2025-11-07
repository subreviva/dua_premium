#!/usr/bin/env node
/**
 * SINCRONIZAR AUTH.USERS → PUBLIC.USERS
 * 
 * Garantir que todos em auth.users também estão em public.users
 * (5 users detectados em auth mas não em public)
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║   SINCRONIZAÇÃO: AUTH.USERS → PUBLIC.USERS                  ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// 1. Listar todos auth.users
const { data: authUsers } = await supabase.auth.admin.listUsers();
console.log(`📊 Auth.users: ${authUsers.users.length} utilizadores\n`);

// 2. Listar todos public.users
const { data: publicUsers } = await supabase.from('users').select('id, email');
console.log(`📊 Public.users: ${publicUsers?.length || 0} utilizadores\n`);

const publicIds = new Set(publicUsers?.map(u => u.id) || []);

// 3. Encontrar users faltantes
const missingUsers = authUsers.users.filter(u => !publicIds.has(u.id));

console.log(`🔍 Users em auth MAS NÃO em public: ${missingUsers.length}\n`);

if (missingUsers.length === 0) {
  console.log('✅ Todos auth.users já estão sincronizados em public.users\n');
  process.exit(0);
}

// 4. Sincronizar users faltantes
console.log('🔄 Sincronizando users faltantes...\n');

let synced = 0;
let errors = 0;

for (const user of missingUsers) {
  console.log(`   Sincronizando: ${user.email}`);
  
  const { error } = await supabase.from('users').insert({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.name || user.email.split('@')[0],
    has_access: false, // Sem acesso por padrão (precisam validar código)
    created_at: user.created_at,
    email_verified: user.email_confirmed_at ? true : false,
    email_verified_at: user.email_confirmed_at
  });
  
  if (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    errors++;
  } else {
    console.log(`   ✅ Sincronizado`);
    synced++;
  }
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`\n📊 RESULTADO:\n`);
console.log(`   ✓ Sincronizados: ${synced}`);
console.log(`   ✗ Erros:         ${errors}\n`);

if (errors === 0) {
  console.log('✅ SINCRONIZAÇÃO COMPLETA: 100% SUCESSO\n');
} else {
  console.log('⚠️  Alguns users falharam na sincronização\n');
  process.exit(1);
}
