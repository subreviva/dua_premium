#!/usr/bin/env node

/**
 * EXECUTOR SQL AUTOMÁTICO via REST API
 */

import fs from 'fs'
import path from 'path'

const DUA_COIN_URL = 'https://nranmngyocaqjwcokcxm.supabase.co'
const DUA_COIN_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ'

const log = {
  info: (m) => console.log(`\x1b[34m📋 ${m}\x1b[0m`),
  success: (m) => console.log(`\x1b[32m✅ ${m}\x1b[0m`),
  error: (m) => console.log(`\x1b[31m❌ ${m}\x1b[0m`)
}

async function executeSQL(sql, description) {
  log.info(`Executando: ${description}`)
  
  try {
    const response = await fetch(`${DUA_COIN_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': DUA_COIN_KEY,
        'Authorization': `Bearer ${DUA_COIN_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      const error = await response.text()
      log.error(`Erro HTTP: ${response.status} - ${error}`)
      return false
    }

    log.success(`✓ ${description}`)
    return true
  } catch (e) {
    log.error(`Exceção: ${e.message}`)
    return false
  }
}

async function executeSQLFile(filePath, description) {
  const sql = fs.readFileSync(filePath, 'utf8')
  return await executeSQL(sql, description)
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   EXECUTAR SCRIPTS SQL AUTOMATICAMENTE                    ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  const GENERATED_DIR = './migration/generated'

  // Passo 1: Criar tabela de mapeamento
  await executeSQLFile(
    path.join(GENERATED_DIR, '03_create_mapping_table.sql'),
    'Criar migration_user_mapping'
  )

  // Passo 2: Inserir mapeamentos existentes
  await executeSQLFile(
    path.join(GENERATED_DIR, '04_insert_existing_mappings.sql'),
    'Inserir mapeamentos existentes'
  )

  // Passo 3: Inserir novos mapeamentos
  if (fs.existsSync(path.join(GENERATED_DIR, '09_insert_new_user_mappings.sql'))) {
    await executeSQLFile(
      path.join(GENERATED_DIR, '09_insert_new_user_mappings.sql'),
      'Inserir novos mapeamentos'
    )
  }

  // Passo 4: Sincronizar saldos (se houver)
  const syncFile = path.join(GENERATED_DIR, '07_sync_dua_coins.sql')
  const syncSQL = fs.readFileSync(syncFile, 'utf8')
  if (!syncSQL.includes('-- Nenhum saldo')) {
    await executeSQLFile(syncFile, 'Sincronizar saldos DUA Coins')
  } else {
    log.info('Sem saldos para sincronizar')
  }

  // Passo 5: Importar tabelas (se houver dados)
  const importFile = path.join(GENERATED_DIR, '08_import_tables.sql')
  const importSQL = fs.readFileSync(importFile, 'utf8')
  if (importSQL.includes('INSERT INTO')) {
    await executeSQLFile(importFile, 'Importar tabelas')
  } else {
    log.info('Sem dados para importar')
  }

  log.success('\n🎉 MIGRAÇÃO COMPLETA!')
}

main()
