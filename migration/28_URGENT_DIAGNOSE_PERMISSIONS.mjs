#!/usr/bin/env node
/**
 * DIAGNÓSTICO URGENTE: "Não foi possível verificar suas permissões"
 * 
 * Verificar exatamente o que está a falhar na query users
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🔍 DIAGNÓSTICO URGENTE: ERRO DE PERMISSÕES\n');

const supabase = createClient(SUPABASE_URL, ANON_KEY);

// Simular login exato como no browser
const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
  email: 'estraca@2lados.pt',
  password: 'lumiarbcv'
});

if (loginError) {
  console.log('❌ FALHA NO LOGIN:', loginError.message);
  process.exit(1);
}

console.log('✓ Login bem-sucedido:', loginData.user.email);
console.log('  User ID:', loginData.user.id);

// Tentar query EXATA do app/login/page.tsx
console.log('\n🔍 Testando query EXATA do código (linha 108-113)...\n');

const { data: userData, error: userError } = await supabase
  .from('users')
  .select('has_access, name')
  .eq('id', loginData.user.id)
  .single();

if (userError) {
  console.log('❌ ERRO NA QUERY:', userError.code);
  console.log('   Mensagem:', userError.message);
  console.log('   Detalhes:', userError.details);
  console.log('   Hint:', userError.hint);
  
  // Diagnosticar causa
  if (userError.code === 'PGRST116') {
    console.log('\n💡 CAUSA: RLS (Row Level Security) bloqueando acesso');
    console.log('   O user autenticado não consegue ler a própria linha em public.users');
    console.log('\n🔧 SOLUÇÃO: Criar RLS policy que permita user ler próprios dados');
  } else if (userError.code === 'PGRST301') {
    console.log('\n💡 CAUSA: Nenhuma linha encontrada');
    console.log('   User existe em auth.users mas NÃO em public.users');
    console.log('\n🔧 SOLUÇÃO: Sincronizar auth.users → public.users');
  } else if (userError.code === '42501') {
    console.log('\n💡 CAUSA: Permissão insuficiente');
    console.log('   RLS policy não permite leitura');
  }
  
  // Verificar se user existe em public.users (usando SERVICE_KEY)
  console.log('\n🔍 Verificando com SERVICE_KEY...\n');
  
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false }
  });
  
  const { data: adminUserData, error: adminError } = await adminClient
    .from('users')
    .select('id, email, has_access, name')
    .eq('id', loginData.user.id)
    .single();
  
  if (adminError) {
    console.log('❌ Erro com SERVICE_KEY também:', adminError.message);
    console.log('   User NÃO EXISTE em public.users');
    console.log('\n🔧 EXECUTANDO SINCRONIZAÇÃO...\n');
    
    const { error: insertError } = await adminClient.from('users').insert({
      id: loginData.user.id,
      email: loginData.user.email,
      name: loginData.user.user_metadata?.name || loginData.user.email.split('@')[0],
      has_access: true, // Admin tem acesso
      created_at: loginData.user.created_at
    });
    
    if (insertError) {
      console.log('❌ Erro ao inserir:', insertError.message);
    } else {
      console.log('✅ User sincronizado em public.users');
      console.log('   Re-testando query...\n');
      
      // Re-testar com ANON_KEY
      const { data: retestData, error: retestError } = await supabase
        .from('users')
        .select('has_access, name')
        .eq('id', loginData.user.id)
        .single();
      
      if (retestError) {
        console.log('❌ AINDA FALHA:', retestError.code, retestError.message);
        console.log('   PROBLEMA É RLS POLICY!');
      } else {
        console.log('✅ Agora funciona!');
        console.log('   has_access:', retestData.has_access);
        console.log('   name:', retestData.name);
      }
    }
  } else {
    console.log('✓ User EXISTE em public.users (com SERVICE_KEY):');
    console.log('   email:', adminUserData.email);
    console.log('   has_access:', adminUserData.has_access);
    console.log('   name:', adminUserData.name);
    console.log('\n💡 PROBLEMA: RLS bloqueando acesso com ANON_KEY');
    console.log('   Mesmo existindo, o user não consegue ler com ANON_KEY');
  }
  
  process.exit(1);
} else {
  console.log('✅ Query funcionou!');
  console.log('   has_access:', userData.has_access);
  console.log('   name:', userData.name);
}

await supabase.auth.signOut();
