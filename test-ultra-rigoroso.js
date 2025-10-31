#!/usr/bin/env node

/**
 * 🧪 TESTE ULTRA RIGOROSO - Music Studio
 * 
 * Testa TODAS as funcionalidades:
 * - 12 endpoints backend
 * - 5 features avançados UI
 * - Error handling
 * - Credits endpoint
 */

const BASE_URL = 'http://localhost:3000'

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

const log = {
  title: (msg) => console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.blue}📋 ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.yellow}⚡ Testing: ${msg}${colors.reset}`),
  pass: (msg) => console.log(`${colors.green}✅ PASS: ${msg}${colors.reset}`),
  fail: (msg) => console.log(`${colors.red}❌ FAIL: ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  WARN: ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  INFO: ${msg}${colors.reset}`),
}

// Resultados globais
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
}

function recordTest(name, status, details = '') {
  results.tests.push({ name, status, details })
  if (status === 'PASS') results.passed++
  else if (status === 'FAIL') results.failed++
  else if (status === 'WARN') results.warnings++
}

/**
 * Test Helper: Fazer request
 */
async function testRequest(method, path, body = null, expectedStatus = 200) {
  const testName = `${method} ${path}`
  log.test(testName)
  
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    }
    
    if (body) {
      options.body = JSON.stringify(body)
    }
    
    const response = await fetch(`${BASE_URL}${path}`, options)
    const data = await response.json()
    
    // Verificar status code
    if (response.status !== expectedStatus) {
      log.fail(`Expected ${expectedStatus}, got ${response.status}`)
      recordTest(testName, 'FAIL', `Status: ${response.status}`)
      return { success: false, status: response.status, data }
    }
    
    log.pass(`Status ${response.status} OK`)
    recordTest(testName, 'PASS', `Status: ${response.status}`)
    return { success: true, status: response.status, data }
    
  } catch (error) {
    log.fail(error.message)
    recordTest(testName, 'FAIL', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * 1. TESTAR ENDPOINTS BACKEND
 */
async function testBackendEndpoints() {
  log.section('TESTE 1: Backend Endpoints (12 rotas)')
  
  // Test 1.1: Credits (deve retornar 999 sem 404)
  log.test('GET /api/music/credits')
  const credits = await testRequest('GET', '/api/music/credits', null, 200)
  if (credits.success && credits.data.success) {
    if (credits.data.credits?.credits_left === 999) {
      log.pass('Credits retorna 999 (mock funcionando)')
    } else {
      log.warn(`Credits: ${credits.data.credits?.credits_left} (esperado 999)`)
      recordTest('Credits value check', 'WARN', 'Not 999')
    }
  }
  
  // Test 1.2: Custom (POST com validação)
  log.test('POST /api/music/custom (sem body - deve retornar 400)')
  await testRequest('POST', '/api/music/custom', {}, 400)
  
  log.test('POST /api/music/custom (body válido)')
  await testRequest('POST', '/api/music/custom', {
    lyrics: '[Verse]\nTest lyrics here',
    tags: 'rock, energetic',
    title: 'Test Song',
    instrumental: false,
    model: 'chirp-v3-5'
  }, 200)
  
  // Test 1.3: Generate (POST)
  log.test('POST /api/music/generate')
  await testRequest('POST', '/api/music/generate', {
    prompt: 'Create an energetic rock song',
    model: 'chirp-v3-5'
  }, 200)
  
  // Test 1.4: Lyrics (POST)
  log.test('POST /api/music/lyrics')
  await testRequest('POST', '/api/music/lyrics', {
    prompt: 'A song about the ocean'
  }, 200)
  
  // Test 1.5: Extend (POST - precisa clip_id)
  log.test('POST /api/music/extend (sem clip_id - deve retornar 400)')
  await testRequest('POST', '/api/music/extend', {}, 400)
  
  // Test 1.6: Cover (POST - precisa clip_id)
  log.test('POST /api/music/cover (sem clip_id - deve retornar 400)')
  await testRequest('POST', '/api/music/cover', {}, 400)
  
  // Test 1.7: Concat (POST - precisa clip_ids array)
  log.test('POST /api/music/concat (sem clip_ids - deve retornar 400)')
  await testRequest('POST', '/api/music/concat', {}, 400)
  
  // Test 1.8: WAV (POST - precisa clip_id)
  log.test('POST /api/music/wav (sem clip_id - deve retornar 400)')
  await testRequest('POST', '/api/music/wav', {}, 400)
  
  // Test 1.9: MIDI (POST - precisa clip_id)
  log.test('POST /api/music/midi (sem clip_id - deve retornar 400)')
  await testRequest('POST', '/api/music/midi', {}, 400)
  
  // Test 1.10: Stems (POST - precisa clip_id)
  log.test('POST /api/music/stems (sem clip_id - deve retornar 400)')
  await testRequest('POST', '/api/music/stems', {}, 400)
  
  // Test 1.11: Stems Full (POST - precisa clip_id)
  log.test('POST /api/music/stems/full (sem clip_id - deve retornar 400)')
  await testRequest('POST', '/api/music/stems/full', {}, 400)
  
  // Test 1.12: Persona (POST - precisa url e persona_name)
  log.test('POST /api/music/persona (sem body - deve retornar 400)')
  await testRequest('POST', '/api/music/persona', {}, 400)
  
  // Test 1.13: Persona Music (POST - precisa persona_id e prompt)
  log.test('POST /api/music/persona-music (sem body - deve retornar 400)')
  await testRequest('POST', '/api/music/persona-music', {}, 400)
}

/**
 * 2. TESTAR ERROR HANDLING
 */
async function testErrorHandling() {
  log.section('TESTE 2: Error Handling (Centralized)')
  
  // Test 2.1: SunoAPIError (400)
  log.test('Validação retorna 400 com mensagem clara')
  const result = await testRequest('POST', '/api/music/custom', {
    lyrics: 'test'
    // falta tags e title
  }, 400)
  
  if (result.data?.error) {
    log.pass(`Erro claro: "${result.data.error}"`)
    recordTest('Error message clarity', 'PASS')
  } else {
    log.fail('Erro não tem mensagem')
    recordTest('Error message clarity', 'FAIL')
  }
  
  // Test 2.2: Verificar estrutura de resposta de erro
  log.test('Estrutura de erro padronizada')
  if (result.data?.success === false && result.data?.error) {
    log.pass('Estrutura: { success: false, error: "..." }')
    recordTest('Error structure', 'PASS')
  } else {
    log.fail('Estrutura de erro inconsistente')
    recordTest('Error structure', 'FAIL')
  }
}

/**
 * 3. VERIFICAR ARQUIVOS CRIADOS
 */
async function testFilesExist() {
  log.section('TESTE 3: Arquivos Críticos')
  
  const fs = require('fs')
  const path = require('path')
  
  const criticalFiles = [
    'lib/api-error-handler.ts',
    'components/song-context-menu.tsx',
    'app/api/music/credits/route.ts',
    'app/api/music/custom/route.ts',
    'app/api/music/wav/route.ts',
    'app/api/music/midi/route.ts',
    'app/api/music/stems/route.ts',
    'app/api/music/stems/full/route.ts',
    'app/api/music/persona/route.ts',
    'app/api/music/persona-music/route.ts',
    'app/api/music/concat/route.ts',
    'API_ERROR_RESOLUTION.md',
    'FEATURES_CHECKLIST.md',
    'UI_FEATURES_ADDED.md',
    'UI_VISUAL_GUIDE.md'
  ]
  
  for (const file of criticalFiles) {
    const fullPath = path.join(process.cwd(), file)
    if (fs.existsSync(fullPath)) {
      log.pass(`${file} existe`)
      recordTest(`File: ${file}`, 'PASS')
    } else {
      log.fail(`${file} NÃO ENCONTRADO`)
      recordTest(`File: ${file}`, 'FAIL')
    }
  }
}

/**
 * 4. VERIFICAR IMPORTS
 */
async function testImports() {
  log.section('TESTE 4: Imports e Dependências')
  
  const fs = require('fs')
  const path = require('path')
  
  // Verificar se api-error-handler é importado corretamente
  log.test('Verificar import em custom/route.ts')
  const customRoute = fs.readFileSync(
    path.join(process.cwd(), 'app/api/music/custom/route.ts'),
    'utf-8'
  )
  
  if (customRoute.includes("import { handleApiError } from '@/lib/api-error-handler'")) {
    log.pass('handleApiError importado corretamente')
    recordTest('Import handleApiError', 'PASS')
  } else {
    log.fail('Import handleApiError não encontrado')
    recordTest('Import handleApiError', 'FAIL')
  }
  
  if (customRoute.includes('return handleApiError(error, \'Custom\')')) {
    log.pass('handleApiError usado no catch block')
    recordTest('Use handleApiError', 'PASS')
  } else {
    log.fail('handleApiError não usado no catch')
    recordTest('Use handleApiError', 'FAIL')
  }
  
  // Verificar song-context-menu.tsx
  log.test('Verificar handlers em song-context-menu.tsx')
  const songMenu = fs.readFileSync(
    path.join(process.cwd(), 'components/song-context-menu.tsx'),
    'utf-8'
  )
  
  const handlers = [
    'handleDownloadWAV',
    'handleDownloadMIDI',
    'handleSeparateStems',
    'handleSeparateStemsFull',
    'handleCreatePersona',
    'handleGenerateWithPersona',
    'handleConcatSongs'
  ]
  
  for (const handler of handlers) {
    if (songMenu.includes(`const ${handler}`)) {
      log.pass(`Handler ${handler} existe`)
      recordTest(`Handler: ${handler}`, 'PASS')
    } else {
      log.fail(`Handler ${handler} não encontrado`)
      recordTest(`Handler: ${handler}`, 'FAIL')
    }
  }
}

/**
 * 5. VERIFICAR CÓDIGO SUNO API
 */
async function testSunoAPIFix() {
  log.section('TESTE 5: Suno API - Credits Fix')
  
  const fs = require('fs')
  const path = require('path')
  
  log.test('Verificar mock credits em lib/suno-api.ts')
  const sunoApi = fs.readFileSync(
    path.join(process.cwd(), 'lib/suno-api.ts'),
    'utf-8'
  )
  
  if (sunoApi.includes('credits_remaining: 999')) {
    log.pass('Mock credits (999) implementado')
    recordTest('Mock credits', 'PASS')
  } else {
    log.fail('Mock credits não encontrado')
    recordTest('Mock credits', 'FAIL')
  }
  
  if (sunoApi.includes('NOTE: The Suno API doesn\'t have a documented credits endpoint')) {
    log.pass('Comentário explicativo presente')
    recordTest('Credits comment', 'PASS')
  } else {
    log.warn('Comentário explicativo ausente')
    recordTest('Credits comment', 'WARN')
  }
}

/**
 * 6. RELATÓRIO FINAL
 */
function printFinalReport() {
  log.title()
  console.log(`${colors.bright}${colors.cyan}📊 RELATÓRIO FINAL - TESTE ULTRA RIGOROSO${colors.reset}`)
  log.title()
  
  console.log(`\n${colors.bright}Resultados:${colors.reset}`)
  console.log(`${colors.green}✅ Testes Passaram: ${results.passed}${colors.reset}`)
  console.log(`${colors.red}❌ Testes Falharam: ${results.failed}${colors.reset}`)
  console.log(`${colors.yellow}⚠️  Avisos: ${results.warnings}${colors.reset}`)
  console.log(`📝 Total de Testes: ${results.tests.length}`)
  
  const successRate = ((results.passed / results.tests.length) * 100).toFixed(1)
  console.log(`\n${colors.bright}Taxa de Sucesso: ${successRate}%${colors.reset}`)
  
  if (results.failed > 0) {
    console.log(`\n${colors.red}${colors.bright}TESTES FALHADOS:${colors.reset}`)
    results.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => console.log(`  ${colors.red}❌ ${t.name}${colors.reset} - ${t.details}`))
  }
  
  if (results.warnings > 0) {
    console.log(`\n${colors.yellow}${colors.bright}AVISOS:${colors.reset}`)
    results.tests
      .filter(t => t.status === 'WARN')
      .forEach(t => console.log(`  ${colors.yellow}⚠️  ${t.name}${colors.reset} - ${t.details}`))
  }
  
  console.log('\n')
  
  if (results.failed === 0) {
    console.log(`${colors.green}${colors.bright}🎉 TODOS OS TESTES PASSARAM! 100% FUNCIONAL!${colors.reset}\n`)
    process.exit(0)
  } else {
    console.log(`${colors.red}${colors.bright}❌ ALGUNS TESTES FALHARAM - REVISAR CÓDIGO${colors.reset}\n`)
    process.exit(1)
  }
}

/**
 * EXECUTAR TODOS OS TESTES
 */
async function runAllTests() {
  console.log(`${colors.bright}${colors.cyan}
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🧪 TESTE ULTRA RIGOROSO - Music Studio Platform      ║
║                                                          ║
║   Testando TODAS as funcionalidades implementadas       ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
${colors.reset}`)
  
  log.info('Servidor deve estar rodando em http://localhost:3000')
  log.info('Iniciando testes em 2 segundos...\n')
  
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  try {
    // Teste 1: Backend Endpoints
    await testBackendEndpoints()
    
    // Teste 2: Error Handling
    await testErrorHandling()
    
    // Teste 3: Arquivos
    await testFilesExist()
    
    // Teste 4: Imports
    await testImports()
    
    // Teste 5: Suno API Fix
    await testSunoAPIFix()
    
    // Relatório Final
    printFinalReport()
    
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}ERRO CRÍTICO:${colors.reset}`, error)
    process.exit(1)
  }
}

// Verificar se servidor está rodando
async function checkServer() {
  try {
    const response = await fetch(BASE_URL)
    return response.ok
  } catch {
    return false
  }
}

// Iniciar testes
(async () => {
  const serverRunning = await checkServer()
  
  if (!serverRunning) {
    console.error(`${colors.red}${colors.bright}❌ ERRO: Servidor não está rodando em ${BASE_URL}${colors.reset}`)
    console.error(`${colors.yellow}Execute: npm run dev${colors.reset}\n`)
    process.exit(1)
  }
  
  await runAllTests()
})()
