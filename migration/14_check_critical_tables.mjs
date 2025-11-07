#!/usr/bin/env node

/**
 * VERIFICAÇÃO DETALHADA - Tabelas críticas usadas pelo site
 */

import { createClient } from '@supabase/supabase-js'

// ⚠️ CREDENCIAIS ANTIGAS - DUA IA (DESATIVADA/MIGRADA)
// Nota: Pode retornar "Invalid API key" - isto é ESPERADO após migração
const DUA_IA_URL = 'https://gocjbfcztorfswlkkjqi.supabase.co'
const DUA_IA_KEY = 'DESATIVADA_APOS_MIGRACAO'

// ✅ CREDENCIAIS ATUAIS - DUA COIN (PRODUÇÃO)
const DUA_COIN_URL = 'https://nranmngyocaqjwcokcxm.supabase.co'
const DUA_COIN_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDY0OTMwMCwiZXhwIjoyMDQ2MjI1MzAwfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ'

const duaIA = createClient(DUA_IA_URL, DUA_IA_KEY)
const duaCoin = createClient(DUA_COIN_URL, DUA_COIN_KEY)

const log = {
  info: (m) => console.log(`\x1b[34m📋 ${m}\x1b[0m`),
  success: (m) => console.log(`\x1b[32m✅ ${m}\x1b[0m`),
  warn: (m) => console.log(`\x1b[33m⚠️  ${m}\x1b[0m`),
  error: (m) => console.log(`\x1b[31m❌ ${m}\x1b[0m`)
}

// Tabelas críticas identificadas no código
const CRITICAL_TABLES = [
  'users',
  'invite_codes',
  'conversations',
  'mercado',
  'mercado_items',
  'mercado_itens',
  'generation_history',
  'token_packages',
  'token_usage_log',
  'user_profiles',
  'profiles'
]

async function checkTable(client, table, dbName) {
  try {
    const { count, error, data } = await client
      .from(table)
      .select('*', { count: 'exact', head: false })
      .limit(5)
    
    if (error) {
      if (error.code === '42P01') {
        return { exists: false, count: 0, sample: [] }
      }
      return { exists: true, count: null, error: error.message, sample: [] }
    }
    
    return { exists: true, count: count || 0, sample: data || [] }
  } catch (e) {
    return { exists: false, count: 0, sample: [], error: e.message }
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   VERIFICAÇÃO DETALHADA - TABELAS CRÍTICAS                ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  console.log('📋 Tabelas identificadas no código do site:\n')
  
  const results = []
  
  for (const table of CRITICAL_TABLES) {
    log.info(`Verificando: ${table}`)
    
    const ia = await checkTable(duaIA, table, 'DUA IA')
    const coin = await checkTable(duaCoin, table, 'DUA COIN')
    
    results.push({ table, ia, coin })
    
    // Status
    let status = '✅ OK'
    let needsMigration = false
    
    if (ia.exists && ia.count > 0 && (!coin.exists || coin.count === 0)) {
      status = '⚠️  PRECISA MIGRAR'
      needsMigration = true
    } else if (!ia.exists && !coin.exists) {
      status = '❌ Não existe em nenhuma'
    } else if (!coin.exists && ia.count === 0) {
      status = '⚠️  Falta criar tabela'
    }
    
    console.log(`   DUA IA: ${ia.exists ? `${ia.count} registos` : '❌ não existe'}`)
    console.log(`   DUA COIN: ${coin.exists ? `${coin.count} registos` : '❌ não existe'}`)
    console.log(`   Status: ${status}\n`)
    
    if (needsMigration && ia.sample.length > 0) {
      console.log(`   📝 Exemplo de dados a migrar:`)
      console.log(`   ${JSON.stringify(ia.sample[0], null, 2).split('\n').join('\n   ')}\n`)
    }
  }
  
  // Resumo
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   RESUMO                                                  ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')
  
  const toMigrate = results.filter(r => r.ia.exists && r.ia.count > 0 && (!r.coin.exists || r.coin.count === 0))
  const toCreate = results.filter(r => !r.coin.exists && (r.ia.exists || r.ia.count === 0))
  const ok = results.filter(r => (!r.ia.exists || r.ia.count === 0) && r.coin.exists)
  
  if (toMigrate.length > 0) {
    log.warn(`⚠️  ${toMigrate.length} tabelas com dados para migrar:`)
    toMigrate.forEach(r => {
      console.log(`   • ${r.table}: ${r.ia.count} registos`)
    })
    console.log()
  }
  
  if (toCreate.length > 0) {
    log.info(`📋 ${toCreate.length} tabelas que faltam criar na DUA COIN:`)
    toCreate.forEach(r => {
      console.log(`   • ${r.table}`)
    })
    console.log()
  }
  
  if (ok.length > 0) {
    log.success(`✅ ${ok.length} tabelas OK (já existem na DUA COIN)`)
  }
  
  // Decisão final
  if (toMigrate.length === 0 && toCreate.length === 0) {
    log.success('\n🎉 TUDO PRONTO! Não é necessário migrar mais nada.')
    log.success('O site pode começar a funcionar imediatamente.')
  } else {
    log.warn('\n⚠️  AÇÃO NECESSÁRIA:')
    if (toMigrate.length > 0) {
      console.log('   1. Migrar dados das tabelas listadas acima')
    }
    if (toCreate.length > 0) {
      console.log('   2. Criar tabelas em falta (podem ser criadas na primeira utilização)')
    }
  }
}

main().catch(console.error)
