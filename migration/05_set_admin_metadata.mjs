#!/usr/bin/env node

/**
 * ════════════════════════════════════════════════════════════════
 * CONFIGURAR METADATA ADMIN EM auth.users
 * ════════════════════════════════════════════════════════════════
 * Atualiza user_metadata e app_metadata para conceder acesso admin
 * 
 * IMPORTANTE: Este script precisa ser executado com SERVICE ROLE KEY
 * porque apenas o Admin API pode modificar metadata em auth.users
 * ════════════════════════════════════════════════════════════════
 */

import { createClient } from '@supabase/supabase-js'

// ────────────────────────────────────────────────────────────────
// CONFIGURAÇÃO SUPABASE DUA COIN (PRIMARY)
// ────────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://nranmngyocaqjwcokcxm.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYW5tbmd5b2NhcWp3Y29rY3htIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDgyNTc3OSwiZXhwIjoyMDQ2NDAxNzc5fQ.NvCIgDKMpN6GlbbOXR3wOuZpN5kQtfGVE9Y3GaL04lQ'

// Criar cliente com SERVICE ROLE (necessário para Admin API)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// ────────────────────────────────────────────────────────────────
// ADMINS A CONFIGURAR
// ────────────────────────────────────────────────────────────────

const ADMINS = [
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

// ────────────────────────────────────────────────────────────────
// FUNÇÃO: ATUALIZAR METADATA DE UM ADMIN
// ────────────────────────────────────────────────────────────────

async function setAdminMetadata(userId, email, name) {
  console.log(`\n🔧 Configurando ${email} como SUPER ADMIN...`)
  
  try {
    // Usar Admin API para atualizar metadata
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          role: 'admin',
          name: name,
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
      console.error(`❌ Erro ao configurar ${email}:`, error.message)
      return false
    }

    console.log(`✅ ${email} configurado com sucesso!`)
    console.log(`   - user_metadata.role: admin`)
    console.log(`   - user_metadata.is_super_admin: true`)
    console.log(`   - app_metadata.roles: [admin, super_admin]`)
    
    return true

  } catch (err) {
    console.error(`❌ Exceção ao configurar ${email}:`, err.message)
    return false
  }
}

// ────────────────────────────────────────────────────────────────
// FUNÇÃO: VERIFICAR METADATA ATUAL
// ────────────────────────────────────────────────────────────────

async function verifyAdminMetadata(userId, email) {
  console.log(`\n🔍 Verificando metadata para ${email}...`)
  
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId)

    if (error) {
      console.error(`❌ Erro ao verificar ${email}:`, error.message)
      return
    }

    console.log(`📋 user_metadata:`, JSON.stringify(data.user.user_metadata, null, 2))
    console.log(`📋 app_metadata:`, JSON.stringify(data.user.app_metadata, null, 2))

  } catch (err) {
    console.error(`❌ Exceção ao verificar ${email}:`, err.message)
  }
}

// ────────────────────────────────────────────────────────────────
// FUNÇÃO: VERIFICAR CONFIGURAÇÃO NAS TABELAS
// ────────────────────────────────────────────────────────────────

async function verifyDatabaseConfig() {
  console.log(`\n\n🔍 VERIFICANDO CONFIGURAÇÃO NAS TABELAS...`)
  console.log(`═══════════════════════════════════════════════════════════════`)
  
  try {
    // Buscar admins configurados
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        role,
        full_name,
        credits
      `)
      .in('id', ADMINS.map(a => a.id))

    if (error) {
      console.error(`❌ Erro ao verificar tabelas:`, error.message)
      return
    }

    console.log(`\n📊 ADMINS CONFIGURADOS:`)
    console.table(data)

    // Buscar permissões
    const { data: perms, error: permsError } = await supabase
      .from('admin_permissions')
      .select('*')
      .in('user_id', ADMINS.map(a => a.id))

    if (permsError) {
      console.log(`⚠️  Tabela admin_permissions ainda não existe (será criada via SQL_05)`)
    } else {
      console.log(`\n🔐 PERMISSÕES ADMIN:`)
      console.table(perms)
    }

  } catch (err) {
    console.error(`❌ Exceção ao verificar tabelas:`, err.message)
  }
}

// ────────────────────────────────────────────────────────────────
// MAIN: EXECUTAR CONFIGURAÇÃO
// ────────────────────────────────────────────────────────────────

async function main() {
  console.log(`╔═══════════════════════════════════════════════════════════════╗`)
  console.log(`║  CONFIGURAÇÃO DE SUPER ADMINS - DUA COIN                      ║`)
  console.log(`╚═══════════════════════════════════════════════════════════════╝`)
  
  let successCount = 0

  // Configurar cada admin
  for (const admin of ADMINS) {
    const success = await setAdminMetadata(admin.id, admin.email, admin.name)
    if (success) successCount++
  }

  // Verificar configuração aplicada
  console.log(`\n\n╔═══════════════════════════════════════════════════════════════╗`)
  console.log(`║  VERIFICAÇÃO DE METADATA                                      ║`)
  console.log(`╚═══════════════════════════════════════════════════════════════╝`)

  for (const admin of ADMINS) {
    await verifyAdminMetadata(admin.id, admin.email)
  }

  // Verificar configuração nas tabelas
  await verifyDatabaseConfig()

  // Resultado final
  console.log(`\n\n╔═══════════════════════════════════════════════════════════════╗`)
  console.log(`║  RESULTADO FINAL                                              ║`)
  console.log(`╚═══════════════════════════════════════════════════════════════╝`)
  console.log(`✅ Admins configurados: ${successCount}/${ADMINS.length}`)
  console.log(`\n📋 PRÓXIMOS PASSOS:`)
  console.log(`   1. Executar SQL_05_CONFIGURE_ADMINS.sql para criar tabela admin_permissions`)
  console.log(`   2. Testar login com estraca@2lados.pt`)
  console.log(`   3. Testar acesso ao painel admin`)
  console.log(`   4. Verificar permissões em ambas as plataformas`)
  console.log(`\n`)
}

// ────────────────────────────────────────────────────────────────
// EXECUTAR
// ────────────────────────────────────────────────────────────────

main().catch(console.error)
