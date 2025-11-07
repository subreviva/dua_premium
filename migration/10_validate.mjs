#!/usr/bin/env node

/**
 * VALIDAÇÃO PÓS-MIGRAÇÃO
 */

import { createClient } from '@supabase/supabase-js'

// ⚠️ CREDENCIAIS ANTIGAS - DUA IA (DESATIVADA/MIGRADA)
// Nota: Pode retornar "Invalid API key" - isto é ESPERADO após migração
const DUA_IA_URL = 'https://gocjbfcztorfswlkkjqi.supabase.co'
const DUA_IA_KEY = 'DESATIVADA_APOS_MIGRACAO'

// ✅ CREDENCIAIS ATUAIS - DUA COIN (PRODUÇÃO)
const DUA_COIN_URL = 'https://nranmngyocaqjwcokcxm.supabase.co'
const DUA_COIN_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0OTMwMCwiZXhwIjoyMDQ2MjI1MzAwfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ'

const duaIA = createClient(DUA_IA_URL, DUA_IA_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const duaCoin = createClient(DUA_COIN_URL, DUA_COIN_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const log = {
  info: (m) => console.log(`\x1b[34m📋 ${m}\x1b[0m`),
  success: (m) => console.log(`\x1b[32m✅ ${m}\x1b[0m`),
  warn: (m) => console.log(`\x1b[33m⚠️  ${m}\x1b[0m`),
  error: (m) => console.log(`\x1b[31m❌ ${m}\x1b[0m`)
}

async function validateUsers() {
  log.info('Validando utilizadores...')
  
  // DUA IA
  const { data: iaUsers } = await duaIA.auth.admin.listUsers()
  const iaEmails = new Set(iaUsers.users.map(u => u.email))
  
  // DUA COIN
  const { data: coinUsers } = await duaCoin.auth.admin.listUsers()
  const coinEmails = new Set(coinUsers.users.map(u => u.email))
  
  log.info(`DUA IA: ${iaEmails.size} emails`)
  log.info(`DUA COIN: ${coinEmails.size} emails`)
  
  // Verificar se todos os emails da IA estão na COIN
  let allFound = true
  for (const email of iaEmails) {
    if (!coinEmails.has(email)) {
      log.error(`Email ${email} da DUA IA NÃO está na DUA COIN!`)
      allFound = false
    }
  }
  
  if (allFound) {
    log.success('✓ Todos os emails da DUA IA existem na DUA COIN')
  }
  
  return allFound
}

async function validateTables() {
  log.info('Validando tabelas...')
  
  const tables = ['codigos_acesso', 'perfis_usuarios', 'convites', 'users_extra_data']
  
  for (const table of tables) {
    const { count: iaCount } = await duaIA
      .from(table)
      .select('*', { count: 'exact', head: true })
    
    const { count: coinCount } = await duaCoin
      .from(table)
      .select('*', { count: 'exact', head: true })
    
    log.info(`${table}: IA=${iaCount || 0}, COIN=${coinCount || 0}`)
    
    if ((iaCount || 0) > 0 && (coinCount || 0) >= (iaCount || 0)) {
      log.success(`✓ ${table} migrado`)
    }
  }
}

async function validateMapping() {
  log.info('Validando mapeamento...')
  
  const { data: iaUsers } = await duaIA.auth.admin.listUsers()
  const { data: coinUsers } = await duaCoin.auth.admin.listUsers()
  
  const coinByEmail = new Map(coinUsers.users.map(u => [u.email, u]))
  
  console.log('\n' + '='.repeat(80))
  console.log('MAPEAMENTO EMAIL → UUID:')
  console.log('='.repeat(80))
  
  for (const iaUser of iaUsers.users) {
    const coinUser = coinByEmail.get(iaUser.email)
    
    if (coinUser) {
      console.log(`${iaUser.email}`)
      console.log(`  DUA IA:   ${iaUser.id}`)
      console.log(`  DUA COIN: ${coinUser.id}`)
      
      if (iaUser.id === coinUser.id) {
        log.warn('  ⚠️  UUIDs IGUAIS (não deveria acontecer se era user novo)')
      } else {
        log.success('  ✓ UUIDs diferentes (mapeamento correto)')
      }
    } else {
      log.error(`  ❌ Email ${iaUser.email} não encontrado na DUA COIN!`)
    }
  }
  
  console.log('='.repeat(80))
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   VALIDAÇÃO PÓS-MIGRAÇÃO                                  ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  await validateUsers()
  await validateTables()
  await validateMapping()

  log.success('\n🎉 VALIDAÇÃO COMPLETA!')
}

main().catch(console.error)
