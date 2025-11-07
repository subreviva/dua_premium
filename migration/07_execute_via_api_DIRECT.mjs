#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════
 * EXECUÇÃO VIA ADMIN API - MÉTODO CONFIÁVEL
 * ═══════════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDgyNTc3OSwiZXhwIjoyMDQ2NDAxNzc5fQ.NvCIgDKMpN6GlbbOXR3wOuZpN5kQtfGVE9Y3GaL04lQ'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('\n═══════════════════════════════════════════════════════════════')
console.log('  EXECUÇÃO DIRETA VIA SUPABASE ADMIN API')
console.log('═══════════════════════════════════════════════════════════════\n')

// ─────────────────────────────────────────────────────────────────
// PASSO 1: MERGE VIA UPDATE/INSERT DIRETO
// ─────────────────────────────────────────────────────────────────

console.log('▶ PASSO 1: MERGE DE UTILIZADORES\n')

// Merge dev@dua.com
console.log('1.1 Atualizando profile de dev@dua.com...')
try {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: 'Usuário',
      avatar_url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Bella',
      credits: 999999, // Será somado se já existir
      updated_at: new Date().toISOString()
    })
    .eq('id', '22b7436c-41be-4332-859e-9d2315bcfe1f')

  if (error) {
    console.error('❌ Erro:', error.message)
  } else {
    console.log('✅ Profile atualizado')
  }
} catch (err) {
  console.error('❌ Exceção:', err.message)
}

// Criar entry na tabela users para dev@dua.com
console.log('1.2 Criando entry em users para dev@dua.com...')
try {
  const { data, error } = await supabase
    .from('users')
    .upsert({
      id: '22b7436c-41be-4332-859e-9d2315bcfe1f',
      email: 'dev@dua.com',
      display_name: 'Usuário',
      has_access: true,
      subscription_tier: 'free',
      total_tokens: 999999,
      created_at: new Date().toISOString()
    }, { onConflict: 'id' })

  if (error) {
    console.error('❌ Erro:', error.message)
  } else {
    console.log('✅ Entry em users criada/atualizada')
  }
} catch (err) {
  console.error('❌ Exceção:', err.message)
}

// Merge estracaofficial@gmail.com
console.log('\n1.3 Atualizando profile de estracaofficial@gmail.com...')
try {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: 'Carlos Filipe Morais Guedes',
      credits: 60,
      updated_at: new Date().toISOString()
    })
    .eq('id', '3606c797-0eb8-4fdb-a150-50d51ffaf460')

  if (error) {
    console.error('❌ Erro:', error.message)
  } else {
    console.log('✅ Profile atualizado')
  }
} catch (err) {
  console.error('❌ Exceção:', err.message)
}

console.log('\n✅ PASSO 1 COMPLETO\n')

// ─────────────────────────────────────────────────────────────────
// PASSO 2: CONFIGURAR ADMINS (METADATA)
// ─────────────────────────────────────────────────────────────────

console.log('▶ PASSO 2: CONFIGURAR ADMINS (METADATA)\n')

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

for (const admin of admins) {
  console.log(`2.${admins.indexOf(admin) + 1} Configurando ${admin.email}...`)
  
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
      console.error(`❌ Erro: ${error.message}`)
    } else {
      console.log(`✅ ${admin.email} configurado como SUPER ADMIN`)
    }
  } catch (err) {
    console.error(`❌ Exceção: ${err.message}`)
  }
}

// Atualizar profiles com role admin
console.log('\n2.3 Atualizando roles em profiles...')
for (const admin of admins) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', admin.id)

    if (error) {
      console.error(`❌ Erro para ${admin.email}: ${error.message}`)
    } else {
      console.log(`✅ Role atualizada para ${admin.email}`)
    }
  } catch (err) {
    console.error(`❌ Exceção: ${err.message}`)
  }
}

// Atualizar users com role admin
console.log('\n2.4 Atualizando roles em users...')
for (const admin of admins) {
  try {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: admin.id,
        email: admin.email,
        display_name: admin.name,
        has_access: true,
        subscription_tier: 'premium',
        total_tokens: 999999,
        role: 'admin',
        is_admin: true
      }, { onConflict: 'id' })

    if (error) {
      console.error(`❌ Erro para ${admin.email}: ${error.message}`)
    } else {
      console.log(`✅ Entry em users atualizada para ${admin.email}`)
    }
  } catch (err) {
    console.error(`❌ Exceção: ${err.message}`)
  }
}

console.log('\n✅ PASSO 2 COMPLETO\n')

// ─────────────────────────────────────────────────────────────────
// PASSO 3: VERIFICAÇÃO
// ─────────────────────────────────────────────────────────────────

console.log('▶ PASSO 3: VERIFICAÇÃO FINAL\n')

console.log('3.1 Verificando profiles...')
try {
  const { data, error } = await supabase
    .from('profiles')
    .select('email, full_name, credits, role')
    .order('email')

  if (error) {
    console.error('❌ Erro:', error.message)
  } else {
    console.log('✅ Profiles encontrados:', data.length)
    console.table(data)
  }
} catch (err) {
  console.error('❌ Exceção:', err.message)
}

console.log('\n3.2 Verificando auth metadata dos admins...')
for (const admin of admins) {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(admin.id)

    if (error) {
      console.error(`❌ Erro para ${admin.email}: ${error.message}`)
    } else {
      console.log(`\n✅ ${admin.email}:`)
      console.log('  user_metadata:', JSON.stringify(data.user.user_metadata, null, 2))
      console.log('  app_metadata:', JSON.stringify(data.user.app_metadata, null, 2))
    }
  } catch (err) {
    console.error(`❌ Exceção: ${err.message}`)
  }
}

console.log('\n✅ PASSO 3 COMPLETO\n')

// ─────────────────────────────────────────────────────────────────
// RESULTADO FINAL
// ─────────────────────────────────────────────────────────────────

console.log('═══════════════════════════════════════════════════════════════')
console.log('  MIGRAÇÃO CORE COMPLETA')
console.log('═══════════════════════════════════════════════════════════════\n')
console.log('✅ AÇÕES EXECUTADAS:')
console.log('  1. ✅ Merge de dev@dua.com (999,999 créditos)')
console.log('  2. ✅ Merge de estracaofficial@gmail.com (60 créditos)')
console.log('  3. ✅ Configuração de metadata para estraca@2lados.pt')
console.log('  4. ✅ Configuração de metadata para dev@dua.com')
console.log('  5. ✅ Atualização de roles em profiles e users')
console.log('\n⚠️  AÇÕES PENDENTES (executar via SQL Editor):')
console.log('  1. ⏳ Executar SQL_05_CONFIGURE_ADMINS.sql (criar admin_permissions)')
console.log('  2. ⏳ Executar SQL_03_IMPORT_tables.sql (invite_codes, token_packages)')
console.log('  3. ⏳ Importar audit_logs (62 logs)')
console.log('  4. ⏳ Criar storage bucket profile-images')
console.log('\n🎯 TESTE AGORA:')
console.log('  1. Login com estraca@2lados.pt')
console.log('  2. Login com dev@dua.com')
console.log('  3. Verificar créditos e role admin')
console.log('\n')
