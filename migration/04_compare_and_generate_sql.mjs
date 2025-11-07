#!/usr/bin/env node

/**
 * FASE 4 - COMPARAÇÃO E GERAÇÃO DE SQL
 * Compara DUA IA vs DUA COIN e gera SQL para migração RIGOROSA
 * REGRA: UUID da DUA COIN tem SEMPRE prioridade
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('\n' + '═'.repeat(80))
console.log('🔍 FASE 4 - COMPARAÇÃO E GERAÇÃO DE SQL MIGRAÇÃO')
console.log('═'.repeat(80) + '\n')

// ════════════════════════════════════════════════════════════════
// 1. CARREGAR DADOS EXPORTADOS
// ════════════════════════════════════════════════════════════════

console.log('📂 Carregando dados exportados...\n')

const duaIAPath = path.join(__dirname, 'data', 'dua_ia_FULL_EXPORT.json')
const duaCOINPath = path.join(__dirname, 'data', 'dua_coin_EXPORT.json')

const duaIA = JSON.parse(fs.readFileSync(duaIAPath, 'utf-8'))
const duaCOIN = JSON.parse(fs.readFileSync(duaCOINPath, 'utf-8'))

console.log(`✅ DUA IA:   ${duaIA.auth_users.length} utilizadores`)
console.log(`✅ DUA COIN: ${duaCOIN.auth_users.length} utilizadores\n`)

// ════════════════════════════════════════════════════════════════
// 2. ANÁLISE DE CONFLITOS POR EMAIL
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('🔍 ANÁLISE DE CONFLITOS')
console.log('─'.repeat(80) + '\n')

const conflicts = [] // Email existe em ambas (UUID diferente)
const newUsers = []  // Email só existe na DUA IA
const onlyCOIN = []  // Email só existe na DUA COIN

// Map de emails DUA COIN (para lookup rápido)
const coinEmailMap = new Map()
duaCOIN.auth_users.forEach(u => {
  coinEmailMap.set(u.email.toLowerCase(), u)
})

// Analisar cada utilizador da DUA IA
for (const iaUser of duaIA.auth_users) {
  const email = iaUser.email.toLowerCase()
  const coinUser = coinEmailMap.get(email)
  
  if (coinUser) {
    // CONFLITO: Email existe em ambas
    conflicts.push({
      email: iaUser.email,
      uuid_dua_ia: iaUser.id,
      uuid_dua_coin: coinUser.id,
      metadata_ia: iaUser.user_metadata,
      metadata_coin: coinUser.user_metadata,
      action: 'MERGE'
    })
  } else {
    // NOVO: Email só existe na DUA IA
    newUsers.push({
      email: iaUser.email,
      uuid_dua_ia: iaUser.id,
      metadata: iaUser.user_metadata,
      action: 'CREATE_NEW'
    })
  }
}

// Utilizadores só na DUA COIN
for (const coinUser of duaCOIN.auth_users) {
  const email = coinUser.email.toLowerCase()
  const iaUser = duaIA.auth_users.find(u => u.email.toLowerCase() === email)
  
  if (!iaUser) {
    onlyCOIN.push({
      email: coinUser.email,
      uuid: coinUser.id,
      action: 'KEEP_AS_IS'
    })
  }
}

// ════════════════════════════════════════════════════════════════
// 3. MOSTRAR ANÁLISE
// ════════════════════════════════════════════════════════════════

console.log(`🔴 CONFLITOS (email em ambas as bases): ${conflicts.length}\n`)
conflicts.forEach(c => {
  console.log(`   ⚠️  ${c.email}`)
  console.log(`      DUA IA UUID:   ${c.uuid_dua_ia}`)
  console.log(`      DUA COIN UUID: ${c.uuid_dua_coin} ← ESTE SERÁ MANTIDO`)
  console.log(`      Ação: MERGE (preservar UUID DUA COIN)\n`)
})

console.log(`🟢 NOVOS (só na DUA IA): ${newUsers.length}\n`)
newUsers.forEach(n => {
  console.log(`   ✅ ${n.email}`)
  console.log(`      UUID DUA IA: ${n.uuid_dua_ia}`)
  console.log(`      Ação: CRIAR NOVO na DUA COIN\n`)
})

console.log(`🔵 EXISTENTES (só na DUA COIN): ${onlyCOIN.length}\n`)
onlyCOIN.forEach(o => {
  console.log(`   📌 ${o.email}`)
  console.log(`      UUID: ${o.uuid}`)
  console.log(`      Ação: MANTER (nada fazer)\n`)
})

// ════════════════════════════════════════════════════════════════
// 4. GERAR SQL PARA CONFLITOS (MERGE)
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('📝 GERANDO SQL - PARTE 1: MERGE DE CONFLITOS')
console.log('─'.repeat(80) + '\n')

let sqlMerge = `-- ════════════════════════════════════════════════════════════════
-- SQL PARTE 1: MERGE DE UTILIZADORES CONFLITANTES
-- ════════════════════════════════════════════════════════════════
-- Data: ${new Date().toISOString()}
-- Conflitos: ${conflicts.length}
-- REGRA: UUID da DUA COIN é preservado, dados da DUA IA são mesclados
-- ════════════════════════════════════════════════════════════════

`

for (const conflict of conflicts) {
  // Buscar dados completos da DUA IA
  const iaUserData = duaIA.tables.users.find(u => u.id === conflict.uuid_dua_ia)
  const coinProfile = duaCOIN.profiles.find(p => p.id === conflict.uuid_dua_coin)
  
  sqlMerge += `\n-- ────────────────────────────────────────────────────────────────\n`
  sqlMerge += `-- MERGE: ${conflict.email}\n`
  sqlMerge += `-- UUID DUA COIN (mantido): ${conflict.uuid_dua_coin}\n`
  sqlMerge += `-- UUID DUA IA (descartado): ${conflict.uuid_dua_ia}\n`
  sqlMerge += `-- ────────────────────────────────────────────────────────────────\n\n`
  
  // 1. Atualizar profile com dados mesclados
  if (coinProfile && iaUserData) {
    sqlMerge += `-- Atualizar profile com dados mesclados\n`
    sqlMerge += `UPDATE public.profiles SET\n`
    
    const updates = []
    if (iaUserData.full_name) updates.push(`  full_name = '${iaUserData.full_name.replace(/'/g, "''")}'`)
    if (iaUserData.display_name) updates.push(`  display_name = '${iaUserData.display_name.replace(/'/g, "''")}'`)
    if (iaUserData.avatar_url) updates.push(`  avatar_url = '${iaUserData.avatar_url.replace(/'/g, "''")}'`)
    if (iaUserData.bio) updates.push(`  bio = '${iaUserData.bio.replace(/'/g, "''")}'`)
    
    // Somar créditos (se houver)
    const iaCredits = iaUserData.credits || iaUserData.total_tokens || 0
    if (iaCredits > 0) {
      updates.push(`  credits = COALESCE(credits, 0) + ${iaCredits}`)
    }
    
    updates.push(`  updated_at = NOW()`)
    
    sqlMerge += updates.join(',\n') + '\n'
    sqlMerge += `WHERE id = '${conflict.uuid_dua_coin}';\n\n`
  }
  
  // 2. Criar/atualizar na tabela users
  if (iaUserData) {
    sqlMerge += `-- Criar/atualizar na tabela users\n`
    sqlMerge += `INSERT INTO public.users (id, email, display_name, has_access, subscription_tier, total_tokens, created_at)\n`
    sqlMerge += `VALUES (\n`
    sqlMerge += `  '${conflict.uuid_dua_coin}',\n`
    sqlMerge += `  '${conflict.email.replace(/'/g, "''")}',\n`
    sqlMerge += `  '${(iaUserData.display_name || iaUserData.full_name || conflict.email).replace(/'/g, "''")}',\n`
    sqlMerge += `  ${iaUserData.has_access || true},\n`
    sqlMerge += `  '${iaUserData.subscription_tier || 'free'}',\n`
    sqlMerge += `  ${iaUserData.credits || iaUserData.total_tokens || 0},\n`
    sqlMerge += `  NOW()\n`
    sqlMerge += `)\n`
    sqlMerge += `ON CONFLICT (id) DO UPDATE SET\n`
    sqlMerge += `  total_tokens = public.users.total_tokens + EXCLUDED.total_tokens,\n`
    sqlMerge += `  updated_at = NOW();\n\n`
  }
  
  // 3. Migrar audit_logs (se houver)
  const iaAuditLogs = duaIA.tables.audit_logs.filter(a => a.user_id === conflict.uuid_dua_ia)
  if (iaAuditLogs.length > 0) {
    sqlMerge += `-- Migrar ${iaAuditLogs.length} audit logs\n`
    for (const log of iaAuditLogs) {
      sqlMerge += `INSERT INTO public.audit_logs (user_id, action, details, ip_address, user_agent, created_at)\n`
      sqlMerge += `VALUES (\n`
      sqlMerge += `  '${conflict.uuid_dua_coin}',\n`
      sqlMerge += `  '${log.action.replace(/'/g, "''")}',\n`
      sqlMerge += `  '${JSON.stringify(log.details || {}).replace(/'/g, "''")}',\n`
      sqlMerge += `  ${log.ip_address ? `'${log.ip_address}'` : 'NULL'},\n`
      sqlMerge += `  ${log.user_agent ? `'${log.user_agent.replace(/'/g, "''")}'` : 'NULL'},\n`
      sqlMerge += `  '${log.created_at}'\n`
      sqlMerge += `);\n\n`
    }
  }
}

// Salvar SQL de merge
const sqlMergePath = path.join(__dirname, 'sql', 'SQL_01_MERGE_conflicts.sql')
fs.writeFileSync(sqlMergePath, sqlMerge)
console.log(`✅ SQL Merge gerado: ${sqlMergePath}\n`)

// ════════════════════════════════════════════════════════════════
// 5. GERAR SQL PARA NOVOS UTILIZADORES
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('📝 GERANDO SQL - PARTE 2: CRIAR NOVOS UTILIZADORES')
console.log('─'.repeat(80) + '\n')

let sqlNew = `-- ════════════════════════════════════════════════════════════════
-- SQL PARTE 2: CRIAR NOVOS UTILIZADORES (só existem na DUA IA)
-- ════════════════════════════════════════════════════════════════
-- Data: ${new Date().toISOString()}
-- Novos utilizadores: ${newUsers.length}
-- ATENÇÃO: Estes utilizadores serão criados via Admin API
-- Este SQL é apenas para referência - a criação real será feita por script
-- ════════════════════════════════════════════════════════════════

`

for (const newUser of newUsers) {
  const iaUserData = duaIA.tables.users.find(u => u.id === newUser.uuid_dua_ia)
  
  sqlNew += `\n-- ────────────────────────────────────────────────────────────────\n`
  sqlNew += `-- CRIAR: ${newUser.email}\n`
  sqlNew += `-- UUID original DUA IA: ${newUser.uuid_dua_ia}\n`
  sqlNew += `-- UUID novo será gerado pela Admin API\n`
  sqlNew += `-- ────────────────────────────────────────────────────────────────\n\n`
  
  sqlNew += `-- NOTA: Este utilizador será criado via supabase.auth.admin.createUser()\n`
  sqlNew += `-- Dados a serem usados:\n`
  sqlNew += `--   email: ${newUser.email}\n`
  sqlNew += `--   email_confirm: true\n`
  sqlNew += `--   user_metadata: ${JSON.stringify(newUser.metadata)}\n\n`
  
  if (iaUserData) {
    sqlNew += `-- Após criação, inserir na tabela users:\n`
    sqlNew += `-- INSERT INTO public.users (id, email, display_name, has_access, subscription_tier, total_tokens)\n`
    sqlNew += `-- VALUES (\n`
    sqlNew += `--   '<UUID_GERADO_PELA_API>',\n`
    sqlNew += `--   '${newUser.email}',\n`
    sqlNew += `--   '${(iaUserData.display_name || iaUserData.full_name || newUser.email).replace(/'/g, "''")}',\n`
    sqlNew += `--   ${iaUserData.has_access || true},\n`
    sqlNew += `--   '${iaUserData.subscription_tier || 'free'}',\n`
    sqlNew += `--   ${iaUserData.credits || iaUserData.total_tokens || 0}\n`
    sqlNew += `-- );\n\n`
  }
}

// Salvar SQL de novos
const sqlNewPath = path.join(__dirname, 'sql', 'SQL_02_CREATE_new_users.sql')
fs.writeFileSync(sqlNewPath, sqlNew)
console.log(`✅ SQL Novos gerado: ${sqlNewPath}\n`)

// ════════════════════════════════════════════════════════════════
// 6. GERAR SQL PARA IMPORTAR TABELAS
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('📝 GERANDO SQL - PARTE 3: IMPORTAR TABELAS')
console.log('─'.repeat(80) + '\n')

let sqlTables = `-- ════════════════════════════════════════════════════════════════
-- SQL PARTE 3: IMPORTAR TABELAS DA DUA IA
-- ════════════════════════════════════════════════════════════════
-- Data: ${new Date().toISOString()}
-- ════════════════════════════════════════════════════════════════

`

// Criar tabela invite_codes se não existir
if (duaIA.tables.invite_codes.length > 0) {
  sqlTables += `\n-- ────────────────────────────────────────────────────────────────\n`
  sqlTables += `-- TABELA: invite_codes\n`
  sqlTables += `-- ────────────────────────────────────────────────────────────────\n\n`
  
  sqlTables += `CREATE TABLE IF NOT EXISTS public.invite_codes (\n`
  sqlTables += `  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`
  sqlTables += `  code TEXT UNIQUE NOT NULL,\n`
  sqlTables += `  active BOOLEAN DEFAULT true,\n`
  sqlTables += `  used_by UUID REFERENCES auth.users(id),\n`
  sqlTables += `  credits INTEGER DEFAULT 30,\n`
  sqlTables += `  created_at TIMESTAMPTZ DEFAULT NOW()\n`
  sqlTables += `);\n\n`
  
  sqlTables += `-- Importar códigos\n`
  for (const code of duaIA.tables.invite_codes) {
    sqlTables += `INSERT INTO public.invite_codes (id, code, active, credits, created_at)\n`
    sqlTables += `VALUES (\n`
    sqlTables += `  '${code.id}',\n`
    sqlTables += `  '${code.code.replace(/'/g, "''")}',\n`
    sqlTables += `  ${code.active},\n`
    sqlTables += `  ${code.credits || 30},\n`
    sqlTables += `  '${code.created_at}'\n`
    sqlTables += `)\n`
    sqlTables += `ON CONFLICT (id) DO NOTHING;\n\n`
  }
}

// Criar tabela token_packages
if (duaIA.tables.token_packages.length > 0) {
  sqlTables += `\n-- ────────────────────────────────────────────────────────────────\n`
  sqlTables += `-- TABELA: token_packages\n`
  sqlTables += `-- ────────────────────────────────────────────────────────────────\n\n`
  
  sqlTables += `CREATE TABLE IF NOT EXISTS public.token_packages (\n`
  sqlTables += `  id SERIAL PRIMARY KEY,\n`
  sqlTables += `  name VARCHAR(100) NOT NULL,\n`
  sqlTables += `  description TEXT,\n`
  sqlTables += `  tokens_amount INTEGER NOT NULL,\n`
  sqlTables += `  price NUMERIC NOT NULL,\n`
  sqlTables += `  currency VARCHAR(3) DEFAULT 'EUR',\n`
  sqlTables += `  is_active BOOLEAN DEFAULT true,\n`
  sqlTables += `  is_featured BOOLEAN DEFAULT false,\n`
  sqlTables += `  sort_order INTEGER DEFAULT 0,\n`
  sqlTables += `  discount_percentage INTEGER DEFAULT 0,\n`
  sqlTables += `  promotional_price NUMERIC,\n`
  sqlTables += `  created_at TIMESTAMPTZ DEFAULT NOW(),\n`
  sqlTables += `  updated_at TIMESTAMPTZ DEFAULT NOW()\n`
  sqlTables += `);\n\n`
  
  sqlTables += `-- Importar pacotes\n`
  for (const pkg of duaIA.tables.token_packages) {
    sqlTables += `INSERT INTO public.token_packages (name, description, tokens_amount, price, currency, is_active, is_featured, sort_order)\n`
    sqlTables += `VALUES (\n`
    sqlTables += `  '${pkg.name.replace(/'/g, "''")}',\n`
    sqlTables += `  ${pkg.description ? `'${pkg.description.replace(/'/g, "''")}'` : 'NULL'},\n`
    sqlTables += `  ${pkg.tokens_amount},\n`
    sqlTables += `  ${pkg.price},\n`
    sqlTables += `  '${pkg.currency || 'EUR'}',\n`
    sqlTables += `  ${pkg.is_active},\n`
    sqlTables += `  ${pkg.is_featured},\n`
    sqlTables += `  ${pkg.sort_order || 0}\n`
    sqlTables += `);\n\n`
  }
}

// Criar tabela conversations
sqlTables += `\n-- ────────────────────────────────────────────────────────────────\n`
sqlTables += `-- TABELA: conversations (estrutura da DUA IA)\n`
sqlTables += `-- ────────────────────────────────────────────────────────────────\n\n`

sqlTables += `CREATE TABLE IF NOT EXISTS public.conversations (\n`
sqlTables += `  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),\n`
sqlTables += `  user_id UUID REFERENCES auth.users(id) NOT NULL,\n`
sqlTables += `  title TEXT DEFAULT 'Nova Conversa',\n`
sqlTables += `  messages JSONB NOT NULL,\n`
sqlTables += `  created_at TIMESTAMPTZ DEFAULT NOW(),\n`
sqlTables += `  updated_at TIMESTAMPTZ DEFAULT NOW(),\n`
sqlTables += `  last_synced_at TIMESTAMPTZ DEFAULT NOW(),\n`
sqlTables += `  sync_version INTEGER DEFAULT 1,\n`
sqlTables += `  deleted_at TIMESTAMPTZ,\n`
sqlTables += `  message_count INTEGER,\n`
sqlTables += `  search_vector TSVECTOR\n`
sqlTables += `);\n\n`

sqlTables += `-- Índices\n`
sqlTables += `CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);\n`
sqlTables += `CREATE INDEX IF NOT EXISTS idx_conversations_deleted_at ON public.conversations(deleted_at) WHERE deleted_at IS NULL;\n\n`

// Criar tabela token_usage_log
sqlTables += `\n-- ────────────────────────────────────────────────────────────────\n`
sqlTables += `-- TABELA: token_usage_log\n`
sqlTables += `-- ────────────────────────────────────────────────────────────────\n\n`

sqlTables += `CREATE TABLE IF NOT EXISTS public.token_usage_log (\n`
sqlTables += `  id SERIAL PRIMARY KEY,\n`
sqlTables += `  user_id UUID REFERENCES auth.users(id) NOT NULL,\n`
sqlTables += `  action_type VARCHAR(100) NOT NULL,\n`
sqlTables += `  tokens_used INTEGER NOT NULL,\n`
sqlTables += `  content_generated TEXT,\n`
sqlTables += `  session_id VARCHAR(255),\n`
sqlTables += `  used_at TIMESTAMPTZ DEFAULT NOW(),\n`
sqlTables += `  metadata JSONB\n`
sqlTables += `);\n\n`

sqlTables += `CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON public.token_usage_log(user_id);\n`
sqlTables += `CREATE INDEX IF NOT EXISTS idx_token_usage_used_at ON public.token_usage_log(used_at DESC);\n\n`

// Salvar SQL de tabelas
const sqlTablesPath = path.join(__dirname, 'sql', 'SQL_03_IMPORT_tables.sql')
fs.writeFileSync(sqlTablesPath, sqlTables)
console.log(`✅ SQL Tabelas gerado: ${sqlTablesPath}\n`)

// ════════════════════════════════════════════════════════════════
// 7. GERAR SQL PARA STORAGE BUCKETS
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('📝 GERANDO SQL - PARTE 4: STORAGE BUCKETS')
console.log('─'.repeat(80) + '\n')

let sqlStorage = `-- ════════════════════════════════════════════════════════════════
-- SQL PARTE 4: CRIAR STORAGE BUCKETS
-- ════════════════════════════════════════════════════════════════
-- ATENÇÃO: Buckets devem ser criados via Dashboard ou Admin API
-- Este SQL é apenas para referência
-- ════════════════════════════════════════════════════════════════

`

for (const bucket of duaIA.storage_buckets) {
  sqlStorage += `\n-- Bucket: ${bucket.name}\n`
  sqlStorage += `-- Criar via: supabase.storage.createBucket('${bucket.name}', {\n`
  sqlStorage += `--   public: ${bucket.public},\n`
  if (bucket.file_size_limit) {
    sqlStorage += `--   fileSizeLimit: ${bucket.file_size_limit},\n`
  }
  if (bucket.allowed_mime_types && bucket.allowed_mime_types.length > 0) {
    sqlStorage += `--   allowedMimeTypes: ${JSON.stringify(bucket.allowed_mime_types)}\n`
  }
  sqlStorage += `-- })\n\n`
}

const sqlStoragePath = path.join(__dirname, 'sql', 'SQL_04_STORAGE_buckets.sql')
fs.writeFileSync(sqlStoragePath, sqlStorage)
console.log(`✅ SQL Storage gerado: ${sqlStoragePath}\n`)

// ════════════════════════════════════════════════════════════════
// 8. SALVAR PLANO DE MIGRAÇÃO
// ════════════════════════════════════════════════════════════════

const migrationPlan = {
  generated_at: new Date().toISOString(),
  summary: {
    conflicts: conflicts.length,
    new_users: newUsers.length,
    keep_as_is: onlyCOIN.length,
    total_users_after_migration: duaCOIN.auth_users.length + newUsers.length
  },
  conflicts: conflicts,
  new_users: newUsers,
  only_coin: onlyCOIN,
  sql_files: [
    'SQL_01_MERGE_conflicts.sql',
    'SQL_02_CREATE_new_users.sql',
    'SQL_03_IMPORT_tables.sql',
    'SQL_04_STORAGE_buckets.sql'
  ]
}

const planPath = path.join(__dirname, 'data', 'MIGRATION_PLAN.json')
fs.writeFileSync(planPath, JSON.stringify(migrationPlan, null, 2))

console.log('═'.repeat(80))
console.log('✅ MIGRAÇÃO PLANEADA!')
console.log('═'.repeat(80) + '\n')

console.log('📊 RESUMO:\n')
console.log(`   🔴 Conflitos (merge):        ${conflicts.length}`)
console.log(`   🟢 Novos (criar):            ${newUsers.length}`)
console.log(`   🔵 Manter (sem alteração):   ${onlyCOIN.length}`)
console.log(`   ═══════════════════════════════════`)
console.log(`   📊 Total após migração:      ${migrationPlan.summary.total_users_after_migration} utilizadores\n`)

console.log('📁 FICHEIROS GERADOS:\n')
console.log(`   ✅ ${sqlMergePath}`)
console.log(`   ✅ ${sqlNewPath}`)
console.log(`   ✅ ${sqlTablesPath}`)
console.log(`   ✅ ${sqlStoragePath}`)
console.log(`   ✅ ${planPath}\n`)

console.log('⚠️  PRÓXIMOS PASSOS:\n')
console.log('   1. REVISAR todos os ficheiros SQL gerados')
console.log('   2. DAR APROVAÇÃO MANUAL antes de executar')
console.log('   3. Executar: node migration/05_execute_migration.mjs\n')
