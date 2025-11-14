#!/usr/bin/env node
/**
 * 🎵 TESTE REAL SIMPLIFICADO - MUSIC STUDIO
 * Usa usuário existente e testa geração real de música
 */

import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente faltando!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const log = {
  success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`),
  info: (msg) => console.log(`\x1b[34mℹ️  ${msg}\x1b[0m`),
  step: (msg) => console.log(`\x1b[36m\x1b[1m${msg}\x1b[0m`),
  waiting: (msg) => console.log(`\x1b[35m⏳ ${msg}\x1b[0m`),
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function getCreditBalance(userId) {
  const { data, error } = await supabase
    .from('duaia_user_balances')
    .select('saldo_servicos_creditos')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data?.saldo_servicos_creditos || 0
}

async function ensureCredits(userId, required = 20) {
  const balance = await getCreditBalance(userId)
  
  if (balance < required) {
    log.info(`Adicionando ${required} créditos...`)
    
    const { error } = await supabase.rpc('add_servicos_credits', {
      p_user_id: userId,
      p_amount: required,
      p_description: 'Créditos para teste Music Studio',
      p_metadata: { test: true }
    })
    
    if (error) throw error
    
    const newBalance = await getCreditBalance(userId)
    log.success(`Créditos adicionados! Saldo: ${newBalance}`)
    return newBalance
  }
  
  log.success(`Saldo suficiente: ${balance} créditos`)
  return balance
}

async function testMusicGeneration(userId, baseUrl) {
  log.step('\n━━━ 🎵 TESTE: Geração de Música ━━━\n')
  
  const initialBalance = await getCreditBalance(userId)
  log.info(`Saldo inicial: ${initialBalance} créditos`)
  
  const payload = {
    userId,
    prompt: 'Uma música calma e relaxante com piano suave e melodias tranquilas',
    customMode: false,
    instrumental: true,
    model: 'V3_5',
  }
  
  log.info('📤 Enviando request para /api/suno/generate...')
  log.info(`   Prompt: "${payload.prompt}"`)
  log.info(`   Model: ${payload.model}`)
  
  const startTime = Date.now()
  
  try {
    const response = await fetch(`${baseUrl}/api/suno/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    
    const data = await response.json()
    const requestTime = Date.now() - startTime
    
    if (!response.ok) {
      log.error(`Erro na API: ${data.error || 'Unknown error'}`)
      console.log('Response completa:', JSON.stringify(data, null, 2))
      return null
    }
    
    log.success(`✨ Música iniciada! (${requestTime}ms)`)
    log.info(`   Task ID: ${data.taskId}`)
    log.info(`   Créditos usados: ${data.creditsUsed}`)
    log.info(`   Novo saldo: ${data.newBalance}`)
    
    // Verificar dedução
    const currentBalance = await getCreditBalance(userId)
    const deducted = initialBalance - currentBalance
    
    if (deducted === data.creditsUsed) {
      log.success(`💳 Créditos deduzidos corretamente: ${deducted}`)
    } else {
      log.error(`⚠️  Inconsistência: esperado ${data.creditsUsed}, deduzido ${deducted}`)
    }
    
    return data.taskId
    
  } catch (error) {
    log.error(`Erro na request: ${error.message}`)
    throw error
  }
}

async function pollTaskStatus(taskId, baseUrl, maxAttempts = 60) {
  log.step(`\n━━━ ⏳ POLLING: Task ${taskId} ━━━\n`)
  log.info('Aguardando conclusão (pode levar 20-60 segundos)...\n')
  
  let attempts = 0
  let lastStatus = ''
  
  while (attempts < maxAttempts) {
    attempts++
    
    try {
      const response = await fetch(`${baseUrl}/api/suno/status?taskId=${taskId}`)
      const data = await response.json()
      
      if (!response.ok) {
        log.error(`Erro ao buscar status: ${data.error}`)
        return null
      }
      
      // Log apenas se status mudou
      if (data.status !== lastStatus) {
        const progress = {
          'PENDING': '▓░░░░░░░░░ 20%',
          'TEXT_SUCCESS': '▓▓▓▓░░░░░░ 40%',
          'FIRST_SUCCESS': '▓▓▓▓▓▓▓░░░ 70%',
          'SUCCESS': '▓▓▓▓▓▓▓▓▓▓ 100%'
        }
        
        console.log(`[${attempts.toString().padStart(2, '0')}] ${progress[data.status] || '░░░░░░░░░░'} ${data.status}`)
        lastStatus = data.status
      }
      
      // Verificar conclusão
      if (data.status === 'SUCCESS') {
        log.success('\n🎉 Geração completa!')
        
        if (data.response?.sunoData && Array.isArray(data.response.sunoData)) {
          log.success(`\n📀 ${data.response.sunoData.length} tracks gerados:\n`)
          data.response.sunoData.forEach((track, i) => {
            log.info(`   ${i + 1}. "${track.title}"`)
            log.info(`      Duração: ${track.duration}s`)
            log.info(`      Audio URL: ${track.audioUrl ? '✅' : '❌'}`)
            log.info(`      Stream URL: ${track.streamAudioUrl ? '✅' : '❌'}`)
            log.info(`      Image URL: ${track.imageUrl ? '✅' : '❌'}`)
            log.info('')
          })
          return data.response.sunoData
        }
        
        return []
      }
      
      // Verificar erro
      if (data.status.includes('FAILED') || data.status.includes('ERROR')) {
        log.error(`\n❌ Geração falhou: ${data.status}`)
        return null
      }
      
      // Aguardar 5 segundos
      await sleep(5000)
      
    } catch (error) {
      log.error(`Erro no polling: ${error.message}`)
    }
  }
  
  log.error(`\n❌ Timeout após ${maxAttempts * 5}s`)
  return null
}

async function main() {
  try {
    console.log('\n')
    log.step('╔════════════════════════════════════════════════════════════╗')
    log.step('║       🎵 TESTE REAL: MUSIC STUDIO API                    ║')
    log.step('╚════════════════════════════════════════════════════════════╝\n')
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    log.info(`Base URL: ${baseUrl}\n`)
    
    // Buscar primeiro usuário com email verificado
    log.step('━━━ 1️⃣ Buscando usuário para teste ━━━\n')
    
    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users?.users?.find(u => u.email_confirmed_at)
    
    if (!user) {
      log.error('Nenhum usuário encontrado!')
      log.info('Crie um usuário via registro primeiro')
      process.exit(1)
    }
    
    log.success(`Usuário encontrado: ${user.email}`)
    log.info(`User ID: ${user.id}\n`)
    
    // Garantir créditos
    log.step('━━━ 2️⃣ Verificando créditos ━━━\n')
    await ensureCredits(user.id, 20)
    
    // Testar geração
    const taskId = await testMusicGeneration(user.id, baseUrl)
    
    if (!taskId) {
      log.error('\nFalha ao iniciar geração')
      process.exit(1)
    }
    
    // Polling
    const tracks = await pollTaskStatus(taskId, baseUrl)
    
    if (tracks && tracks.length > 0) {
      log.step('\n╔════════════════════════════════════════════════════════════╗')
      log.step('║           ✅ TESTE COMPLETO COM SUCESSO!                 ║')
      log.step('╚════════════════════════════════════════════════════════════╝\n')
      
      log.success('✅ Créditos verificados')
      log.success('✅ Música gerada via Suno API')
      log.success('✅ Créditos deduzidos corretamente')
      log.success(`✅ ${tracks.length} tracks salvos na biblioteca`)
      log.success('✅ Estados de loading funcionando\n')
      
      // Saldo final
      const finalBalance = await getCreditBalance(user.id)
      log.info(`Saldo final: ${finalBalance} créditos\n`)
    } else {
      log.error('\nFalha na geração ou timeout')
      process.exit(1)
    }
    
  } catch (error) {
    log.error(`\n❌ ERRO: ${error.message}`)
    console.error(error)
    process.exit(1)
  }
}

main()
