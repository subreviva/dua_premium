#!/usr/bin/env node
/**
 * Direct E2E (DB-level): create user with invite code and grant 150 credits
 */
import fs from 'fs'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load env from .env.local (preferred) or fallback to .env
const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env'
dotenv.config({ path: envPath })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
})

async function main() {
  // 1) find active code
  const { data: codeData, error: codeErr } = await admin
    .from('invite_codes')
    .select('id, code')
    .eq('active', true)
    .limit(1)
    .maybeSingle()

  if (codeErr || !codeData) {
    console.error('No active invite code', codeErr)
    process.exit(2)
  }

  const inviteCode = codeData.code
  const email = `qa+${Date.now()}@2lados.pt`
  const password = 'Qa!TestPassword1234'
  const name = 'QA Direct Test'

  console.log('📨 Creating auth user for', email)

  // 2) create auth user (confirmed)
  const { data: auth, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name }
  })

  if (authErr || !auth?.user?.id) {
    console.error('Auth create error', authErr)
    process.exit(3)
  }

  const userId = auth.user.id

  // 3) insert public.users
  await admin.from('users').insert({
    id: userId,
    email,
    name,
    has_access: true,
    email_verified: true,
    registration_completed: true,
    onboarding_completed: false,
    username_set: false,
    avatar_set: false,
    welcome_seen: false,
    session_active: true,
    creditos_servicos: 150,
    saldo_dua: 50,
    account_type: 'normal',
  })

  // 4) ensure duaia_user_balances + add 150 by RPC
  await admin.from('duaia_user_balances').upsert({
    user_id: userId,
    servicos_creditos: 0,
    duacoin_balance: 0,
  }, { onConflict: 'user_id' })

  const { error: addErr } = await admin.rpc('add_servicos_credits', {
    p_user_id: userId,
    p_amount: 150,
    p_transaction_type: 'signup_bonus',
    p_description: 'Créditos iniciais - Teste direto',
    p_admin_email: null,
    p_metadata: { source: 'test-invite-direct', invite_code: inviteCode }
  })

  if (addErr) {
    console.error('Add credits error', addErr)
    process.exit(4)
  }

  // 5) mark code used
  await admin.from('invite_codes').update({
    active: false,
    used_by: userId,
    used_at: new Date().toISOString(),
  }).eq('id', codeData.id)

  // 6) verify balance = 150
  const { data: bal, error: balErr } = await admin
    .from('duaia_user_balances').select('servicos_creditos').eq('user_id', userId).single()

  if (balErr) {
    console.error('Balance error', balErr)
    process.exit(5)
  }

  console.log('🔎 Balance now:', bal?.servicos_creditos)
  if ((bal?.servicos_creditos ?? 0) < 150) {
    console.error('Expected >=150 credits')
    process.exit(6)
  }

  // 7) simulate using a service: deduct 6 credits for musica
  const { data: deduct, error: dedErr } = await admin.rpc('deduct_servicos_credits', {
    p_user_id: userId,
    p_amount: 6,
    p_operation: 'musica',
    p_description: 'Teste de música',
    p_metadata: { test: true }
  })

  if (dedErr) {
    console.error('Deduct error', dedErr)
    process.exit(7)
  }

  console.log('🎵 Deduct result:', deduct)

  const { data: bal2 } = await admin
    .from('duaia_user_balances').select('servicos_creditos').eq('user_id', userId).single()

  console.log('✅ Final balance after deduction:', bal2?.servicos_creditos)
  console.log('🎉 Test OK for', email)
}

main().catch((e) => {
  console.error('Fatal', e)
  process.exit(10)
})
