#!/usr/bin/env node

/**
 * AUDITORIA COMPLETA - Verificar o que falta migrar
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

async function getAllTables(client, dbName) {
  log.info(`Buscando todas as tabelas de ${dbName}...`)
  
  // Lista de tabelas conhecidas do site
  const knownTables = [
    'users',
    'codigos_acesso',
    'perfis_usuarios',
    'convites',
    'users_extra_data',
    'mercado_items',
    'mercado_compras',
    'community_posts',
    'community_comments',
    'community_likes',
    'conversations',
    'messages',
    'profiles',
    'user_profiles',
    'avatars',
    'design_projects',
    'music_generations',
    'suno_generations'
  ]
  
  const tableData = {}
  
  for (const table of knownTables) {
    try {
      const { count, error } = await client
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          tableData[table] = { exists: false, count: 0 }
        } else {
          tableData[table] = { exists: true, count: null, error: error.message }
        }
      } else {
        tableData[table] = { exists: true, count: count || 0 }
      }
    } catch (e) {
      tableData[table] = { exists: false, count: 0 }
    }
  }
  
  return tableData
}

async function getStorageBuckets(client, dbName) {
  log.info(`Buscando storage buckets de ${dbName}...`)
  
  try {
    const { data, error } = await client.storage.listBuckets()
    
    if (error) {
      log.error(`Erro ao buscar buckets: ${error.message}`)
      return []
    }
    
    return data || []
  } catch (e) {
    log.error(`Exceção: ${e.message}`)
    return []
  }
}

async function getBucketFiles(client, bucketName) {
  try {
    const { data, error } = await client.storage.from(bucketName).list()
    
    if (error) return { count: 0, files: [] }
    
    return { count: data.length, files: data }
  } catch (e) {
    return { count: 0, files: [] }
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   AUDITORIA COMPLETA DE MIGRAÇÃO                          ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  // 1. Tabelas
  log.info('━━━ PARTE 1: TABELAS ━━━')
  const iaTableData = await getAllTables(duaIA, 'DUA IA')
  const coinTableData = await getAllTables(duaCoin, 'DUA COIN')
  
  console.log('\n📊 COMPARAÇÃO DE TABELAS:\n')
  console.log('┌─────────────────────────┬─────────────┬─────────────┬──────────┐')
  console.log('│ Tabela                  │ DUA IA      │ DUA COIN    │ Status   │')
  console.log('├─────────────────────────┼─────────────┼─────────────┼──────────┤')
  
  const allTables = new Set([
    ...Object.keys(iaTableData),
    ...Object.keys(coinTableData)
  ])
  
  for (const table of allTables) {
    const ia = iaTableData[table] || { exists: false, count: 0 }
    const coin = coinTableData[table] || { exists: false, count: 0 }
    
    const iaStr = ia.exists ? `${ia.count} reg.` : '❌ N/A'
    const coinStr = coin.exists ? `${coin.count} reg.` : '❌ N/A'
    
    let status = '✅ OK'
    if (ia.exists && ia.count > 0 && (!coin.exists || coin.count === 0)) {
      status = '⚠️  FALTA'
    }
    
    console.log(`│ ${table.padEnd(23)} │ ${iaStr.padEnd(11)} │ ${coinStr.padEnd(11)} │ ${status.padEnd(8)} │`)
  }
  console.log('└─────────────────────────┴─────────────┴─────────────┴──────────┘')

  // 2. Storage Buckets
  log.info('\n━━━ PARTE 2: STORAGE BUCKETS ━━━')
  const iaBuckets = await getStorageBuckets(duaIA, 'DUA IA')
  const coinBuckets = await getStorageBuckets(duaCoin, 'DUA COIN')
  
  console.log('\n📦 STORAGE BUCKETS:\n')
  console.log('DUA IA:')
  if (iaBuckets.length === 0) {
    console.log('   ❌ Nenhum bucket encontrado')
  } else {
    for (const bucket of iaBuckets) {
      const files = await getBucketFiles(duaIA, bucket.name)
      console.log(`   • ${bucket.name} (${files.count} ficheiros, ${bucket.public ? 'público' : 'privado'})`)
    }
  }
  
  console.log('\nDUA COIN:')
  if (coinBuckets.length === 0) {
    console.log('   ❌ Nenhum bucket encontrado')
  } else {
    for (const bucket of coinBuckets) {
      const files = await getBucketFiles(duaCoin, bucket.name)
      console.log(`   • ${bucket.name} (${files.count} ficheiros, ${bucket.public ? 'público' : 'privado'})`)
    }
  }

  // 3. Auth Users
  log.info('\n━━━ PARTE 3: AUTH USERS ━━━')
  const { data: iaUsers } = await duaIA.auth.admin.listUsers()
  const { data: coinUsers } = await duaCoin.auth.admin.listUsers()
  
  console.log(`\n👥 UTILIZADORES:`)
  console.log(`   DUA IA:   ${iaUsers?.users?.length || 0} utilizadores`)
  console.log(`   DUA COIN: ${coinUsers?.users?.length || 0} utilizadores`)

  // Resumo
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   RESUMO DA AUDITORIA                                     ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  let missingTables = []
  let missingBuckets = []
  
  for (const table of allTables) {
    const ia = iaTableData[table]
    const coin = coinTableData[table]
    
    if (ia?.exists && ia?.count > 0 && (!coin?.exists || coin?.count === 0)) {
      missingTables.push({ table, count: ia.count })
    }
  }
  
  for (const iaBucket of iaBuckets) {
    const exists = coinBuckets.find(b => b.name === iaBucket.name)
    if (!exists) {
      const files = await getBucketFiles(duaIA, iaBucket.name)
      missingBuckets.push({ name: iaBucket.name, files: files.count })
    }
  }

  if (missingTables.length === 0 && missingBuckets.length === 0) {
    log.success('✅ Tudo migrado! Não falta nada.')
  } else {
    log.warn('⚠️  ITENS POR MIGRAR:')
    
    if (missingTables.length > 0) {
      console.log('\n📊 TABELAS COM DADOS NÃO MIGRADOS:')
      missingTables.forEach(t => {
        console.log(`   • ${t.table}: ${t.count} registos`)
      })
    }
    
    if (missingBuckets.length > 0) {
      console.log('\n📦 STORAGE BUCKETS NÃO MIGRADOS:')
      missingBuckets.forEach(b => {
        console.log(`   • ${b.name}: ${b.files} ficheiros`)
      })
    }
  }
}

main().catch(console.error)
