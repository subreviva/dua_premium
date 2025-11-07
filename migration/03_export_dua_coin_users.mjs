#!/usr/bin/env node

/**
 * FASE 3 - EXPORTAÇÃO DA DUA COIN (BASE PRINCIPAL)
 * Exporta utilizadores existentes para preservar UUIDs
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ════════════════════════════════════════════════════════════════
// CREDENCIAIS DUA COIN
// ════════════════════════════════════════════════════════════════

const DUA_COIN = {
  url: 'https://nranmngyocaqjwcokcxm.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ'
}

console.log('\n' + '═'.repeat(80))
console.log('📦 FASE 3 - EXPORTAÇÃO DA DUA COIN (BASE PRINCIPAL)')
console.log('═'.repeat(80) + '\n')

const supabaseCOIN = createClient(DUA_COIN.url, DUA_COIN.key, {
  auth: { persistSession: false }
})

// ════════════════════════════════════════════════════════════════
// 1. EXPORTAR AUTH.USERS
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('👥 1. EXPORTAR AUTH.USERS (PRIORIDADE MÁXIMA)')
console.log('─'.repeat(80) + '\n')

let authUsers = []
try {
  const { data, error } = await supabaseCOIN.auth.admin.listUsers()
  
  if (error) {
    console.log('❌ Erro ao exportar auth.users:', error.message)
  } else {
    authUsers = data.users.map(u => ({
      id: u.id,
      email: u.email,
      email_confirmed_at: u.email_confirmed_at,
      created_at: u.created_at,
      updated_at: u.updated_at,
      last_sign_in_at: u.last_sign_in_at,
      role: u.role,
      user_metadata: u.user_metadata,
      app_metadata: u.app_metadata
    }))
    
    console.log(`✅ ${authUsers.length} utilizadores exportados de auth.users\n`)
    authUsers.forEach(u => {
      console.log(`   🔒 ${u.email} → UUID: ${u.id} (DEVE SER PRESERVADO)`)
    })
  }
} catch (err) {
  console.log('❌ Erro ao listar utilizadores:', err.message)
}

console.log()

// ════════════════════════════════════════════════════════════════
// 2. EXPORTAR PROFILES
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('📋 2. EXPORTAR PUBLIC.PROFILES')
console.log('─'.repeat(80) + '\n')

let profiles = []
try {
  const { data, error } = await supabaseCOIN
    .from('profiles')
    .select('*')
  
  if (error) {
    console.log('❌ Erro ao exportar profiles:', error.message)
  } else {
    profiles = data || []
    console.log(`✅ ${profiles.length} profiles exportados\n`)
    profiles.forEach(p => {
      console.log(`   📋 ${p.email || p.full_name || p.id}`)
    })
  }
} catch (err) {
  console.log('❌ Erro:', err.message)
}

console.log()

// ════════════════════════════════════════════════════════════════
// 3. EXPORTAR USERS (se existir)
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('📋 3. EXPORTAR PUBLIC.USERS')
console.log('─'.repeat(80) + '\n')

let users = []
try {
  const { data, error } = await supabaseCOIN
    .from('users')
    .select('*')
  
  if (error) {
    console.log('⚠️  Tabela users:', error.message)
  } else {
    users = data || []
    console.log(`✅ ${users.length} registros em users`)
  }
} catch (err) {
  console.log('⚠️  Erro:', err.message)
}

console.log()

// ════════════════════════════════════════════════════════════════
// 4. EXPORTAR OUTRAS TABELAS IMPORTANTES
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('📋 4. EXPORTAR OUTRAS TABELAS')
console.log('─'.repeat(80) + '\n')

const tables = {
  codigos_acesso: [],
  convites: [],
  audit_logs: []
}

for (const tableName of Object.keys(tables)) {
  try {
    const { data, error, count } = await supabaseCOIN
      .from(tableName)
      .select('*', { count: 'exact' })
    
    if (error) {
      console.log(`⚠️  ${tableName}: ${error.message}`)
    } else {
      tables[tableName] = data || []
      console.log(`✅ ${tableName.padEnd(25)} → ${count} registros`)
    }
  } catch (err) {
    console.log(`⚠️  ${tableName}: ${err.message}`)
  }
}

console.log()

// ════════════════════════════════════════════════════════════════
// 5. SALVAR EXPORTAÇÃO
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('💾 5. SALVAR DADOS DA DUA COIN')
console.log('─'.repeat(80) + '\n')

const exportData = {
  metadata: {
    exported_at: new Date().toISOString(),
    source: 'DUA COIN',
    source_url: DUA_COIN.url,
    total_users: authUsers.length,
    note: 'ESTES UUIDs DEVEM SER PRESERVADOS - SÃO PRIORITÁRIOS'
  },
  auth_users: authUsers,
  profiles: profiles,
  users: users,
  tables: tables,
  summary: {
    auth_users: authUsers.length,
    profiles: profiles.length,
    users: users.length,
    codigos_acesso: tables.codigos_acesso.length,
    convites: tables.convites.length,
    audit_logs: tables.audit_logs.length
  }
}

const outputPath = path.join(__dirname, 'data', 'dua_coin_EXPORT.json')
fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2))

console.log('✅ Exportação DUA COIN salva em:')
console.log(`   ${outputPath}\n`)

// ════════════════════════════════════════════════════════════════
// 6. RESUMO
// ════════════════════════════════════════════════════════════════

console.log('═'.repeat(80))
console.log('📊 RESUMO DUA COIN')
console.log('═'.repeat(80) + '\n')

console.log('✅ DADOS EXISTENTES NA DUA COIN:\n')
console.log(`   👥 ${authUsers.length} utilizadores (auth.users)`)
console.log(`   📋 ${profiles.length} profiles`)
console.log(`   📋 ${users.length} users`)
console.log(`   📝 ${tables.codigos_acesso.length} códigos de acesso`)
console.log(`   🎫 ${tables.convites.length} convites`)
console.log(`   📊 ${tables.audit_logs.length} logs de auditoria`)

console.log()

if (authUsers.length > 0) {
  console.log('🔒 EMAILS E UUIDs A PRESERVAR:\n')
  authUsers.forEach(u => {
    console.log(`   ${u.email.padEnd(35)} → ${u.id}`)
  })
  console.log()
}

console.log('═'.repeat(80))
console.log('✅ EXPORTAÇÃO DUA COIN COMPLETA!')
console.log('═'.repeat(80) + '\n')

console.log('📌 PRÓXIMO PASSO:')
console.log('   Execute: node migration/04_compare_and_generate_sql.mjs')
console.log('   Para comparar e gerar SQL de migração\n')
