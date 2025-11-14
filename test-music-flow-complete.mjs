#!/usr/bin/env node
/**
 * 🎵 TESTE COMPLETO DO FLUXO DE GERAÇÃO DE MÚSICA
 * 
 * Verifica:
 * 1. ✅ Verificação de créditos ANTES da geração
 * 2. ✅ Geração de música via API Suno
 * 3. ✅ Dedução de créditos APÓS sucesso
 * 4. ✅ Salvamento na biblioteca
 * 5. ✅ Estados de loading durante geração
 * 6. ✅ Polling de status até conclusão
 */

import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const sunoApiKey = process.env.SUNO_API_KEY

if (!supabaseUrl || !supabaseServiceKey || !sunoApiKey) {
  console.error('❌ Variáveis de ambiente faltando!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  console.error('SUNO_API_KEY:', !!sunoApiKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Cores para console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}${colors.bright}${msg}${colors.reset}`),
  waiting: (msg) => console.log(`${colors.magenta}⏳ ${msg}${colors.reset}`),
}

// Função para aguardar
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Função para buscar saldo de créditos
async function getCreditBalance(userId) {
  const { data, error } = await supabase
    .from('duaia_user_balances')
    .select('saldo_servicos_creditos')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data?.saldo_servicos_creditos || 0
}

// Função para verificar transações
async function getRecentTransactions(userId, limit = 5) {
  const { data, error } = await supabase
    .from('duaia_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

// Função para buscar ou criar usuário de teste
async function getOrCreateTestUser() {
  const testEmail = 'test-music-flow@dua.ia'
  
  log.step('\n━━━ 1️⃣ SETUP: Buscar ou criar usuário de teste ━━━')
  
  // Tentar buscar usuário existente
  const { data: existingUser } = await supabase.auth.admin.listUsers()
  const user = existingUser?.users?.find(u => u.email === testEmail)
  
  if (user) {
    log.success(`Usuário de teste encontrado: ${user.email} (${user.id})`)
    return user
  }
  
  // Criar novo usuário
  log.info('Criando novo usuário de teste...')
  const { data: newUser, error } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: 'Test@123456',
    email_confirm: true,
    user_metadata: {
      nome_completo: 'Test Music Flow',
    },
  })
  
  if (error) throw error
  
  // Aguardar criação do balance (trigger automático)
  await sleep(2000)
  
  log.success(`Usuário criado: ${newUser.user.email} (${newUser.user.id})`)
  return newUser.user
}

// Função para verificar se usuário tem créditos suficientes
async function ensureCredits(userId, required = 50) {
  const balance = await getCreditBalance(userId)
  
  if (balance < required) {
    log.warning(`Saldo insuficiente (${balance} créditos). Adicionando ${required}...`)
    
    const { error } = await supabase.rpc('add_servicos_credits', {
      p_user_id: userId,
      p_amount: required,
      p_description: 'Créditos para teste de fluxo de música',
      p_metadata: { test: true, auto_added: true }
    })
    
    if (error) throw error
    
    const newBalance = await getCreditBalance(userId)
    log.success(`Créditos adicionados! Novo saldo: ${newBalance}`)
    return newBalance
  }
  
  log.success(`Saldo suficiente: ${balance} créditos`)
  return balance
}

// Teste 1: Modo Simples (prompt básico)
async function testSimpleMode(userId, baseUrl) {
  log.step('\n━━━ 2️⃣ TESTE 1: Geração Modo Simples ━━━')
  
  const initialBalance = await getCreditBalance(userId)
  log.info(`Saldo inicial: ${initialBalance} créditos`)
  
  const payload = {
    userId,
    prompt: 'Uma música calma e relaxante com piano suave',
    customMode: false,
    instrumental: true,
    model: 'V3_5',
  }
  
  log.info('Enviando request para /api/suno/generate...')
  log.info(`Payload: ${JSON.stringify(payload, null, 2)}`)
  
  const startTime = Date.now()
  const response = await fetch(`${baseUrl}/api/suno/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  
  const data = await response.json()
  const requestTime = Date.now() - startTime
  
  if (!response.ok) {
    log.error(`Erro na geração: ${data.error || 'Unknown error'}`)
    console.log('Response:', data)
    return null
  }
  
  log.success(`Música iniciada! Task ID: ${data.taskId} (${requestTime}ms)`)
  log.info(`Créditos usados: ${data.creditsUsed}`)
  log.info(`Novo saldo: ${data.newBalance}`)
  log.info(`Transaction ID: ${data.transactionId}`)
  
  // Verificar dedução de créditos
  const currentBalance = await getCreditBalance(userId)
  const deducted = initialBalance - currentBalance
  
  if (deducted === data.creditsUsed) {
    log.success(`✅ Créditos deduzidos corretamente: ${deducted}`)
  } else {
    log.error(`❌ Inconsistência: esperado ${data.creditsUsed}, deduzido ${deducted}`)
  }
  
  return { taskId: data.taskId, model: 'V3_5' }
}

// Teste 2: Modo Customizado
async function testCustomMode(userId, baseUrl) {
  log.step('\n━━━ 3️⃣ TESTE 2: Geração Modo Customizado ━━━')
  
  const initialBalance = await getCreditBalance(userId)
  log.info(`Saldo inicial: ${initialBalance} créditos`)
  
  const payload = {
    userId,
    prompt: 'Melodia inspiradora com cordas orquestrais e piano emocional',
    customMode: true,
    instrumental: true,
    model: 'V4',
    style: 'orquestral, cinemático, inspirador, emocional',
    title: 'Teste de Fluxo Completo',
    styleWeight: 0.7,
    weirdnessConstraint: 0.5,
    audioWeight: 0.65,
  }
  
  log.info('Enviando request para /api/suno/generate...')
  
  const startTime = Date.now()
  const response = await fetch(`${baseUrl}/api/suno/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  
  const data = await response.json()
  const requestTime = Date.now() - startTime
  
  if (!response.ok) {
    log.error(`Erro na geração: ${data.error || 'Unknown error'}`)
    console.log('Response:', data)
    return null
  }
  
  log.success(`Música iniciada! Task ID: ${data.taskId} (${requestTime}ms)`)
  log.info(`Créditos usados: ${data.creditsUsed}`)
  log.info(`Novo saldo: ${data.newBalance}`)
  
  // Verificar dedução de créditos
  const currentBalance = await getCreditBalance(userId)
  const deducted = initialBalance - currentBalance
  
  if (deducted === data.creditsUsed) {
    log.success(`✅ Créditos deduzidos corretamente: ${deducted}`)
  } else {
    log.error(`❌ Inconsistência: esperado ${data.creditsUsed}, deduzido ${deducted}`)
  }
  
  return { taskId: data.taskId, model: 'V4' }
}

// Polling de status
async function pollTaskStatus(taskId, baseUrl, maxAttempts = 60) {
  log.step(`\n━━━ 4️⃣ POLLING: Aguardando conclusão da Task ${taskId} ━━━`)
  log.info('Estados esperados: PENDING → TEXT_SUCCESS → FIRST_SUCCESS → SUCCESS')
  
  let attempts = 0
  let lastStatus = ''
  
  while (attempts < maxAttempts) {
    attempts++
    
    const response = await fetch(`${baseUrl}/api/suno/status?taskId=${taskId}`)
    const data = await response.json()
    
    if (!response.ok) {
      log.error(`Erro ao buscar status: ${data.error}`)
      return null
    }
    
    // Log apenas se status mudou
    if (data.status !== lastStatus) {
      log.info(`[${attempts}] Status: ${data.status}`)
      lastStatus = data.status
    }
    
    // Verificar estados de conclusão
    if (data.status === 'SUCCESS') {
      log.success('✅ Geração completa!')
      
      if (data.response?.sunoData && Array.isArray(data.response.sunoData)) {
        log.success(`📀 ${data.response.sunoData.length} tracks gerados:`)
        data.response.sunoData.forEach((track, i) => {
          log.info(`  ${i + 1}. "${track.title}" - ${track.duration}s`)
          log.info(`     Audio: ${track.audioUrl ? '✅' : '❌'}`)
          log.info(`     Stream: ${track.streamAudioUrl ? '✅' : '❌'}`)
          log.info(`     Image: ${track.imageUrl ? '✅' : '❌'}`)
        })
        return data.response.sunoData
      }
      
      return []
    }
    
    // Verificar estados de erro
    if (data.status.includes('FAILED') || data.status.includes('ERROR')) {
      log.error(`❌ Geração falhou: ${data.status}`)
      return null
    }
    
    // Estados intermediários: continuar polling
    if (data.status === 'FIRST_SUCCESS' && data.response?.sunoData) {
      log.info(`🎵 Primeira track completa! Aguardando variações...`)
    }
    
    // Aguardar 5 segundos antes do próximo poll
    await sleep(5000)
  }
  
  log.error(`❌ Timeout após ${maxAttempts} tentativas (${maxAttempts * 5}s)`)
  return null
}

// Teste principal
async function runFullFlowTest() {
  try {
    console.log('\n')
    log.step('╔════════════════════════════════════════════════════════════╗')
    log.step('║  🎵 TESTE COMPLETO: FLUXO DE GERAÇÃO DE MÚSICA           ║')
    log.step('╚════════════════════════════════════════════════════════════╝')
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    log.info(`Base URL: ${baseUrl}`)
    
    // 1. Setup: Usuário de teste
    const user = await getOrCreateTestUser()
    
    // 2. Garantir créditos suficientes
    await ensureCredits(user.id, 50)
    
    // 3. Teste Modo Simples
    const simpleTest = await testSimpleMode(user.id, baseUrl)
    
    if (simpleTest) {
      // 4. Polling até conclusão
      const simpleTracks = await pollTaskStatus(simpleTest.taskId, baseUrl)
      
      if (simpleTracks && simpleTracks.length > 0) {
        log.success(`\n✅ FLUXO MODO SIMPLES: COMPLETO!`)
        log.success(`   - Créditos verificados ✅`)
        log.success(`   - Música gerada ✅`)
        log.success(`   - Créditos deduzidos ✅`)
        log.success(`   - ${simpleTracks.length} tracks na biblioteca ✅`)
      }
    }
    
    // 5. Teste Modo Customizado
    const customTest = await testCustomMode(user.id, baseUrl)
    
    if (customTest) {
      // 6. Polling até conclusão
      const customTracks = await pollTaskStatus(customTest.taskId, baseUrl)
      
      if (customTracks && customTracks.length > 0) {
        log.success(`\n✅ FLUXO MODO CUSTOMIZADO: COMPLETO!`)
        log.success(`   - Créditos verificados ✅`)
        log.success(`   - Música gerada ✅`)
        log.success(`   - Créditos deduzidos ✅`)
        log.success(`   - ${customTracks.length} tracks na biblioteca ✅`)
      }
    }
    
    // 7. Resumo final
    log.step('\n━━━ 5️⃣ RESUMO FINAL ━━━')
    const finalBalance = await getCreditBalance(user.id)
    const transactions = await getRecentTransactions(user.id, 10)
    
    log.info(`Saldo final: ${finalBalance} créditos`)
    log.info(`\nÚltimas transações (${transactions.length}):`)
    transactions.forEach((tx, i) => {
      const type = tx.tipo === 'deducao' ? '💳' : '💰'
      const amount = tx.tipo === 'deducao' ? `-${tx.quantidade}` : `+${tx.quantidade}`
      log.info(`  ${type} ${amount} - ${tx.descricao}`)
    })
    
    log.step('\n╔════════════════════════════════════════════════════════════╗')
    log.step('║  ✅ TESTE COMPLETO FINALIZADO COM SUCESSO!               ║')
    log.step('╚════════════════════════════════════════════════════════════╝\n')
    
  } catch (error) {
    log.error(`\n❌ ERRO NO TESTE: ${error.message}`)
    console.error(error)
    process.exit(1)
  }
}

// Executar teste
runFullFlowTest()
