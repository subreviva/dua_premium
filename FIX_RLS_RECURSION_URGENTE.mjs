#!/usr/bin/env node
/**
 * CORREÇÃO URGENTE: RLS INFINITE RECURSION
 * 
 * O erro "infinite recursion detected in policy for relation 'users'"
 * indica que as políticas RLS estão se referenciando de forma circular.
 * 
 * Vamos diagnosticar e criar políticas RLS corretas.
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
});

console.log('\n🚨 CORREÇÃO URGENTE: RLS INFINITE RECURSION\n');

// ============================================================================
// GERAR SQL PARA CORRIGIR RLS POLICIES
// ============================================================================

const fixRLSSQL = `
-- ============================================================================
-- CORREÇÃO RLS POLICIES - ELIMINAR RECURSÃO INFINITA
-- ============================================================================

-- 1. DESABILITAR RLS temporariamente
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLICIES EXISTENTES (podem estar causando recursão)
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

-- 3. RECRIAR RLS POLICIES SIMPLES E SEM RECURSÃO
-- Política 1: Usuários podem ler próprios dados (usando auth.uid() diretamente)
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

-- Política 2: Usuários podem atualizar próprios dados
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id);

-- Política 3: Super admins podem ler todos (usando emails hardcoded)
CREATE POLICY "super_admins_select_all" ON public.users
  FOR SELECT 
  USING (
    auth.jwt() ->> 'email' IN ('estraca@2lados.pt', 'dev@dua.com')
  );

-- Política 4: Super admins podem atualizar todos
CREATE POLICY "super_admins_update_all" ON public.users
  FOR UPDATE 
  USING (
    auth.jwt() ->> 'email' IN ('estraca@2lados.pt', 'dev@dua.com')
  );

-- Política 5: Inserção só via auth (novos usuários)
CREATE POLICY "users_insert_auth" ON public.users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 4. REABILITAR RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICAÇÃO: POLICIES ATIVAS
-- ============================================================================
-- Para verificar se as policies foram criadas corretamente:
-- SELECT * FROM pg_policies WHERE tablename = 'users';

`;

console.log('📋 SQL GERADO PARA CORRIGIR RLS:\n');
console.log('═'.repeat(80));
console.log(fixRLSSQL);
console.log('═'.repeat(80));

// Salvar SQL em arquivo
import fs from 'fs';
fs.writeFileSync('FIX_RLS_INFINITE_RECURSION.sql', fixRLSSQL);

console.log('\n✅ ARQUIVO GERADO: FIX_RLS_INFINITE_RECURSION.sql\n');

console.log('🔧 INSTRUÇÕES PARA APLICAR A CORREÇÃO:\n');
console.log('1️⃣  Ir para o Supabase Dashboard');
console.log('   URL: https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm\n');

console.log('2️⃣  Ir para SQL Editor');
console.log('   Menu lateral: SQL Editor → New Query\n');

console.log('3️⃣  Copiar e colar o SQL do arquivo:');
console.log('   FIX_RLS_INFINITE_RECURSION.sql\n');

console.log('4️⃣  Executar o SQL (botão "RUN")\n');

console.log('5️⃣  Verificar se não há erros\n');

console.log('6️⃣  Executar novamente o teste:');
console.log('   node ADMIN_ULTRA_RIGOROSO_VERIFICATION.mjs\n');

// ============================================================================
// TESTAR A CORREÇÃO TEORICAMENTE
// ============================================================================

console.log('🧪 TESTE TEÓRICO DA CORREÇÃO:\n');

console.log('✅ ANTES (PROBLEMÁTICO):');
console.log('   Policy que causava recursão: EXISTS (SELECT 1 FROM users...)');
console.log('   Resultado: infinite recursion\n');

console.log('✅ DEPOIS (CORRIGIDO):');
console.log('   Policy simples: auth.uid() = id');
console.log('   Policy super admin: auth.jwt() ->> \'email\' IN (...)');
console.log('   Resultado: sem recursão\n');

console.log('🎯 VANTAGENS DA NOVA ABORDAGEM:');
console.log('   ✓ Sem subqueries na tabela users');
console.log('   ✓ Usa auth.uid() diretamente (mais rápido)');
console.log('   ✓ Super admins identificados por JWT email');
console.log('   ✓ Políticas independentes (sem dependências circulares)');
console.log('   ✓ Melhor performance\n');

console.log('⚠️  IMPORTANTE:');
console.log('   Após aplicar o SQL, aguardar 30 segundos antes de testar');
console.log('   para que as mudanças se propaguem no Supabase.\n');

console.log('🚀 PRÓXIMOS PASSOS:');
console.log('   1. Aplicar o SQL no Supabase Dashboard');
console.log('   2. Executar: node ADMIN_ULTRA_RIGOROSO_VERIFICATION.mjs');
console.log('   3. Verificar que todos os testes passam\n');