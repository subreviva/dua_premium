#!/usr/bin/env node
/**
 * End-to-end test: register with invite code (production), verify 150 credits
 */
import 'dotenv/config'
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://v0-remix-of-untitled-chat-ktgpa943m.vercel.app'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase env vars')
  process.exit(1)
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY)

async function main() {
  // 1) pick an active invite code
  const { data: codeData, error: codeErr } = await admin
    .from('invite_codes')
    .select('code')
    .eq('active', true)
    .limit(1)
    .maybeSingle()

  if (codeErr || !codeData?.code) {
    console.error('No active invite code found', codeErr)
    process.exit(2)
  }

  const inviteCode = codeData.code
  const email = `qa+${Date.now()}@2lados.pt`
  const payload = {
    inviteCode,
    name: 'QA Live Test',
    email,
    password: 'Qa!TestPassword1234',
    acceptedTerms: true
  }

  console.log('▶️ Registering with invite code', inviteCode, 'email', email)

  // 2) call production API
  const res = await fetch(`${APP_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    console.error('Register failed:', res.status, body)
    process.exit(3)
  }

  console.log('✅ Register ok:', body.user?.id)
  const userId = body.user?.id
  if (!userId) {
    console.error('Missing userId in response')
    process.exit(4)
  }

  // 3) verify duaia_user_balances
  const { data: bal, error: balErr } = await admin
    .from('duaia_user_balances')
    .select('servicos_creditos')
    .eq('user_id', userId)
    .single()

  if (balErr) {
    console.error('Balance query error:', balErr)
    process.exit(5)
  }

  console.log('🔎 Balance:', bal?.servicos_creditos)
  if ((bal?.servicos_creditos ?? 0) < 150) {
    console.error('Expected 150 credits, got', bal?.servicos_creditos)
    process.exit(6)
  }

  console.log('🎉 E2E OK: 150 credits available for', email)
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(10)
})
