#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('\n═══════════════════════════════════════════════════════════════')
console.log('  VERIFICAÇÃO DA ESTRUTURA DA TABELA USERS')
console.log('═══════════════════════════════════════════════════════════════\n')

// Buscar qualquer utilizador para ver estrutura
const { data, error } = await supabase
  .from('users')
  .select('*')
  .limit(1)

if (error) {
  console.error('❌ Erro:', error.message)
} else if (data && data.length > 0) {
  console.log('✅ Estrutura da tabela users:')
  console.log(JSON.stringify(data[0], null, 2))
  console.log('\n📋 Colunas disponíveis:')
  console.log(Object.keys(data[0]).join(', '))
} else {
  console.log('⚠️  Tabela users está vazia')
}

console.log('\n═══════════════════════════════════════════════════════════════\n')
