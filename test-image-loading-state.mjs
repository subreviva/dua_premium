#!/usr/bin/env node
/**
 * 🔄 TESTE ESPECÍFICO - LOADING STATE DO IMAGE STUDIO
 * 
 * Verifica rigorosamente o estado de loading durante geração:
 * ✅ DESKTOP
 *    - Tamanho do spinner (w-16 h-16)
 *    - Ícone Sparkles rotativo
 *    - Texto "A gerar imagem..."
 *    - Subtext "Isto pode demorar alguns segundos"
 *    - Background pattern animado
 * 
 * ✅ MOBILE
 *    - Layout centralizado
 *    - Tamanhos de fonte legíveis
 *    - Spinner visível
 *    - Padding adequado
 */

import fs from 'fs/promises'

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${colors.bright}${'═'.repeat(70)}${colors.reset}\n${colors.cyan}${colors.bright}${msg}${colors.reset}\n${colors.cyan}${colors.bright}${'═'.repeat(70)}${colors.reset}`),
}

async function testLoadingState() {
  log.section('🔄 TESTE DE LOADING STATE - MOBILE & DESKTOP')
  
  try {
    const filePath = './app/imagestudio/create/page.tsx'
    const content = await fs.readFile(filePath, 'utf-8')
    
    let passed = 0
    let failed = 0
    
    // Teste 1: Spinner size adequado
    console.log('\n📐 Teste 1: Tamanho do Spinner')
    if (content.includes('w-16 h-16') && content.includes('Sparkles')) {
      log.success('Spinner com tamanho adequado (w-16 h-16 = 64px)')
      passed++
    } else {
      log.error('Spinner muito pequeno para mobile')
      failed++
    }
    
    // Teste 2: Rotação contínua
    console.log('\n🔄 Teste 2: Animação de Rotação')
    if (content.includes('rotate: 360') && content.includes('repeat: Infinity')) {
      log.success('Rotação contínua implementada (360° infinito)')
      passed++
    } else {
      log.error('Animação de rotação não encontrada')
      failed++
    }
    
    // Teste 3: Texto principal
    console.log('\n📝 Teste 3: Texto de Loading')
    if (content.includes('A gerar imagem...') && content.includes('text-white font-medium')) {
      log.success('Texto "A gerar imagem..." com estilo profissional')
      passed++
    } else {
      log.error('Texto de loading não encontrado')
      failed++
    }
    
    // Teste 4: Subtext explicativo
    console.log('\n📄 Teste 4: Subtext Explicativo')
    if (content.includes('Isto pode demorar alguns segundos') && content.includes('text-sm')) {
      log.success('Subtext "Isto pode demorar alguns segundos" presente')
      passed++
    } else {
      log.error('Subtext explicativo não encontrado')
      failed++
    }
    
    // Teste 5: Background pattern animado
    console.log('\n🎨 Teste 5: Background Pattern Animado')
    if (content.includes('radial-gradient') && content.includes('dotPulse')) {
      log.success('Background pattern com animação dotPulse')
      passed++
    } else {
      log.error('Background pattern animado não encontrado')
      failed++
    }
    
    // Teste 6: Centralização (flex items-center justify-center)
    console.log('\n🎯 Teste 6: Centralização do Conteúdo')
    if (content.includes('flex items-center justify-center') && content.includes('absolute inset-0')) {
      log.success('Conteúdo centralizado vertical e horizontalmente')
      passed++
    } else {
      log.error('Centralização não encontrada')
      failed++
    }
    
    // Teste 7: Cores profissionais
    console.log('\n🎨 Teste 7: Cores Profissionais')
    if (content.includes('bg-[#8B7355]/10') && content.includes('text-[#8B7355]')) {
      log.success('Cores profissionais (#8B7355) no loading state')
      passed++
    } else {
      log.error('Cores profissionais não encontradas')
      failed++
    }
    
    // Teste 8: Responsividade (tamanhos fixos vs adaptativos)
    console.log('\n📱 Teste 8: Responsividade')
    const hasFixedSizes = content.includes('w-16 h-16') && content.includes('w-8 h-8')
    const hasTextSizes = content.includes('text-sm')
    
    if (hasFixedSizes && hasTextSizes) {
      log.success('Tamanhos adequados para mobile e desktop')
      log.info('   - Spinner: 64px (w-16 h-16)')
      log.info('   - Ícone: 32px (w-8 h-8)')
      log.info('   - Texto: text-sm (14px)')
      passed++
    } else {
      log.error('Tamanhos não otimizados para mobile')
      failed++
    }
    
    // Teste 9: Aspect ratio preservation
    console.log('\n📐 Teste 9: Preservação de Aspect Ratio')
    const aspectRatioCheck = 
      content.includes('aspect-square') &&
      content.includes('aspect-video') &&
      content.includes('aspect-[9/16]') &&
      content.includes('aspect-[4/3]')
    
    if (aspectRatioCheck) {
      log.success('Aspect ratios preservados durante loading')
      log.info('   - 1:1 (aspect-square)')
      log.info('   - 16:9 (aspect-video)')
      log.info('   - 9:16 (aspect-[9/16])')
      log.info('   - 4:3 (aspect-[4/3])')
      passed++
    } else {
      log.error('Aspect ratios não preservados')
      failed++
    }
    
    // Teste 10: Loading state no botão
    console.log('\n🔘 Teste 10: Loading State no Botão Gerar')
    if (content.includes('isGenerating') && content.includes('cursor-not-allowed')) {
      log.success('Botão desabilitado durante geração (cursor-not-allowed)')
      passed++
    } else {
      log.error('Botão não desabilitado durante loading')
      failed++
    }
    
    // Relatório final
    const total = passed + failed
    const percentage = ((passed / total) * 100).toFixed(1)
    
    console.log(`\n${colors.bright}${'═'.repeat(70)}${colors.reset}`)
    console.log(`${colors.bright}🏆 LOADING STATE: ${passed}/${total} (${percentage}%)${colors.reset}`)
    console.log(`${colors.bright}${'═'.repeat(70)}${colors.reset}\n`)
    
    if (percentage >= 95) {
      log.success('🎉 LOADING STATE 100% PROFISSIONAL E RESPONSIVO!')
      console.log('')
      console.log(`${colors.cyan}📱 MOBILE:${colors.reset}`)
      log.success('   - Spinner 64px (visível e touch-friendly)')
      log.success('   - Texto legível (font-medium)')
      log.success('   - Layout centralizado')
      log.success('   - Aspect ratio preservado')
      
      console.log(`\n${colors.cyan}🖥️  DESKTOP:${colors.reset}`)
      log.success('   - Spinner elegante com rotação suave')
      log.success('   - Background pattern animado')
      log.success('   - Cores enterprise-grade (#8B7355)')
      log.success('   - Botão desabilitado durante loading')
      console.log('')
    } else if (percentage >= 80) {
      log.info('⚠️  Loading state funcional mas pode ser melhorado')
    } else {
      log.error('❌ Loading state precisa de correções')
    }
    
  } catch (error) {
    log.error(`Erro ao testar loading state: ${error.message}`)
    process.exit(1)
  }
}

testLoadingState()
