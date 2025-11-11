#!/usr/bin/env node

/**
 * 🚀 APLICAR SCHEMA DE CRÉDITOS NO SUPABASE
 * Aplica todas as mudanças necessárias no banco de dados
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Carregar .env.local manualmente
const envContent = readFileSync('.env.local', 'utf-8')
const envVars = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)="?([^"]+)"?$/)
  if (match) {
    envVars[match[1]] = match[2]
  }
})

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('\n🚀 APLICANDO SCHEMA DE CRÉDITOS NO SUPABASE\n')

// Ler SQL
const sql = readFileSync('APLICAR_SCHEMA_CREDITOS_ULTRA_RIGOROSO.sql', 'utf-8')

// Dividir em statements individuais (ignorar comentários)
const statements = sql
  .split('\n')
  .filter(line => !line.trim().startsWith('--') && line.trim())
  .join('\n')
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('DO $$'))

console.log(`📝 ${statements.length} comandos SQL para executar\n`)

async function executarSQL() {
  let sucessos = 0
  let erros = 0
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';'
    
    // Pular comentários e DO blocks
    if (statement.includes('COMMENT ON') || statement.includes('RAISE NOTICE')) {
      continue
    }
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement })
      
      if (error) {
        // Tentar método alternativo
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({ sql_query: statement })
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
      }
      
      console.log(`✅ [${i + 1}/${statements.length}] Executado`)
      sucessos++
    } catch (error) {
      console.log(`⚠️ [${i + 1}/${statements.length}] ${error.message}`)
      erros++
    }
  }
  
  console.log(`\n📊 Resultado: ${sucessos} sucessos, ${erros} erros`)
  console.log('\n⚠️ IMPORTANTE: Execute o SQL manualmente no Supabase Dashboard > SQL Editor')
  console.log('📁 Arquivo: APLICAR_SCHEMA_CREDITOS_ULTRA_RIGOROSO.sql\n')
}

executarSQL()
