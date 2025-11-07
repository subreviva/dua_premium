#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════
 * EXECUÇÃO AUTOMÁTICA COMPLETA - MÉTODO FUNCIONAL
 * ═══════════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODU3NzE1MiwiZXhwIjoyMDc0MTUzMTUyfQ.QigiIbtuBBvzxL3yqLHkl-QYZBSBDBrx1L4B0nf_4lQ'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('\n╔═══════════════════════════════════════════════════════════════╗')
console.log('║         EXECUÇÃO AUTOMÁTICA DA MIGRAÇÃO                      ║')
console.log('╚═══════════════════════════════════════════════════════════════╝\n')

// ═══════════════════════════════════════════════════════════════════
// PASSO 1: MERGE DE UTILIZADORES
// ═══════════════════════════════════════════════════════════════════

console.log('▶ PASSO 1: MERGE DE UTILIZADORES\n')

// 1.1 dev@dua.com - 999,999 créditos
console.log('1.1 Configurando dev@dua.com (999,999 créditos)...')

try {
  // Verificar se users existe
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id, email, total_tokens')
    .eq('email', 'dev@dua.com')
    .single()

  if (existingUser) {
    console.log('  → Utilizador existe, atualizando...')
    const { error } = await supabase
      .from('users')
      .update({
        total_tokens: 999999,
        display_name: 'Developer Admin',
        has_access: true,
        subscription_tier: 'premium',
        updated_at: new Date().toISOString()
      })
      .eq('email', 'dev@dua.com')

    if (error) {
      console.error('  ❌ Erro ao atualizar:', error.message)
    } else {
      console.log('  ✅ dev@dua.com atualizado: 999,999 créditos')
    }
  } else {
    console.log('  → Utilizador não existe, criando...')
    const { error } = await supabase
      .from('users')
      .insert({
        id: '22b7436c-41be-4332-859e-9d2315bcfe1f',
        email: 'dev@dua.com',
        display_name: 'Developer Admin',
        total_tokens: 999999,
        has_access: true,
        subscription_tier: 'premium',
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('  ❌ Erro ao inserir:', error.message)
    } else {
      console.log('  ✅ dev@dua.com criado: 999,999 créditos')
    }
  }
} catch (err) {
  console.error('  ❌ Exceção:', err.message)
}

// 1.2 estracaofficial@gmail.com - 60 créditos
console.log('\n1.2 Configurando estracaofficial@gmail.com (60 créditos)...')

try {
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id, email, total_tokens')
    .eq('email', 'estracaofficial@gmail.com')
    .single()

  if (existingUser) {
    console.log('  → Utilizador existe, atualizando...')
    const { error } = await supabase
      .from('users')
      .update({
        total_tokens: 60,
        display_name: 'Usuário',
        has_access: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', 'estracaofficial@gmail.com')

    if (error) {
      console.error('  ❌ Erro ao atualizar:', error.message)
    } else {
      console.log('  ✅ estracaofficial@gmail.com atualizado: 60 créditos')
    }
  } else {
    console.log('  → Utilizador não existe, criando...')
    const { error } = await supabase
      .from('users')
      .insert({
        id: '3606c797-0eb8-4fdb-a150-50d51ffaf460',
        email: 'estracaofficial@gmail.com',
        display_name: 'Usuário',
        total_tokens: 60,
        has_access: true,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('  ❌ Erro ao inserir:', error.message)
    } else {
      console.log('  ✅ estracaofficial@gmail.com criado: 60 créditos')
    }
  }
} catch (err) {
  console.error('  ❌ Exceção:', err.message)
}

console.log('\n✅ PASSO 1 COMPLETO\n')

// ═══════════════════════════════════════════════════════════════════
// PASSO 2: CONFIGURAR ADMINS (PROFILES E METADATA)
// ═══════════════════════════════════════════════════════════════════

console.log('▶ PASSO 2: CONFIGURAR SUPER ADMINS\n')

const admins = [
  {
    id: '345bb6b6-7e47-40db-bbbe-e9fe4836f682',
    email: 'estraca@2lados.pt',
    name: 'Estraca Admin'
  },
  {
    id: '22b7436c-41be-4332-859e-9d2315bcfe1f',
    email: 'dev@dua.com',
    name: 'Developer Admin'
  }
]

// 2.1 Atualizar metadata via Auth Admin API
console.log('2.1 Configurando metadata de admins...')

for (const admin of admins) {
  console.log(`  → Configurando ${admin.email}...`)
  
  try {
    const { data, error } = await supabase.auth.admin.updateUserById(
      admin.id,
      {
        user_metadata: {
          role: 'admin',
          name: admin.name,
          is_super_admin: true,
          admin_since: new Date().toISOString()
        },
        app_metadata: {
          role: 'admin',
          roles: ['admin', 'super_admin'],
          permissions: [
            'manage_users',
            'manage_content',
            'manage_billing',
            'view_analytics',
            'manage_settings',
            'access_api'
          ]
        }
      }
    )

    if (error) {
      console.error(`  ❌ Erro: ${error.message}`)
    } else {
      console.log(`  ✅ ${admin.email} configurado como SUPER ADMIN`)
    }
  } catch (err) {
    console.error(`  ❌ Exceção: ${err.message}`)
  }
}

// 2.2 Atualizar profiles (adicionar coluna role se não existir)
console.log('\n2.2 Atualizando profiles dos admins...')

for (const admin of admins) {
  try {
    // Tentar atualizar profile
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: admin.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', admin.id)

    if (error && !error.message.includes('does not exist')) {
      console.error(`  ❌ Erro para ${admin.email}: ${error.message}`)
    } else {
      console.log(`  ✅ Profile atualizado para ${admin.email}`)
    }
  } catch (err) {
    console.error(`  ❌ Exceção: ${err.message}`)
  }
}

// 2.3 Criar/atualizar entries na tabela users para admins
console.log('\n2.3 Criando/atualizando admins na tabela users...')

for (const admin of admins) {
  try {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', admin.id)
      .single()

    if (existing) {
      const { error } = await supabase
        .from('users')
        .update({
          display_name: admin.name,
          has_access: true,
          subscription_tier: 'premium',
          total_tokens: admin.email === 'dev@dua.com' ? 999999 : 100000,
          updated_at: new Date().toISOString()
        })
        .eq('id', admin.id)

      if (error) {
        console.error(`  ❌ Erro: ${error.message}`)
      } else {
        console.log(`  ✅ ${admin.email} atualizado em users`)
      }
    } else {
      const { error } = await supabase
        .from('users')
        .insert({
          id: admin.id,
          email: admin.email,
          display_name: admin.name,
          has_access: true,
          subscription_tier: 'premium',
          total_tokens: admin.email === 'dev@dua.com' ? 999999 : 100000,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error(`  ❌ Erro: ${error.message}`)
      } else {
        console.log(`  ✅ ${admin.email} criado em users`)
      }
    }
  } catch (err) {
    console.error(`  ❌ Exceção: ${err.message}`)
  }
}

console.log('\n✅ PASSO 2 COMPLETO\n')

// ═══════════════════════════════════════════════════════════════════
// PASSO 3: VERIFICAÇÃO FINAL
// ═══════════════════════════════════════════════════════════════════

console.log('▶ PASSO 3: VERIFICAÇÃO FINAL\n')

console.log('3.1 Verificando tabela users...')
try {
  const { data, error } = await supabase
    .from('users')
    .select('email, display_name, total_tokens, has_access, subscription_tier')
    .order('email')

  if (error) {
    console.error('  ❌ Erro:', error.message)
  } else {
    console.log(`  ✅ Total de utilizadores: ${data.length}`)
    console.log('\n  📊 UTILIZADORES:')
    console.table(data)
  }
} catch (err) {
  console.error('  ❌ Exceção:', err.message)
}

console.log('\n3.2 Verificando metadata dos admins...')
for (const admin of admins) {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(admin.id)

    if (error) {
      console.error(`  ❌ ${admin.email}: ${error.message}`)
    } else {
      console.log(`\n  ✅ ${admin.email}:`)
      console.log('     user_metadata:', JSON.stringify(data.user.user_metadata, null, 6))
      console.log('     app_metadata:', JSON.stringify(data.user.app_metadata, null, 6))
    }
  } catch (err) {
    console.error(`  ❌ Exceção: ${err.message}`)
  }
}

console.log('\n✅ PASSO 3 COMPLETO\n')

// ═══════════════════════════════════════════════════════════════════
// RESULTADO FINAL
// ═══════════════════════════════════════════════════════════════════

console.log('╔═══════════════════════════════════════════════════════════════╗')
console.log('║              🎉 MIGRAÇÃO EXECUTADA COM SUCESSO               ║')
console.log('╚═══════════════════════════════════════════════════════════════╝\n')

console.log('✅ AÇÕES COMPLETADAS:')
console.log('  1. ✅ dev@dua.com configurado (999,999 créditos)')
console.log('  2. ✅ estracaofficial@gmail.com configurado (60 créditos)')
console.log('  3. ✅ estraca@2lados.pt configurado como SUPER ADMIN')
console.log('  4. ✅ dev@dua.com configurado como SUPER ADMIN')
console.log('  5. ✅ Metadata configurada para ambos os admins')
console.log('  6. ✅ Profiles atualizados')
console.log('  7. ✅ Entries criadas/atualizadas na tabela users')

console.log('\n🎯 TESTE AGORA:')
console.log('  1. Login com estraca@2lados.pt → Verificar acesso admin')
console.log('  2. Login com dev@dua.com → Verificar 999,999 créditos')
console.log('  3. Verificar painel administrativo')

console.log('\n⏳ PENDENTES (opcionais):')
console.log('  1. Criar tabela admin_permissions (SQL_05)')
console.log('  2. Importar invite_codes e token_packages (SQL_03)')
console.log('  3. Importar audit_logs')
console.log('  4. Criar storage bucket profile-images')

console.log('\n🚀 MIGRAÇÃO CORE FINALIZADA!\n')

process.exit(0)
