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

console.log('\n╔═══════════════════════════════════════════════════════════════╗')
console.log('║         POPULAR TABELA USERS - VERSÃO MÍNIMA                 ║')
console.log('╚═══════════════════════════════════════════════════════════════╝\n')

const users = [
  {
    id: '22b7436c-41be-4332-859e-9d2315bcfe1f',
    email: 'dev@dua.com'
  },
  {
    id: '345bb6b6-7e47-40db-bbbe-e9fe4836f682',
    email: 'estraca@2lados.pt'
  },
  {
    id: '3606c797-0eb8-4fdb-a150-50d51ffaf460',
    email: 'estracaofficial@gmail.com'
  }
]

let successCount = 0

for (const user of users) {
  console.log(`Inserindo ${user.email}...`)
  
  try {
    // Tentar inserir com estrutura mínima
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        created_at: new Date().toISOString()
      })

    if (error) {
      // Se der erro de conflito, tentar update
      if (error.message.includes('duplicate') || error.message.includes('conflict')) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            email: user.email,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (updateError) {
          console.error(`  ❌ Erro ao atualizar: ${updateError.message}`)
        } else {
          console.log(`  ✅ ${user.email} atualizado`)
          successCount++
        }
      } else {
        console.error(`  ❌ Erro ao inserir: ${error.message}`)
      }
    } else {
      console.log(`  ✅ ${user.email} inserido`)
      successCount++
    }
  } catch (err) {
    console.error(`  ❌ Exceção: ${err.message}`)
  }
}

console.log('\n─────────────────────────────────────────────────────────────────')
console.log(`✅ Total processado: ${successCount}/${users.length}`)

// Verificar resultado
console.log('\n📊 VERIFICAÇÃO FINAL:')
const { data, error } = await supabase
  .from('users')
  .select('*')
  .order('email')

if (error) {
  console.error('❌ Erro ao verificar:', error.message)
} else {
  console.log(`Total de registros em users: ${data.length}`)
  console.table(data)
}

console.log('\n╚═══════════════════════════════════════════════════════════════╝\n')
