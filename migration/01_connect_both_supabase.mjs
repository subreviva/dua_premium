#!/usr/bin/env node

/**
 * FASE 1.1 - CONECTAR ÀS DUAS SUPABASE
 * Testa conexão e lista tabelas de ambas as bases
 * NÃO ALTERA NADA - apenas leitura
 */

import { createClient } from '@supabase/supabase-js'

// ════════════════════════════════════════════════════════════════
// CREDENCIAIS
// ════════════════════════════════════════════════════════════════

const DUA_IA = {
  url: 'https://gocjbfcztorfswlkkjqi.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvY2piZmN6dG9yZnN3bGtranFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjI4NjM1NSwiZXhwIjoyMDc3ODYyMzU1fQ.AhNnsqi7E3Rco-m36fAVuqW5UsyDWdMAVKYkFAneOPk'
}

const DUA_COIN = {
  url: 'https://nranmngyocaqjwcokcxm.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ'
}

console.log('\n' + '═'.repeat(80))
console.log('🔌 FASE 1.1 - TESTE DE CONEXÃO')
console.log('═'.repeat(80) + '\n')

// ════════════════════════════════════════════════════════════════
// CRIAR CLIENTES
// ════════════════════════════════════════════════════════════════

console.log('🔧 Criando clientes Supabase...\n')

const supabaseIA = createClient(DUA_IA.url, DUA_IA.key, {
  auth: { persistSession: false }
})

const supabaseCOIN = createClient(DUA_COIN.url, DUA_COIN.key, {
  auth: { persistSession: false }
})

console.log('✅ Clientes criados\n')

// ════════════════════════════════════════════════════════════════
// TESTAR DUA IA
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('📊 DUA IA (Origem)')
console.log('─'.repeat(80) + '\n')

console.log('URL:', DUA_IA.url)

try {
  // Testar conexão listando profiles
  const { data: profilesIA, error: errorIA } = await supabaseIA
    .from('profiles')
    .select('id, email', { count: 'exact', head: false })
    .limit(1)

  if (errorIA) {
    console.log('❌ ERRO ao conectar DUA IA:', errorIA.message)
  } else {
    console.log('✅ Conexão DUA IA funcionando!')
    
    // Contar tabelas importantes
    const tables = ['profiles', 'codigos_acesso', 'convites', 'perfis_usuarios', 'users_extra_data']
    
    console.log('\n📋 Tabelas encontradas:\n')
    
    for (const table of tables) {
      const { count, error } = await supabaseIA
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`   ⚠️  ${table}: NÃO EXISTE`)
      } else {
        console.log(`   ✅ ${table}: ${count} registros`)
      }
    }
  }
} catch (err) {
  console.log('❌ ERRO ao testar DUA IA:', err.message)
}

console.log()

// ════════════════════════════════════════════════════════════════
// TESTAR DUA COIN
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('📊 DUA COIN (Destino)')
console.log('─'.repeat(80) + '\n')

console.log('URL:', DUA_COIN.url)

try {
  // Testar conexão listando profiles
  const { data: profilesCOIN, error: errorCOIN } = await supabaseCOIN
    .from('profiles')
    .select('id, email', { count: 'exact', head: false })
    .limit(1)

  if (errorCOIN) {
    console.log('❌ ERRO ao conectar DUA COIN:', errorCOIN.message)
  } else {
    console.log('✅ Conexão DUA COIN funcionando!')
    
    // Contar tabelas importantes
    const tables = ['profiles', 'users', 'audit_logs', 'codigos_acesso', 'convites']
    
    console.log('\n📋 Tabelas encontradas:\n')
    
    for (const table of tables) {
      const { count, error } = await supabaseCOIN
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`   ⚠️  ${table}: NÃO EXISTE`)
      } else {
        console.log(`   ✅ ${table}: ${count} registros`)
      }
    }
  }
} catch (err) {
  console.log('❌ ERRO ao testar DUA COIN:', err.message)
}

console.log()

// ════════════════════════════════════════════════════════════════
// CONTAR UTILIZADORES
// ════════════════════════════════════════════════════════════════

console.log('─'.repeat(80))
console.log('👥 CONTAGEM DE UTILIZADORES')
console.log('─'.repeat(80) + '\n')

try {
  // DUA IA
  const { count: countIA } = await supabaseIA
    .from('profiles')
    .select('*', { count: 'exact', head: true })
  
  console.log(`📊 DUA IA:   ${countIA} utilizadores`)
  
  // DUA COIN
  const { count: countCOIN } = await supabaseCOIN
    .from('profiles')
    .select('*', { count: 'exact', head: true })
  
  console.log(`📊 DUA COIN: ${countCOIN} utilizadores`)
  console.log(`📊 TOTAL:    ${countIA + countCOIN} (antes do merge)`)
} catch (err) {
  console.log('❌ Erro ao contar:', err.message)
}

console.log()

// ════════════════════════════════════════════════════════════════
// RESUMO
// ════════════════════════════════════════════════════════════════

console.log('═'.repeat(80))
console.log('✅ TESTE DE CONEXÃO COMPLETO')
console.log('═'.repeat(80) + '\n')

console.log('📌 PRÓXIMO PASSO:')
console.log('   Execute: node migration/02_export_dua_ia.mjs')
console.log('   Para exportar dados da DUA IA\n')

console.log('⚠️  LEMBRE-SE:')
console.log('   - Nenhum dado foi alterado')
console.log('   - Apenas testamos as conexões')
console.log('   - DUA COIN continua intacta\n')
