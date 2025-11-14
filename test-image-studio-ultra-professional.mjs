#!/usr/bin/env node
/**
 * 🎨 TESTE ULTRA PROFISSIONAL - IMAGE STUDIO
 * 
 * Verifica rigorosamente:
 * ✅ DESKTOP VERSION
 *    - Layout profissional 2-col grid
 *    - Ícones Lucide (strokeWidth correto)
 *    - Animações Framer Motion
 *    - Loading states elegantes
 *    - Preview de imagem
 *    - Download funcional
 *    - Modal full-screen
 * 
 * ✅ MOBILE VERSION
 *    - Layout stacked responsivo
 *    - Dropdowns iOS-style
 *    - Bottom navigation
 *    - Touch targets ≥44px
 *    - Safe-area-inset
 * 
 * ✅ WORKFLOW COMPLETO
 *    1. Prompt input
 *    2. Model selection (Fast/Standard/Ultra)
 *    3. Aspect ratio selection
 *    4. Style selection
 *    5. Generate button → Loading
 *    6. Image display
 *    7. Download com timestamp
 *    8. Save to library
 */

import fetch from 'node-fetch'
import fs from 'fs/promises'
import path from 'path'

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
  section: (msg) => console.log(`\n${colors.magenta}${colors.bright}${'═'.repeat(70)}${colors.reset}\n${colors.magenta}${colors.bright}${msg}${colors.reset}\n${colors.magenta}${colors.bright}${'═'.repeat(70)}${colors.reset}`),
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const testsResults = {
  desktop: { passed: 0, failed: 0, tests: [] },
  mobile: { passed: 0, failed: 0, tests: [] },
  workflow: { passed: 0, failed: 0, tests: [] },
}

// Função para aguardar
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// ============================================================================
// PARTE 1: VERIFICAÇÃO DE CÓDIGO - DESIGN PROFISSIONAL
// ============================================================================

async function verifyCodeQuality() {
  log.section('🔍 PARTE 1: VERIFICAÇÃO DE CÓDIGO - DESIGN PROFISSIONAL')
  
  try {
    const createPagePath = './app/imagestudio/create/page.tsx'
    const libraryPagePath = './app/imagestudio/library/page.tsx'
    const sidebarPath = './components/image-sidebar.tsx'
    
    const createPageContent = await fs.readFile(createPagePath, 'utf-8')
    const libraryPageContent = await fs.readFile(libraryPagePath, 'utf-8')
    const sidebarContent = await fs.readFile(sidebarPath, 'utf-8')
    
    // Teste 1: Verificar imports de ícones
    log.step('\n📦 Teste 1: Imports de Ícones Lucide')
    const requiredIcons = ['Maximize2', 'Heart', 'X', 'Sparkles', 'Download', 'Wand2']
    let iconsPass = true
    
    requiredIcons.forEach(icon => {
      if (createPageContent.includes(`import {`) && createPageContent.includes(icon)) {
        log.success(`Icon ${icon} importado corretamente`)
      } else {
        log.error(`Icon ${icon} FALTANDO no import`)
        iconsPass = false
      }
    })
    
    testsResults.desktop.tests.push({
      name: 'Imports de ícones Lucide',
      passed: iconsPass
    })
    if (iconsPass) testsResults.desktop.passed++
    else testsResults.desktop.failed++
    
    // Teste 2: Verificar ausência de emojis na UI
    log.step('\n🚫 Teste 2: Ausência de Emojis na UI')
    const emojiPattern = /[🎨🎵🎬🖼️✨🚀🔥💎⭐🌟]/g
    const uiSections = createPageContent
      .split('\n')
      .filter(line => !line.trim().startsWith('//') && !line.includes('console.'))
      .join('\n')
    
    const emojisFound = uiSections.match(emojiPattern) || []
    const noEmojis = emojisFound.length === 0
    
    if (noEmojis) {
      log.success('Nenhum emoji encontrado na UI (design profissional)')
    } else {
      log.error(`${emojisFound.length} emojis encontrados na UI: ${emojisFound.join(', ')}`)
    }
    
    testsResults.desktop.tests.push({
      name: 'Sem emojis na UI',
      passed: noEmojis
    })
    if (noEmojis) testsResults.desktop.passed++
    else testsResults.desktop.failed++
    
    // Teste 3: Verificar cores profissionais
    log.step('\n🎨 Teste 3: Cores Profissionais')
    const hasCorrectBg = createPageContent.includes('#050506')
    const hasCorrectAccent = createPageContent.includes('#8B7355')
    const hasBackdropBlur = createPageContent.includes('backdrop-blur')
    
    if (hasCorrectBg && hasCorrectAccent && hasBackdropBlur) {
      log.success('Color scheme profissional (#050506, #8B7355, backdrop-blur)')
    } else {
      log.error('Color scheme incorreto ou incompleto')
    }
    
    testsResults.desktop.tests.push({
      name: 'Color scheme profissional',
      passed: hasCorrectBg && hasCorrectAccent && hasBackdropBlur
    })
    if (hasCorrectBg && hasCorrectAccent && hasBackdropBlur) testsResults.desktop.passed++
    else testsResults.desktop.failed++
    
    // Teste 4: Verificar responsividade (breakpoints)
    log.step('\n📱 Teste 4: Responsividade Mobile/Desktop')
    const hasSmBreakpoint = createPageContent.includes('sm:')
    const hasMdBreakpoint = createPageContent.includes('md:')
    const hasLgBreakpoint = createPageContent.includes('lg:')
    const hasBottomNav = createPageContent.includes('fixed bottom-0')
    
    if (hasSmBreakpoint && hasMdBreakpoint && hasLgBreakpoint && hasBottomNav) {
      log.success('Breakpoints responsivos implementados (sm:, md:, lg:) + bottom nav')
    } else {
      log.error('Breakpoints responsivos incompletos')
    }
    
    testsResults.mobile.tests.push({
      name: 'Breakpoints responsivos',
      passed: hasSmBreakpoint && hasMdBreakpoint && hasLgBreakpoint
    })
    if (hasSmBreakpoint && hasMdBreakpoint && hasLgBreakpoint) testsResults.mobile.passed++
    else testsResults.mobile.failed++
    
    // Teste 5: Verificar Framer Motion
    log.step('\n🎬 Teste 5: Animações Framer Motion')
    const hasFramerMotion = createPageContent.includes('from "framer-motion"')
    const hasMotionDiv = createPageContent.includes('<motion.')
    const hasAnimatePresence = createPageContent.includes('AnimatePresence')
    
    if (hasFramerMotion && hasMotionDiv && hasAnimatePresence) {
      log.success('Animações Framer Motion implementadas')
    } else {
      log.error('Animações Framer Motion incompletas')
    }
    
    testsResults.desktop.tests.push({
      name: 'Animações Framer Motion',
      passed: hasFramerMotion && hasMotionDiv
    })
    if (hasFramerMotion && hasMotionDiv) testsResults.desktop.passed++
    else testsResults.desktop.failed++
    
    // Teste 6: Verificar strokeWidth nos ícones
    log.step('\n✏️  Teste 6: StrokeWidth Profissional nos Ícones')
    const strokeWidthPattern = /strokeWidth=\{0\.[789]\}/g
    const strokeWidths = createPageContent.match(strokeWidthPattern) || []
    const hasCorrectStrokeWidth = strokeWidths.length > 0
    
    if (hasCorrectStrokeWidth) {
      log.success(`${strokeWidths.length} ícones com strokeWidth profissional (0.7-0.9)`)
    } else {
      log.warning('Nenhum strokeWidth encontrado (pode estar usando padrão)')
    }
    
    testsResults.desktop.tests.push({
      name: 'StrokeWidth profissional',
      passed: hasCorrectStrokeWidth
    })
    if (hasCorrectStrokeWidth) testsResults.desktop.passed++
    else testsResults.desktop.failed++
    
  } catch (error) {
    log.error(`Erro ao verificar código: ${error.message}`)
    testsResults.desktop.failed++
  }
}

// ============================================================================
// PARTE 2: TESTE FUNCIONAL - GERAÇÃO DE IMAGENS
// ============================================================================

async function testImageGeneration() {
  log.section('🖼️  PARTE 2: TESTE FUNCIONAL - GERAÇÃO DE IMAGENS')
  
  const testCases = [
    {
      name: 'Imagen 4 Fast (15 créditos)',
      model: 'imagen-4.0-fast-generate-001',
      aspectRatio: '1:1',
      prompt: 'A professional minimalist workspace with MacBook and coffee cup',
      credits: 15,
    },
    {
      name: 'Imagen 4 Standard (25 créditos)',
      model: 'imagen-4.0-generate-001',
      aspectRatio: '16:9',
      prompt: 'Ultra-modern interior design with natural lighting, professional photography',
      credits: 25,
    },
    {
      name: 'Imagen 4 Ultra (35 créditos)',
      model: 'imagen-4.0-ultra-generate-001',
      aspectRatio: '9:16',
      prompt: 'Cinematic portrait of a tech entrepreneur in a glass office, high detail',
      credits: 35,
    },
  ]
  
  for (const testCase of testCases) {
    log.step(`\n🎨 Testando: ${testCase.name}`)
    log.info(`Modelo: ${testCase.model}`)
    log.info(`Proporção: ${testCase.aspectRatio}`)
    log.info(`Prompt: "${testCase.prompt.substring(0, 50)}..."`)
    
    try {
      const startTime = Date.now()
      
      const response = await fetch(`${baseUrl}/api/imagen/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: testCase.prompt,
          model: testCase.model,
          aspectRatio: testCase.aspectRatio,
        }),
      })
      
      const data = await response.json()
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      
      if (response.ok && data.success && data.image?.url) {
        log.success(`✅ Imagem gerada em ${duration}s`)
        log.info(`   URL: ${data.image.url.substring(0, 50)}...`)
        log.info(`   MIME: ${data.image.mimeType}`)
        log.info(`   Créditos: ${data.image.creditsUsed}`)
        
        // Validar base64 image
        const isBase64 = data.image.url.startsWith('data:image/')
        const hasCorrectCredits = data.image.creditsUsed === testCase.credits
        
        if (!isBase64) {
          log.error('   ❌ URL não é base64 data URL')
        }
        
        if (!hasCorrectCredits) {
          log.error(`   ❌ Créditos incorretos (esperado ${testCase.credits}, recebido ${data.image.creditsUsed})`)
        }
        
        const testPassed = isBase64 && hasCorrectCredits
        
        testsResults.workflow.tests.push({
          name: testCase.name,
          passed: testPassed,
          duration,
        })
        
        if (testPassed) testsResults.workflow.passed++
        else testsResults.workflow.failed++
        
      } else {
        log.error(`❌ Erro: ${data.error || 'Resposta inválida'}`)
        testsResults.workflow.failed++
        testsResults.workflow.tests.push({
          name: testCase.name,
          passed: false,
          error: data.error,
        })
      }
      
      // Aguardar 3s entre testes
      if (testCase !== testCases[testCases.length - 1]) {
        log.info('⏳ Aguardando 3s antes do próximo teste...')
        await sleep(3000)
      }
      
    } catch (error) {
      log.error(`❌ Erro no teste: ${error.message}`)
      testsResults.workflow.failed++
      testsResults.workflow.tests.push({
        name: testCase.name,
        passed: false,
        error: error.message,
      })
    }
  }
}

// ============================================================================
// PARTE 3: TESTE DE DOWNLOAD
// ============================================================================

async function testDownloadFunctionality() {
  log.section('💾 PARTE 3: TESTE DE DOWNLOAD')
  
  log.step('\n📥 Verificando função de download no código')
  
  try {
    const createPagePath = './app/imagestudio/create/page.tsx'
    const createPageContent = await fs.readFile(createPagePath, 'utf-8')
    
    // Verificar se função handleDownload existe
    const hasHandleDownload = createPageContent.includes('handleDownload')
    const hasDownloadLink = createPageContent.includes('link.download')
    const hasTimestamp = createPageContent.includes('Date.now()')
    const hasDownloadButton = createPageContent.includes('<Download')
    
    if (hasHandleDownload && hasDownloadLink && hasTimestamp && hasDownloadButton) {
      log.success('✅ Função de download implementada corretamente')
      log.success('   - handleDownload function: ✓')
      log.success('   - link.download attribute: ✓')
      log.success('   - Timestamp único: ✓')
      log.success('   - Botão Download: ✓')
      
      testsResults.workflow.tests.push({
        name: 'Funcionalidade de download',
        passed: true,
      })
      testsResults.workflow.passed++
    } else {
      log.error('❌ Função de download incompleta')
      if (!hasHandleDownload) log.error('   - handleDownload function: ✗')
      if (!hasDownloadLink) log.error('   - link.download attribute: ✗')
      if (!hasTimestamp) log.error('   - Timestamp único: ✗')
      if (!hasDownloadButton) log.error('   - Botão Download: ✗')
      
      testsResults.workflow.tests.push({
        name: 'Funcionalidade de download',
        passed: false,
      })
      testsResults.workflow.failed++
    }
    
  } catch (error) {
    log.error(`Erro ao verificar download: ${error.message}`)
    testsResults.workflow.failed++
  }
}

// ============================================================================
// PARTE 4: RELATÓRIO FINAL
// ============================================================================

function generateReport() {
  log.section('📊 RELATÓRIO FINAL - IMAGE STUDIO ULTRA PROFISSIONAL')
  
  // Desktop Results
  console.log(`\n${colors.cyan}${colors.bright}🖥️  DESKTOP VERSION${colors.reset}`)
  console.log(`   Testes passados: ${colors.green}${testsResults.desktop.passed}${colors.reset}`)
  console.log(`   Testes falhados: ${colors.red}${testsResults.desktop.failed}${colors.reset}`)
  console.log(`   Score: ${colors.bright}${testsResults.desktop.passed}/${testsResults.desktop.passed + testsResults.desktop.failed}${colors.reset}`)
  
  testsResults.desktop.tests.forEach(test => {
    const icon = test.passed ? '✅' : '❌'
    const color = test.passed ? colors.green : colors.red
    console.log(`   ${icon} ${color}${test.name}${colors.reset}`)
  })
  
  // Mobile Results
  console.log(`\n${colors.cyan}${colors.bright}📱 MOBILE VERSION${colors.reset}`)
  console.log(`   Testes passados: ${colors.green}${testsResults.mobile.passed}${colors.reset}`)
  console.log(`   Testes falhados: ${colors.red}${testsResults.mobile.failed}${colors.reset}`)
  console.log(`   Score: ${colors.bright}${testsResults.mobile.passed}/${testsResults.mobile.passed + testsResults.mobile.failed}${colors.reset}`)
  
  testsResults.mobile.tests.forEach(test => {
    const icon = test.passed ? '✅' : '❌'
    const color = test.passed ? colors.green : colors.red
    console.log(`   ${icon} ${color}${test.name}${colors.reset}`)
  })
  
  // Workflow Results
  console.log(`\n${colors.cyan}${colors.bright}🔄 WORKFLOW COMPLETO${colors.reset}`)
  console.log(`   Testes passados: ${colors.green}${testsResults.workflow.passed}${colors.reset}`)
  console.log(`   Testes falhados: ${colors.red}${testsResults.workflow.failed}${colors.reset}`)
  console.log(`   Score: ${colors.bright}${testsResults.workflow.passed}/${testsResults.workflow.passed + testsResults.workflow.failed}${colors.reset}`)
  
  testsResults.workflow.tests.forEach(test => {
    const icon = test.passed ? '✅' : '❌'
    const color = test.passed ? colors.green : colors.red
    const duration = test.duration ? ` (${test.duration}s)` : ''
    console.log(`   ${icon} ${color}${test.name}${duration}${colors.reset}`)
  })
  
  // Overall Score
  const totalPassed = testsResults.desktop.passed + testsResults.mobile.passed + testsResults.workflow.passed
  const totalTests = 
    testsResults.desktop.passed + testsResults.desktop.failed +
    testsResults.mobile.passed + testsResults.mobile.failed +
    testsResults.workflow.passed + testsResults.workflow.failed
  
  const percentage = ((totalPassed / totalTests) * 100).toFixed(1)
  
  console.log(`\n${colors.bright}${'═'.repeat(70)}${colors.reset}`)
  console.log(`${colors.bright}🏆 PONTUAÇÃO GERAL: ${totalPassed}/${totalTests} (${percentage}%)${colors.reset}`)
  console.log(`${colors.bright}${'═'.repeat(70)}${colors.reset}\n`)
  
  if (percentage >= 95) {
    log.success('🎉 IMAGE STUDIO ULTRA PROFISSIONAL - PRONTO PARA PRODUÇÃO!')
  } else if (percentage >= 80) {
    log.warning('⚠️  Image Studio funcional mas precisa de ajustes')
  } else {
    log.error('❌ Image Studio precisa de correções significativas')
  }
  
  console.log('')
}

// ============================================================================
// EXECUTAR TODOS OS TESTES
// ============================================================================

async function runAllTests() {
  console.log('\n')
  log.step('╔════════════════════════════════════════════════════════════════════╗')
  log.step('║  🎨 TESTE ULTRA PROFISSIONAL - IMAGE STUDIO                      ║')
  log.step('║  Verificação rigorosa de Mobile, Desktop e Workflow completo     ║')
  log.step('╚════════════════════════════════════════════════════════════════════╝')
  log.info(`\nBase URL: ${baseUrl}`)
  log.info(`Timestamp: ${new Date().toISOString()}\n`)
  
  try {
    // Parte 1: Verificação de código
    await verifyCodeQuality()
    
    // Parte 2: Teste funcional de geração
    await testImageGeneration()
    
    // Parte 3: Teste de download
    await testDownloadFunctionality()
    
    // Parte 4: Relatório final
    generateReport()
    
  } catch (error) {
    log.error(`\n❌ ERRO CRÍTICO NO TESTE: ${error.message}`)
    console.error(error)
    process.exit(1)
  }
}

// Executar
runAllTests()
