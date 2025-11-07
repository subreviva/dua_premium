#!/usr/bin/env node

/**
 * TESTE DE LOGIN CROSS-DATABASE
 * Verifica se utilizadores podem fazer login em ambas as Supabase
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// ⚠️ CREDENCIAIS ANTIGAS - DUA IA (DESATIVADA/MIGRADA)
// Nota: Pode retornar "Invalid API key" - isto é ESPERADO após migração
const DUA_IA_URL = 'https://gocjbfcztorfswlkkjqi.supabase.co'
const DUA_IA_KEY = 'DESATIVADA_APOS_MIGRACAO'

// ✅ CREDENCIAIS ATUAIS - DUA COIN (PRODUÇÃO)
const DUA_COIN_URL = 'https://nranmngyocaqjwcokcxm.supabase.co'
const DUA_COIN_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2NDkzMDAsImV4cCI6MjA0NjIyNTMwMH0.dFKTXrh2w8FOzcXndyjlVXP-jUaBUxkBZEWLd4UQeTU'

const log = {
  info: (m) => console.log(`\x1b[34m📋 ${m}\x1b[0m`),
  success: (m) => console.log(`\x1b[32m✅ ${m}\x1b[0m`),
  warn: (m) => console.log(`\x1b[33m⚠️  ${m}\x1b[0m`),
  error: (m) => console.log(`\x1b[31m❌ ${m}\x1b[0m`)
}

async function testLogin(email, password, supabaseUrl, supabaseKey, dbName) {
  const client = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
  
  log.info(`Testando login de ${email} em ${dbName}...`)
  
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      log.error(`${dbName}: ${error.message}`)
      return false
    }
    
    if (data.user) {
      log.success(`${dbName}: Login OK! UUID: ${data.user.id}`)
      return true
    }
    
    log.warn(`${dbName}: Sem erro mas sem user`)
    return false
    
  } catch (e) {
    log.error(`${dbName}: Exceção: ${e.message}`)
    return false
  }
}

async function getUsers() {
  const DUA_IA_SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdvb2piZmN6dG9yZnN3bGtranFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODUwNzUwMywiZXhwIjoyMDc0MDgzNTAzfQ.Jh4qpCj5xDFl3p8RZKQ1PGh5r8N-sZyf5sK7rh2JGxY'
  const DUA_COIN_SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ'
  
  const duaIA = createClient(DUA_IA_URL, DUA_IA_SERVICE, {
    auth: { persistSession: false }
  })
  
  const duaCoin = createClient(DUA_COIN_URL, DUA_COIN_SERVICE, {
    auth: { persistSession: false }
  })
  
  log.info('Buscando utilizadores...')
  
  const { data: iaUsers } = await duaIA.auth.admin.listUsers()
  const { data: coinUsers } = await duaCoin.auth.admin.listUsers()
  
  return {
    ia: iaUsers.users,
    coin: coinUsers.users
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   TESTE DE LOGIN CROSS-DATABASE                           ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  const users = await getUsers()
  
  console.log('\n📊 UTILIZADORES:')
  console.log(`   DUA IA: ${users.ia.length} utilizadores`)
  console.log(`   DUA COIN: ${users.coin.length} utilizadores`)
  
  // Verificar emails comuns
  const iaEmails = new Set(users.ia.map(u => u.email))
  const coinEmails = new Set(users.coin.map(u => u.email))
  
  const commonEmails = [...iaEmails].filter(e => coinEmails.has(e))
  
  console.log(`\n📧 Emails comuns: ${commonEmails.length}`)
  commonEmails.forEach(e => console.log(`   - ${e}`))
  
  if (commonEmails.length === 0) {
    log.warn('\n⚠️  Nenhum email comum encontrado!')
    log.warn('Não há utilizadores para testar login cross-database')
    log.info('\n📋 EXPLICAÇÃO:')
    log.info('Para que o login funcione em ambas as bases:')
    log.info('1. O email deve existir em ambas')
    log.info('2. A PASSWORD deve ser a mesma (ou redefinida)')
    log.info('3. Cada base tem seu próprio UUID (diferente)')
    return
  }
  
  log.warn('\n⚠️  ATENÇÃO: Teste de login requer passwords!')
  log.warn('Como as passwords são hashed, não podemos testá-las automaticamente')
  log.warn('Precisaria que o utilizador fizesse login manual ou usasse password reset')
  
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   ANÁLISE DE COMPATIBILIDADE                              ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')
  
  // Analisar cada email comum
  for (const email of commonEmails) {
    const iaUser = users.ia.find(u => u.email === email)
    const coinUser = users.coin.find(u => u.email === email)
    
    console.log(`\n📧 ${email}`)
    console.log('   DUA IA:')
    console.log(`      UUID: ${iaUser.id}`)
    console.log(`      Criado: ${iaUser.created_at}`)
    console.log(`      Email confirmado: ${iaUser.email_confirmed_at ? '✅' : '❌'}`)
    
    console.log('   DUA COIN:')
    console.log(`      UUID: ${coinUser.id}`)
    console.log(`      Criado: ${coinUser.created_at}`)
    console.log(`      Email confirmado: ${coinUser.email_confirmed_at ? '✅' : '❌'}`)
    
    if (iaUser.id === coinUser.id) {
      log.warn('      ⚠️  UUIDs IGUAIS - pode causar conflito!')
    } else {
      log.success('      ✓ UUIDs diferentes (correto)')
    }
  }
  
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   CONCLUSÃO                                               ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')
  
  log.info('🔐 COMO FUNCIONA O LOGIN:')
  console.log('   1. Cada Supabase tem sua própria tabela auth.users')
  console.log('   2. Cada base mantém suas próprias passwords (hashed)')
  console.log('   3. Mesmo email pode ter passwords DIFERENTES em cada base')
  console.log('   4. UUIDs são DIFERENTES para o mesmo email')
  
  log.warn('\n⚠️  SITUAÇÃO ATUAL:')
  console.log('   • Login na DUA IA → usa UUID da DUA IA')
  console.log('   • Login na DUA COIN → usa UUID da DUA COIN')
  console.log('   • São contas SEPARADAS (mesmo email, passwords podem diferir)')
  
  log.info('\n💡 PARA UNIFICAR LOGIN:')
  console.log('   OPÇÃO 1: Single Sign-On (SSO)')
  console.log('   • Usar OAuth (Google, GitHub, etc)')
  console.log('   • Login único serve para ambas as bases')
  
  console.log('\n   OPÇÃO 2: Password Sync')
  console.log('   • Quando user muda password numa base, atualizar na outra')
  console.log('   • Requer webhook/trigger')
  
  console.log('\n   OPÇÃO 3: Usar apenas DUA COIN')
  console.log('   • Todas as apps apontam para DUA COIN')
  console.log('   • DUA IA fica apenas como backup/histórico')
  
  log.success('\n✅ RECOMENDAÇÃO: OPÇÃO 3')
  log.info('Migrar todas as aplicações para usar DUA COIN como base principal')
}

main().catch(console.error)
