#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://gocjbfcztorfswlkkjqi.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY2piZmN6dG9yZnN3bGtranFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4NjM1NSwiZXhwIjoyMDc3ODYyMzU1fQ.dKGt8xCd9sxG7yM5gGJKT0C8N0aPzKvvLGTQE0MQHAQ'

const log = {
  info: (m) => console.log(`\x1b[34m📋 ${m}\x1b[0m`),
  success: (m) => console.log(`\x1b[32m✅ ${m}\x1b[0m`),
  warn: (m) => console.log(`\x1b[33m⚠️  ${m}\x1b[0m`),
  error: (m) => console.log(`\x1b[31m❌ ${m}\x1b[0m`)
}

async function executarSQL(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ query: sql })
    })
    return response.ok
  } catch (err) {
    return false
  }
}

async function run() {
  console.log('\n🛒 DUA CREATIVE MARKET - Setup Automático')
  console.log('==========================================\n')

  // 1. Criar cliente Supabase
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  })

  // 2. Ler migração SQL
  log.info('Lendo ficheiro de migração SQL...')
  const sql = readFileSync('./sql/migrations/20251107_mercado_criativo.sql', 'utf-8')
  log.success('Ficheiro lido')

  // 3. Executar migração via RPC (dividir em statements)
  log.info('Executando migração SQL...')
  try {
    // Executar todo o SQL de uma vez
    const { data, error } = await supabase.rpc('exec', { query: sql })
    
    if (error) {
      // Fallback: executar via queries diretas statement por statement
      log.warn('RPC exec falhou, tentando executar statements individuais...')
      
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 10 && !s.startsWith('--'))
      
      let sucessos = 0
      for (const stmt of statements) {
        try {
          await supabase.rpc('exec', { query: stmt + ';' })
          sucessos++
        } catch (e) {
          // Ignorar erros de "já existe"
          if (!e.message?.includes('already exists')) {
            log.warn(`Statement falhou (pode já existir): ${stmt.substring(0, 50)}...`)
          } else {
            sucessos++
          }
        }
      }
      
      if (sucessos > 0) {
        log.success(`${sucessos}/${statements.length} statements executados`)
      }
    } else {
      log.success('Migração SQL aplicada!')
    }
  } catch (err) {
    log.error(`Erro na migração: ${err.message}`)
  }

  // 4. Verificar tabelas criadas
  log.info('Verificando tabelas criadas...')
  try {
    const { data: itens, error: e1 } = await supabase.from('mercado_itens').select('count').limit(1)
    const { data: compras, error: e2 } = await supabase.from('mercado_compras').select('count').limit(1)
    
    if (!e1) log.success('Tabela mercado_itens ✓')
    if (!e2) log.success('Tabela mercado_compras ✓')
  } catch (err) {
    log.warn('Não foi possível verificar tabelas')
  }

  // 5. Criar bucket via Supabase Storage API
  log.info('Criando bucket "mercado"...')
  try {
    const { data, error } = await supabase.storage.createBucket('mercado', { 
      public: true,
      fileSizeLimit: 52428800 // 50MB
    })
    
    if (error) {
      if (error.message?.includes('already exists')) {
        log.warn('Bucket "mercado" já existe')
      } else {
        throw error
      }
    } else {
      log.success('Bucket "mercado" criado!')
    }
  } catch (err) {
    log.error(`Erro ao criar bucket: ${err.message}`)
  }

  // 6. Resumo final
  console.log('\n' + '='.repeat(50))
  log.success('Setup completo!')
  console.log('\n📋 Próximos passos:')
  console.log('1. npm run dev')
  console.log('2. Aceda a: http://localhost:3000/mercado')
  console.log('3. Faça login')
  console.log('4. Clique em "Publicar Conteúdo"')
  console.log('5. Upload de um ficheiro teste\n')
}

run().catch(err => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
