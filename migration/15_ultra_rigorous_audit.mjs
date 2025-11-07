#!/usr/bin/env node

/**
 * AUDITORIA ULTRA-RIGOROSA
 * Verificação manual e detalhada de TUDO
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ⚠️ CREDENCIAIS ANTIGAS - DUA IA (DESATIVADA/MIGRADA)
// Estas credenciais podem retornar "Invalid API key" - isto é ESPERADO
// A DUA IA foi desativada após migração bem-sucedida para DUA COIN
const DUA_IA_URL = 'https://gocjbfcztorfswlkkjqi.supabase.co'
const DUA_IA_ANON = 'DESATIVADA_APOS_MIGRACAO'
const DUA_IA_SERVICE = 'DESATIVADA_APOS_MIGRACAO'

// ✅ CREDENCIAIS ATUAIS - DUA COIN (PRODUÇÃO)
// Esta é a base de dados ativa que o site usa
const DUA_COIN_URL = 'https://nranmngyocaqjwcokcxm.supabase.co'
const DUA_COIN_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA2NDkzMDAsImV4cCI6MjA0NjIyNTMwMH0.dFKTXrh2w8FOzcXndyjlVXP-jUaBUxkBZEWLd4UQeTU'
const DUA_COIN_SERVICE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0OTMwMCwiZXhwIjoyMDQ2MjI1MzAwfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ'


const log = {
  info: (m) => console.log(`\x1b[34m📋 ${m}\x1b[0m`),
  success: (m) => console.log(`\x1b[32m✅ ${m}\x1b[0m`),
  warn: (m) => console.log(`\x1b[33m⚠️  ${m}\x1b[0m`),
  error: (m) => console.log(`\x1b[31m❌ ${m}\x1b[0m`),
  critical: (m) => console.log(`\x1b[41m\x1b[37m 🚨 ${m} \x1b[0m`)
}

// Função para verificar auth users usando Admin API
async function checkAuth(client, name) {
  try {
    const { data, error } = await client.auth.admin.listUsers()
    
    if (error) {
      // Se for DUA IA, "Invalid API key" é ESPERADO (base desativada após migração)
      const isExpectedError = name === 'DUA IA' && error.message.includes('Invalid API key')
      
      return {
        success: false,
        error: error.message,
        expectedError: isExpectedError,
        users: 0,
        list: []
      }
    }
    
    return {
      success: true,
      users: data.users?.length || 0,
      list: data.users?.map(u => ({
        email: u.email,
        id: u.id,
        created_at: u.created_at
      })) || []
    }
  } catch (err) {
    const isExpectedError = name === 'DUA IA' && err.message.includes('Invalid API key')
    
    return {
      success: false,
      error: err.message,
      expectedError: isExpectedError,
      users: 0,
      list: []
    }
  }
}

async function checkTableWithData(client, table, dbName) {
  try {
    // Tentar SELECT com dados completos
    const { data, error, count } = await client
      .from(table)
      .select('*', { count: 'exact' })
      .limit(10)
    
    if (error) {
      if (error.code === '42P01') {
        return { exists: false, count: 0, data: [], error: 'Tabela não existe' }
      }
      return { exists: true, count: null, data: [], error: error.message }
    }
    
    return { exists: true, count: count || 0, data: data || [], error: null }
  } catch (e) {
    return { exists: false, count: 0, data: [], error: e.message }
  }
}

async function checkStorage(client, dbName) {
  try {
    const { data: buckets, error } = await client.storage.listBuckets()
    
    if (error) {
      return { success: false, buckets: [], error: error.message }
    }
    
    const bucketsWithFiles = []
    
    for (const bucket of buckets || []) {
      try {
        const { data: files, error: filesError } = await client.storage
          .from(bucket.name)
          .list()
        
        bucketsWithFiles.push({
          name: bucket.name,
          public: bucket.public,
          files: files?.length || 0,
          error: filesError?.message || null
        })
      } catch (e) {
        bucketsWithFiles.push({
          name: bucket.name,
          public: bucket.public,
          files: 0,
          error: e.message
        })
      }
    }
    
    return { success: true, buckets: bucketsWithFiles, error: null }
  } catch (e) {
    return { success: false, buckets: [], error: e.message }
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   🔍 AUDITORIA ULTRA-RIGOROSA                             ║')
  console.log('║   Verificação completa e detalhada                        ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  const duaIA = createClient(DUA_IA_URL, DUA_IA_SERVICE, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const duaCoin = createClient(DUA_COIN_URL, DUA_COIN_SERVICE, {
    auth: { persistSession: false, autoRefreshToken: false }
  })

  const issues = []
  const warnings = []

  // ============================================================
  // PARTE 1: VERIFICAR CONFIGURAÇÃO DO SITE
  // ============================================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('PARTE 1: CONFIGURAÇÃO DO SITE (.env.local)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  try {
    const envContent = fs.readFileSync('.env.local', 'utf8')
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)
    const anonMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)
    const serviceMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)
    
    const currentUrl = urlMatch?.[1]?.trim() || 'NÃO ENCONTRADO'
    const currentAnon = anonMatch?.[1]?.trim() || 'NÃO ENCONTRADO'
    const currentService = serviceMatch?.[1]?.trim() || 'NÃO ENCONTRADO'
    
    console.log(`📋 URL atual: ${currentUrl}`)
    console.log(`📋 Anon Key: ${currentAnon.substring(0, 50)}...`)
    console.log(`📋 Service Key: ${currentService.substring(0, 50)}...`)
    
    if (currentUrl.includes('gocjbfcztorfswlkkjqi')) {
      log.critical('SITE AINDA USA DUA IA (ANTIGA)!')
      issues.push('Site não foi atualizado para DUA COIN')
    } else if (currentUrl.includes('nranmngyocaqjwcokcxm')) {
      log.success('Site usa DUA COIN (correto) ✓')
    } else {
      log.error('URL não reconhecida!')
      issues.push('URL do Supabase não reconhecida')
    }
    
    // Verificar se as keys correspondem
    if (currentAnon !== DUA_COIN_ANON.trim()) {
      log.warn('⚠️  ANON KEY não corresponde exatamente à DUA COIN')
      warnings.push('ANON KEY pode estar desatualizada')
    } else {
      log.success('ANON KEY correta ✓')
    }
    
    if (currentService !== DUA_COIN_SERVICE.trim()) {
      log.warn('⚠️  SERVICE KEY não corresponde exatamente à DUA COIN')
      warnings.push('SERVICE KEY pode estar desatualizada')
    } else {
      log.success('SERVICE KEY correta ✓')
    }
    
  } catch (e) {
    log.error(`Erro ao ler .env.local: ${e.message}`)
    issues.push('.env.local não encontrado ou ilegível')
  }

  // ============================================================
  // PARTE 2: VERIFICAR AUTH USERS
  // ============================================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('PARTE 2: UTILIZADORES (auth.users)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const iaAuth = await checkAuth(duaIA, 'DUA IA')
  const coinAuth = await checkAuth(duaCoin, 'DUA COIN')

  console.log('📊 DUA IA:')
  if (iaAuth.success) {
    console.log(`   • Total: ${iaAuth.users.length} utilizadores`)
    if (iaAuth.users.length > 0) {
      log.warn('⚠️  DUA IA ainda tem utilizadores!')
      iaAuth.users.forEach(u => {
        console.log(`   - ${u.email} (${u.id})`)
      })
      warnings.push(`DUA IA tem ${iaAuth.users.length} utilizadores (esperado: 0)`)
    } else {
      log.success('DUA IA vazia (correto) ✓')
    }
  } else {
    log.error(`Erro: ${iaAuth.error}`)
    issues.push(`Não foi possível verificar users da DUA IA: ${iaAuth.error}`)
  }

  console.log('\n📊 DUA COIN:')
  if (coinAuth.success) {
    console.log(`   • Total: ${coinAuth.users.length} utilizadores`)
    if (coinAuth.users.length === 0) {
      log.critical('DUA COIN NÃO TEM UTILIZADORES!')
      issues.push('DUA COIN está vazia - migração pode não ter funcionado')
    } else {
      log.success(`DUA COIN tem ${coinAuth.users.length} utilizadores ✓`)
      coinAuth.users.forEach(u => {
        console.log(`   - ${u.email} (${u.id})`)
      })
    }
  } else {
    log.error(`Erro: ${coinAuth.error}`)
    issues.push(`Não foi possível verificar users da DUA COIN: ${coinAuth.error}`)
  }

  // Verificar emails duplicados
  if (iaAuth.success && coinAuth.success) {
    const iaEmails = new Set(iaAuth.users.map(u => u.email))
    const coinEmails = new Set(coinAuth.users.map(u => u.email))
    
    const common = [...iaEmails].filter(e => coinEmails.has(e))
    
    if (common.length > 0) {
      log.warn(`\n⚠️  ${common.length} emails existem em AMBAS as bases:`)
      common.forEach(e => console.log(`   - ${e}`))
      warnings.push('Emails duplicados podem causar confusão')
    }
  }

  // ============================================================
  // PARTE 3: VERIFICAR TABELAS CRÍTICAS COM DADOS REAIS
  // ============================================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('PARTE 3: TABELAS (com dados completos)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const criticalTables = [
    'users', 'profiles', 'invite_codes', 'conversations',
    'mercado', 'mercado_items', 'generation_history',
    'codigos_acesso', 'perfis_usuarios', 'convites'
  ]

  console.log('┌─────────────────────────┬──────────────────┬──────────────────┬──────────┐')
  console.log('│ Tabela                  │ DUA IA           │ DUA COIN         │ Status   │')
  console.log('├─────────────────────────┼──────────────────┼──────────────────┼──────────┤')

  for (const table of criticalTables) {
    const ia = await checkTableWithData(duaIA, table, 'DUA IA')
    const coin = await checkTableWithData(duaCoin, table, 'DUA COIN')
    
    const iaStr = ia.exists ? `${ia.count || '?'} reg${ia.error ? ' ⚠️' : ''}` : '❌ N/A'
    const coinStr = coin.exists ? `${coin.count || '?'} reg${coin.error ? ' ⚠️' : ''}` : '❌ N/A'
    
    let status = '✅ OK'
    
    if (ia.exists && ia.count > 0 && (!coin.exists || coin.count === 0)) {
      status = '🚨 FALTA'
      issues.push(`Tabela ${table}: ${ia.count} registos na DUA IA não migrados`)
    } else if (!coin.exists && ia.exists) {
      status = '⚠️  SEM TB'
      warnings.push(`Tabela ${table} não existe na DUA COIN`)
    }
    
    console.log(`│ ${table.padEnd(23)} │ ${iaStr.padEnd(16)} │ ${coinStr.padEnd(16)} │ ${status.padEnd(8)} │`)
    
    // Mostrar dados de exemplo se houver registos
    if (ia.count > 0 && ia.data.length > 0) {
      console.log(`│   └─ DUA IA: ${JSON.stringify(ia.data[0]).substring(0, 60)}...`)
    }
    if (coin.count > 0 && coin.data.length > 0) {
      console.log(`│   └─ DUA COIN: ${JSON.stringify(coin.data[0]).substring(0, 60)}...`)
    }
  }
  
  console.log('└─────────────────────────┴──────────────────┴──────────────────┴──────────┘')

  // ============================================================
  // PARTE 4: VERIFICAR STORAGE
  // ============================================================
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('PARTE 4: STORAGE BUCKETS')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const iaStorage = await checkStorage(duaIA, 'DUA IA')
  const coinStorage = await checkStorage(duaCoin, 'DUA COIN')

  console.log('📦 DUA IA:')
  if (iaStorage.success) {
    if (iaStorage.buckets.length === 0) {
      console.log('   ❌ Nenhum bucket')
    } else {
      iaStorage.buckets.forEach(b => {
        console.log(`   • ${b.name}: ${b.files} ficheiros (${b.public ? 'público' : 'privado'})`)
        if (b.error) console.log(`     ⚠️  Erro: ${b.error}`)
      })
    }
  } else {
    log.error(`   Erro: ${iaStorage.error}`)
  }

  console.log('\n📦 DUA COIN:')
  if (coinStorage.success) {
    if (coinStorage.buckets.length === 0) {
      log.warn('⚠️  Nenhum bucket na DUA COIN!')
      warnings.push('DUA COIN não tem storage buckets')
    } else {
      coinStorage.buckets.forEach(b => {
        console.log(`   • ${b.name}: ${b.files} ficheiros (${b.public ? 'público' : 'privado'})`)
        if (b.error) console.log(`     ⚠️  Erro: ${b.error}`)
      })
    }
  } else {
    log.error(`   Erro: ${coinStorage.error}`)
  }

  // Comparar buckets
  if (iaStorage.success && coinStorage.success) {
    const iaBucketNames = new Set(iaStorage.buckets.map(b => b.name))
    const coinBucketNames = new Set(coinStorage.buckets.map(b => b.name))
    
    for (const bucket of iaBucketNames) {
      if (!coinBucketNames.has(bucket)) {
        const iaBucket = iaStorage.buckets.find(b => b.name === bucket)
        if (iaBucket.files > 0) {
          log.warn(`\n⚠️  Bucket "${bucket}" tem ${iaBucket.files} ficheiros na DUA IA mas não existe na DUA COIN`)
          warnings.push(`Bucket ${bucket} não migrado (${iaBucket.files} ficheiros)`)
        }
      }
    }
  }

  // ============================================================
  // RESUMO FINAL
  // ============================================================
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   📊 RESUMO FINAL DA AUDITORIA                            ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  if (issues.length === 0 && warnings.length === 0) {
    log.success('🎉 TUDO PERFEITO!')
    log.success('✅ Nenhum problema encontrado')
    log.success('✅ Migração 100% completa')
    log.success('✅ Site pronto para usar')
  } else {
    if (issues.length > 0) {
      log.critical(`🚨 ${issues.length} PROBLEMAS CRÍTICOS ENCONTRADOS:`)
      issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`)
      })
      console.log()
    }
    
    if (warnings.length > 0) {
      log.warn(`⚠️  ${warnings.length} AVISOS:`)
      warnings.forEach((warn, i) => {
        console.log(`   ${i + 1}. ${warn}`)
      })
      console.log()
    }
  }

  // Decisão final
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   🎯 DECISÃO FINAL                                        ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  if (issues.length > 0) {
    log.critical('❌ MIGRAÇÃO NÃO ESTÁ COMPLETA!')
    log.error('É necessário corrigir os problemas acima antes de usar o site.')
  } else if (warnings.length > 0) {
    log.warn('⚠️  MIGRAÇÃO COMPLETA COM RESSALVAS')
    log.info('Os avisos podem não ser críticos, mas devem ser revistos.')
  } else {
    log.success('✅ MIGRAÇÃO 100% COMPLETA E VERIFICADA!')
    log.success('O site está pronto para usar.')
  }

  // Guardar relatório
  const report = {
    timestamp: new Date().toISOString(),
    site_config: {
      url: fs.readFileSync('.env.local', 'utf8').match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1] || 'N/A'
    },
    dua_ia: {
      users: iaAuth.users.length,
      users_list: iaAuth.users.map(u => ({ email: u.email, id: u.id }))
    },
    dua_coin: {
      users: coinAuth.users.length,
      users_list: coinAuth.users.map(u => ({ email: u.email, id: u.id }))
    },
    issues,
    warnings
  }

  fs.writeFileSync('migration/audit-report.json', JSON.stringify(report, null, 2))
  log.info('\n📄 Relatório completo guardado em: migration/audit-report.json')
}

main().catch(console.error)
