#!/usr/bin/env node

/**
 * EXECUÇÃO SIMPLIFICADA (SÓ CRIAR UTILIZADORES VIA API)
 * Os scripts SQL devem ser executados manualmente no SQL Editor
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const DUA_COIN_URL = process.env.SUPABASE_DUA_COIN_URL || 'https://nranmngyocaqjwcokcxm.supabase.co'
const DUA_COIN_KEY = process.env.SUPABASE_DUA_COIN_SERVICE_ROLE || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ'

const duaCoin = createClient(DUA_COIN_URL, DUA_COIN_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const log = {
  info: (m) => console.log(`\x1b[34m📋 ${m}\x1b[0m`),
  success: (m) => console.log(`\x1b[32m✅ ${m}\x1b[0m`),
  warn: (m) => console.log(`\x1b[33m⚠️  ${m}\x1b[0m`),
  error: (m) => console.log(`\x1b[31m❌ ${m}\x1b[0m`)
}

const GENERATED_DIR = './migration/generated'

async function createNewUsers() {
  const payloadFile = path.join(GENERATED_DIR, '05_create_users_payload.json')
  
  if (!fs.existsSync(payloadFile)) {
    log.error('Payload não encontrado!')
    return []
  }

  const usersToCreate = JSON.parse(fs.readFileSync(payloadFile, 'utf8'))
  
  if (usersToCreate.length === 0) {
    log.info('Nenhum utilizador novo para criar')
    return []
  }

  log.info(`Criar ${usersToCreate.length} utilizadores novos...`)

  const newUserMappings = []

  for (const user of usersToCreate) {
    try {
      log.info(`Criando: ${user.email}`)
      
      const { data, error } = await duaCoin.auth.admin.createUser({
        email: user.email,
        email_confirm: user.email_confirm,
        user_metadata: user.user_metadata || {},
        app_metadata: user.app_metadata || {}
      })

      if (error) {
        log.error(`Erro: ${error.message}`)
        continue
      }

      newUserMappings.push({
        old_id: user.app_metadata.old_id,
        new_id: data.user.id,
        email: user.email
      })

      log.success(`✓ ${user.email} → ${data.user.id}`)
    } catch (e) {
      log.error(`Exceção: ${e.message}`)
    }
  }

  // Guardar mapeamentos
  fs.writeFileSync(
    path.join(GENERATED_DIR, '09_new_user_mappings.json'),
    JSON.stringify(newUserMappings, null, 2)
  )

  // Gerar SQL
  let sql = `-- Inserir novos mapeamentos\nBEGIN;\n\n`
  newUserMappings.forEach(m => {
    sql += `INSERT INTO migration_user_mapping (old_id, new_id, email) VALUES ('${m.old_id}', '${m.new_id}', '${m.email}');\n`
  })
  sql += `\nCOMMIT;\n`
  
  fs.writeFileSync(path.join(GENERATED_DIR, '09_insert_new_user_mappings.sql'), sql)

  return newUserMappings
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   CRIAR UTILIZADORES NOVOS (VIA API)                      ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  const newMappings = await createNewUsers()

  if (newMappings.length > 0) {
    log.success(`${newMappings.length} utilizadores criados!`)
    log.info('\n📋 PRÓXIMOS PASSOS MANUAIS:')
    log.info('1. Abrir SQL Editor do Supabase (DUA COIN)')
    log.info('2. Executar: migration/generated/03_create_mapping_table.sql')
    log.info('3. Executar: migration/generated/04_insert_existing_mappings.sql')
    log.info('4. Executar: migration/generated/09_insert_new_user_mappings.sql')
    log.info('5. Executar: migration/generated/07_sync_dua_coins.sql')
    log.info('6. Executar: migration/generated/08_import_tables.sql')
  } else {
    log.info('Nenhum utilizador novo criado.')
  }
}

main()
