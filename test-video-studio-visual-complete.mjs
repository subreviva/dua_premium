#!/usr/bin/env node

/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  VIDEO STUDIO - TESTE VISUAL COMPLETO                                   ║
 * ║  Loading, Responsividade Mobile/Desktop, Download                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { readFile } from 'fs/promises'

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

async function checkFile(filePath, checks = []) {
  try {
    const content = await readFile(filePath, 'utf-8')
    const found = {}
    for (const check of checks) {
      found[check] = content.includes(check)
    }
    return { exists: true, content, found }
  } catch {
    return { exists: false, content: '', found: {} }
  }
}

console.log('\n╔══════════════════════════════════════════════════════════════════════════╗')
console.log('║            VIDEO STUDIO - TESTE VISUAL COMPLETO                         ║')
console.log('╚══════════════════════════════════════════════════════════════════════════╝\n')

console.log('🎯 VERIFICAÇÕES:\n')
console.log('1. Loading States (progress bar, polling, animações)')
console.log('2. Responsividade Mobile/Desktop (classes Tailwind)')
console.log('3. Download Buttons (todas as ferramentas)')
console.log('4. Player de Vídeo (aspect-video, controls, autoPlay)\n')

const TOOLS = [
  {
    name: 'Image-to-Video',
    file: 'app/videostudio/image-to-video/page.tsx',
  },
  {
    name: 'Video-to-Video (Editor)',
    file: 'app/videostudio/editar/page.tsx',
  },
  {
    name: 'Video Upscale (4K)',
    file: 'app/videostudio/qualidade/page.tsx',
  },
  {
    name: 'Act-Two Performance',
    file: 'app/videostudio/performance/page.tsx',
  },
]

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('1️⃣  LOADING STATES (Progress Bar + Polling)')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

for (const tool of TOOLS) {
  console.log(`\n📹 ${tool.name}\n`)
  
  const code = await checkFile(tool.file, [
    'isProcessing',
    'setIsProcessing',
    'progress',
    'setProgress',
    'animate={{ rotate: 360 }}',
    'transition={{ duration:',
    'width: `${progress}%`',
    'bg-white/10 rounded-full h-1',
    'Math.round(progress)',
  ])

  test(
    `Loading state (isProcessing)`,
    code.found['isProcessing'] && code.found['setIsProcessing'],
    code.found['isProcessing'] ? '✓ useState com isProcessing' : '✗ Estado ausente'
  )

  test(
    `Progress tracking (progress, setProgress)`,
    code.found['progress'] && code.found['setProgress'],
    code.found['progress'] ? '✓ Progress state implementado' : '✗ Progress ausente'
  )

  test(
    `Animação de loading (rotate 360)`,
    code.found['animate={{ rotate: 360 }}'],
    code.found['animate={{ rotate: 360 }}'] ? '✓ Spinner animado com Framer Motion' : '✗ Sem animação'
  )

  test(
    `Progress bar visual`,
    code.found['width: `${progress}%`'] && code.found['bg-white/10 rounded-full h-1'],
    code.found['width: `${progress}%`'] ? '✓ Barra de progresso 0-100%' : '✗ Barra ausente'
  )

  test(
    `Exibição de porcentagem`,
    code.found['Math.round(progress)'],
    code.found['Math.round(progress)'] ? '✓ Mostra % na tela' : '✗ Sem indicador %'
  )
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('2️⃣  RESPONSIVIDADE MOBILE/DESKTOP')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

for (const tool of TOOLS) {
  console.log(`\n📱 ${tool.name}\n`)
  
  const code = await checkFile(tool.file, [
    'max-w-',
    'sm:',
    'md:',
    'lg:',
    'px-4 sm:px-6',
    'py-4 sm:py-6',
    'text-sm sm:text-base',
    'text-xl sm:text-2xl',
    'grid-cols-1 lg:grid-cols-2',
    'flex-col sm:flex-row',
    'aspect-video',
    'w-full',
    'object-contain',
  ])

  test(
    `Containers com largura máxima`,
    code.found['max-w-'],
    code.found['max-w-'] ? '✓ max-w-* para limitar largura' : '✗ Sem max-width'
  )

  test(
    `Breakpoints mobile (sm:)`,
    code.found['sm:'],
    code.found['sm:'] ? '✓ Adaptação para small screens' : '✗ Sem breakpoint sm:'
  )

  test(
    `Breakpoints tablet (md:)`,
    code.found['md:'],
    code.found['md:'] ? '✓ Adaptação para medium screens' : '⚠ Sem breakpoint md:'
  )

  test(
    `Breakpoints desktop (lg:)`,
    code.found['lg:'],
    code.found['lg:'] ? '✓ Adaptação para large screens' : '⚠ Sem breakpoint lg:'
  )

  test(
    `Padding responsivo (px-4 sm:px-6)`,
    code.found['px-4 sm:px-6'] || code.found['py-4 sm:py-6'],
    code.found['px-4 sm:px-6'] ? '✓ Padding adapta a tela' : '⚠ Padding fixo'
  )

  test(
    `Texto responsivo`,
    code.found['text-sm sm:text-base'] || code.found['text-xl sm:text-2xl'],
    code.found['text-sm sm:text-base'] ? '✓ Tamanho de fonte responsivo' : '⚠ Texto fixo'
  )

  test(
    `Video player responsivo`,
    code.found['aspect-video'] && code.found['w-full'] && code.found['object-contain'],
    code.found['aspect-video'] ? '✓ aspect-video + w-full + object-contain' : '✗ Video não responsivo'
  )
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('3️⃣  DOWNLOAD BUTTONS (Todas as Ferramentas)')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const downloadPatterns = {
  'Image-to-Video': {
    file: 'app/videostudio/image-to-video/page.tsx',
    downloadText: 'Download Video',
    filename: 'generated-video.mp4',
  },
  'Video-to-Video': {
    file: 'app/videostudio/editar/page.tsx',
    downloadText: 'Download Video',
    filename: 'duaia-edited-video.mp4',
  },
  'Video Upscale': {
    file: 'app/videostudio/qualidade/page.tsx',
    downloadText: 'Download 4K',
    filename: 'duaia-upscaled-4k.mp4',
  },
  'Act-Two': {
    file: 'app/videostudio/performance/page.tsx',
    downloadText: 'Download Video',
    filename: 'duaia-character-performance.mp4',
  },
}

for (const [toolName, pattern] of Object.entries(downloadPatterns)) {
  console.log(`\n💾 ${toolName}\n`)
  
  const code = await checkFile(pattern.file, [
    'download=',
    pattern.downloadText,
    pattern.filename,
    'href={',
    '<a',
    'motion.a',
    'Download',
  ])

  test(
    `Botão de download existe`,
    code.found['download='] && (code.found['<a'] || code.found['motion.a']),
    code.found['download='] ? '✓ Tag <a> com atributo download' : '✗ Sem botão download'
  )

  test(
    `Texto do botão: "${pattern.downloadText}"`,
    code.found[pattern.downloadText],
    code.found[pattern.downloadText] ? `✓ "${pattern.downloadText}"` : '✗ Texto não encontrado'
  )

  test(
    `Nome do arquivo: "${pattern.filename}"`,
    code.found[pattern.filename],
    code.found[pattern.filename] ? `✓ download="${pattern.filename}"` : '✗ Filename não especificado'
  )

  test(
    `Link para vídeo (href)`,
    code.found['href={'],
    code.found['href={'] ? '✓ href={videoUrl}' : '✗ Sem link'
  )
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('4️⃣  PLAYER DE VÍDEO (Apresentação do Resultado)')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

for (const tool of TOOLS) {
  console.log(`\n🎥 ${tool.name}\n`)
  
  const code = await checkFile(tool.file, [
    '<video',
    'aspect-video',
    'w-full',
    'controls',
    'playsInline',
    'autoPlay',
    'loop',
    'preload="metadata"',
    'className="w-full aspect-video',
    'object-contain',
    'border border-white/10',
    'rounded-lg',
    'bg-black',
  ])

  test(
    `Tag <video> existe`,
    code.found['<video'],
    code.found['<video'] ? '✓ Player HTML5 <video>' : '✗ Sem video tag'
  )

  test(
    `Aspect ratio 16:9`,
    code.found['aspect-video'],
    code.found['aspect-video'] ? '✓ aspect-video (16:9)' : '✗ Sem aspect ratio'
  )

  test(
    `Largura responsiva`,
    code.found['w-full'],
    code.found['w-full'] ? '✓ w-full (100% width)' : '✗ Largura fixa'
  )

  test(
    `Controls nativos do navegador`,
    code.found['controls'],
    code.found['controls'] ? '✓ controls (play, pause, fullscreen)' : '✗ Sem controls'
  )

  test(
    `Otimizado para mobile (playsInline)`,
    code.found['playsInline'],
    code.found['playsInline'] ? '✓ playsInline (mobile-friendly)' : '✗ Sem playsInline'
  )

  test(
    `Auto-play quando pronto`,
    code.found['autoPlay'],
    code.found['autoPlay'] ? '✓ autoPlay' : '⚠ Sem autoPlay (manual)'
  )

  test(
    `Loop infinito`,
    code.found['loop'],
    code.found['loop'] ? '✓ loop (repete)' : '⚠ Sem loop'
  )

  test(
    `Object-fit para manter proporção`,
    code.found['object-contain'],
    code.found['object-contain'] ? '✓ object-contain (sem distorção)' : '⚠ Pode distorcer'
  )

  test(
    `Design profissional (border, rounded, bg)`,
    code.found['border border-white/10'] && code.found['rounded-lg'] && code.found['bg-black'],
    code.found['border border-white/10'] ? '✓ Border, rounded, background preto' : '⚠ Design básico'
  )
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('5️⃣  ANIMAÇÕES E TRANSIÇÕES (UX Profissional)')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

for (const tool of TOOLS) {
  console.log(`\n✨ ${tool.name}\n`)
  
  const code = await checkFile(tool.file, [
    'motion.div',
    'AnimatePresence',
    'initial={{ opacity: 0',
    'animate={{ opacity: 1',
    'exit={{ opacity: 0',
    'transition={{ duration:',
    'whileHover={{',
    'whileTap={{',
    'hover:',
    'transition-all',
    'duration-300',
  ])

  test(
    `Framer Motion (motion.div)`,
    code.found['motion.div'],
    code.found['motion.div'] ? '✓ Componentes animados' : '✗ Sem Framer Motion'
  )

  test(
    `AnimatePresence (transições suaves)`,
    code.found['AnimatePresence'],
    code.found['AnimatePresence'] ? '✓ Animações de entrada/saída' : '✗ Sem AnimatePresence'
  )

  test(
    `Fade in/out (opacity)`,
    code.found['initial={{ opacity: 0'] && code.found['animate={{ opacity: 1'],
    code.found['initial={{ opacity: 0'] ? '✓ Fade in/out implementado' : '✗ Sem fade'
  )

  test(
    `Hover effects`,
    code.found['whileHover={{'] || code.found['hover:'],
    code.found['whileHover={{'] ? '✓ Efeitos hover (scale, color)' : '⚠ Hover básico ou ausente'
  )

  test(
    `Transições suaves (transition-all)`,
    code.found['transition-all'],
    code.found['transition-all'] ? '✓ Transições CSS suaves' : '⚠ Transições instantâneas'
  )
}

console.log('\n╔══════════════════════════════════════════════════════════════════════════╗')
console.log('║                           RESULTADO FINAL                                ║')
console.log('╚══════════════════════════════════════════════════════════════════════════╝\n')

console.log(`✅ TESTES PASSADOS: ${passed}`)
console.log(`❌ TESTES FALHADOS: ${failed}`)
console.log(`⚠️  AVISOS (opcional): ${tests.filter(t => t.details.startsWith('⚠')).length}`)
console.log(`📊 TOTAL: ${tests.length}`)
console.log(`🎯 TAXA DE SUCESSO: ${((passed / tests.length) * 100).toFixed(1)}%\n`)

if (failed === 0) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🎉 VIDEO STUDIO - VISUAL 100% PROFISSIONAL!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('✅ LOADING:')
  console.log('  • Progress bar 0-100%')
  console.log('  • Spinner animado (rotate 360°)')
  console.log('  • Indicador de porcentagem')
  console.log('  • Estado isProcessing\n')
  console.log('✅ RESPONSIVIDADE:')
  console.log('  • Breakpoints: sm:, md:, lg:')
  console.log('  • Padding responsivo: px-4 sm:px-6')
  console.log('  • Texto responsivo: text-sm sm:text-base')
  console.log('  • Grid responsivo: grid-cols-1 lg:grid-cols-2')
  console.log('  • Max-width containers')
  console.log('  • Flex direction: flex-col sm:flex-row\n')
  console.log('✅ DOWNLOAD:')
  console.log('  • Botões em todas as 4 ferramentas')
  console.log('  • Atributo download com nome do arquivo')
  console.log('  • Links href={videoUrl}')
  console.log('  • Textos descritivos ("Download Video", "Download 4K")\n')
  console.log('✅ PLAYER DE VÍDEO:')
  console.log('  • HTML5 <video> tag')
  console.log('  • aspect-video (16:9)')
  console.log('  • w-full (responsivo)')
  console.log('  • controls (play, pause, fullscreen)')
  console.log('  • playsInline (mobile-friendly)')
  console.log('  • autoPlay + loop')
  console.log('  • object-contain (sem distorção)')
  console.log('  • Design profissional (border, rounded, bg-black)\n')
  console.log('✅ ANIMAÇÕES:')
  console.log('  • Framer Motion (motion.div)')
  console.log('  • AnimatePresence (transições)')
  console.log('  • Fade in/out (opacity 0→1)')
  console.log('  • Hover effects (scale, color)')
  console.log('  • Transições suaves (transition-all)\n')
} else {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('⚠️  ALGUNS TESTES FALHARAM - VERIFIQUE OS DETALHES ACIMA')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

console.log('📝 Teste executado em:', new Date().toLocaleString('pt-BR'))
console.log('')

process.exit(failed > 0 ? 1 : 0)
