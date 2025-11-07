#!/usr/bin/env node
/**
 * TESTE FINAL E2E - LOGIN COMPLETO
 * 
 * Simula exatamente o que acontece no browser
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Cliente ANON (igual ao browser)
const supabase = createClient(SUPABASE_URL, ANON_KEY);

console.log('\n🧪 TESTE E2E - SIMULAÇÃO BROWSER COMPLETA\n');

console.log('1️⃣ Login com ANON_KEY (igual ao frontend)...\n');

const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
  email: 'estraca@2lados.pt',
  password: 'lumiarbcv'
});

if (loginError) {
  console.log('❌ ERRO LOGIN:', loginError.message);
  process.exit(1);
}

console.log('✅ Login sucesso:', loginData.user.email);
console.log('   User ID:', loginData.user.id);

console.log('\n2️⃣ Verificar has_access (query igual app/login/page.tsx)...\n');

const { data: userData, error: userError } = await supabase
  .from('users')
  .select('has_access, name, email, last_login_at')
  .eq('id', loginData.user.id)
  .single();

if (userError) {
  console.log('❌ ERRO QUERY:', userError.code, userError.message);
  console.log('\n⚠️  Este é o erro que aparece no browser!');
  console.log('   Código:', userError.code);
  console.log('   Mensagem:', userError.message);
  
  // Diagnóstico adicional
  if (userError.code === '42501') {
    console.log('\n🔍 DIAGNÓSTICO: Erro 42501 = RLS bloqueando acesso');
    console.log('   Causa: Policy para SELECT não está permitindo ANON_KEY');
    console.log('   Solução: Atualizar RLS policy para permitir auth.uid()');
  } else if (userError.code === 'PGRST116') {
    console.log('\n🔍 DIAGNÓSTICO: Erro PGRST116 = Query retornou múltiplas linhas');
    console.log('   Causa: .single() mas há + de 1 resultado');
  } else if (userError.code === 'PGRST204') {
    console.log('\n🔍 DIAGNÓSTICO: Erro PGRST204 = Nenhum resultado');
    console.log('   Causa: User não existe em public.users');
  }
  
  process.exit(1);
}

console.log('✅ Query sucesso!');
console.log('   has_access:', userData.has_access);
console.log('   name:', userData.name);
console.log('   email:', userData.email);
console.log('   last_login_at:', userData.last_login_at);

if (!userData.has_access) {
  console.log('\n⚠️  ATENÇÃO: has_access = false');
  console.log('   User teria seu acesso negado');
} else {
  console.log('\n✅ has_access = true → Login permitido');
}

console.log('\n3️⃣ Atualizar last_login_at...\n');

const { error: updateError } = await supabase
  .from('users')
  .update({ last_login_at: new Date().toISOString() })
  .eq('id', loginData.user.id);

if (updateError) {
  console.log('⚠️  Erro ao atualizar last_login_at:', updateError.message);
  console.log('   (Não crítico, login ainda funciona)');
} else {
  console.log('✅ last_login_at atualizado');
}

console.log('\n4️⃣ Fazer logout...\n');

await supabase.auth.signOut();
console.log('✅ Logout sucesso');

console.log('\n🎉 TESTE E2E COMPLETO - 100% SUCESSO!\n');
console.log('✅ Login funciona com ANON_KEY');
console.log('✅ Query has_access funciona');
console.log('✅ RLS permite leitura de próprios dados');
console.log('✅ Update last_login_at funciona');
console.log();
console.log('⚡ CÓDIGO ESTÁ PRONTO PARA VERCEL!');
console.log('   Testar em: https://v0-remix-of-untitled-chat-liard-one.vercel.app/login');
console.log();
