#!/usr/bin/env node

/**
 * VERIFICAR UTILIZADOR DEV@DUA.COM
 * Diagnosticar problema de login
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
console.log('🔍 DIAGNÓSTICO DO UTILIZADOR dev@dua.com')
console.log('═'.repeat(80) + '\n')

const supabase = createClient(URL, SERVICE_KEY)

// Buscar utilizador
console.log('📋 Buscando utilizador dev@dua.com...\n')

const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()

if (listError) {
  console.log('❌ Erro ao listar users:', listError.message)
  process.exit(1)
}

const devUser = users.find(u => u.email === 'dev@dua.com')

if (!devUser) {
  console.log('❌ Utilizador dev@dua.com NÃO encontrado!')
  console.log('\n💡 Solução: Criar novo utilizador dev@dua.com\n')
  process.exit(1)
}

console.log('✅ Utilizador encontrado!')
console.log('\n📊 Detalhes completos:\n')
console.log(JSON.stringify(devUser, null, 2))

console.log('\n' + '─'.repeat(80))
console.log('🔑 INFORMAÇÕES CRÍTICAS')
console.log('─'.repeat(80) + '\n')

console.log(`Email: ${devUser.email}`)
console.log(`ID: ${devUser.id}`)
console.log(`Email confirmado: ${devUser.email_confirmed_at ? '✅ SIM' : '❌ NÃO'}`)
console.log(`Criado em: ${new Date(devUser.created_at).toLocaleString('pt-PT')}`)
console.log(`Último login: ${devUser.last_sign_in_at ? new Date(devUser.last_sign_in_at).toLocaleString('pt-PT') : '❌ Nunca'}`)
console.log(`Telefone: ${devUser.phone || '❌ Não configurado'}`)
console.log(`Provider: ${devUser.app_metadata?.provider || 'email'}`)

// Verificar se tem password
const hasPassword = devUser.encrypted_password && devUser.encrypted_password.length > 0

console.log(`\n🔐 Password: ${hasPassword ? '✅ Configurada' : '❌ NÃO CONFIGURADA (PROBLEMA!)'}`)

if (!hasPassword) {
  console.log('\n' + '═'.repeat(80))
  console.log('🚨 PROBLEMA IDENTIFICADO!')
  console.log('═'.repeat(80))
  console.log('\nO utilizador dev@dua.com NÃO tem password configurada!')
  console.log('Isto acontece quando o utilizador é criado pela Admin API sem password.\n')
  
  console.log('💡 SOLUÇÕES:\n')
  console.log('1. Criar nova password via Admin API:')
  console.log('   node migration/18_reset_dev_password.mjs')
  console.log('\n2. Ou fazer reset de password via email:')
  console.log('   - Ir para página de login')
  console.log('   - Clicar em "Esqueci a password"')
  console.log('   - Introduzir dev@dua.com')
  console.log('   - Seguir link do email\n')
  
  console.log('3. Ou usar outro utilizador que já funciona:')
  console.log('   - estracaofficial@gmail.com')
  console.log('   - jorsonnrijo@gmail.com')
  console.log('   - etc.\n')
}

// Verificar profile
console.log('\n' + '─'.repeat(80))
console.log('👤 VERIFICAR PROFILE')
console.log('─'.repeat(80) + '\n')

const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', devUser.id)
  .single()

if (profileError) {
  console.log('⚠️  Profile não encontrado ou erro:', profileError.message)
} else {
  console.log('✅ Profile existe:')
  console.log(JSON.stringify(profile, null, 2))
}

console.log('\n' + '═'.repeat(80))
console.log('📝 RESUMO')
console.log('═'.repeat(80) + '\n')

if (!hasPassword) {
  console.log('❌ Login não funciona porque utilizador não tem password configurada')
  console.log('✅ Execute: node migration/18_reset_dev_password.mjs\n')
} else {
  console.log('✅ Utilizador parece estar OK')
  console.log('⚠️  Se login não funciona, pode ser problema de:')
  console.log('   - Password errada')
  console.log('   - Email não confirmado')
  console.log('   - Cache do browser')
  console.log('   - Configuração do site (.env.local)\n')
}
