#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

const SUPABASE_URL = 'https://vqplhrqvfyiuxmifkmru.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcGxocnF2ZnlpdXhtaWZrbXJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDQxMzg3MCwiZXhwIjoyMDQ1OTg5ODcwfQ.e3iS2F0mZ4kHOIH0KTLP3gJl2e3OuwYObA3Fkg2XQ-8'
const API_URL = 'http://localhost:3000'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const log = {
  success: (msg) => console.log(`\x1b[32m✅ ${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m❌ ${msg}\x1b[0m`),
  info: (msg) => console.log(`\x1b[34mℹ️  ${msg}\x1b[0m`),
  step: (msg) => console.log(`\x1b[36m\x1b[1m\n${msg}\x1b[0m`),
  waiting: (msg) => console.log(`\x1b[35m⏳ ${msg}\x1b[0m`),
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function main() {
  console.log('\n\x1b[44m\x1b[37m\x1b[1m')
  console.log('╔═══════════════════════════════════════════════════════╗')
  console.log('║  🎵 TESTE REAL: MUSIC STUDIO COM API SUNO           ║')
  console.log('╚═══════════════════════════════════════════════════════╝')
  console.log('\x1b[0m\n')

  try {
    // 1. Buscar primeiro usuário
    log.step('━━━ 1️⃣ BUSCANDO USUÁRIO ━━━')
    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users?.users?.[0]
    
    if (!user) {
      log.error('Nenhum usuário encontrado!')
      process.exit(1)
    }
    
    log.success(`Usuário: ${user.email}`)
    log.info(`ID: ${user.id}`)
    
    // 2. Verificar/adicionar créditos
    log.step('━━━ 2️⃣ VERIFICANDO CRÉDITOS ━━━')
    
    let { data: balance } = await supabase
      .from('duaia_user_balances')
      .select('saldo_servicos_creditos')
      .eq('user_id', user.id)
      .single()
    
    const credits = balance?.saldo_servicos_creditos || 0
    log.info(`Saldo atual: ${credits} créditos`)
    
    if (credits < 20) {
      log.waiting('Adicionando 50 créditos...')
      await supabase.rpc('add_servicos_credits', {
        p_user_id: user.id,
        p_amount: 50,
        p_description: 'Teste Music Studio',
        p_metadata: { test: true }
      })
      
      const { data: newBalance } = await supabase
        .from('duaia_user_balances')
        .select('saldo_servicos_creditos')
        .eq('user_id', user.id)
        .single()
      
      log.success(`Novo saldo: ${newBalance.saldo_servicos_creditos} créditos`)
    }
    
    // 3. GERAR MÚSICA
    log.step('━━━ 3️⃣ GERANDO MÚSICA ━━━')
    log.info('Prompt: "Uma música calma e relaxante com piano suave"')
    log.info('Modelo: V3_5 (Suno)')
    
    const startTime = Date.now()
    
    const response = await fetch(`${API_URL}/api/suno/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        prompt: 'Uma música calma e relaxante com piano suave e melodias tranquilas',
        customMode: false,
        instrumental: true,
        model: 'V3_5',
      }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      log.error(`Erro: ${data.error || JSON.stringify(data)}`)
      process.exit(1)
    }
    
    const requestTime = Date.now() - startTime
    log.success(`Música iniciada em ${requestTime}ms`)
    log.info(`Task ID: ${data.taskId}`)
    log.info(`Créditos deduzidos: ${data.creditsUsed}`)
    log.info(`Novo saldo: ${data.newBalance}`)
    
    // 4. POLLING ATÉ CONCLUSÃO
    log.step('━━━ 4️⃣ AGUARDANDO CONCLUSÃO ━━━')
    log.waiting('Polling a cada 5 segundos...\n')
    
    let attempts = 0
    let lastStatus = ''
    const pollStart = Date.now()
    
    while (attempts < 120) { // 10 minutos max
      attempts++
      
      const statusRes = await fetch(`${API_URL}/api/suno/status?taskId=${data.taskId}`)
      const statusData = await statusRes.json()
      
      const elapsed = Math.floor((Date.now() - pollStart) / 1000)
      const elapsedStr = `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`
      
      if (statusData.status !== lastStatus) {
        const progressMap = {
          'PENDING': '▓░░░░░░░░░ 20%',
          'TEXT_SUCCESS': '▓▓▓▓░░░░░░ 40%',
          'FIRST_SUCCESS': '▓▓▓▓▓▓▓░░░ 70%',
          'SUCCESS': '▓▓▓▓▓▓▓▓▓▓ 100%'
        }
        
        console.log(`[${elapsedStr}] ${progressMap[statusData.status] || '░░░░░░░░░░'} ${statusData.status}`)
        lastStatus = statusData.status
      }
      
      // SUCCESS!
      if (statusData.status === 'SUCCESS') {
        log.success('\n🎉 MÚSICA GERADA COM SUCESSO!\n')
        
        if (statusData.response?.sunoData) {
          const tracks = statusData.response.sunoData
          log.success(`📀 ${tracks.length} tracks criados:\n`)
          
          tracks.forEach((track, i) => {
            console.log(`   ${i + 1}. "${track.title}"`)
            console.log(`      Duração: ${track.duration}s`)
            console.log(`      Tags: ${track.tags || 'N/A'}`)
            console.log(`      Audio: ${track.audioUrl ? '\x1b[32m✅\x1b[0m' : '\x1b[31m❌\x1b[0m'}`)
            console.log(`      Image: ${track.imageUrl ? '\x1b[32m✅\x1b[0m' : '\x1b[31m❌\x1b[0m'}`)
            console.log('')
          })
        }
        
        break
      }
      
      // ERRO
      if (statusData.status.includes('FAILED') || statusData.status.includes('ERROR')) {
        log.error(`\nGeração falhou: ${statusData.status}`)
        break
      }
      
      // Aguardar
      await sleep(5000)
    }
    
    // 5. RESUMO FINAL
    log.step('━━━ 5️⃣ RESUMO ━━━')
    
    const { data: finalBalance } = await supabase
      .from('duaia_user_balances')
      .select('saldo_servicos_creditos')
      .eq('user_id', user.id)
      .single()
    
    log.info(`Saldo final: ${finalBalance.saldo_servicos_creditos} créditos`)
    
    const { data: txs } = await supabase
      .from('duaia_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3)
    
    console.log('\nÚltimas transações:')
    txs?.forEach(tx => {
      const icon = tx.tipo === 'deducao' ? '💳' : '💰'
      const amount = tx.tipo === 'deducao' ? `-${tx.quantidade}` : `+${tx.quantidade}`
      console.log(`   ${icon} ${amount} - ${tx.descricao}`)
    })
    
    console.log('\n\x1b[42m\x1b[37m\x1b[1m')
    console.log('╔═══════════════════════════════════════════════════════╗')
    console.log('║        ✅ TESTE COMPLETO FINALIZADO!                 ║')
    console.log('╚═══════════════════════════════════════════════════════╝')
    console.log('\x1b[0m\n')
    
  } catch (error) {
    log.error(`\nERRO: ${error.message}`)
    console.error(error)
    process.exit(1)
  }
}

main()
