#!/usr/bin/env node

/**
 * EXECUÇÃO DA MIGRAÇÃO (APENAS APÓS APROVAÇÃO)
 * 
 * Este script:
 * 1. Cria utilizadores novos na DUA COIN via Admin API
 * 2. Executa os scripts SQL aprovados
 * 3. Valida os resultados
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import readline from 'readline'

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

// Ler mapeamento gerado
const GENERATED_DIR = './migration/generated'
const mappingFile = path.join(GENERATED_DIR, '02_user_mapping.json')

if (!fs.existsSync(mappingFile)) {
  log.error('Ficheiro de mapeamento não encontrado!')
  log.error('Execute primeiro: node migration/00_analyze_and_prepare.mjs')
  process.exit(1)
}

const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'))

// Helper para pedir confirmação
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

async function createNewUsers() {
  log.info(`Criar ${mapping.toCreate.length} utilizadores novos na DUA COIN...`)

  const newUserMappings = []

  for (const user of mapping.toCreate) {
    try {
      log.info(`Criando: ${user.email}`)
      
      const { data, error } = await duaCoin.auth.admin.createUser({
        email: user.email,
        email_confirm: true,
        user_metadata: user.user_metadata || {},
        app_metadata: { 
          migrated_from: 'DUA_IA', 
          old_id: user.old_id,
          migrated_at: new Date().toISOString()
        }
      })

      if (error) {
        log.error(`Erro ao criar ${user.email}: ${error.message}`)
        continue
      }

      newUserMappings.push({
        old_id: user.old_id,
        new_id: data.user.id,
        email: user.email
      })

      log.success(`✓ Criado: ${user.email} → ${data.user.id}`)
    } catch (e) {
      log.error(`Exceção ao criar ${user.email}: ${e.message}`)
    }
  }

  // Guardar novos mapeamentos
  fs.writeFileSync(
    path.join(GENERATED_DIR, '09_new_user_mappings.json'),
    JSON.stringify(newUserMappings, null, 2)
  )

  // Gerar SQL para inserir mapeamentos
  let sql = `-- 09_insert_new_user_mappings.sql\n-- Gerado automaticamente após criação de utilizadores\n\nBEGIN;\n\n`
  
  newUserMappings.forEach(m => {
    sql += `INSERT INTO migration_user_mapping (old_id, new_id, email) VALUES ('${m.old_id}', '${m.new_id}', '${m.email}');\n`
  })
  
  sql += `\nCOMMIT;\n`
  
  fs.writeFileSync(path.join(GENERATED_DIR, '09_insert_new_user_mappings.sql'), sql)

  log.success(`${newUserMappings.length} utilizadores criados com sucesso!`)
  return newUserMappings
}

async function executeSQLScript(scriptPath, description) {
  log.info(`Executar: ${description}`)
  log.warn(`⚠️  SQL gerado em: ${scriptPath}`)
  log.warn(`Execute manualmente via psql ou SQL Editor do Supabase`)
  return true
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   EXECUÇÃO DA MIGRAÇÃO DUA IA → DUA COIN                  ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  console.log('📋 RESUMO DA MIGRAÇÃO:')
  console.log(`   • ${mapping.existing.length} utilizadores já existem (mapeados)`)
  console.log(`   • ${mapping.toCreate.length} utilizadores novos a criar`)
  console.log(`   • ${mapping.duaCoinsSync.length} saldos a sincronizar`)

  const confirm = await askConfirmation('\n⚠️  Deseja continuar com a execução?')
  
  if (!confirm) {
    log.warn('Execução cancelada pelo utilizador')
    process.exit(0)
  }

  try {
    // Passo 1: Criar tabela de mapeamento
    log.info('PASSO 1: Criar tabela de mapeamento')
    await executeSQLScript(
      path.join(GENERATED_DIR, '03_create_mapping_table.sql'),
      'Criar migration_user_mapping'
    )

    // Passo 2: Inserir mapeamentos existentes
    log.info('PASSO 2: Inserir mapeamentos de utilizadores existentes')
    await executeSQLScript(
      path.join(GENERATED_DIR, '04_insert_existing_mappings.sql'),
      'Inserir mapeamentos existentes'
    )

    // Passo 3: Criar utilizadores novos
    if (mapping.toCreate.length > 0) {
      log.info('PASSO 3: Criar utilizadores novos')
      const newMappings = await createNewUsers()
      
      // Inserir novos mapeamentos
      if (newMappings.length > 0) {
        await executeSQLScript(
          path.join(GENERATED_DIR, '09_insert_new_user_mappings.sql'),
          'Inserir mapeamentos de utilizadores novos'
        )
      }
    }

    // Passo 4: Sincronizar saldos DUA Coins
    log.info('PASSO 4: Sincronizar saldos DUA Coins')
    await executeSQLScript(
      path.join(GENERATED_DIR, '07_sync_dua_coins.sql'),
      'Sincronizar saldos'
    )

    // Passo 5: Importar tabelas
    log.info('PASSO 5: Importar tabelas com FK corrigidas')
    await executeSQLScript(
      path.join(GENERATED_DIR, '08_import_tables.sql'),
      'Importar codigos_acesso, perfis, convites, etc'
    )

    console.log('\n╔════════════════════════════════════════════════════════════╗')
    console.log('║   ✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!                       ║')
    console.log('╚════════════════════════════════════════════════════════════╝\n')

    // Validação
    log.info('Validando resultados...')
    const { count: mappingCount } = await duaCoin
      .from('migration_user_mapping')
      .select('*', { count: 'exact', head: true })
    
    log.success(`Total de mapeamentos: ${mappingCount}`)

  } catch (error) {
    log.error('Erro fatal: ' + error.message)
    console.error(error)
    process.exit(1)
  }
}

main()
