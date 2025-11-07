#!/usr/bin/env node

/**
 * CRIAR TABELA DE MAPEAMENTO VIA MIGRATIONS API
 */

import { createClient } from '@supabase/supabase-js'

const DUA_COIN_URL = 'https://nranmngyocaqjwcokcxm.supabase.co'
const DUA_COIN_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ'

const log = {
  info: (m) => console.log(`\x1b[34m📋 ${m}\x1b[0m`),
  success: (m) => console.log(`\x1b[32m✅ ${m}\x1b[0m`),
  error: (m) => console.log(`\x1b[31m❌ ${m}\x1b[0m`)
}

async function createTableViaAPI() {
  log.info('Tentando criar tabela via Management API...')
  
  const sql = `
    CREATE TABLE IF NOT EXISTS migration_user_mapping (
      old_id UUID PRIMARY KEY,
      new_id UUID NOT NULL,
      email TEXT NOT NULL,
      migrated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_migration_mapping_new_id ON migration_user_mapping(new_id);
    CREATE INDEX IF NOT EXISTS idx_migration_mapping_email ON migration_user_mapping(email);
  `
  
  try {
    // Usar Database Webhooks ou REST API
    const response = await fetch(`${DUA_COIN_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'apikey': DUA_COIN_KEY,
        'Authorization': `Bearer ${DUA_COIN_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    })
    
    log.info('API REST não suporta DDL diretamente')
    log.info('Solução: Inserir via INSERT direto (tabela já deve existir)')
    
  } catch (e) {
    log.error(e.message)
  }
}

// Solução alternativa: criar via INSERT na tabela _realtime.schema_migrations
async function insertSchemaDirectly() {
  const duaCoin = createClient(DUA_COIN_URL, DUA_COIN_KEY)
  
  log.info('Verificando se migration_user_mapping existe...')
  
  try {
    const { data, error } = await duaCoin
      .from('migration_user_mapping')
      .select('old_id')
      .limit(1)
    
    if (error && error.code === '42P01') {
      log.error('Tabela não existe - precisa ser criada manualmente')
      log.info('\n📋 COPIE E COLE NO SQL EDITOR DO SUPABASE:')
      console.log('\n' + '-'.repeat(60))
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
      console.log('-'.repeat(60) + '\n')
      
      return false
    }
    
    log.success('Tabela já existe!')
    return true
    
  } catch (e) {
    log.error(e.message)
    return false
  }
}

async function main() {
  const exists = await insertSchemaDirectly()
  
  if (exists) {
    log.success('Pode continuar com: node migration/08_execute_final.mjs')
  } else {
    log.info('Após criar a tabela no SQL Editor, execute: node migration/08_execute_final.mjs')
  }
}

main()
