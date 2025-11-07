#!/usr/bin/env node
/**
 * VERIFICAR SE PROBLEMA É VERCEL ENV VARS
 */

import { config } from 'dotenv';

config({ path: '.env.local' });

console.log('\n🔍 VERIFICAÇÃO: VARIÁVEIS DE AMBIENTE\n');

const localVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...'
};

console.log('📋 VARIÁVEIS LOCAIS (.env.local):');
console.log(JSON.stringify(localVars, null, 2));

// Ler .env.vercel
config({ path: '.env.vercel', override: true });

const vercelVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...'
};

console.log('\n📋 VARIÁVEIS VERCEL (.env.vercel):');
console.log(JSON.stringify(vercelVars, null, 2));

// Comparar
console.log('\n🔍 COMPARAÇÃO:\n');

if (localVars.NEXT_PUBLIC_SUPABASE_URL === vercelVars.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL: IDÊNTICAS');
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL: DIFERENTES!');
  console.log('   Local:', localVars.NEXT_PUBLIC_SUPABASE_URL);
  console.log('   Vercel:', vercelVars.NEXT_PUBLIC_SUPABASE_URL);
}

if (localVars.NEXT_PUBLIC_SUPABASE_ANON_KEY === vercelVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: IDÊNTICAS');
} else {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY: DIFERENTES!');
}

console.log('\n💡 SE VARIÁVEIS SÃO IDÊNTICAS:');
console.log('   Problema é RLS no Vercel (mas não localmente)');
console.log('   → Possível cache do Supabase');
console.log('   → Verificar Supabase Dashboard → Authentication → Policies\n');

console.log('🔧 AÇÃO IMEDIATA:');
console.log('   1. Verificar RLS policy em public.users');
console.log('   2. Criar policy se não existir');
console.log('   3. Re-deploy Vercel após fix\n');
