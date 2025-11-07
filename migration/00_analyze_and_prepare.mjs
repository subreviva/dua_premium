#!/usr/bin/env node

/**
 * MIGRAÇÃO INTELIGENTE DUA IA → DUA COIN
 * 
 * Este script:
 * 1. Conecta às duas Supabase (service_role)
 * 2. Analisa tabelas existentes
 * 3. Exporta dados da DUA IA
 * 4. Compara emails e cria mapeamento
 * 5. Gera scripts SQL para aprovação
 * 6. NÃO EXECUTA NADA automaticamente
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// ═══════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════

const DUA_IA_URL = process.env.SUPABASE_DUA_IA_URL || 'https://gocjbfcztorfswlkkjqi.supabase.co'
const DUA_IA_KEY = process.env.SUPABASE_DUA_IA_SERVICE_ROLE || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY2piZmN6dG9yZnN3bGtranFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4NjM1NSwiZXhwIjoyMDc3ODYyMzU1fQ.AhNnsqi7E3Rco-m36fAVuqW5UsyDWdMAVKYkFAneOPk'

const DUA_COIN_URL = process.env.SUPABASE_DUA_COIN_URL || 'https://nranmngyocaqjwcokcxm.supabase.co'
const DUA_COIN_KEY = process.env.SUPABASE_DUA_COIN_SERVICE_ROLE || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ'

const OUTPUT_DIR = './migration/generated'

// ═══════════════════════════════════════════════════════════
// CLIENTES SUPABASE
// ═══════════════════════════════════════════════════════════

const duaIA = createClient(DUA_IA_URL, DUA_IA_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const duaCoin = createClient(DUA_COIN_URL, DUA_COIN_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

const log = {
  info: (m) => console.log(`\x1b[34m📋 ${m}\x1b[0m`),
  success: (m) => console.log(`\x1b[32m✅ ${m}\x1b[0m`),
  warn: (m) => console.log(`\x1b[33m⚠️  ${m}\x1b[0m`),
  error: (m) => console.log(`\x1b[31m❌ ${m}\x1b[0m`)
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// ═══════════════════════════════════════════════════════════
// ETAPA 1: ANALISAR SCHEMAS
// ═══════════════════════════════════════════════════════════

async function analyzeSchemas() {
  log.info('ETAPA 1: Analisando schemas das duas bases...')
  
  const report = {
    dua_ia: { tables: {}, users_count: 0 },
    dua_coin: { tables: {}, users_count: 0 }
  }

  // Verificar tabelas na DUA IA
  const tablesToCheck = [
    'codigos_acesso',
    'perfis_usuarios', 
    'convites',
    'users_extra_data',
    'users' // tabela principal de saldo
  ]

  for (const table of tablesToCheck) {
    try {
      const { count, error } = await duaIA.from(table).select('*', { count: 'exact', head: true })
      if (!error) {
        report.dua_ia.tables[table] = { exists: true, count }
        log.success(`DUA IA: tabela ${table} encontrada (${count} registos)`)
      }
    } catch (e) {
      report.dua_ia.tables[table] = { exists: false }
      log.warn(`DUA IA: tabela ${table} não encontrada`)
    }
  }

  // Contar utilizadores auth.users na DUA IA
  try {
    const { data: usersIA } = await duaIA.auth.admin.listUsers({ perPage: 1000 })
    report.dua_ia.users_count = usersIA?.users?.length || 0
    log.success(`DUA IA: ${report.dua_ia.users_count} utilizadores auth.users`)
  } catch (e) {
    log.error('Erro ao listar users DUA IA: ' + e.message)
  }

  // Verificar estrutura na DUA COIN
  for (const table of tablesToCheck) {
    try {
      const { count, error } = await duaCoin.from(table).select('*', { count: 'exact', head: true })
      if (!error) {
        report.dua_coin.tables[table] = { exists: true, count }
        log.success(`DUA COIN: tabela ${table} encontrada (${count} registos)`)
      }
    } catch (e) {
      report.dua_coin.tables[table] = { exists: false }
      log.warn(`DUA COIN: tabela ${table} não existe ainda`)
    }
  }

  // Contar utilizadores auth.users na DUA COIN
  try {
    const { data: usersCoin } = await duaCoin.auth.admin.listUsers({ perPage: 1000 })
    report.dua_coin.users_count = usersCoin?.users?.length || 0
    log.success(`DUA COIN: ${report.dua_coin.users_count} utilizadores auth.users`)
  } catch (e) {
    log.error('Erro ao listar users DUA COIN: ' + e.message)
  }

  ensureDir(OUTPUT_DIR)
  fs.writeFileSync(
    path.join(OUTPUT_DIR, '00_schema_analysis.json'),
    JSON.stringify(report, null, 2)
  )
  
  log.success('Análise de schemas guardada em: migration/generated/00_schema_analysis.json')
  return report
}

// ═══════════════════════════════════════════════════════════
// ETAPA 2: EXPORTAR DADOS DA DUA IA
// ═══════════════════════════════════════════════════════════

async function exportDuaIA() {
  log.info('ETAPA 2: Exportando dados da DUA IA...')
  
  const exports = {}

  // Exportar auth.users (apenas leitura)
  try {
    const { data } = await duaIA.auth.admin.listUsers({ perPage: 1000 })
    exports.auth_users = data.users.map(u => ({
      id: u.id,
      email: u.email,
      email_confirmed_at: u.email_confirmed_at,
      created_at: u.created_at,
      user_metadata: u.user_metadata,
      app_metadata: u.app_metadata
    }))
    log.success(`Exportados ${exports.auth_users.length} utilizadores`)
  } catch (e) {
    log.error('Erro ao exportar auth.users: ' + e.message)
    exports.auth_users = []
  }

  // Exportar codigos_acesso
  try {
    const { data } = await duaIA.from('codigos_acesso').select('*')
    exports.codigos_acesso = data || []
    log.success(`Exportados ${exports.codigos_acesso.length} códigos de acesso`)
  } catch (e) {
    log.warn('Tabela codigos_acesso não existe ou erro: ' + e.message)
    exports.codigos_acesso = []
  }

  // Exportar perfis_usuarios
  try {
    const { data } = await duaIA.from('perfis_usuarios').select('*')
    exports.perfis_usuarios = data || []
    log.success(`Exportados ${exports.perfis_usuarios.length} perfis`)
  } catch (e) {
    log.warn('Tabela perfis_usuarios não existe')
    exports.perfis_usuarios = []
  }

  // Exportar convites
  try {
    const { data } = await duaIA.from('convites').select('*')
    exports.convites = data || []
    log.success(`Exportados ${exports.convites.length} convites`)
  } catch (e) {
    log.warn('Tabela convites não existe')
    exports.convites = []
  }

  // Exportar users_extra_data
  try {
    const { data } = await duaIA.from('users_extra_data').select('*')
    exports.users_extra_data = data || []
    log.success(`Exportados ${exports.users_extra_data.length} users_extra_data`)
  } catch (e) {
    log.warn('Tabela users_extra_data não existe')
    exports.users_extra_data = []
  }

  // Exportar users (saldo DUA Coins)
  try {
    const { data } = await duaIA.from('users').select('id, email, dua_coins, created_at')
    exports.users_dua_coins = data || []
    log.success(`Exportados ${exports.users_dua_coins.length} saldos DUA Coins`)
  } catch (e) {
    log.warn('Tabela users não tem coluna dua_coins ou erro: ' + e.message)
    exports.users_dua_coins = []
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, '01_dua_ia_export.json'),
    JSON.stringify(exports, null, 2)
  )

  log.success('Dados exportados para: migration/generated/01_dua_ia_export.json')
  return exports
}

// ═══════════════════════════════════════════════════════════
// ETAPA 3: GERAR MAPEAMENTO INTELIGENTE
// ═══════════════════════════════════════════════════════════

async function generateMapping(exportsIA) {
  log.info('ETAPA 3: Gerando mapeamento inteligente de utilizadores...')
  
  const mapping = {
    existing: [],  // emails que já existem na DUA COIN (manter UUID da COIN)
    toCreate: [],  // emails novos para criar na DUA COIN
    duaCoinsSync: [] // sincronização de saldos
  }

  // Buscar todos os users da DUA COIN
  const { data: usersCoin } = await duaCoin.auth.admin.listUsers({ perPage: 1000 })
  const coinEmailMap = new Map()
  
  usersCoin.users.forEach(u => {
    if (u.email) coinEmailMap.set(u.email.toLowerCase(), u.id)
  })

  log.info(`DUA COIN tem ${coinEmailMap.size} emails registados`)

  // Processar cada user da DUA IA
  for (const userIA of exportsIA.auth_users) {
    const email = userIA.email?.toLowerCase()
    if (!email) continue

    if (coinEmailMap.has(email)) {
      // Email já existe na DUA COIN - mapear
      mapping.existing.push({
        old_id: userIA.id,
        new_id: coinEmailMap.get(email),
        email: email,
        action: 'MAP_EXISTING'
      })
      log.info(`✓ Email ${email} já existe - mapear ${userIA.id} → ${coinEmailMap.get(email)}`)
    } else {
      // Email novo - precisamos criar na DUA COIN
      mapping.toCreate.push({
        old_id: userIA.id,
        email: email,
        email_confirmed_at: userIA.email_confirmed_at,
        created_at: userIA.created_at,
        user_metadata: userIA.user_metadata,
        action: 'CREATE_NEW'
      })
      log.warn(`⚠ Email ${email} não existe na DUA COIN - será criado`)
    }
  }

  // Sincronização de saldos DUA Coins
  for (const userBalance of exportsIA.users_dua_coins) {
    const email = userBalance.email?.toLowerCase()
    if (!email) continue

    const targetUserId = coinEmailMap.get(email) || 
                         mapping.toCreate.find(u => u.email === email)?.old_id

    if (targetUserId) {
      mapping.duaCoinsSync.push({
        user_id: targetUserId,
        email: email,
        dua_coins_to_add: userBalance.dua_coins || 0,
        source: 'DUA_IA'
      })
    }
  }

  log.success(`Mapeamento: ${mapping.existing.length} existentes, ${mapping.toCreate.length} novos`)
  log.success(`Sincronização: ${mapping.duaCoinsSync.length} saldos para sincronizar`)

  fs.writeFileSync(
    path.join(OUTPUT_DIR, '02_user_mapping.json'),
    JSON.stringify(mapping, null, 2)
  )

  return mapping
}

// ═══════════════════════════════════════════════════════════
// ETAPA 4: GERAR SCRIPTS SQL
// ═══════════════════════════════════════════════════════════

function generateSQL(mapping, exportsIA) {
  log.info('ETAPA 4: Gerando scripts SQL para aprovação...')

  // Script 1: Criar tabela de mapeamento
  let sql1 = `-- 03_create_mapping_table.sql
-- Criar tabela de mapeamento na DUA COIN

CREATE TABLE IF NOT EXISTS migration_user_mapping (
  old_id UUID PRIMARY KEY,
  new_id UUID NOT NULL,
  email TEXT NOT NULL,
  migrated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_migration_mapping_new_id ON migration_user_mapping(new_id);
CREATE INDEX IF NOT EXISTS idx_migration_mapping_email ON migration_user_mapping(email);
`

  // Script 2: Inserir mapeamentos existentes
  let sql2 = `-- 04_insert_existing_mappings.sql
-- Inserir mapeamentos de users que já existem na DUA COIN

BEGIN;

`
  mapping.existing.forEach(m => {
    sql2 += `INSERT INTO migration_user_mapping (old_id, new_id, email) VALUES ('${m.old_id}', '${m.new_id}', '${m.email}');\n`
  })
  
  sql2 += `\nCOMMIT;\n\n-- Total: ${mapping.existing.length} mapeamentos existentes\n`

  // Script 3: Payload para criar users novos (via Admin API)
  const createPayload = mapping.toCreate.map(u => ({
    email: u.email,
    email_confirm: true,
    user_metadata: u.user_metadata || {},
    app_metadata: { migrated_from: 'DUA_IA', old_id: u.old_id }
  }))

  fs.writeFileSync(
    path.join(OUTPUT_DIR, '05_create_users_payload.json'),
    JSON.stringify(createPayload, null, 2)
  )

  // Script 4: Template para inserir mapeamentos após criação
  let sql4 = `-- 06_insert_new_user_mappings.sql
-- IMPORTANTE: Executar APÓS criar os novos users via Admin API
-- Substituir <NEW_UUID> pelos UUIDs retornados pela API

BEGIN;

`
  mapping.toCreate.forEach(u => {
    sql4 += `-- Email: ${u.email} (old_id: ${u.old_id})\n`
    sql4 += `INSERT INTO migration_user_mapping (old_id, new_id, email) VALUES ('${u.old_id}', '<NEW_UUID_FOR_${u.email}>', '${u.email}');\n\n`
  })
  
  sql4 += `COMMIT;\n\n-- Total: ${mapping.toCreate.length} utilizadores novos a criar\n`

  // Script 5: Sincronizar saldos DUA Coins
  let sql5 = `-- 07_sync_dua_coins.sql
-- Sincronizar saldos DUA Coins dos utilizadores migrados

BEGIN;

`
  mapping.duaCoinsSync.forEach(s => {
    if (s.dua_coins_to_add > 0) {
      sql5 += `-- ${s.email}: adicionar ${s.dua_coins_to_add} DUA Coins\n`
      sql5 += `UPDATE users SET dua_coins = COALESCE(dua_coins, 0) + ${s.dua_coins_to_add} WHERE id = '${s.user_id}';\n\n`
    }
  })
  
  sql5 += `COMMIT;\n\n-- Total: ${mapping.duaCoinsSync.length} saldos sincronizados\n`

  // Script 6: Importar tabelas com FK corrigidas
  let sql6 = `-- 08_import_tables.sql
-- Importar tabelas com foreign keys corrigidas via mapeamento

BEGIN;

-- Criar tabelas de destino se não existirem (ajustar schemas conforme necessário)

CREATE TABLE IF NOT EXISTS codigos_acesso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  usado BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS perfis_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  nome TEXT,
  bio TEXT,
  avatar_url TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS convites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  email_convidado TEXT,
  codigo TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users_extra_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

`

  // Inserir codigos_acesso
  if (exportsIA.codigos_acesso.length > 0) {
    sql6 += `\n-- Importar codigos_acesso\n`
    exportsIA.codigos_acesso.forEach(row => {
      const newUserId = mapping.existing.find(m => m.old_id === row.user_id)?.new_id || 
                        mapping.toCreate.find(m => m.old_id === row.user_id)?.old_id
      if (newUserId) {
        sql6 += `INSERT INTO codigos_acesso (id, codigo, user_id, usado) 
                 SELECT '${row.id}', '${row.codigo}', m.new_id, ${row.usado || false}
                 FROM migration_user_mapping m WHERE m.old_id = '${row.user_id}';\n`
      }
    })
  }

  // Inserir perfis_usuarios
  if (exportsIA.perfis_usuarios.length > 0) {
    sql6 += `\n-- Importar perfis_usuarios\n`
    exportsIA.perfis_usuarios.forEach(row => {
      sql6 += `INSERT INTO perfis_usuarios (id, user_id, nome, bio, avatar_url)
               SELECT '${row.id}', m.new_id, '${row.nome || ''}', '${row.bio || ''}', '${row.avatar_url || ''}'
               FROM migration_user_mapping m WHERE m.old_id = '${row.user_id}';\n`
    })
  }

  // Inserir convites
  if (exportsIA.convites.length > 0) {
    sql6 += `\n-- Importar convites\n`
    exportsIA.convites.forEach(row => {
      sql6 += `INSERT INTO convites (id, user_id, email_convidado, codigo)
               SELECT '${row.id}', m.new_id, '${row.email_convidado}', '${row.codigo}'
               FROM migration_user_mapping m WHERE m.old_id = '${row.user_id}';\n`
    })
  }

  // Inserir users_extra_data
  if (exportsIA.users_extra_data.length > 0) {
    sql6 += `\n-- Importar users_extra_data\n`
    exportsIA.users_extra_data.forEach(row => {
      const metadata = JSON.stringify(row.metadata || {}).replace(/'/g, "''")
      sql6 += `INSERT INTO users_extra_data (id, user_id, metadata)
               SELECT '${row.id}', m.new_id, '${metadata}'::jsonb
               FROM migration_user_mapping m WHERE m.old_id = '${row.user_id}';\n`
    })
  }

  sql6 += `\nCOMMIT;\n`

  // Guardar todos os scripts
  fs.writeFileSync(path.join(OUTPUT_DIR, '03_create_mapping_table.sql'), sql1)
  fs.writeFileSync(path.join(OUTPUT_DIR, '04_insert_existing_mappings.sql'), sql2)
  fs.writeFileSync(path.join(OUTPUT_DIR, '06_insert_new_user_mappings.sql'), sql4)
  fs.writeFileSync(path.join(OUTPUT_DIR, '07_sync_dua_coins.sql'), sql5)
  fs.writeFileSync(path.join(OUTPUT_DIR, '08_import_tables.sql'), sql6)

  log.success('Scripts SQL gerados em: migration/generated/')
  log.success('- 03_create_mapping_table.sql')
  log.success('- 04_insert_existing_mappings.sql')
  log.success('- 05_create_users_payload.json')
  log.success('- 06_insert_new_user_mappings.sql (template)')
  log.success('- 07_sync_dua_coins.sql')
  log.success('- 08_import_tables.sql')
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   MIGRAÇÃO INTELIGENTE DUA IA → DUA COIN                  ║')
  console.log('║   MODO: ANÁLISE E PREPARAÇÃO (NÃO EXECUTAR)               ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  try {
    // Etapa 1: Analisar schemas
    const schemaReport = await analyzeSchemas()

    // Etapa 2: Exportar dados
    const exportsIA = await exportDuaIA()

    // Etapa 3: Gerar mapeamento
    const mapping = await generateMapping(exportsIA)

    // Etapa 4: Gerar scripts SQL
    generateSQL(mapping, exportsIA)

    console.log('\n╔════════════════════════════════════════════════════════════╗')
    console.log('║   ✅ PREPARAÇÃO COMPLETA!                                  ║')
    console.log('╚════════════════════════════════════════════════════════════╝\n')

    console.log('📋 RESUMO:')
    console.log(`   • ${mapping.existing.length} utilizadores já existem (mapeados)`)
    console.log(`   • ${mapping.toCreate.length} utilizadores novos a criar`)
    console.log(`   • ${mapping.duaCoinsSync.length} saldos DUA Coins a sincronizar`)
    console.log(`   • ${exportsIA.codigos_acesso.length} códigos de acesso`)
    console.log(`   • ${exportsIA.perfis_usuarios.length} perfis`)
    console.log(`   • ${exportsIA.convites.length} convites`)
    console.log(`   • ${exportsIA.users_extra_data.length} users_extra_data`)

    console.log('\n📁 Ficheiros gerados em: migration/generated/')
    console.log('   1. 00_schema_analysis.json')
    console.log('   2. 01_dua_ia_export.json')
    console.log('   3. 02_user_mapping.json')
    console.log('   4. 03_create_mapping_table.sql')
    console.log('   5. 04_insert_existing_mappings.sql')
    console.log('   6. 05_create_users_payload.json')
    console.log('   7. 06_insert_new_user_mappings.sql')
    console.log('   8. 07_sync_dua_coins.sql')
    console.log('   9. 08_import_tables.sql')

    console.log('\n⚠️  PRÓXIMOS PASSOS:')
    console.log('   1. Reveja os ficheiros gerados')
    console.log('   2. Aprove a execução')
    console.log('   3. Execute: node migration/05_execute_migration.mjs')

  } catch (error) {
    log.error('Erro fatal: ' + error.message)
    console.error(error)
    process.exit(1)
  }
}

main()
