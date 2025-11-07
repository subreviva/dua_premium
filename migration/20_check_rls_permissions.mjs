#!/usr/bin/env node

/**
 * DIAGNÓSTICO DE PERMISSÕES - RLS
 * Verificar políticas de segurança que podem estar bloqueando acesso
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

const URL = urlMatch[1].trim()
const SERVICE_KEY = serviceMatch[1].trim()

console.log('\n' + '═'.repeat(80))
console.log('🔍 DIAGNÓSTICO DE PERMISSÕES - RLS')
console.log('═'.repeat(80) + '\n')

const supabase = createClient(URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Verificar profile do dev@dua.com
const DEV_USER_ID = '22b7436c-41be-4332-859e-9d2315bcfe1f'

console.log('👤 Verificando profile do dev@dua.com...\n')

const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', DEV_USER_ID)
  .single()

if (profileError) {
  console.log('❌ Erro ao buscar profile:', profileError.message)
  console.log('\n🔍 Detalhes do erro:')
  console.log(JSON.stringify(profileError, null, 2))
} else {
  console.log('✅ Profile encontrado:')
  console.log(JSON.stringify(profile, null, 2))
}

// Verificar se tabela profiles tem RLS ativo
console.log('\n' + '─'.repeat(80))
console.log('🔒 VERIFICANDO RLS NA TABELA profiles')
console.log('─'.repeat(80) + '\n')

// Verificar políticas RLS via query direta
console.log('📋 Tentando verificar políticas RLS...\n')

let policies = null
let policiesError = null

try {
  const result = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'profiles')
  
  policies = result.data
  policiesError = result.error
} catch (err) {
  policiesError = { message: 'Tabela pg_policies não acessível' }
}

if (policies && policies.length > 0) {
  console.log(`✅ ${policies.length} política(s) RLS encontrada(s):`)
  policies.forEach(p => {
    console.log(`   - ${p.policyname}: ${p.cmd}`)
  })
} else {
  console.log('⚠️  Não foi possível listar políticas RLS')
  console.log('   Isto é normal - vamos verificar de outra forma\n')
}

// Testar acesso com diferentes roles
console.log('\n' + '═'.repeat(80))
console.log('🧪 TESTANDO ACESSO À TABELA profiles')
console.log('═'.repeat(80) + '\n')

// Teste 1: Com SERVICE_ROLE (bypass RLS)
console.log('1️⃣  Teste com SERVICE_ROLE (admin - bypass RLS)...')
const { data: test1, error: error1 } = await supabase
  .from('profiles')
  .select('id, email, role')
  .limit(5)

if (error1) {
  console.log(`   ❌ Erro: ${error1.message}`)
} else {
  console.log(`   ✅ Sucesso - ${test1.length} perfis encontrados`)
}

// Teste 2: Simular acesso de utilizador autenticado
console.log('\n2️⃣  Simulando acesso de utilizador autenticado...')

// Criar cliente com ANON key e fazer login
const anonMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)
const ANON_KEY = anonMatch[1].trim()

const anonClient = createClient(URL, ANON_KEY)

const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
  email: 'dev@dua.com',
  password: 'DuaAdmin2025!'
})

if (authError) {
  console.log(`   ❌ Erro no login: ${authError.message}`)
} else {
  console.log('   ✅ Login bem-sucedido')
  
  // Tentar acessar profile próprio
  console.log('   🔍 Tentando acessar profile próprio...')
  
  const { data: myProfile, error: myProfileError } = await anonClient
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single()
  
  if (myProfileError) {
    console.log(`   ❌ ERRO: ${myProfileError.message}`)
    console.log('\n   🚨 PROBLEMA ENCONTRADO!')
    console.log('   O utilizador autenticado não consegue acessar seu próprio profile')
    console.log('   Isto indica que as políticas RLS estão muito restritivas\n')
  } else {
    console.log('   ✅ Sucesso - Profile acessível')
    console.log(`   📋 Role: ${myProfile.role}`)
    console.log(`   💰 Saldo: ${myProfile.dua_balance} DUA Coins`)
  }
  
  // Fazer logout
  await anonClient.auth.signOut()
}

console.log('\n' + '═'.repeat(80))
console.log('💡 SOLUÇÃO')
console.log('═'.repeat(80) + '\n')

console.log('Se o erro "Não foi possível verificar suas permissões" apareceu,')
console.log('isto significa que as políticas RLS estão bloqueando o acesso.\n')

console.log('🔧 CORRIGIR AGORA:')
console.log('   1. Execute: node migration/21_fix_rls_policies.mjs')
console.log('   2. Ou acesse o Supabase Dashboard')
console.log('   3. SQL Editor → Cole e execute as políticas corretas\n')

console.log('📝 As políticas RLS devem permitir:')
console.log('   ✓ Utilizador autenticado pode ler seu próprio profile')
console.log('   ✓ Utilizador autenticado pode atualizar seu próprio profile')
console.log('   ✓ Admins podem ler/editar todos os profiles\n')
