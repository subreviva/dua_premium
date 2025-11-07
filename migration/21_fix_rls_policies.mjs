#!/usr/bin/env node

/**
 * CORRIGIR POLÍTICAS RLS
 * Remove políticas problemáticas e cria novas corretas
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ler credenciais do .env.local
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf-8')

const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)
const serviceMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)
const projectMatch = urlMatch[1].match(/https:\/\/([^.]+)/)

const URL = urlMatch[1].trim()
const SERVICE_KEY = serviceMatch[1].trim()
const PROJECT_REF = projectMatch[1]

console.log('\n' + '═'.repeat(80))
console.log('🔧 CORRIGIR POLÍTICAS RLS DA TABELA profiles')
console.log('═'.repeat(80) + '\n')

console.log(`📋 Projeto: ${PROJECT_REF}`)
console.log(`🔗 URL: ${URL}\n`)

// SQL para corrigir políticas RLS
const SQL_FIX_POLICIES = `
-- ════════════════════════════════════════════════════════════════
-- CORRIGIR POLÍTICAS RLS DA TABELA profiles
-- ════════════════════════════════════════════════════════════════

-- 1. Remover TODAS as políticas antigas (podem estar causando recursão)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

-- 2. Garantir que RLS está ativo
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas SIMPLES e SEM RECURSÃO

-- SELECT: Utilizadores podem ver seu próprio profile
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- INSERT: Utilizadores podem criar seu próprio profile
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- UPDATE: Utilizadores podem atualizar seu próprio profile
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- DELETE: Apenas service_role pode deletar
-- (sem política = apenas admin via SERVICE_ROLE_KEY)

-- ════════════════════════════════════════════════════════════════
-- VERIFICAR RESULTADO
-- ════════════════════════════════════════════════════════════════

-- Listar políticas ativas
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
WHERE tablename = 'profiles'
ORDER BY policyname;
`

console.log('📝 SQL gerado:\n')
console.log('─'.repeat(80))
console.log(SQL_FIX_POLICIES)
console.log('─'.repeat(80) + '\n')

// Salvar SQL num ficheiro
const sqlPath = path.join(__dirname, 'fix-rls-policies.sql')
fs.writeFileSync(sqlPath, SQL_FIX_POLICIES, 'utf-8')
console.log(`✅ SQL salvo em: ${sqlPath}\n`)

console.log('═'.repeat(80))
console.log('🎯 COMO APLICAR AS CORREÇÕES')
console.log('═'.repeat(80) + '\n')

console.log('📌 OPÇÃO 1 - Via Supabase Dashboard (RECOMENDADO):\n')
console.log(`   1. Acesse: https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new`)
console.log(`   2. Cole o SQL acima (ou abra: migration/fix-rls-policies.sql)`)
console.log('   3. Clique em "RUN"')
console.log('   4. ✅ Políticas corrigidas!\n')

console.log('📌 OPÇÃO 2 - Via psql (se tiver acesso direto):\n')
console.log('   psql [connection_string] < migration/fix-rls-policies.sql\n')

console.log('📌 OPÇÃO 3 - Copiar e executar manualmente:\n')
console.log('   1. Copie o SQL acima')
console.log('   2. Execute no SQL Editor do Supabase\n')

console.log('═'.repeat(80))
console.log('⚠️  IMPORTANTE')
console.log('═'.repeat(80) + '\n')

console.log('❌ NÃO posso executar este SQL automaticamente porque:')
console.log('   - A API do Supabase não expõe execução direta de SQL DDL')
console.log('   - É necessário usar o Dashboard ou psql diretamente')
console.log('   - Isto é por segurança (apenas admins podem alterar esquema)\n')

console.log('✅ Após executar o SQL, teste novamente com:')
console.log('   node migration/20_check_rls_permissions.mjs\n')

console.log('💡 Depois de corrigir, o erro "Não foi possível verificar suas permissões"')
console.log('   deve desaparecer e o login funcionará normalmente!\n')
