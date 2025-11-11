#!/usr/bin/env node
/**
 * Verify user credits after registration
 */
import fs from 'fs'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env'
dotenv.config({ path: envPath })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing Supabase env vars')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

const userEmail = process.argv[2]

if (!userEmail) {
  console.error('❌ Usage: node verify-user-credits.mjs <email>')
  process.exit(1)
}

async function main() {
  console.log(`🔍 Verificando créditos para: ${userEmail}\n`)

  // Find user by email
  const { data: user, error: userErr } = await admin
    .from('users')
    .select('*')
    .eq('email', userEmail)
    .single()

  if (userErr || !user) {
    console.error(`❌ Usuário não encontrado: ${userEmail}`)
    process.exit(1)
  }

  console.log(`✅ Usuário encontrado: ${user.name || user.email}`)
  console.log(`   ID: ${user.id}`)
  console.log(`   Email verificado: ${user.email_verified ? '✅' : '❌'}`)
  console.log(`   Registo completo: ${user.registration_completed ? '✅' : '❌'}`)
  console.log(`   Tem acesso: ${user.has_access ? '✅' : '❌'}\n`)

  // Check legacy credits (public.users)
  console.log('💰 CRÉDITOS (tabela users - legacy):')
  console.log(`   Créditos de Serviços: ${user.creditos_servicos ?? 0}`)
  console.log(`   Saldo DUA: ${user.saldo_dua ?? 0}`)
  console.log(`   Tipo de conta: ${user.account_type ?? 'normal'}\n`)

  // Check new credits system (duaia_user_balances)
  const { data: balance, error: balErr } = await admin
    .from('duaia_user_balances')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (balErr || !balance) {
    console.log('⚠️  Sem registo em duaia_user_balances')
  } else {
    console.log('💳 CRÉDITOS (tabela duaia_user_balances - atual):')
    console.log(`   Créditos de Serviços: ${balance.servicos_creditos ?? 0}`)
    console.log(`   DuaCoin Balance: ${balance.duacoin_balance ?? 0}`)
    console.log(`   Última atualização: ${balance.updated_at}\n`)
  }

  // Check transactions
  const { data: txs, error: txErr } = await admin
    .from('duaia_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!txErr && txs && txs.length > 0) {
    console.log(`📜 TRANSAÇÕES (últimas ${txs.length}):`)
    txs.forEach(tx => {
      const sign = tx.amount >= 0 ? '+' : ''
      console.log(`   ${sign}${tx.amount} | ${tx.transaction_type} | ${tx.description || 'sem descrição'}`)
    })
    console.log()
  } else {
    console.log('📜 Sem transações registadas\n')
  }

  // Validation
  console.log('═══════════════════════════════════════════════════════════')
  console.log('   VALIDAÇÃO DE BENEFÍCIOS')
  console.log('═══════════════════════════════════════════════════════════\n')

  const servicosCredits = balance?.servicos_creditos ?? user.creditos_servicos ?? 0
  const duaBalance = balance?.duacoin_balance ?? user.saldo_dua ?? 0

  const checks = [
    { name: 'Créditos de Serviços >= 150', pass: servicosCredits >= 150, value: servicosCredits },
    { name: 'Saldo DUA >= 50', pass: duaBalance >= 50, value: duaBalance },
    { name: 'Email verificado', pass: user.email_verified },
    { name: 'Registo completo', pass: user.registration_completed },
    { name: 'Tem acesso', pass: user.has_access },
  ]

  checks.forEach(check => {
    const icon = check.pass ? '✅' : '❌'
    const val = check.value !== undefined ? ` (valor: ${check.value})` : ''
    console.log(`${icon} ${check.name}${val}`)
  })

  const allPassed = checks.every(c => c.pass)
  console.log()
  if (allPassed) {
    console.log('🎉 TODOS OS BENEFÍCIOS ATRIBUÍDOS CORRETAMENTE!\n')
  } else {
    console.log('⚠️  ALGUNS BENEFÍCIOS EM FALTA - VERIFICAR REGISTO\n')
  }
}

main().catch((e) => {
  console.error('💥 Erro:', e)
  process.exit(10)
})
