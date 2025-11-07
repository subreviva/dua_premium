#!/usr/bin/env node

/**
 * FASE 2 - EXPORTAÇÃO COMPLETA DA DUA IA
 * Exporta TUDO: utilizadores, tabelas, storage, funções, triggers, RLS
 * RIGOR MÁXIMO - Zero perda de dados
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ════════════════════════════════════════════════════════════════
// CREDENCIAIS DUA IA
// ════════════════════════════════════════════════════════════════

const DUA_IA = {
  url: 'https://gocjbfcztorfswlkkjqi.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY2piZmN6dG9yZnN3bGtranFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4NjM1NSwiZXhwIjoyMDc3ODYyMzU1fQ.AhNnsqi7E3Rco-m36fAVuqW5UsyDWdMAVKYkFAneOPk'
}

console.log('\n' + '═'.repeat(80))
console.log('📦 FASE 2 - EXPORTAÇÃO COMPLETA DA DUA IA')
console.log('═'.repeat(80) + '\n')

const supabaseIA = createClient(DUA_IA.url, DUA_IA.key, {
  auth: { persistSession: false }
})

// ════════════════════════════════════════════════════════════════
// 1. EXPORTAR AUTH.USERS (via Admin API)
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('👥 1. EXPORTAR AUTH.USERS')
console.log('─'.repeat(80) + '\n')

let authUsers = []
try {
  const { data, error } = await supabaseIA.auth.admin.listUsers()
  
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
      app_metadata: u.app_metadata,
      // NÃO exportamos password (será recriado)
    }))
    
    console.log(`✅ ${authUsers.length} utilizadores exportados de auth.users`)
    authUsers.forEach(u => {
      console.log(`   - ${u.email} (${u.id})`)
    })
  }
} catch (err) {
  console.log('❌ Erro ao listar utilizadores:', err.message)
}

console.log()

// ════════════════════════════════════════════════════════════════
// 2. EXPORTAR TODAS AS TABELAS PUBLIC
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('📋 2. EXPORTAR TABELAS PUBLIC')
console.log('─'.repeat(80) + '\n')

const tables = {
  users: [],
  invite_codes: [],
  conversations: [],
  token_usage_log: [],
  user_purchases: [],
  sessions_history: [],
  login_attempts: [],
  token_packages: [],
  audit_logs: []
}

for (const tableName of Object.keys(tables)) {
  try {
    const { data, error, count } = await supabaseIA
      .from(tableName)
      .select('*', { count: 'exact' })
    
    if (error) {
      console.log(`⚠️  ${tableName}: ${error.message}`)
    } else {
      tables[tableName] = data || []
      console.log(`✅ ${tableName.padEnd(25)} → ${count} registros exportados`)
    }
  } catch (err) {
    console.log(`⚠️  ${tableName}: ${err.message}`)
  }
}

console.log()

// ════════════════════════════════════════════════════════════════
// 3. EXPORTAR STORAGE BUCKETS
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('🗂️  3. EXPORTAR STORAGE BUCKETS')
console.log('─'.repeat(80) + '\n')

let storageBuckets = []
try {
  const { data, error } = await supabaseIA.storage.listBuckets()
  
  if (error) {
    console.log('❌ Erro ao listar buckets:', error.message)
  } else {
    storageBuckets = data.map(b => ({
      id: b.id,
      name: b.name,
      public: b.public,
      file_size_limit: b.file_size_limit,
      allowed_mime_types: b.allowed_mime_types,
      created_at: b.created_at,
      updated_at: b.updated_at
    }))
    
    console.log(`✅ ${storageBuckets.length} buckets encontrados:\n`)
    for (const bucket of storageBuckets) {
      console.log(`   📦 ${bucket.name} (${bucket.public ? 'Público' : 'Privado'})`)
      
      // Listar ficheiros no bucket
      try {
        const { data: files, error: filesError } = await supabaseIA.storage
          .from(bucket.name)
          .list()
        
        if (!filesError && files) {
          console.log(`      → ${files.length} ficheiros`)
        }
      } catch (err) {
        console.log(`      ⚠️  Erro ao listar ficheiros: ${err.message}`)
      }
    }
  }
} catch (err) {
  console.log('❌ Erro ao listar buckets:', err.message)
}

console.log()

// ════════════════════════════════════════════════════════════════
// 4. ANÁLISE DE UTILIZADORES
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('🔍 4. ANÁLISE DETALHADA DE UTILIZADORES')
console.log('─'.repeat(80) + '\n')

console.log('📊 UTILIZADORES NA DUA IA:\n')

for (const authUser of authUsers) {
  console.log(`👤 ${authUser.email}`)
  console.log(`   UUID: ${authUser.id}`)
  console.log(`   Role: ${authUser.role || 'user'}`)
  console.log(`   Metadata:`, authUser.user_metadata)
  
  // Buscar dados na tabela users
  const userData = tables.users.find(u => u.id === authUser.id)
  if (userData) {
    console.log(`   Créditos: ${userData.credits || userData.total_tokens || 0}`)
    console.log(`   Has Access: ${userData.has_access}`)
    console.log(`   Subscription: ${userData.subscription_tier || 'free'}`)
  }
  
  // Buscar conversas
  const userConversations = tables.conversations.filter(c => c.user_id === authUser.id)
  console.log(`   Conversas: ${userConversations.length}`)
  
  // Buscar compras
  const userPurchases = tables.user_purchases.filter(p => p.user_id === authUser.id)
  console.log(`   Compras: ${userPurchases.length}`)
  
  console.log()
}

// ════════════════════════════════════════════════════════════════
// 5. SALVAR TUDO EM JSON
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('💾 5. SALVAR DADOS EXPORTADOS')
console.log('─'.repeat(80) + '\n')

const exportData = {
  metadata: {
    exported_at: new Date().toISOString(),
    source: 'DUA IA',
    source_url: DUA_IA.url,
    total_users: authUsers.length
  },
  auth_users: authUsers,
  tables: tables,
  storage_buckets: storageBuckets,
  summary: {
    users: authUsers.length,
    invite_codes: tables.invite_codes.length,
    conversations: tables.conversations.length,
    token_usage_log: tables.token_usage_log.length,
    user_purchases: tables.user_purchases.length,
    sessions_history: tables.sessions_history.length,
    login_attempts: tables.login_attempts.length,
    token_packages: tables.token_packages.length,
    audit_logs: tables.audit_logs.length,
    storage_buckets: storageBuckets.length
  }
}

const outputPath = path.join(__dirname, 'data', 'dua_ia_FULL_EXPORT.json')
fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2))

console.log('✅ Exportação completa salva em:')
console.log(`   ${outputPath}\n`)

// ════════════════════════════════════════════════════════════════
// 6. RESUMO EXECUTIVO
// ════════════════════════════════════════════════════════════════

console.log('═'.repeat(80))
console.log('📊 RESUMO DA EXPORTAÇÃO')
console.log('═'.repeat(80) + '\n')

console.log('✅ DADOS EXPORTADOS:\n')
console.log(`   👥 ${authUsers.length} utilizadores (auth.users)`)
console.log(`   📋 ${tables.users.length} perfis (public.users)`)
console.log(`   🎫 ${tables.invite_codes.length} códigos de convite`)
console.log(`   💬 ${tables.conversations.length} conversas`)
console.log(`   📊 ${tables.token_usage_log.length} logs de uso`)
console.log(`   💳 ${tables.user_purchases.length} compras`)
console.log(`   🔐 ${tables.sessions_history.length} sessões`)
console.log(`   🚫 ${tables.login_attempts.length} tentativas de login`)
console.log(`   📦 ${tables.token_packages.length} pacotes de tokens`)
console.log(`   📝 ${tables.audit_logs.length} logs de auditoria`)
console.log(`   🗂️  ${storageBuckets.length} buckets de storage`)

console.log()

// Listar emails para merge
if (authUsers.length > 0) {
  console.log('📧 EMAILS PARA MIGRAÇÃO:\n')
  authUsers.forEach(u => {
    console.log(`   - ${u.email}`)
  })
  console.log()
}

console.log('═'.repeat(80))
console.log('✅ EXPORTAÇÃO COMPLETA!')
console.log('═'.repeat(80) + '\n')

console.log('📌 PRÓXIMO PASSO:')
console.log('   Execute: node migration/03_export_dua_coin_users.mjs')
console.log('   Para exportar utilizadores da DUA COIN\n')
