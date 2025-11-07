#!/usr/bin/env node

/**
 * MIGRAÇÃO SUPABASE: DUA IA → DUA COIN
 * 
 * FASE 1: ANÁLISE E EXPORTAÇÃO
 * 
 * Este script apenas:
 * 1. Conecta às duas bases
 * 2. Lista schemas disponíveis
 * 3. Exporta dados para análise
 * 4. NÃO executa nenhuma alteração
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'

// Credenciais DUA IA (origem)
const DUA_IA_URL = 'https://gocjbfcztorfswlkkjqi.supabase.co'
const DUA_IA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY2piZmN6dG9yZnN3bGtranFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4NjM1NSwiZXhwIjoyMDc3ODYyMzU1fQ.dKGt8xCd9sxG7yM5gGJKT0C8N0aPzKvvLGTQE0MQHAQ'

// Credenciais DUA COIN (destino)
const DUA_COIN_URL = 'https://nranmngyocaqjwcokcxm.supabase.co'
const DUA_COIN_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ'

const log = {
  info: (m) => console.log(`\x1b[34m📋 ${m}\x1b[0m`),
  success: (m) => console.log(`\x1b[32m✅ ${m}\x1b[0m`),
  warn: (m) => console.log(`\x1b[33m⚠️  ${m}\x1b[0m`),
  error: (m) => console.log(`\x1b[31m❌ ${m}\x1b[0m`)
}

async function analisar() {
  console.log('\n🔍 MIGRAÇÃO SUPABASE - FASE 1: ANÁLISE\n')
  console.log('=' .repeat(60))
  
  // Conectar às duas bases
  log.info('Conectando à DUA IA (origem)...')
  const duaIA = createClient(DUA_IA_URL, DUA_IA_KEY, {
    auth: { persistSession: false }
  })
  log.success('Conectado à DUA IA')

  log.info('Conectando à DUA COIN (destino)...')
  const duaCoin = createClient(DUA_COIN_URL, DUA_COIN_KEY, {
    auth: { persistSession: false }
  })
  log.success('Conectado à DUA COIN')

  console.log('\n' + '='.repeat(60))
  log.info('PASSO 1: Listar tabelas disponíveis na DUA IA')
  console.log('='.repeat(60))

  // Listar todas as tabelas da DUA IA
  const { data: tabelasIA, error: e1 } = await duaIA.rpc('exec', {
    query: `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `
  })

  if (e1) {
    log.error(`Erro ao listar tabelas DUA IA: ${e1.message}`)
  } else {
    log.success(`Tabelas encontradas na DUA IA: ${tabelasIA?.length || 0}`)
    console.log('\nTabelas públicas na DUA IA:')
    tabelasIA?.forEach(t => console.log(`  • ${t.table_name}`))
  }

  console.log('\n' + '='.repeat(60))
  log.info('PASSO 2: Verificar tabelas-alvo na DUA IA')
  console.log('='.repeat(60))

  const tabelasAlvo = [
    'codigos_acesso',
    'perfis_usuarios',
    'convites',
    'users_extra_data',
    'users' // da auth.users
  ]

  const exportData = {}

  for (const tabela of tabelasAlvo) {
    log.info(`Verificando tabela: ${tabela}`)
    
    let query
    let schema = 'public'
    
    if (tabela === 'users') {
      schema = 'auth'
      query = 'SELECT id, email, created_at, email_confirmed_at, raw_user_meta_data FROM auth.users'
    } else {
      query = `SELECT * FROM ${tabela}`
    }

    try {
      const { data, error } = await duaIA.rpc('exec', { query: `${query} LIMIT 5;` })
      
      if (error) {
        log.warn(`Tabela ${tabela} não encontrada ou sem acesso`)
        exportData[tabela] = { existe: false, registos: 0 }
      } else {
        // Contar registos totais
        const countQuery = tabela === 'users' 
          ? 'SELECT COUNT(*) as total FROM auth.users'
          : `SELECT COUNT(*) as total FROM ${tabela}`
        
        const { data: countData } = await duaIA.rpc('exec', { query: countQuery })
        const total = countData?.[0]?.total || 0
        
        log.success(`${tabela}: ${total} registos`)
        exportData[tabela] = { 
          existe: true, 
          registos: total,
          amostra: data?.slice(0, 3) || []
        }
      }
    } catch (err) {
      log.warn(`Erro ao verificar ${tabela}: ${err.message}`)
      exportData[tabela] = { existe: false, erro: err.message }
    }
  }

  console.log('\n' + '='.repeat(60))
  log.info('PASSO 3: Exportar auth.users de ambas as bases')
  console.log('='.repeat(60))

  // Exportar auth.users da DUA IA
  log.info('Exportando auth.users da DUA IA...')
  const { data: usersIA, error: e2 } = await duaIA.rpc('exec', {
    query: 'SELECT id, email, created_at, email_confirmed_at FROM auth.users ORDER BY created_at;'
  })

  if (e2) {
    log.error(`Erro: ${e2.message}`)
  } else {
    log.success(`${usersIA?.length || 0} utilizadores exportados da DUA IA`)
    writeFileSync('migration/export_users_ia.json', JSON.stringify(usersIA, null, 2))
    log.success('Gravado em: migration/export_users_ia.json')
  }

  // Exportar auth.users da DUA COIN
  log.info('Exportando auth.users da DUA COIN...')
  const { data: usersCoin, error: e3 } = await duaCoin.rpc('exec', {
    query: 'SELECT id, email, created_at, email_confirmed_at FROM auth.users ORDER BY created_at;'
  })

  if (e3) {
    log.error(`Erro: ${e3.message}`)
  } else {
    log.success(`${usersCoin?.length || 0} utilizadores exportados da DUA COIN`)
    writeFileSync('migration/export_users_coin.json', JSON.stringify(usersCoin, null, 2))
    log.success('Gravado em: migration/export_users_coin.json')
  }

  console.log('\n' + '='.repeat(60))
  log.info('PASSO 4: Analisar conflitos de emails')
  console.log('='.repeat(60))

  const emailsIA = new Set(usersIA?.map(u => u.email?.toLowerCase()) || [])
  const emailsCoin = new Set(usersCoin?.map(u => u.email?.toLowerCase()) || [])

  const emailsDuplicados = [...emailsIA].filter(e => emailsCoin.has(e))
  const emailsUnicosIA = [...emailsIA].filter(e => !emailsCoin.has(e))

  log.warn(`Emails duplicados (existem em ambas): ${emailsDuplicados.length}`)
  log.info(`Emails únicos na DUA IA (criar novos): ${emailsUnicosIA.length}`)

  const analiseConflitos = {
    total_ia: usersIA?.length || 0,
    total_coin: usersCoin?.length || 0,
    duplicados: emailsDuplicados.length,
    unicos_ia: emailsUnicosIA.length,
    lista_duplicados: emailsDuplicados,
    lista_unicos_ia: emailsUnicosIA
  }

  writeFileSync('migration/analise_conflitos.json', JSON.stringify(analiseConflitos, null, 2))
  log.success('Análise gravada em: migration/analise_conflitos.json')

  console.log('\n' + '='.repeat(60))
  log.info('PASSO 5: Exportar tabelas-alvo completas')
  console.log('='.repeat(60))

  // Exportar cada tabela que existe
  for (const tabela of tabelasAlvo) {
    if (tabela === 'users' || !exportData[tabela]?.existe) continue

    log.info(`Exportando ${tabela}...`)
    
    const { data, error } = await duaIA.rpc('exec', {
      query: `SELECT * FROM ${tabela};`
    })

    if (!error && data) {
      writeFileSync(`migration/export_${tabela}.json`, JSON.stringify(data, null, 2))
      log.success(`${data.length} registos exportados → migration/export_${tabela}.json`)
    }
  }

  console.log('\n' + '='.repeat(60))
  log.success('FASE 1 COMPLETA: Análise e Exportação')
  console.log('='.repeat(60))

  console.log('\n📊 RESUMO:')
  console.log(`• Utilizadores DUA IA: ${usersIA?.length || 0}`)
  console.log(`• Utilizadores DUA COIN: ${usersCoin?.length || 0}`)
  console.log(`• Emails duplicados: ${emailsDuplicados.length}`)
  console.log(`• Novos utilizadores a criar: ${emailsUnicosIA.length}`)
  
  console.log('\n📁 Ficheiros criados em migration/:')
  console.log('  • export_users_ia.json')
  console.log('  • export_users_coin.json')
  console.log('  • analise_conflitos.json')
  console.log('  • export_codigos_acesso.json (se existir)')
  console.log('  • export_perfis_usuarios.json (se existir)')
  console.log('  • export_convites.json (se existir)')
  console.log('  • export_users_extra_data.json (se existir)')

  console.log('\n⏭️  PRÓXIMOS PASSOS:')
  console.log('1. Revisar ficheiros JSON exportados')
  console.log('2. Executar: node migration-gerar-scripts.mjs')
  console.log('3. Revisar scripts SQL gerados')
  console.log('4. Aprovar manualmente antes da execução\n')
}

analisar().catch(err => {
  console.error('❌ Erro fatal:', err)
  process.exit(1)
})
