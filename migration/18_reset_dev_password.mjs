#!/usr/bin/env node

/**
 * DEFINIR PASSWORD PARA dev@dua.com
 * Resolver problema de login
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
console.log('🔐 DEFINIR PASSWORD PARA dev@dua.com')
console.log('═'.repeat(80) + '\n')

const supabase = createClient(URL, SERVICE_KEY)

// Password nova (forte e fácil de lembrar)
const NEW_PASSWORD = 'DuaAdmin2025!'

console.log('📋 Atualizando utilizador dev@dua.com...')
console.log(`🔑 Nova password: ${NEW_PASSWORD}\n`)

try {
  // Atualizar password usando Admin API
  const { data, error } = await supabase.auth.admin.updateUserById(
    '22b7436c-41be-4332-859e-9d2315bcfe1f',
    {
      password: NEW_PASSWORD,
      email_confirm: true
    }
  )

  if (error) {
    console.log('❌ Erro ao atualizar password:', error.message)
    process.exit(1)
  }

  console.log('✅ Password atualizada com sucesso!')
  console.log('\n' + '═'.repeat(80))
  console.log('🎉 PRONTO PARA USAR!')
  console.log('═'.repeat(80) + '\n')
  
  console.log('📧 Email: dev@dua.com')
  console.log(`🔑 Password: ${NEW_PASSWORD}`)
  console.log('\n💡 Guarde esta password num local seguro!')
  
  console.log('\n🚀 Próximos passos:')
  console.log('   1. Acesse o site (http://localhost:3000 ou produção)')
  console.log('   2. Clique em "Login"')
  console.log('   3. Use as credenciais acima')
  console.log('   4. Acesso com sucesso! ✓\n')

  // Salvar credenciais num ficheiro
  const credsPath = path.join(__dirname, 'dev-admin-credentials.txt')
  const credsContent = `
═══════════════════════════════════════════════════════════════
  CREDENCIAIS DO ADMINISTRADOR
═══════════════════════════════════════════════════════════════

Email:    dev@dua.com
Password: ${NEW_PASSWORD}

Criado:   ${new Date().toLocaleString('pt-PT')}
ID:       22b7436c-41be-4332-859e-9d2315bcfe1f

⚠️  IMPORTANTE: Mantenha estas credenciais em segurança!
⚠️  Não partilhe com ninguém!

═══════════════════════════════════════════════════════════════
`

  fs.writeFileSync(credsPath, credsContent, 'utf-8')
  console.log(`📄 Credenciais salvas em: ${credsPath}\n`)

} catch (err) {
  console.log('❌ Erro:', err.message)
  process.exit(1)
}
