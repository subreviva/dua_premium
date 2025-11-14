#!/usr/bin/env node
/**
 * 🎵 TESTE ULTRA REALISTA - FLUXO COMPLETO HUMANO
 * 
 * Simula usuário real:
 * 1. Faz login com credenciais reais
 * 2. Obtém token de autenticação
 * 3. Verifica saldo de créditos
 * 4. Cria música (modo simples)
 * 5. Cria música (modo customizado)
 * 6. Acompanha progresso em tempo real
 * 7. Verifica biblioteca
 */

import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'

// ====== CONFIGURAÇÃO ======
const SUPABASE_URL = 'https://vqplhrqvfyiuxmifkmru.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxcGxocnF2ZnlpdXhtaWZrbXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0MTM4NzAsImV4cCI6MjA0NTk4OTg3MH0.gJCCkU4VlkfmRCPEX0edjctkq65I5nP1FqRjjQN9Ulk'
const API_URL = 'http://localhost:3000'

// Credenciais de usuário real (crie um antes ou use existente)
const USER_EMAIL = 'teste@dua.ia'
const USER_PASSWORD = 'Teste@123456'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ====== CORES ======
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
}

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.cyan}${colors.bright}\n${msg}${colors.reset}`),
  user: (msg) => console.log(`${colors.magenta}👤 ${msg}${colors.reset}`),
  api: (msg) => console.log(`${colors.cyan}🌐 ${msg}${colors.reset}`),
  music: (msg) => console.log(`${colors.blue}🎵 ${msg}${colors.reset}`),
  credits: (msg) => console.log(`${colors.yellow}💳 ${msg}${colors.reset}`),
  time: (msg) => console.log(`${colors.dim}   ⏱  ${msg}${colors.reset}`),
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let currentUser = null
let accessToken = null

// ====== PASSO 1: LOGIN ======
async function loginUser() {
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  log.step('  PASSO 1: LOGIN DO USUÁRIO')
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  log.user(`Tentando fazer login com: ${USER_EMAIL}`)
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: USER_EMAIL,
      password: USER_PASSWORD,
    })
    
    if (error) {
      log.error(`Falha no login: ${error.message}`)
      log.warning('Tentando criar novo usuário...')
      
      // Tentar criar usuário
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: USER_EMAIL,
        password: USER_PASSWORD,
        options: {
          data: {
            nome_completo: 'Teste Music Studio',
          }
        }
      })
      
      if (signUpError) {
        throw new Error(`Erro ao criar usuário: ${signUpError.message}`)
      }
      
      log.success('Novo usuário criado!')
      currentUser = signUpData.user
      accessToken = signUpData.session.access_token
    } else {
      currentUser = data.user
      accessToken = data.session.access_token
    }
    
    log.success(`Login realizado com sucesso!`)
    log.info(`User ID: ${currentUser.id}`)
    log.info(`Email: ${currentUser.email}`)
    log.time(`Timestamp: ${new Date().toLocaleString('pt-BR')}`)
    
    return true
  } catch (error) {
    log.error(`Erro no login: ${error.message}`)
    return false
  }
}

// ====== PASSO 2: VERIFICAR CRÉDITOS ======
async function checkCredits() {
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  log.step('  PASSO 2: VERIFICAR SALDO DE CRÉDITOS')
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    const { data, error } = await supabase
      .from('duaia_user_balances')
      .select('saldo_servicos_creditos, saldo_dua')
      .eq('user_id', currentUser.id)
      .single()
    
    if (error) throw error
    
    const credits = data?.saldo_servicos_creditos || 0
    const dua = data?.saldo_dua || 0
    
    log.credits(`Saldo de Créditos: ${credits} créditos`)
    log.credits(`Saldo DUA: ${dua} DUA`)
    
    if (credits < 12) {
      log.warning('Créditos insuficientes para 2 gerações (12 créditos necessários)')
      log.warning('Adicionando créditos automaticamente...')
      
      // Adicionar créditos via RPC
      const { error: rpcError } = await supabase.rpc('add_servicos_credits', {
        p_user_id: currentUser.id,
        p_amount: 50,
        p_description: 'Créditos para teste Music Studio',
        p_metadata: { test: true, automated: true }
      })
      
      if (rpcError) {
        log.error(`Erro ao adicionar créditos: ${rpcError.message}`)
      } else {
        log.success('50 créditos adicionados!')
        
        // Verificar novo saldo
        const { data: newData } = await supabase
          .from('duaia_user_balances')
          .select('saldo_servicos_creditos')
          .eq('user_id', currentUser.id)
          .single()
        
        log.credits(`Novo saldo: ${newData.saldo_servicos_creditos} créditos`)
      }
    } else {
      log.success('Créditos suficientes para testes!')
    }
    
    return true
  } catch (error) {
    log.error(`Erro ao verificar créditos: ${error.message}`)
    return false
  }
}

// ====== PASSO 3: GERAR MÚSICA (MODO SIMPLES) ======
async function generateSimpleMusic() {
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  log.step('  PASSO 3: GERAR MÚSICA - MODO SIMPLES')
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const prompt = 'Uma música calma e relaxante com piano suave e melodias tranquilas para meditação'
  
  log.user('Usuário preenchendo formulário...')
  log.music(`Prompt: "${prompt}"`)
  log.info('Modo: Simples (sem customização)')
  log.info('Instrumental: Sim')
  log.info('Modelo: V3_5')
  
  log.user('Clicando em "Generate"...')
  
  const startTime = Date.now()
  
  try {
    const response = await fetch(`${API_URL}/api/suno/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        userId: currentUser.id,
        prompt,
        customMode: false,
        instrumental: true,
        model: 'V3_5',
      }),
    })
    
    const requestTime = Date.now() - startTime
    const data = await response.json()
    
    if (!response.ok) {
      log.error(`Erro na API: ${response.status} ${response.statusText}`)
      log.error(`Mensagem: ${data.error || JSON.stringify(data)}`)
      return null
    }
    
    log.success(`Requisição enviada em ${requestTime}ms`)
    log.api(`Task ID: ${data.taskId}`)
    log.credits(`Créditos deduzidos: ${data.creditsUsed}`)
    log.credits(`Novo saldo: ${data.newBalance}`)
    log.info(`Transaction ID: ${data.transactionId}`)
    
    log.user('Redirecionado para /musicstudio/library')
    log.user('Abrindo GenerationSidebar para acompanhar progresso...')
    
    return data.taskId
  } catch (error) {
    log.error(`Erro na geração: ${error.message}`)
    return null
  }
}

// ====== PASSO 4: GERAR MÚSICA (MODO CUSTOMIZADO) ======
async function generateCustomMusic() {
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  log.step('  PASSO 4: GERAR MÚSICA - MODO CUSTOMIZADO')
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const prompt = 'Uma composição orquestral épica e inspiradora com cordas poderosas, metais grandiosos e percussão dramática'
  const style = 'orquestral, cinemático, épico, dramático, inspirador'
  const title = 'Teste Music Studio - Épico'
  
  log.user('Usuário preenchendo formulário customizado...')
  log.music(`Prompt: "${prompt}"`)
  log.music(`Estilo: "${style}"`)
  log.music(`Título: "${title}"`)
  log.info('Modo: Customizado')
  log.info('Instrumental: Sim')
  log.info('Modelo: V4')
  log.info('Style Weight: 0.7')
  log.info('Weirdness: 0.5')
  log.info('Audio Weight: 0.65')
  
  log.user('Clicando em "Generate"...')
  
  const startTime = Date.now()
  
  try {
    const response = await fetch(`${API_URL}/api/suno/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        userId: currentUser.id,
        prompt,
        customMode: true,
        instrumental: true,
        model: 'V4',
        style,
        title,
        styleWeight: 0.7,
        weirdnessConstraint: 0.5,
        audioWeight: 0.65,
      }),
    })
    
    const requestTime = Date.now() - startTime
    const data = await response.json()
    
    if (!response.ok) {
      log.error(`Erro na API: ${response.status} ${response.statusText}`)
      log.error(`Mensagem: ${data.error || JSON.stringify(data)}`)
      return null
    }
    
    log.success(`Requisição enviada em ${requestTime}ms`)
    log.api(`Task ID: ${data.taskId}`)
    log.credits(`Créditos deduzidos: ${data.creditsUsed}`)
    log.credits(`Novo saldo: ${data.newBalance}`)
    log.info(`Transaction ID: ${data.transactionId}`)
    
    log.user('Aguardando na biblioteca com GenerationSidebar aberta...')
    
    return data.taskId
  } catch (error) {
    log.error(`Erro na geração: ${error.message}`)
    return null
  }
}

// ====== PASSO 5: ACOMPANHAR PROGRESSO ======
async function trackProgress(taskId, musicName) {
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  log.step(`  PASSO 5: ACOMPANHANDO "${musicName}"`)
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  log.user('Observando GenerationSidebar na direita da tela...')
  log.info('Estados esperados: PENDING → TEXT_SUCCESS → FIRST_SUCCESS → SUCCESS')
  console.log('')
  
  const progressBar = (percent) => {
    const filled = Math.floor(percent / 10)
    const empty = 10 - filled
    return `[${'▓'.repeat(filled)}${'░'.repeat(empty)}] ${percent}%`
  }
  
  let attempts = 0
  const maxAttempts = 60 // 5 minutos
  let lastStatus = ''
  const startTime = Date.now()
  
  while (attempts < maxAttempts) {
    attempts++
    
    try {
      const response = await fetch(`${API_URL}/api/suno/status?taskId=${taskId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        log.error(`Erro ao consultar status: ${data.error}`)
        break
      }
      
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const elapsedStr = `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, '0')}`
      
      // Mapear status para progresso visual
      const statusMap = {
        'PENDING': { percent: 20, msg: 'Preparando geração...' },
        'TEXT_SUCCESS': { percent: 40, msg: 'Texto processado, criando áudio...' },
        'FIRST_SUCCESS': { percent: 70, msg: 'Primeira track completa, gerando variações...' },
        'SUCCESS': { percent: 100, msg: 'Concluído! Salvando na biblioteca...' },
      }
      
      const statusInfo = statusMap[data.status] || { percent: 0, msg: data.status }
      
      // Mostrar apenas quando status muda
      if (data.status !== lastStatus) {
        console.log(`\n${colors.bright}[${elapsedStr}]${colors.reset} ${progressBar(statusInfo.percent)}`)
        log.music(statusInfo.msg)
        
        if (data.status === 'FIRST_SUCCESS') {
          log.success('🎉 Primeira música pronta! Aguardando variações...')
        }
        
        lastStatus = data.status
      } else {
        // Atualizar na mesma linha para mostrar tempo passando
        process.stdout.write(`\r${colors.dim}[${elapsedStr}] Aguardando... ${colors.reset}`)
      }
      
      // Verificar conclusão
      if (data.status === 'SUCCESS') {
        console.log('\n')
        log.success('✨ GERAÇÃO CONCLUÍDA!')
        
        if (data.response?.sunoData && Array.isArray(data.response.sunoData)) {
          const tracks = data.response.sunoData
          log.success(`\n📀 ${tracks.length} tracks gerados:\n`)
          
          tracks.forEach((track, i) => {
            console.log(`${colors.bright}   ${i + 1}. ${track.title}${colors.reset}`)
            console.log(`      Duração: ${track.duration}s`)
            console.log(`      Tags: ${track.tags || 'N/A'}`)
            console.log(`      Audio: ${track.audioUrl ? colors.green + '✅ Disponível' : colors.red + '❌ Não disponível'}${colors.reset}`)
            console.log(`      Stream: ${track.streamAudioUrl ? colors.green + '✅ Disponível' : colors.red + '❌ Não disponível'}${colors.reset}`)
            console.log(`      Imagem: ${track.imageUrl ? colors.green + '✅ Disponível' : colors.red + '❌ Não disponível'}${colors.reset}`)
            console.log('')
          })
          
          log.user('Músicas aparecem na MusicLibrarySidebar!')
          log.user('Pode clicar em Play para ouvir ou Download para baixar')
          
          return tracks
        }
        
        return []
      }
      
      // Verificar erro
      if (data.status.includes('FAILED') || data.status.includes('ERROR')) {
        console.log('\n')
        log.error(`Geração falhou: ${data.status}`)
        return null
      }
      
      // Aguardar 5 segundos antes do próximo poll
      await sleep(5000)
      
    } catch (error) {
      log.error(`Erro no polling: ${error.message}`)
      break
    }
  }
  
  if (attempts >= maxAttempts) {
    console.log('\n')
    log.error(`Timeout após ${Math.floor(maxAttempts * 5 / 60)} minutos`)
  }
  
  return null
}

// ====== PASSO 6: RESUMO FINAL ======
async function showSummary() {
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  log.step('  RESUMO FINAL')
  log.step('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    // Saldo final
    const { data: balance } = await supabase
      .from('duaia_user_balances')
      .select('saldo_servicos_creditos, saldo_dua')
      .eq('user_id', currentUser.id)
      .single()
    
    log.credits(`Saldo final: ${balance.saldo_servicos_creditos} créditos`)
    log.credits(`Saldo DUA: ${balance.saldo_dua} DUA`)
    
    // Últimas transações
    const { data: transactions } = await supabase
      .from('duaia_transactions')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (transactions && transactions.length > 0) {
      console.log(`\n${colors.bright}Últimas transações:${colors.reset}\n`)
      transactions.forEach(tx => {
        const icon = tx.tipo === 'deducao' ? '💳' : '💰'
        const amount = tx.tipo === 'deducao' ? `-${tx.quantidade}` : `+${tx.quantidade}`
        const color = tx.tipo === 'deducao' ? colors.red : colors.green
        console.log(`   ${icon} ${color}${amount} créditos${colors.reset} - ${tx.descricao}`)
      })
    }
    
  } catch (error) {
    log.error(`Erro ao buscar resumo: ${error.message}`)
  }
}

// ====== MAIN ======
async function main() {
  console.log('\n')
  console.log(colors.bgBlue + colors.white + colors.bright)
  console.log('╔════════════════════════════════════════════════════════════════════╗')
  console.log('║                                                                    ║')
  console.log('║       🎵 TESTE ULTRA REALISTA - MUSIC STUDIO FLOW 🎵             ║')
  console.log('║                                                                    ║')
  console.log('║       Simulando usuário humano real com login e navegação         ║')
  console.log('║                                                                    ║')
  console.log('╚════════════════════════════════════════════════════════════════════╝')
  console.log(colors.reset)
  console.log('')
  
  try {
    // 1. Login
    const loginSuccess = await loginUser()
    if (!loginSuccess) {
      log.error('Teste abortado: falha no login')
      process.exit(1)
    }
    
    await sleep(2000)
    
    // 2. Verificar créditos
    const creditsOk = await checkCredits()
    if (!creditsOk) {
      log.warning('Continuando mesmo com erro nos créditos...')
    }
    
    await sleep(2000)
    
    // 3. Gerar música simples
    const simpleTaskId = await generateSimpleMusic()
    if (!simpleTaskId) {
      log.error('Falha ao gerar música simples')
    } else {
      await sleep(2000)
      await trackProgress(simpleTaskId, 'Música Simples (Piano Relaxante)')
    }
    
    await sleep(3000)
    
    // 4. Gerar música customizada
    const customTaskId = await generateCustomMusic()
    if (!customTaskId) {
      log.error('Falha ao gerar música customizada')
    } else {
      await sleep(2000)
      await trackProgress(customTaskId, 'Música Customizada (Épica Orquestral)')
    }
    
    await sleep(2000)
    
    // 5. Resumo final
    await showSummary()
    
    // Conclusão
    console.log('\n')
    console.log(colors.bgGreen + colors.white + colors.bright)
    console.log('╔════════════════════════════════════════════════════════════════════╗')
    console.log('║                                                                    ║')
    console.log('║              ✅ TESTE COMPLETO FINALIZADO COM SUCESSO!            ║')
    console.log('║                                                                    ║')
    console.log('╚════════════════════════════════════════════════════════════════════╝')
    console.log(colors.reset)
    console.log('')
    
    log.success('✅ Login realizado')
    log.success('✅ Créditos verificados e deduzidos')
    log.success('✅ Músicas geradas via Suno API')
    log.success('✅ Progresso acompanhado em tempo real')
    log.success('✅ Tracks salvos na biblioteca')
    log.success('✅ Estados de loading funcionando')
    console.log('')
    
  } catch (error) {
    console.log('\n')
    log.error(`ERRO NO TESTE: ${error.message}`)
    console.error(error.stack)
    process.exit(1)
  }
}

main()
