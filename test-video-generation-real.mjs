#!/usr/bin/env node

/**
 * VIDEO STUDIO - TESTE REAL DE GERACAO DE VIDEO
 * 
 * Gera um vídeo REAL usando a API Runway e aguarda até estar completo:
 * 1. Cria task de video-to-video
 * 2. Faz polling do status a cada 10 segundos
 * 3. Aguarda até status = SUCCEEDED
 * 4. Exibe URL do vídeo final
 * 5. Verifica todo o processo (pode levar 2-5 minutos)
 */

const RUNWAY_API_KEY = 'key_1d0820d75b451974c91be5ffefe9850190cef3be243422b2363aee9b145d6a0aae3d9b00a4af08d9e94fcb191384d5fdecd7a41fd9b31a5225b1fa382fbe7edb'
const RUNWAY_API_BASE = 'https://api.dev.runwayml.com/v1'
const RUNWAY_API_VERSION = '2024-11-06'

// Modelos suportados conforme documentação:
// - gen4_turbo (25 créditos/5s, 50 créditos/10s) - Recomendado
// - gen4_aleph (60 créditos/5s, 120 créditos/10s) - Premium
// - gen3a_turbo (20 créditos/5s) - Econômico
const TEST_MODEL = 'gen4_turbo' // Mudando para gen4_turbo conforme documentação

// Video de exemplo MENOR (para evitar erro de 32MB)
// Vamos usar um video base64 minimo para teste
const TEST_VIDEO_BASE64 = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAACKBtZGF0AAAC'

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

function log(message, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString('pt-BR')
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`)
}

function header(title) {
  console.log('\n' + colors.cyan + '='.repeat(70) + colors.reset)
  console.log(colors.bright + title.toUpperCase() + colors.reset)
  console.log(colors.cyan + '='.repeat(70) + colors.reset)
}

function section(title) {
  console.log(`\n${colors.blue}${'─'.repeat(70)}${colors.reset}`)
  console.log(`${colors.bright}${title}${colors.reset}`)
  console.log(`${colors.blue}${'─'.repeat(70)}${colors.reset}`)
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function generateVideo() {
  header('RUNWAY API - GERACAO REAL DE VIDEO')
  
  const startTime = Date.now()
  let taskId = null
  let attempts = 0
  const MAX_ATTEMPTS = 60 // 10 minutos (60 * 10s)
  
  try {
    // ============================================================
    // PASSO 1: Criar task de image-to-video (mais simples)
    // ============================================================
    section('1. CRIANDO TASK DE IMAGE-TO-VIDEO')
    
    log('Configuracao:', 'cyan')
    log('  - Imagem: https://picsum.photos/1280/720 (placeholder)', 'cyan')
    log(`  - Modelo: ${TEST_MODEL}`, 'cyan')
    log('  - Prompt: "A serene lake with mountains in the background at sunset"', 'cyan')
    log('  - Aspect Ratio: 1280:720 (16:9)', 'cyan')
    log('  - Duracao: 5 segundos', 'cyan')
    log('', 'reset')
    
    log('Enviando requisicao para Runway API...', 'yellow')
    
    const createResponse = await fetch(`${RUNWAY_API_BASE}/image_to_video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'X-Runway-Version': RUNWAY_API_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: TEST_MODEL,
        promptImage: 'https://picsum.photos/1280/720',
        promptText: 'A serene lake with mountains in the background at sunset',
        ratio: '1280:720',
        duration: 5
      })
    })
    
    if (!createResponse.ok) {
      const errorData = await createResponse.json().catch(() => ({}))
      throw new Error(`HTTP ${createResponse.status}: ${errorData.message || JSON.stringify(errorData)}`)
    }
    
    const taskData = await createResponse.json()
    taskId = taskData.id
    
    log(`Task criada com sucesso!`, 'green')
    log(`Task ID: ${taskId}`, 'bright')
    log(`Status inicial: ${taskData.status}`, 'cyan')
    log('', 'reset')
    
    // ============================================================
    // PASSO 2: Polling do status ate completar
    // ============================================================
    section('2. AGUARDANDO GERACAO DO VIDEO')
    
    log('Iniciando polling (verifica a cada 10 segundos)...', 'yellow')
    log('Maximo de tentativas: 60 (10 minutos)', 'yellow')
    log('', 'reset')
    
    let currentStatus = taskData.status
    let progress = taskData.progress || 0
    let videoUrl = null
    
    while (currentStatus !== 'SUCCEEDED' && currentStatus !== 'FAILED' && attempts < MAX_ATTEMPTS) {
      attempts++
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      
      // Aguardar 10 segundos entre requisicoes
      await sleep(10000)
      
      // Consultar status
      const statusResponse = await fetch(`${RUNWAY_API_BASE}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${RUNWAY_API_KEY}`,
          'X-Runway-Version': RUNWAY_API_VERSION
        }
      })
      
      if (!statusResponse.ok) {
        log(`Erro ao consultar status: HTTP ${statusResponse.status}`, 'red')
        continue
      }
      
      const statusData = await statusResponse.json()
      currentStatus = statusData.status
      progress = statusData.progress || progress
      
      // Exibir progresso
      const progressBar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5))
      log(
        `[${attempts}/${MAX_ATTEMPTS}] ${progressBar} ${progress}% | Status: ${currentStatus} | Tempo: ${formatDuration(elapsed)}`,
        currentStatus === 'RUNNING' ? 'cyan' : 'yellow'
      )
      
      // Verificar se tem output
      if (statusData.output && statusData.output.length > 0) {
        videoUrl = statusData.output[0]
        log(`Video URL detectada: ${videoUrl.substring(0, 50)}...`, 'green')
      }
      
      // Se completou
      if (currentStatus === 'SUCCEEDED') {
        log('', 'reset')
        log('VIDEO GERADO COM SUCESSO!', 'green')
        break
      }
      
      // Se falhou
      if (currentStatus === 'FAILED') {
        log('', 'reset')
        log('GERACAO FALHOU!', 'red')
        if (statusData.failure) {
          log(`Motivo: ${JSON.stringify(statusData.failure)}`, 'red')
        }
        break
      }
    }
    
    // Timeout
    if (attempts >= MAX_ATTEMPTS && currentStatus !== 'SUCCEEDED') {
      throw new Error('Timeout: Video nao completou em 10 minutos')
    }
    
    // ============================================================
    // PASSO 3: Resultado final
    // ============================================================
    section('3. RESULTADO FINAL')
    
    const totalTime = Math.floor((Date.now() - startTime) / 1000)
    
    log(`Task ID: ${taskId}`, 'bright')
    log(`Status Final: ${currentStatus}`, currentStatus === 'SUCCEEDED' ? 'green' : 'red')
    log(`Progress: ${progress}%`, 'cyan')
    log(`Tempo Total: ${formatDuration(totalTime)}`, 'yellow')
    log(`Tentativas de Polling: ${attempts}`, 'cyan')
    log('', 'reset')
    
    if (videoUrl) {
      log('VIDEO PRONTO PARA DOWNLOAD:', 'green')
      log(videoUrl, 'bright')
      log('', 'reset')
    } else {
      log('Video URL nao disponivel', 'red')
    }
    
    // ============================================================
    // PASSO 4: Resumo do processo
    // ============================================================
    section('4. RESUMO DO PROCESSO')
    
    log('Etapas completadas:', 'cyan')
    log('  1. Task criada na API Runway', 'green')
    log('  2. Polling de status implementado', 'green')
    log(`  3. Video ${currentStatus === 'SUCCEEDED' ? 'gerado com sucesso' : 'falhou'}`, currentStatus === 'SUCCEEDED' ? 'green' : 'red')
    log(`  4. Tempo total: ${formatDuration(totalTime)}`, 'cyan')
    log('', 'reset')
    
    if (currentStatus === 'SUCCEEDED') {
      log('TESTE COMPLETO - VIDEO GERADO E PRONTO!', 'green')
      log('O fluxo de geracao esta 100% funcional', 'green')
    } else {
      log('TESTE PARCIAL - Video nao completou', 'yellow')
    }
    
    console.log('')
    
  } catch (error) {
    log('', 'reset')
    log('ERRO DURANTE GERACAO:', 'red')
    log(error.message, 'red')
    console.error(error)
    process.exit(1)
  }
}

// Executar imediatamente
console.log('Iniciando teste de geracao real de video...')
console.log('Este processo pode levar 2-5 minutos')
console.log('')

generateVideo().then(() => {
  console.log('Teste concluido')
  process.exit(0)
}).catch(error => {
  console.log('')
  console.log('ERRO FATAL:', error.message)
  console.error(error)
  process.exit(1)
})
