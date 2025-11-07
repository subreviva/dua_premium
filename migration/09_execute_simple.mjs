#!/usr/bin/env node

/**
 * MIGRAÇÃO SIMPLES - SEM TABELA DE MAPEAMENTO
 * Usa os ficheiros JSON gerados para fazer INSERT direto
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const DUA_COIN_URL = 'https://nranmngyocaqjwcokcxm.supabase.co'
const DUA_COIN_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ'

const duaCoin = createClient(DUA_COIN_URL, DUA_COIN_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const log = {
  info: (m) => console.log(`\x1b[34m📋 ${m}\x1b[0m`),
  success: (m) => console.log(`\x1b[32m✅ ${m}\x1b[0m`),
  error: (m) => console.log(`\x1b[31m❌ ${m}\x1b[0m`)
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   MIGRAÇÃO SIMPLIFICADA (SEM TABELA DE MAPEAMENTO)        ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  const GENERATED_DIR = './migration/generated'
  
  // Ler mapeamento
  const mappingFile = path.join(GENERATED_DIR, '02_user_mapping.json')
  const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'))
  
  // Ler novos mapeamentos
  const newMappingsFile = path.join(GENERATED_DIR, '09_new_user_mappings.json')
  const newMappings = JSON.parse(fs.readFileSync(newMappingsFile, 'utf8'))
  
  // Criar mapa old_id → new_id
  const mappingMap = new Map()
  
  mapping.existing.forEach(m => {
    mappingMap.set(m.old_id, m.new_id)
  })
  
  newMappings.forEach(m => {
    mappingMap.set(m.old_id, m.new_id)
  })
  
  log.success(`Mapeamento carregado: ${mappingMap.size} utilizadores`)
  
  // Ler dados exportados
  const exportFile = path.join(GENERATED_DIR, '01_dua_ia_export.json')
  const exports = JSON.parse(fs.readFileSync(exportFile, 'utf8'))
  
  // Importar codigos_acesso
  if (exports.codigos_acesso && exports.codigos_acesso.length > 0) {
    log.info(`Importando ${exports.codigos_acesso.length} códigos de acesso...`)
    
    const toInsert = exports.codigos_acesso.map(item => ({
      ...item,
      user_id: mappingMap.get(item.user_id) || item.user_id
    }))
    
    const { error } = await duaCoin.from('codigos_acesso').insert(toInsert)
    if (error) log.error(`Erro: ${error.message}`)
    else log.success(`✓ Códigos importados`)
  } else {
    log.info('Sem códigos de acesso para importar')
  }
  
  // Importar perfis_usuarios
  if (exports.perfis_usuarios && exports.perfis_usuarios.length > 0) {
    log.info(`Importando ${exports.perfis_usuarios.length} perfis...`)
    
    const toInsert = exports.perfis_usuarios.map(item => ({
      ...item,
      user_id: mappingMap.get(item.user_id) || item.user_id
    }))
    
    const { error } = await duaCoin.from('perfis_usuarios').upsert(toInsert, { onConflict: 'user_id' })
    if (error) log.error(`Erro: ${error.message}`)
    else log.success(`✓ Perfis importados`)
  } else {
    log.info('Sem perfis para importar')
  }
  
  // Importar convites
  if (exports.convites && exports.convites.length > 0) {
    log.info(`Importando ${exports.convites.length} convites...`)
    
    const toInsert = exports.convites.map(item => ({
      ...item,
      convidante_id: mappingMap.get(item.convidante_id) || item.convidante_id,
      convidado_id: item.convidado_id ? (mappingMap.get(item.convidado_id) || item.convidado_id) : null
    }))
    
    const { error } = await duaCoin.from('convites').insert(toInsert)
    if (error) log.error(`Erro: ${error.message}`)
    else log.success(`✓ Convites importados`)
  } else {
    log.info('Sem convites para importar')
  }
  
  // Importar users_extra_data
  if (exports.users_extra_data && exports.users_extra_data.length > 0) {
    log.info(`Importando ${exports.users_extra_data.length} extra data...`)
    
    const toInsert = exports.users_extra_data.map(item => ({
      ...item,
      user_id: mappingMap.get(item.user_id) || item.user_id
    }))
    
    const { error } = await duaCoin.from('users_extra_data').upsert(toInsert, { onConflict: 'user_id' })
    if (error) log.error(`Erro: ${error.message}`)
    else log.success(`✓ Extra data importado`)
  } else {
    log.info('Sem extra data para importar')
  }
  
  // Sincronizar saldos DUA Coins
  if (mapping.duaCoinsSync && mapping.duaCoinsSync.length > 0) {
    log.info(`Sincronizando ${mapping.duaCoinsSync.length} saldos...`)
    
    for (const sync of mapping.duaCoinsSync) {
      const { error } = await duaCoin
        .from('users')
        .update({ 
          dua_coins: duaCoin.rpc('increment', { 
            x: sync.amount_to_add 
          }) 
        })
        .eq('id', sync.user_id)
      
      if (error) log.error(`Erro ao sync ${sync.email}: ${error.message}`)
    }
    
    log.success(`✓ Saldos sincronizados`)
  } else {
    log.info('Sem saldos para sincronizar')
  }
  
  log.success('\n🎉 MIGRAÇÃO COMPLETA!')
  
  // Resumo
  console.log('\n📊 RESUMO:')
  console.log(`   • ${mappingMap.size} utilizadores mapeados`)
  console.log(`   • ${exports.codigos_acesso?.length || 0} códigos de acesso`)
  console.log(`   • ${exports.perfis_usuarios?.length || 0} perfis`)
  console.log(`   • ${exports.convites?.length || 0} convites`)
  console.log(`   • ${exports.users_extra_data?.length || 0} extra data`)
}

main().catch(console.error)
