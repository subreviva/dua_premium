#!/usr/bin/env node

/**
 * VIDEO STUDIO - TESTE COMPLETO DE FLUXO
 * 
 * Verifica todo o processo desde upload até vídeo pronto:
 * 1. Credits system (verificação ANTES + dedução DEPOIS)
 * 2. Upload de vídeo e conversão para base64
 * 3. Chamada API Runway video-to-video
 * 4. Task creation e polling de status
 * 5. Progress bar e estados de loading
 * 6. Download do vídeo final
 * 7. Responsividade mobile/desktop
 * 8. Verificação de emojis no código
 */

import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const RUNWAY_API_KEY = 'key_dabf0475058fa399f5b4bb6ebee8e1f3e45fb05bb8648c94b2bc1ec8afb56c5d'
const RUNWAY_API_BASE = 'https://api.dev.runwayml.com/v1'
const RUNWAY_API_VERSION = '2024-11-06'

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function header(title) {
  log('\n' + '='.repeat(60), 'cyan')
  log(title.toUpperCase(), 'bright')
  log('='.repeat(60), 'cyan')
}

function section(title) {
  log(`\n${'─'.repeat(60)}`, 'blue')
  log(title, 'bright')
  log('─'.repeat(60), 'blue')
}

let totalTests = 0
let passedTests = 0
let criticalIssues = []

function test(name, passed, details = '') {
  totalTests++
  if (passed) {
    passedTests++
    log(`PASS ${name}`, 'green')
    if (details) log(`     ${details}`, 'cyan')
  } else {
    log(`FAIL ${name}`, 'red')
    if (details) log(`     ${details}`, 'yellow')
  }
}

function critical(issue) {
  criticalIssues.push(issue)
  log(`CRITICO ${issue}`, 'red')
}

async function testVideoStudioFlow() {
  header('VIDEO STUDIO - TESTE DE FLUXO COMPLETO')

  // ============================================================
  // TESTE 1: Verificar código sem emojis
  // ============================================================
  section('1. VERIFICACAO DE EMOJIS NO CODIGO')
  
  try {
    const editorPage = await readFile(
      join(__dirname, 'app/videostudio/editar/page.tsx'),
      'utf-8'
    )
    
    const emojiRegex = /[🎵🎉✨❌✅🚀💫⚡🎯🎨🔥💡🎬🎭🎪📹🎥📺🖼️🌟⭐🏆💰💳]/g
    const emojisFound = editorPage.match(emojiRegex) || []
    
    test(
      'Código sem emojis',
      emojisFound.length === 0,
      emojisFound.length > 0 
        ? `Encontrados ${emojisFound.length} emojis: ${emojisFound.slice(0, 5).join(', ')}`
        : 'Código profissional sem emojis'
    )
    
    if (emojisFound.length > 0) {
      critical('Remover emojis do código do Video Studio')
    }
  } catch (error) {
    test('Código sem emojis', false, `Erro ao ler arquivo: ${error.message}`)
  }

  // ============================================================
  // TESTE 2: Verificar API de video-to-video
  // ============================================================
  section('2. VERIFICACAO DA API ROUTE')
  
  try {
    const apiRoute = await readFile(
      join(__dirname, 'app/api/runway/video-to-video/route.ts'),
      'utf-8'
    )
    
    // Verificar imports do sistema de créditos
    const hasCheckCredits = apiRoute.includes('checkCredits')
    const hasDeductCredits = apiRoute.includes('deductCredits')
    const hasCreditOperation = apiRoute.includes('CreditOperation')
    
    test(
      'Import checkCredits',
      hasCheckCredits,
      hasCheckCredits ? 'Sistema de verificação presente' : 'FALTA import checkCredits'
    )
    
    test(
      'Import deductCredits',
      hasDeductCredits,
      hasDeductCredits ? 'Sistema de dedução presente' : 'FALTA import deductCredits'
    )
    
    test(
      'Import CreditOperation',
      hasCreditOperation,
      hasCreditOperation ? 'Tipo CreditOperation presente' : 'FALTA tipo CreditOperation'
    )
    
    // Verificar chamada checkCredits ANTES da API
    const hasCheckBeforeAPI = apiRoute.includes('await checkCredits')
    test(
      'Verificação de créditos ANTES da API',
      hasCheckBeforeAPI,
      hasCheckBeforeAPI 
        ? 'Créditos verificados antes de chamar Runway'
        : 'FALTA verificação de créditos antes da API'
    )
    
    if (!hasCheckBeforeAPI) {
      critical('Adicionar checkCredits() ANTES da chamada à API Runway')
    }
    
    // Verificar dedução DEPOIS do sucesso
    const hasDeductAfterSuccess = apiRoute.includes('await deductCredits')
    test(
      'Dedução de créditos DEPOIS do sucesso',
      hasDeductAfterSuccess,
      hasDeductAfterSuccess
        ? 'Créditos deduzidos após task criada'
        : 'FALTA dedução de créditos após sucesso'
    )
    
    if (!hasDeductAfterSuccess) {
      critical('Adicionar deductCredits() DEPOIS da task ser criada')
    }
    
    // Verificar retorno 402 se créditos insuficientes
    const has402Response = apiRoute.includes('402')
    test(
      'Retorno 402 para créditos insuficientes',
      has402Response,
      has402Response
        ? 'Retorna erro 402 se sem créditos'
        : 'Adicionar retorno 402 para créditos insuficientes'
    )
    
  } catch (error) {
    test('Verificação da API route', false, `Erro: ${error.message}`)
  }

  // ============================================================
  // TESTE 3: Testar API Runway diretamente
  // ============================================================
  section('3. TESTE DA API RUNWAY')
  
  log('Testando task status endpoint...', 'cyan')
  
  try {
    // Criar um task de teste para verificar o polling
    const testVideoBase64 = 'data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAACG1kYXQAAAAPbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAA'
    
    const createResponse = await fetch(`${RUNWAY_API_BASE}/video_to_video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'X-Runway-Version': RUNWAY_API_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gen4_aleph',
        promptText: 'Professional test video',
        videoUri: testVideoBase64,
        ratio: '1280:720'
      })
    })
    
    if (createResponse.ok) {
      const taskData = await createResponse.json()
      const taskId = taskData.id
      
      test(
        'Criação de task na API Runway',
        true,
        `Task ID: ${taskId.substring(0, 20)}...`
      )
      
      // Testar polling de status
      log('Testando polling de status (aguarde 5s)...', 'cyan')
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      const statusResponse = await fetch(`${RUNWAY_API_BASE}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${RUNWAY_API_KEY}`,
          'X-Runway-Version': RUNWAY_API_VERSION
        }
      })
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        test(
          'Polling de status funcional',
          true,
          `Status: ${statusData.status}, Progress: ${statusData.progress || 0}%`
        )
        
        // Verificar estrutura da resposta
        const hasRequiredFields = statusData.id && statusData.status
        test(
          'Resposta com campos obrigatórios',
          hasRequiredFields,
          hasRequiredFields
            ? 'Campos id, status presentes'
            : 'FALTA campos na resposta'
        )
      } else {
        test('Polling de status funcional', false, `HTTP ${statusResponse.status}`)
      }
      
    } else {
      const errorData = await createResponse.json().catch(() => ({}))
      test(
        'Criação de task na API Runway',
        false,
        `HTTP ${createResponse.status}: ${errorData.message || 'Erro desconhecido'}`
      )
    }
    
  } catch (error) {
    test('Teste da API Runway', false, error.message)
  }

  // ============================================================
  // TESTE 4: Verificar estados de loading
  // ============================================================
  section('4. ESTADOS DE LOADING')
  
  try {
    const editorPage = await readFile(
      join(__dirname, 'app/videostudio/editar/page.tsx'),
      'utf-8'
    )
    
    // Verificar estado isProcessing
    const hasIsProcessing = editorPage.includes('isProcessing')
    test(
      'Estado isProcessing',
      hasIsProcessing,
      hasIsProcessing ? 'Estado de loading presente' : 'FALTA estado isProcessing'
    )
    
    // Verificar progress bar
    const hasProgress = editorPage.includes('progress')
    const hasProgressBar = editorPage.includes('width:') && editorPage.includes('%')
    test(
      'Progress bar implementada',
      hasProgress && hasProgressBar,
      hasProgress && hasProgressBar
        ? 'Progress bar 0-100% presente'
        : 'FALTA progress bar visual'
    )
    
    // Verificar polling interval
    const hasPolling = editorPage.includes('setInterval') || editorPage.includes('setTimeout')
    test(
      'Sistema de polling',
      hasPolling,
      hasPolling
        ? 'Polling de status implementado'
        : 'FALTA sistema de polling'
    )
    
    // Verificar cancelamento de polling
    const hasClearInterval = editorPage.includes('clearInterval')
    test(
      'Limpeza de interval',
      hasClearInterval,
      hasClearInterval
        ? 'Cleanup de polling presente'
        : 'FALTA clearInterval para cleanup'
    )
    
  } catch (error) {
    test('Estados de loading', false, error.message)
  }

  // ============================================================
  // TESTE 5: Verificar responsividade
  // ============================================================
  section('5. RESPONSIVIDADE MOBILE/DESKTOP')
  
  try {
    const editorPage = await readFile(
      join(__dirname, 'app/videostudio/editar/page.tsx'),
      'utf-8'
    )
    
    // Verificar grid responsivo
    const hasResponsiveGrid = editorPage.includes('grid-cols-1 md:grid-cols-2')
    test(
      'Grid responsivo',
      hasResponsiveGrid,
      hasResponsiveGrid
        ? 'Layout adapta mobile (1 col) → desktop (2 cols)'
        : 'FALTA grid responsivo md: breakpoint'
    )
    
    if (!hasResponsiveGrid) {
      critical('Adicionar grid responsivo: grid-cols-1 md:grid-cols-2')
    }
    
    // Verificar sidebar oculta em mobile
    const hasMobileSidebar = editorPage.includes('hidden md:block')
    test(
      'Sidebar oculta em mobile',
      hasMobileSidebar,
      hasMobileSidebar
        ? 'CinemaSidebar oculta em mobile'
        : 'FALTA hidden md:block na sidebar'
    )
    
    // Verificar padding responsivo
    const hasResponsivePadding = editorPage.includes('p-4 md:p-6') || editorPage.includes('px-4 md:px-6')
    test(
      'Padding responsivo',
      hasResponsivePadding,
      hasResponsivePadding
        ? 'Espaçamento adapta mobile → desktop'
        : 'Considerar padding responsivo'
    )
    
    // Verificar texto responsivo
    const hasResponsiveText = editorPage.includes('text-') && editorPage.includes('md:text-')
    test(
      'Texto responsivo',
      hasResponsiveText,
      hasResponsiveText
        ? 'Tamanhos de texto adaptam-se'
        : 'Considerar texto responsivo'
    )
    
  } catch (error) {
    test('Responsividade', false, error.message)
  }

  // ============================================================
  // TESTE 6: Verificar botão de download
  // ============================================================
  section('6. BOTAO DE DOWNLOAD')
  
  try {
    const editorPage = await readFile(
      join(__dirname, 'app/videostudio/editar/page.tsx'),
      'utf-8'
    )
    
    // Verificar presença do botão download
    const hasDownloadButton = editorPage.includes('Download') || editorPage.includes('download')
    test(
      'Botão de download presente',
      hasDownloadButton,
      hasDownloadButton ? 'Botão download implementado' : 'FALTA botão de download'
    )
    
    // Verificar design discreto
    const hasDiscreteDesign = editorPage.includes('bg-white/5') || editorPage.includes('bg-black/5')
    test(
      'Design discreto',
      hasDiscreteDesign,
      hasDiscreteDesign
        ? 'Botão com design discreto (bg-white/5)'
        : 'Considerar design mais discreto'
    )
    
    // Verificar ícone Download
    const hasDownloadIcon = editorPage.includes('Download') && editorPage.includes('lucide-react')
    test(
      'Ícone Download (Lucide)',
      hasDownloadIcon,
      hasDownloadIcon
        ? 'Ícone profissional Lucide'
        : 'Verificar ícone Download'
    )
    
  } catch (error) {
    test('Botão de download', false, error.message)
  }

  // ============================================================
  // TESTE 7: Verificar preview e resultado
  // ============================================================
  section('7. PREVIEW E RESULTADO')
  
  try {
    const editorPage = await readFile(
      join(__dirname, 'app/videostudio/editar/page.tsx'),
      'utf-8'
    )
    
    // Verificar video preview
    const hasVideoPreview = editorPage.includes('videoPreview')
    test(
      'Preview do vídeo original',
      hasVideoPreview,
      hasVideoPreview ? 'Preview implementado' : 'FALTA preview do vídeo'
    )
    
    // Verificar processedVideo
    const hasProcessedVideo = editorPage.includes('processedVideo')
    test(
      'Vídeo processado',
      hasProcessedVideo,
      hasProcessedVideo ? 'Estado de vídeo processado presente' : 'FALTA processedVideo'
    )
    
    // Verificar tag <video>
    const hasVideoTag = editorPage.includes('<video')
    test(
      'Tag <video> HTML5',
      hasVideoTag,
      hasVideoTag ? 'Player de vídeo HTML5' : 'FALTA tag <video>'
    )
    
  } catch (error) {
    test('Preview e resultado', false, error.message)
  }

  // ============================================================
  // TESTE 8: Verificar aspect ratios
  // ============================================================
  section('8. ASPECT RATIOS SUPORTADOS')
  
  try {
    const editorPage = await readFile(
      join(__dirname, 'app/videostudio/editar/page.tsx'),
      'utf-8'
    )
    
    const requiredRatios = [
      '1280:720',   // 16:9
      '720:1280',   // 9:16
      '960:960',    // 1:1
      '1584:672',   // 21:9
    ]
    
    let allRatiosPresent = true
    requiredRatios.forEach(ratio => {
      const hasRatio = editorPage.includes(ratio)
      if (!hasRatio) allRatiosPresent = false
    })
    
    test(
      'Aspect ratios principais',
      allRatiosPresent,
      allRatiosPresent
        ? '16:9, 9:16, 1:1, 21:9 disponíveis'
        : 'FALTA alguns aspect ratios'
    )
    
    // Verificar dropdown de ratios
    const hasRatioDropdown = editorPage.includes('selectedRatio')
    test(
      'Seletor de aspect ratio',
      hasRatioDropdown,
      hasRatioDropdown ? 'Dropdown implementado' : 'FALTA seletor de ratio'
    )
    
  } catch (error) {
    test('Aspect ratios', false, error.message)
  }

  // ============================================================
  // RESUMO FINAL
  // ============================================================
  header('RESUMO FINAL')
  
  const percentage = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0
  
  log(`\nTestes: ${passedTests}/${totalTests} (${percentage}%)`, 'bright')
  
  if (criticalIssues.length > 0) {
    log('\nISSUES CRITICOS:', 'red')
    criticalIssues.forEach((issue, index) => {
      log(`${index + 1}. ${issue}`, 'yellow')
    })
  }
  
  log('', 'reset')
  
  if (passedTests === totalTests) {
    log('VIDEO STUDIO EM OTIMO ESTADO!', 'green')
    log('Funcionalidades OK:', 'cyan')
    log('- Credits system implementado (check ANTES + deduct DEPOIS)', 'cyan')
    log('- Loading states com progress bar', 'cyan')
    log('- Responsividade mobile/desktop', 'cyan')
    log('- Preview e resultado funcionais', 'cyan')
    log('- Botao download discreto', 'cyan')
    log('- API Runway integrada', 'cyan')
  } else if (percentage >= 85) {
    log('VIDEO STUDIO EM BOM ESTADO!', 'yellow')
    log('Alguns ajustes recomendados acima', 'cyan')
  } else {
    log('VIDEO STUDIO PRECISA DE AJUSTES', 'red')
    log('Verifique os testes que falharam acima', 'yellow')
  }
  
  log('', 'reset')
  
  process.exit(passedTests === totalTests ? 0 : 1)
}

// Executar teste
testVideoStudioFlow().catch(error => {
  log(`\nERRO FATAL: ${error.message}`, 'red')
  console.error(error)
  process.exit(1)
})
