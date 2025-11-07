#!/usr/bin/env node
/**
 * CRIAR RLS POLICY: Users podem ler próprios dados
 * 
 * CORREÇÃO IMEDIATA do erro "Não foi possível verificar suas permissões"
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
console.log('║   CORREÇÃO URGENTE: CRIAR RLS POLICY                        ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

console.log('🔧 Criando RLS Policy para tabela users...\n');

// SQL para criar policy
const createPolicySQL = `
-- Criar policy que permite users lerem próprios dados
CREATE POLICY IF NOT EXISTS "Users can read own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);
`;

console.log('📝 SQL a executar:');
console.log(createPolicySQL);

console.log('⚠️  SQL direto não suportado via SDK, gerando arquivo...\n');

// Alternativa: Verificar se RLS está habilitado
const { data: tableData, error: tableError } = await supabase
  .from('users')
  .select('id')
  .limit(1);

if (tableError) {
  console.log('❌ Tabela users não acessível:', tableError.message);
} else {
  console.log('✅ Tabela users acessível via SERVICE_KEY');
}

console.log('\n═══════════════════════════════════════════════════════════════\n');

console.log('🎯 AÇÃO MANUAL NECESSÁRIA:\n');
console.log('Como não posso executar SQL direto, você precisa:\n');

console.log('1️⃣  Aceder ao Supabase Dashboard:');
console.log('   https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/editor\n');

console.log('2️⃣  Ir para SQL Editor (menu lateral)\n');

console.log('3️⃣  Executar este SQL:\n');
console.log('```sql');
console.log('-- Habilitar RLS na tabela users (se ainda não estiver)');
console.log('ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;');
console.log('');
console.log('-- Criar policy para SELECT (users podem ler próprios dados)');
console.log('CREATE POLICY IF NOT EXISTS "Users can read own data"');
console.log('ON public.users');
console.log('FOR SELECT');
console.log('USING (auth.uid() = id);');
console.log('');
console.log('-- Criar policy para UPDATE (users podem atualizar próprios dados)');
console.log('CREATE POLICY IF NOT EXISTS "Users can update own data"');
console.log('ON public.users');
console.log('FOR UPDATE');
console.log('USING (auth.uid() = id);');
console.log('```\n');

console.log('4️⃣  Clicar em "RUN" para executar\n');

console.log('5️⃣  Verificar policies criadas:');
console.log('   Authentication → Policies → public.users\n');

console.log('═══════════════════════════════════════════════════════════════\n');

console.log('✅ APÓS CRIAR POLICIES:\n');
console.log('   1. Aguardar 30 segundos');
console.log('   2. Re-testar login no Vercel');
console.log('   3. Erro "Não foi possível verificar suas permissões" RESOLVIDO\n');

// Criar arquivo SQL para facilitar
const fs = await import('fs');
const sqlContent = `-- ============================================================
-- CORREÇÃO URGENTE: RLS POLICIES PARA TABELA USERS
-- ============================================================
-- Erro: "Não foi possível verificar suas permissões"
-- Causa: Users autenticados não conseguem ler public.users
-- Solução: Criar policies que permitem leitura/escrita própria
-- ============================================================

-- 1. Habilitar RLS (se ainda não estiver)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Policy para SELECT (ler próprios dados)
CREATE POLICY IF NOT EXISTS "Users can read own data"
ON public.users
FOR SELECT
USING (auth.uid() = id);

-- 3. Policy para UPDATE (atualizar próprios dados)
CREATE POLICY IF NOT EXISTS "Users can update own data"
ON public.users
FOR UPDATE
USING (auth.uid() = id);

-- 4. Verificar policies criadas
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies
WHERE tablename = 'users';
`;

fs.writeFileSync('FIX_RLS_POLICIES.sql', sqlContent);

console.log('📄 Arquivo criado: FIX_RLS_POLICIES.sql');
console.log('   Pode copiar e colar no Supabase SQL Editor\n');
