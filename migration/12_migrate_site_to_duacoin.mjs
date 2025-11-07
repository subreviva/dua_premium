#!/usr/bin/env node

/**
 * MIGRAR SITE PARA DUA COIN
 * Atualiza .env.local para usar DUA COIN em vez de DUA IA
 */

import fs from 'fs'
import readline from 'readline'

const log = {
  info: (m) => console.log(`\x1b[34m📋 ${m}\x1b[0m`),
  success: (m) => console.log(`\x1b[32m✅ ${m}\x1b[0m`),
  warn: (m) => console.log(`\x1b[33m⚠️  ${m}\x1b[0m`),
  error: (m) => console.log(`\x1b[31m❌ ${m}\x1b[0m`)
}

function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve => {
    rl.question(question + ' (sim/não): ', answer => {
      rl.close()
      resolve(answer.toLowerCase() === 'sim' || answer.toLowerCase() === 's')
    })
  })
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   MIGRAR SITE PARA DUA COIN                               ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  log.info('Este script vai atualizar .env.local para usar DUA COIN')
  log.warn('⚠️  IMPORTANTE: Faça backup antes de continuar!')
  
  const envPath = '.env.local'
  
  if (!fs.existsSync(envPath)) {
    log.error('Ficheiro .env.local não encontrado!')
    return
  }

  // Ler ficheiro atual
  const currentEnv = fs.readFileSync(envPath, 'utf8')
  
  console.log('\n📋 CONFIGURAÇÃO ATUAL:')
  const currentUrl = currentEnv.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1] || 'não encontrado'
  console.log(`   URL: ${currentUrl}`)
  
  if (currentUrl.includes('nranmngyocaqjwcokcxm')) {
    log.success('✅ Já está usando DUA COIN!')
    log.info('Não é necessário migrar.')
    return
  }
  
  if (!currentUrl.includes('gocjbfcztorfswlkkjqi')) {
    log.warn('URL não reconhecida. Continuar mesmo assim?')
  }

  console.log('\n📋 NOVA CONFIGURAÇÃO:')
  console.log('   URL: https://nranmngyocaqjwcokcxm.supabase.co')
  console.log('   Base: DUA COIN')
  console.log('   Utilizadores: 8 (7 originais + 1 migrado)')
  
  const confirm = await askConfirmation('\n⚠️  Deseja continuar com a migração?')
  
  if (!confirm) {
    log.warn('Migração cancelada pelo utilizador')
    return
  }

  // Backup
  const backupPath = `.env.local.backup.${Date.now()}`
  fs.copyFileSync(envPath, backupPath)
  log.success(`Backup criado: ${backupPath}`)

  // Substituir URLs e Keys
  let newEnv = currentEnv

  // DUA COIN credentials
  const DUA_COIN_URL = 'https://nranmngyocaqjwcokcxm.supabase.co'
  const DUA_COIN_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NzcxNTIsImV4cCI6MjA3NDE1MzE1Mn0.T7zOZleFfSZe6KEKlpW0JLU9xzq6m3WP0qRkPGfL6Ho'
  const DUA_COIN_SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ'

  // Substituir URL
  newEnv = newEnv.replace(
    /NEXT_PUBLIC_SUPABASE_URL=.+/,
    `NEXT_PUBLIC_SUPABASE_URL=${DUA_COIN_URL}`
  )

  // Substituir ANON KEY
  newEnv = newEnv.replace(
    /NEXT_PUBLIC_SUPABASE_ANON_KEY=.+/,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${DUA_COIN_ANON}`
  )

  // Substituir SERVICE ROLE KEY
  newEnv = newEnv.replace(
    /SUPABASE_SERVICE_ROLE_KEY=.+/,
    `SUPABASE_SERVICE_ROLE_KEY=${DUA_COIN_SERVICE}`
  )

  // Escrever novo ficheiro
  fs.writeFileSync(envPath, newEnv)
  
  log.success('✅ .env.local atualizado com sucesso!')
  
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   MIGRAÇÃO COMPLETA!                                      ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  log.info('📋 PRÓXIMOS PASSOS:')
  console.log('   1. Restart da aplicação: npm run dev')
  console.log('   2. Testar login com um utilizador')
  console.log('   3. Verificar que tudo funciona')
  
  log.info(`\n💾 Backup guardado em: ${backupPath}`)
  log.warn('⚠️  Se algo correr mal, restaure o backup:')
  console.log(`   cp ${backupPath} .env.local`)
}

main().catch(console.error)
