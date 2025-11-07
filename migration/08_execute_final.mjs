#!/usr/bin/env node

/**
 * EXECUTOR FINAL - Inserir mapeamentos diretamente via API
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const DUA_COIN_URL = 'https://nranmngyocaqjwcokcxm.supabase.co'
const DUA_COIN_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ'

const duaCoin = createClient(DUA_COIN_URL, DUA_COIN_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  db: { schema: 'public' }
})

const log = {
  info: (m) => console.log(`\x1b[34m📋 ${m}\x1b[0m`),
  success: (m) => console.log(`\x1b[32m✅ ${m}\x1b[0m`),
  error: (m) => console.log(`\x1b[31m❌ ${m}\x1b[0m`)
}

async function createMappingTable() {
  log.info('Tentando inserir mapeamento de teste...')
  
  // Tentar inserir um registro fictício
  const { error } = await duaCoin
    .from('migration_user_mapping')
    .insert({ 
      old_id: '00000000-0000-0000-0000-000000000000',
      new_id: '00000000-0000-0000-0000-000000000000',
      email: 'test@test.com'
    })
  
  if (error && error.code === '42P01') {
    log.error('Tabela não existe!')
    log.info('\n📋 EXECUTE NO SQL EDITOR:')
    console.log('\n' + '='.repeat(60))
    console.log(`
CREATE TABLE IF NOT EXISTS migration_user_mapping (
  old_id UUID PRIMARY KEY,
  new_id UUID NOT NULL,
  email TEXT NOT NULL,
  migrated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_migration_mapping_new_id ON migration_user_mapping(new_id);
CREATE INDEX IF NOT EXISTS idx_migration_mapping_email ON migration_user_mapping(email);
    `)
    console.log('='.repeat(60) + '\n')
    return false
  }
  
  // Limpar o teste
  if (!error) {
    await duaCoin
      .from('migration_user_mapping')
      .delete()
      .eq('email', 'test@test.com')
  }
  
  log.success('Tabela existe!')
  return true
}

async function insertMappings() {
  const GENERATED_DIR = './migration/generated'
  
  // Ler mapeamento
  const mappingFile = path.join(GENERATED_DIR, '02_user_mapping.json')
  const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'))
  
  // Ler novos mapeamentos
  const newMappingsFile = path.join(GENERATED_DIR, '09_new_user_mappings.json')
  const newMappings = JSON.parse(fs.readFileSync(newMappingsFile, 'utf8'))
  
  // Combinar todos
  const allMappings = [
    ...mapping.existing.map(m => ({
      old_id: m.old_id,
      new_id: m.new_id,
      email: m.email
    })),
    ...newMappings
  ]
  
  log.info(`Inserindo ${allMappings.length} mapeamentos...`)
  
  const { data, error } = await duaCoin
    .from('migration_user_mapping')
    .upsert(allMappings, { onConflict: 'old_id' })
  
  if (error) {
    log.error(`Erro ao inserir: ${error.message}`)
    return false
  }
  
  log.success(`✓ ${allMappings.length} mapeamentos inseridos!`)
  return true
}

async function importData() {
  const GENERATED_DIR = './migration/generated'
  const exportFile = path.join(GENERATED_DIR, '01_dua_ia_export.json')
  const exports = JSON.parse(fs.readFileSync(exportFile, 'utf8'))
  
  // Buscar todos os mapeamentos
  const { data: mappings } = await duaCoin
    .from('migration_user_mapping')
    .select('*')
  
  const mappingMap = new Map(mappings.map(m => [m.old_id, m.new_id]))
  
  // Importar codigos_acesso
  if (exports.codigos_acesso.length > 0) {
    log.info(`Importando ${exports.codigos_acesso.length} códigos de acesso...`)
    
    const toInsert = exports.codigos_acesso.map(item => ({
      ...item,
      user_id: mappingMap.get(item.user_id) || item.user_id
    }))
    
    const { error } = await duaCoin.from('codigos_acesso').insert(toInsert)
    if (error) log.error(`Erro: ${error.message}`)
    else log.success(`✓ Códigos importados`)
  }
  
  // Importar perfis_usuarios
  if (exports.perfis_usuarios.length > 0) {
    log.info(`Importando ${exports.perfis_usuarios.length} perfis...`)
    
    const toInsert = exports.perfis_usuarios.map(item => ({
      ...item,
      user_id: mappingMap.get(item.user_id) || item.user_id
    }))
    
    const { error } = await duaCoin.from('perfis_usuarios').insert(toInsert)
    if (error) log.error(`Erro: ${error.message}`)
    else log.success(`✓ Perfis importados`)
  }
  
  // Importar convites
  if (exports.convites.length > 0) {
    log.info(`Importando ${exports.convites.length} convites...`)
    
    const toInsert = exports.convites.map(item => ({
      ...item,
      convidante_id: mappingMap.get(item.convidante_id) || item.convidante_id,
      convidado_id: item.convidado_id ? (mappingMap.get(item.convidado_id) || item.convidado_id) : null
    }))
    
    const { error } = await duaCoin.from('convites').insert(toInsert)
    if (error) log.error(`Erro: ${error.message}`)
    else log.success(`✓ Convites importados`)
  }
  
  // Importar users_extra_data
  if (exports.users_extra_data.length > 0) {
    log.info(`Importando ${exports.users_extra_data.length} extra data...`)
    
    const toInsert = exports.users_extra_data.map(item => ({
      ...item,
      user_id: mappingMap.get(item.user_id) || item.user_id
    }))
    
    const { error } = await duaCoin.from('users_extra_data').insert(toInsert)
    if (error) log.error(`Erro: ${error.message}`)
    else log.success(`✓ Extra data importado`)
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║   EXECUTAR MIGRAÇÃO FINAL                                 ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')

  // Passo 1: Verificar/Criar tabela
  const tableExists = await createMappingTable()
  
  if (!tableExists) {
    log.error('Tabela migration_user_mapping não existe!')
    log.error('Execute primeiro o SQL: migration/generated/03_create_mapping_table.sql')
    log.error('Via Supabase SQL Editor')
    return
  }

  // Passo 2: Inserir mapeamentos
  await insertMappings()

  // Passo 3: Importar dados
  await importData()

  log.success('\n🎉 MIGRAÇÃO COMPLETA!')
  
  // Validação
  const { count } = await duaCoin
    .from('migration_user_mapping')
    .select('*', { count: 'exact', head: true })
  
  log.success(`Total de mapeamentos: ${count}`)
}

main()
