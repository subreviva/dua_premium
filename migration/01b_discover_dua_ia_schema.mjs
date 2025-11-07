#!/usr/bin/env node

/**
 * FASE 1.2 - DESCOBRIR ESTRUTURA DA DUA IA
 * A tabela profiles não existe - vamos descobrir qual é o nome correto
 * Vamos listar TODAS as tabelas da DUA IA
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
console.log('🔍 FASE 1.2 - DESCOBRIR ESTRUTURA DA DUA IA')
console.log('═'.repeat(80) + '\n')

const supabaseIA = createClient(DUA_IA.url, DUA_IA.key, {
  auth: { persistSession: false }
})

console.log('URL:', DUA_IA.url)
console.log()

// ════════════════════════════════════════════════════════════════
// MÉTODO 1: Query direto ao information_schema
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('📋 MÉTODO 1: Listar via SQL')
console.log('─'.repeat(80) + '\n')

try {
  const { data, error } = await supabaseIA.rpc('exec_sql', {
    query: `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `
  })
  
  if (error) {
    console.log('⚠️  RPC não disponível:', error.message)
  } else {
    console.log('✅ Tabelas encontradas via SQL:\n')
    data.forEach(row => console.log(`   - ${row.table_name}`))
  }
} catch (err) {
  console.log('⚠️  Erro ao usar RPC:', err.message)
}

console.log()

// ════════════════════════════════════════════════════════════════
// MÉTODO 2: Tentar nomes comuns
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('📋 MÉTODO 2: Testar nomes comuns')
console.log('─'.repeat(80) + '\n')

const possibleTables = [
  'profiles',
  'perfis',
  'usuarios',
  'users',
  'user_profiles',
  'perfis_usuarios',
  'codigos_acesso',
  'access_codes',
  'convites',
  'invites',
  'subscriptions',
  'subscricoes',
  'transactions',
  'transacoes',
  'credits',
  'creditos',
  'dua_credits',
  'dua_coins',
  'balances',
  'saldos',
  'auth_users'
]

const existingTables = []

for (const tableName of possibleTables) {
  try {
    const { count, error } = await supabaseIA
      .from(tableName)
      .select('*', { count: 'exact', head: true })
    
    if (!error) {
      existingTables.push({ name: tableName, count })
      console.log(`✅ ${tableName.padEnd(25)} → ${count} registros`)
    }
  } catch (err) {
    // Ignora erros (tabela não existe)
  }
}

if (existingTables.length === 0) {
  console.log('⚠️  Nenhuma tabela encontrada com nomes comuns')
}

console.log()

// ════════════════════════════════════════════════════════════════
// MÉTODO 3: Usar REST API para listar schema
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('📋 MÉTODO 3: Inspecionar via REST API')
console.log('─'.repeat(80) + '\n')

try {
  const response = await fetch(`${DUA_IA.url}/rest/v1/`, {
    headers: {
      'apikey': DUA_IA.key,
      'Authorization': `Bearer ${DUA_IA.key}`
    }
  })
  
  if (response.ok) {
    const data = await response.json()
    console.log('✅ Schema info:', JSON.stringify(data, null, 2))
  } else {
    console.log('⚠️  Não foi possível obter schema:', response.status)
  }
} catch (err) {
  console.log('⚠️  Erro ao usar REST API:', err.message)
}

console.log()

// ════════════════════════════════════════════════════════════════
// SALVAR RESULTADO
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('💾 SALVAR RESULTADO')
console.log('─'.repeat(80) + '\n')

const result = {
  url: DUA_IA.url,
  timestamp: new Date().toISOString(),
  tables_found: existingTables,
  total_tables: existingTables.length
}

const outputPath = path.join(__dirname, 'data', 'dua_ia_schema.json')
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))

console.log('✅ Schema salvo em:', outputPath)
console.log(`✅ ${existingTables.length} tabelas descobertas\n`)

// ════════════════════════════════════════════════════════════════
// RESUMO
// ════════════════════════════════════════════════════════════════

console.log('═'.repeat(80))
console.log('📊 RESUMO DA DESCOBERTA')
console.log('═'.repeat(80) + '\n')

if (existingTables.length > 0) {
  console.log('✅ Tabelas encontradas na DUA IA:\n')
  existingTables.forEach(({ name, count }) => {
    console.log(`   📋 ${name.padEnd(25)} → ${count} registros`)
  })
  console.log()
  
  console.log('📌 PRÓXIMO PASSO:')
  console.log('   Revisar: migration/data/dua_ia_schema.json')
  console.log('   Execute: node migration/02_export_dua_ia.mjs')
  console.log('   (Será atualizado para usar as tabelas corretas)\n')
} else {
  console.log('❌ PROBLEMA: Nenhuma tabela foi encontrada!')
  console.log()
  console.log('🔍 POSSÍVEIS CAUSAS:')
  console.log('   1. Service Role Key incorreta')
  console.log('   2. Base de dados vazia')
  console.log('   3. Schema não é "public"')
  console.log('   4. RLS bloqueando acesso (mesmo com service role)')
  console.log()
  console.log('📌 AÇÃO NECESSÁRIA:')
  console.log('   Verificar no Dashboard da DUA IA:')
  console.log('   https://supabase.com/dashboard/project/gocjbfcztorfswlkkjqi/editor')
  console.log('   - Quais tabelas existem?')
  console.log('   - Service Role está ativa?\n')
}
