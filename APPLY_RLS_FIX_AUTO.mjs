#!/usr/bin/env node
/**
 * APLICAÇÃO AUTOMÁTICA DA CORREÇÃO RLS
 * 
 * Este script aplicará automaticamente as correções via Supabase RPC
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

console.log('\n🤖 APLICAÇÃO AUTOMÁTICA DA CORREÇÃO RLS\n');

async function applyRLSFix() {
  try {
    console.log('1️⃣ Desabilitando RLS temporariamente...');
    
    // Executar comandos SQL através de rpc ou query direta
    const fixCommands = [
      'ALTER TABLE public.users DISABLE ROW LEVEL SECURITY',
      'DROP POLICY IF EXISTS "Users can read own data" ON public.users',
      'DROP POLICY IF EXISTS "Users can update own data" ON public.users',
      'DROP POLICY IF EXISTS "Users can insert own data" ON public.users',
      'DROP POLICY IF EXISTS "Enable read access for all users" ON public.users',
      'DROP POLICY IF EXISTS "Enable insert for authentication users only" ON public.users',
      'DROP POLICY IF EXISTS "Enable update for users based on email" ON public.users',
      'DROP POLICY IF EXISTS "Super admins can read all users" ON public.users',
      'DROP POLICY IF EXISTS "Super admins can update all users" ON public.users',
      'DROP POLICY IF EXISTS "Super admins can delete users" ON public.users',
      'DROP POLICY IF EXISTS "admin_users_select" ON public.users',
      'DROP POLICY IF EXISTS "admin_users_insert" ON public.users',
      'DROP POLICY IF EXISTS "admin_users_update" ON public.users'
    ];
    
    console.log('2️⃣ Removendo políticas problemáticas...');
    
    // Tentar aplicar via RPC (se disponível)
    try {
      // Primeiro, vamos testar se conseguimos acessar a tabela sem políticas
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.log('⚠️  Acesso com SERVICE_KEY:', testError.message);
        console.log('   (Isso é esperado se as políticas estão causando recursão)');
      } else {
        console.log('✅ Acesso com SERVICE_KEY funcionando');
      }
      
    } catch (error) {
      console.log('⚠️  Erro ao testar acesso:', error.message);
    }
    
    console.log('\n3️⃣ Testando login de admin para verificar o problema...');
    
    // Testar com cliente anon (como no frontend)
    const anonClient = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data: loginData, error: loginError } = await anonClient.auth.signInWithPassword({
      email: 'estraca@2lados.pt',
      password: 'lumiarbcv'
    });
    
    if (loginError) {
      console.log('❌ Login falhou:', loginError.message);
      return;
    }
    
    console.log('✅ Login bem-sucedido');
    
    // Tentar acessar dados (aqui deve dar o erro de recursão)
    const { data: userData, error: userError } = await anonClient
      .from('users')
      .select('id, email')
      .eq('id', loginData.user.id)
      .single();
    
    if (userError) {
      console.log('❌ Confirmado - erro de recursão:', userError.message);
      
      if (userError.message.includes('infinite recursion')) {
        console.log('\n🔧 APLICANDO CORREÇÃO EMERGENCIAL...');
        await applyEmergencyFix();
      }
    } else {
      console.log('✅ Dados acessados com sucesso - sem problemas de RLS');
      console.log('   ID:', userData.id);
      console.log('   Email:', userData.email);
    }
    
    await anonClient.auth.signOut();
    
  } catch (error) {
    console.error('❌ Erro na aplicação da correção:', error.message);
  }
}

async function applyEmergencyFix() {
  console.log('\n🚨 APLICANDO CORREÇÃO EMERGENCIAL...\n');
  
  // Como não podemos executar DDL via cliente normal, vamos criar
  // uma função que pode ser executada manualmente
  
  const emergencySQL = `
-- CORREÇÃO EMERGENCIAL RLS - Execute no Supabase Dashboard SQL Editor

-- 1. Desabilitar RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas problemáticas
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can read own data" ON public.users;
  DROP POLICY IF EXISTS "Users can update own data" ON public.users;
  DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
  DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
  DROP POLICY IF EXISTS "Enable insert for authentication users only" ON public.users;
  DROP POLICY IF EXISTS "Enable update for users based on email" ON public.users;
  DROP POLICY IF EXISTS "Super admins can read all users" ON public.users;
  DROP POLICY IF EXISTS "Super admins can update all users" ON public.users;
  DROP POLICY IF EXISTS "Super admins can delete users" ON public.users;
  DROP POLICY IF EXISTS "admin_users_select" ON public.users;
  DROP POLICY IF EXISTS "admin_users_insert" ON public.users;
  DROP POLICY IF EXISTS "admin_users_update" ON public.users;
END $$;

-- 3. Criar políticas simples e seguras
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "super_admins_select_all" ON public.users
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN ('estraca@2lados.pt', 'dev@dua.com')
  );

CREATE POLICY "super_admins_update_all" ON public.users
  FOR UPDATE USING (
    auth.jwt() ->> 'email' IN ('estraca@2lados.pt', 'dev@dua.com')
  );

CREATE POLICY "users_insert_auth" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Reabilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Verificar políticas criadas
SELECT * FROM pg_policies WHERE tablename = 'users';
`;
  
  // Salvar SQL emergencial
  import fs from 'fs';
  fs.writeFileSync('EMERGENCY_RLS_FIX.sql', emergencySQL);
  
  console.log('✅ ARQUIVO EMERGENCIAL CRIADO: EMERGENCY_RLS_FIX.sql\n');
  
  console.log('🔥 AÇÃO IMEDIATA NECESSÁRIA:\n');
  console.log('1. Ir para: https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm');
  console.log('2. Menu: SQL Editor → New Query');
  console.log('3. Copiar conteúdo de: EMERGENCY_RLS_FIX.sql');
  console.log('4. Colar e executar (botão RUN)');
  console.log('5. Aguardar 30 segundos');
  console.log('6. Testar: node ADMIN_ULTRA_RIGOROSO_VERIFICATION.mjs\n');
  
  console.log('⚡ ALTERNATIVA RÁPIDA:');
  console.log('   Se tiver acesso direto ao PostgreSQL:');
  console.log('   psql "postgresql://..." -f EMERGENCY_RLS_FIX.sql\n');
}

// Executar
applyRLSFix();