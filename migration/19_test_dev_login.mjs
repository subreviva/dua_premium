#!/usr/bin/env node

/**
 * TESTAR LOGIN DO dev@dua.com
 * Verificar se password funciona
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
const anonMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)

const URL = urlMatch[1].trim()
const ANON_KEY = anonMatch[1].trim()

console.log('\n' + '═'.repeat(80))
console.log('🧪 TESTAR LOGIN - dev@dua.com')
console.log('═'.repeat(80) + '\n')

// Criar cliente com ANON key (simula login do frontend)
const supabase = createClient(URL, ANON_KEY)

const EMAIL = 'dev@dua.com'
const PASSWORD = 'DuaAdmin2025!'

console.log(`📧 Email: ${EMAIL}`)
console.log(`🔑 Password: ${PASSWORD}`)
console.log('\n🔄 Tentando login...\n')

try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD
  })

  if (error) {
    console.log('❌ LOGIN FALHOU!')
    console.log(`Erro: ${error.message}`)
    console.log('\n💡 Possíveis causas:')
    console.log('   - Password incorreta')
    console.log('   - Email não confirmado')
    console.log('   - Utilizador desativado')
    console.log('   - Configuração do Supabase\n')
    process.exit(1)
  }

  console.log('✅ LOGIN BEM-SUCEDIDO!')
  console.log('\n' + '═'.repeat(80))
  console.log('📊 DADOS DA SESSÃO')
  console.log('═'.repeat(80) + '\n')
  
  console.log(`User ID: ${data.user.id}`)
  console.log(`Email: ${data.user.email}`)
  console.log(`Email verificado: ${data.user.email_confirmed_at ? '✅' : '❌'}`)
  console.log(`Role: ${data.user.user_metadata?.role || 'user'}`)
  console.log(`Nome: ${data.user.user_metadata?.name || 'N/A'}`)
  
  console.log('\n🎫 Token (primeiros 50 caracteres):')
  console.log(data.session.access_token.substring(0, 50) + '...')
  
  console.log('\n⏰ Sessão expira em:')
  console.log(new Date(data.session.expires_at * 1000).toLocaleString('pt-PT'))
  
  console.log('\n' + '═'.repeat(80))
  console.log('🎉 TUDO OK! LOGIN FUNCIONA PERFEITAMENTE!')
  console.log('═'.repeat(80) + '\n')
  
  console.log('✅ Pode usar estas credenciais no site:')
  console.log(`   Email: ${EMAIL}`)
  console.log(`   Password: ${PASSWORD}\n`)

  // Fazer logout
  await supabase.auth.signOut()
  console.log('🔚 Logout feito (limpeza)\n')

} catch (err) {
  console.log('❌ Erro durante teste:', err.message)
  process.exit(1)
}
