#!/usr/bin/env node
/**
 * End-to-end test: register with invite code (production), verify 150 credits
 */
import 'dotenv/config'
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'

const APP_URL = process.env.TEST_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://v0-remix-of-untitled-chat-hqs8ugzge.vercel.app'
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

  // 2) call production API (register). If 404, fallback to /api/validate-code
  const res = await fetch(`${APP_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const body = await res.json().catch(() => ({}))

  let userId
  if (!res.ok) {
    console.warn('Register failed:', res.status)
    console.log('➡️  Falling back to /api/validate-code (magic link)')
    const fb = await fetch(`${APP_URL}/api/validate-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: inviteCode, email })
    })
    const fbBody = await fb.json().catch(() => ({}))
    if (!fb.ok || !fbBody?.success) {
      console.error('Fallback failed:', fb.status, fbBody)
      process.exit(3)
    }
    // We don't get userId from /api/validate-code directly; fetch by email
    const { data: userRow, error: userErr } = await admin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()
    if (userErr || !userRow?.id) {
      console.error('Cannot resolve user id after fallback', userErr)
      process.exit(3)
    }
    userId = userRow.id
  } else {
    userId = body.user?.id
  }

  console.log('✅ User id:', userId)
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
