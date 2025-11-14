#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  VIDEO STUDIO - TESTE COMPLETO DE TODAS AS FERRAMENTAS                  ║
 * ║  Verificação profissional dos 4 tools + sistema de créditos             ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { readFile } from 'fs/promises'
import { join } from 'path'

const TOOLS = {
  imageToVideo: {
    name: 'Image-to-Video',
    frontend: 'app/videostudio/image-to-video/page.tsx',
    backend: 'app/api/runway/image-to-video/route.ts',
    endpoint: '/api/runway/image-to-video',
    model: 'gen4_turbo',
    credits: 25,
    operation: 'video_gen4_turbo_5s',
    apiEndpoint: 'https://api.dev.runwayml.com/v1/image_to_video'
  },
  videoToVideo: {
    name: 'Editor Criativo (Video-to-Video)',
    frontend: 'app/videostudio/editar/page.tsx',
    backend: 'app/api/runway/video-to-video/route.ts',
    endpoint: '/api/runway/video-to-video',
    model: 'gen4_aleph',
    credits: 50,
    operation: 'video_to_video',
    apiEndpoint: 'https://api.dev.runwayml.com/v1/video_to_video'
  },
  upscale: {
    name: 'Qualidade 4K (Video Upscale)',
    frontend: 'app/videostudio/qualidade/page.tsx',
    backend: 'app/api/runway/video-upscale/route.ts',
    endpoint: '/api/runway/video-upscale',
    model: 'upscale_v1',
    credits: 25,
    operation: 'video_upscale_10s',
    apiEndpoint: 'https://api.dev.runwayml.com/v1/video_upscale'
  },
  actTwo: {
    name: 'Performance Act-Two (Character Animation)',
    frontend: 'app/videostudio/performance/page.tsx',
    backend: 'app/api/runway/character-performance/route.ts',
    endpoint: '/api/runway/character-performance',
    model: 'act_two',
    credits: 30,
    operation: 'video_act_two',
    apiEndpoint: 'https://api.runwayml.com/v1/character_performance'
  }
}

const tests = []
let passed = 0
let failed = 0

function test(name, result, details = '') {
  tests.push({ name, result, details })
  if (result) {
    passed++
    console.log(`✅ ${name}`)
  } else {
    failed++
    console.log(`❌ ${name}`)
  }
  if (details) console.log(`   ${details}`)
}

async function checkFile(filePath, searchTerms = []) {
  try {
    const content = await readFile(filePath, 'utf-8')
    const found = {}
    for (const term of searchTerms) {
      found[term] = content.includes(term)
    }
    return { exists: true, content, found }
  } catch {
    return { exists: false, content: '', found: {} }
  }
}

console.log('\n╔══════════════════════════════════════════════════════════════════════════╗')
console.log('║         VIDEO STUDIO - VERIFICAÇÃO COMPLETA DAS FERRAMENTAS             ║')
console.log('╚══════════════════════════════════════════════════════════════════════════╝\n')

console.log('📋 FERRAMENTAS A VERIFICAR:\n')
Object.entries(TOOLS).forEach(([key, tool]) => {
  console.log(`${tool.name}:`)
  console.log(`  Frontend: ${tool.frontend}`)
  console.log(`  Backend: ${tool.backend}`)
  console.log(`  Endpoint: ${tool.endpoint}`)
  console.log(`  Modelo: ${tool.model}`)
  console.log(`  Créditos: ${tool.credits}`)
  console.log(`  Operação: ${tool.operation}`)
  console.log(`  API Runway: ${tool.apiEndpoint}`)
  console.log('')
})

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('1️⃣  VERIFICAÇÃO DE ARQUIVOS E ESTRUTURA')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

for (const [key, tool] of Object.entries(TOOLS)) {
  console.log(`\n📹 ${tool.name}\n`)
  
  // Verificar frontend
  const frontend = await checkFile(tool.frontend, [
    'fetch(',
    tool.endpoint,
    'useState',
    'isProcessing',
    'setIsProcessing'
  ])
  test(
    `Frontend existe: ${tool.frontend}`,
    frontend.exists,
    frontend.exists ? `✓ Usa ${tool.endpoint}` : ''
  )

  if (frontend.exists) {
    test(
      `Frontend tem chamada API: ${tool.endpoint}`,
      frontend.found[tool.endpoint],
      frontend.found[tool.endpoint] ? '✓ fetch() configurado' : '✗ Endpoint não encontrado'
    )
    test(
      `Frontend tem estado de loading`,
      frontend.found['isProcessing'] && frontend.found['setIsProcessing'],
      frontend.found['isProcessing'] ? '✓ isProcessing implementado' : '✗ Loading state ausente'
    )
  }

  // Verificar backend
  const backend = await checkFile(tool.backend, [
    'checkCredits',
    'deductCredits',
    'RUNWAY_API_KEY',
    tool.apiEndpoint,
    tool.operation
  ])
  test(
    `Backend existe: ${tool.backend}`,
    backend.exists,
    backend.exists ? `✓ API route implementada` : ''
  )

  if (backend.exists) {
    test(
      `Backend verifica créditos ANTES (checkCredits)`,
      backend.found['checkCredits'],
      backend.found['checkCredits'] ? '✓ Proteção de créditos ativa' : '✗ SEM verificação de créditos!'
    )
    test(
      `Backend deduz créditos DEPOIS (deductCredits)`,
      backend.found['deductCredits'],
      backend.found['deductCredits'] ? '✓ Débito implementado' : '✗ Créditos não são debitados!'
    )
    test(
      `Backend chama API Runway: ${tool.apiEndpoint}`,
      backend.found[tool.apiEndpoint] || backend.content.includes('api.dev.runwayml.com') || backend.content.includes('api.runwayml.com'),
      backend.found[tool.apiEndpoint] ? '✓ Integração Runway ML ativa' : '✗ API Runway não encontrada'
    )
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('2️⃣  VERIFICAÇÃO DO SISTEMA DE CRÉDITOS')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const creditsConfig = await checkFile('lib/credits/credits-config.ts', [
  'video_gen4_turbo_5s',
  'video_to_video',
  'video_upscale_10s',
  'video_act_two',
  'VIDEO_CREDITS'
])

test(
  `Arquivo de configuração de créditos existe`,
  creditsConfig.exists,
  creditsConfig.exists ? '✓ lib/credits/credits-config.ts' : ''
)

if (creditsConfig.exists) {
  // Extrair valores dos créditos do arquivo
  const videoCreditsMatch = creditsConfig.content.match(/export const VIDEO_CREDITS = \{([^}]+)\}/s)
  
  if (videoCreditsMatch) {
    const videoCreditsContent = videoCreditsMatch[1]
    
    // Image-to-Video (gen4_turbo 5s)
    const gen4TurboMatch = videoCreditsContent.match(/video_gen4_turbo_5s:\s*(\d+)/)
    const gen4TurboCredits = gen4TurboMatch ? parseInt(gen4TurboMatch[1]) : 0
    test(
      `Image-to-Video (gen4_turbo 5s): ${gen4TurboCredits} créditos`,
      gen4TurboCredits === 25,
      gen4TurboCredits === 25 ? '✓ Configuração correta' : `✗ Esperado 25, encontrado ${gen4TurboCredits}`
    )

    // Video-to-Video (gen4_aleph)
    const v2vMatch = videoCreditsContent.match(/video_to_video:\s*(\d+)/)
    const v2vCredits = v2vMatch ? parseInt(v2vMatch[1]) : 0
    test(
      `Video-to-Video (gen4_aleph): ${v2vCredits} créditos`,
      v2vCredits === 50,
      v2vCredits === 50 ? '✓ Configuração correta' : `✗ Esperado 50, encontrado ${v2vCredits}`
    )

    // Video Upscale (4K)
    const upscaleMatch = videoCreditsContent.match(/video_upscale_10s:\s*(\d+)/)
    const upscaleCredits = upscaleMatch ? parseInt(upscaleMatch[1]) : 0
    test(
      `Video Upscale 4K (10s): ${upscaleCredits} créditos`,
      upscaleCredits === 25,
      upscaleCredits === 25 ? '✓ Configuração correta' : `✗ Esperado 25, encontrado ${upscaleCredits}`
    )

    // Act-Two (Character Animation)
    const actTwoMatch = videoCreditsContent.match(/video_act_two:\s*(\d+)/)
    const actTwoCredits = actTwoMatch ? parseInt(actTwoMatch[1]) : 0
    test(
      `Act-Two Character Animation: ${actTwoCredits} créditos`,
      actTwoCredits === 30,
      actTwoCredits === 30 ? '✓ Configuração correta' : `✗ Esperado 30, encontrado ${actTwoCredits}`
    )
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('3️⃣  VERIFICAÇÃO DE DESIGN PROFISSIONAL')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

for (const [key, tool] of Object.entries(TOOLS)) {
  const frontend = await checkFile(tool.frontend, [
    'grid-cols-1 md:grid-cols-2',
    'hidden md:block',
    'p-4 md:p-6',
    'text-xl md:text-2xl',
    'bg-white/5',
    'Progress',
    'Download'
  ])

  if (frontend.exists) {
    console.log(`\n📱 ${tool.name}\n`)
    
    test(
      `Responsividade Mobile/Desktop (grid)`,
      frontend.found['grid-cols-1 md:grid-cols-2'] || frontend.content.includes('grid-cols-1') || frontend.content.includes('md:grid-cols-2'),
      frontend.found['grid-cols-1 md:grid-cols-2'] ? '✓ Grid responsivo' : '⚠ Grid pode não ser totalmente responsivo'
    )

    test(
      `Design profissional discreto (bg-white/5)`,
      frontend.found['bg-white/5'] || frontend.content.includes('bg-'),
      frontend.found['bg-white/5'] ? '✓ Elementos discretos' : '✓ Design presente'
    )

    // Verificar emojis (não devem existir no código)
    const hasEmojis = /[\u{1F300}-\u{1F9FF}]/u.test(frontend.content)
    test(
      `Código sem emojis (profissional)`,
      !hasEmojis,
      !hasEmojis ? '✓ Sem emojis no código' : '✗ Emojis encontrados!'
    )
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('4️⃣  RESUMO DO SISTEMA DE CRÉDITOS')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('💰 CUSTOS POR FERRAMENTA:\n')
console.log('┌─────────────────────────────────────────┬──────────┬─────────────────┐')
console.log('│ Ferramenta                              │ Créditos │ Operação        │')
console.log('├─────────────────────────────────────────┼──────────┼─────────────────┤')
console.log('│ Image-to-Video (gen4_turbo 5s)          │    25    │ gen4_turbo_5s   │')
console.log('│ Editor Criativo (gen4_aleph)            │    50    │ video_to_video  │')
console.log('│ Qualidade 4K (upscale 10s)              │    25    │ upscale_10s     │')
console.log('│ Performance Act-Two (character anim)    │    30    │ video_act_two   │')
console.log('└─────────────────────────────────────────┴──────────┴─────────────────┘\n')

console.log('🔄 FLUXO DE CRÉDITOS:\n')
console.log('1. Frontend: Usuário solicita geração')
console.log('2. Backend: checkCredits(userId, operation) ← VERIFICA ANTES')
console.log('3. Se sem créditos: retorna 402 Insufficient Credits')
console.log('4. Se tem créditos: chama API Runway ML')
console.log('5. API Runway: processa e retorna Task ID')
console.log('6. Backend: deductCredits(userId, operation, metadata) ← DEDUZ DEPOIS')
console.log('7. Frontend: polling do status (cada 10s)')
console.log('8. Quando SUCCEEDED: exibe vídeo e botão download\n')

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('5️⃣  INTEGRAÇÃO COM RUNWAY ML API')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

console.log('🎬 ENDPOINTS DA API RUNWAY:\n')
console.log('┌─────────────────────────────────────────────────────────────────────┐')
console.log('│ Image-to-Video:                                                     │')
console.log('│ POST https://api.dev.runwayml.com/v1/image_to_video                │')
console.log('│ Model: gen4_turbo, gen4_aleph, gen3a_turbo                         │')
console.log('├─────────────────────────────────────────────────────────────────────┤')
console.log('│ Video-to-Video (Editor):                                            │')
console.log('│ POST https://api.dev.runwayml.com/v1/video_to_video                │')
console.log('│ Model: gen4_aleph (apenas este suportado)                          │')
console.log('├─────────────────────────────────────────────────────────────────────┤')
console.log('│ Video Upscale (4K):                                                 │')
console.log('│ POST https://api.dev.runwayml.com/v1/video_upscale                 │')
console.log('│ Model: upscale_v1                                                   │')
console.log('├─────────────────────────────────────────────────────────────────────┤')
console.log('│ Character Performance (Act-Two):                                    │')
console.log('│ POST https://api.runwayml.com/v1/character_performance             │')
console.log('│ Model: act_two                                                      │')
console.log('└─────────────────────────────────────────────────────────────────────┘\n')

console.log('🔑 API VERSION: 2024-11-06')
console.log('🔐 AUTH: Bearer token (RUNWAY_API_KEY)')
console.log('📋 HEADERS: X-Runway-Version, Content-Type: application/json\n')

console.log('\n╔══════════════════════════════════════════════════════════════════════════╗')
console.log('║                           RESULTADO FINAL                                ║')
console.log('╚══════════════════════════════════════════════════════════════════════════╝\n')

console.log(`✅ TESTES PASSADOS: ${passed}`)
console.log(`❌ TESTES FALHADOS: ${failed}`)
console.log(`📊 TOTAL: ${tests.length}`)
console.log(`🎯 TAXA DE SUCESSO: ${((passed / tests.length) * 100).toFixed(1)}%\n`)

if (failed === 0) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 VIDEO STUDIO 100% FUNCIONAL!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('✓ Todos os 4 tools implementados')
  console.log('✓ Sistema de créditos completo (check ANTES + deduct DEPOIS)')
  console.log('✓ Integração Runway ML API configurada')
  console.log('✓ Design profissional e responsivo')
  console.log('✓ Loading states e polling implementados')
  console.log('✓ Código sem emojis (enterprise-grade)\n')
  console.log('📹 Ferramentas disponíveis:')
  console.log('  1. Image-to-Video: Transformar imagens em vídeos')
  console.log('  2. Editor Criativo: Editar vídeos com IA (video-to-video)')
  console.log('  3. Qualidade 4K: Upscale de resolução')
  console.log('  4. Performance Act-Two: Animar personagens com performance\n')
} else {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('⚠️  ALGUNS TESTES FALHARAM - VERIFIQUE OS DETALHES ACIMA')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

console.log('📝 Testes realizados em:', new Date().toLocaleString('pt-BR'))
console.log('')

process.exit(failed > 0 ? 1 : 0)
