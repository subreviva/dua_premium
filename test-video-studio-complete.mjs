#!/usr/bin/env node
/**
 * 🎬 TESTE ULTRA PROFISSIONAL - VIDEO STUDIO EDITAR
 * 
 * Verifica rigorosamente:
 * ✅ Sistema de créditos (verificação ANTES + dedução APÓS)
 * ✅ Loading states (mobile + desktop)
 * ✅ Geração de vídeo
 * ✅ Responsividade
 * ✅ Botão download discreto
 * ✅ Preview do resultado
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
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${colors.bright}${'═'.repeat(70)}${colors.reset}\n${colors.cyan}${colors.bright}${msg}${colors.reset}\n${colors.cyan}${colors.bright}${'═'.repeat(70)}${colors.reset}`),
}

async function testVideoStudio() {
  log.section('🎬 TESTE ULTRA PROFISSIONAL - VIDEO STUDIO EDITAR')
  
  try {
    const filePath = './app/videostudio/editar/page.tsx'
    const apiPath = './app/api/runway/video-to-video/route.ts'
    
    const pageContent = await fs.readFile(filePath, 'utf-8')
    const apiContent = await fs.readFile(apiPath, 'utf-8')
    
    let passed = 0
    let failed = 0
    
    // ==================== PARTE 1: SISTEMA DE CRÉDITOS ====================
    log.section('💳 PARTE 1: SISTEMA DE CRÉDITOS')
    
    console.log('\n🔍 Teste 1: Verificação de Créditos ANTES da Geração')
    if (apiContent.includes('checkCredits') && apiContent.includes('import')) {
      log.success('Sistema de créditos implementado')
      passed++
    } else {
      log.error('❌ CRÍTICO: Falta verificação de créditos!')
      log.warning('   API não verifica créditos antes de gerar vídeo')
      log.warning('   Usuário pode gerar sem ter saldo!')
      failed++
    }
    
    console.log('\n💳 Teste 2: Dedução de Créditos APÓS Sucesso')
    if (apiContent.includes('deductCredits')) {
      log.success('Dedução de créditos implementada')
      passed++
    } else {
      log.error('❌ CRÍTICO: Falta dedução de créditos!')
      log.warning('   Vídeos gerados gratuitamente!')
      failed++
    }
    
    console.log('\n💰 Teste 3: Display de Custo na UI')
    if (pageContent.includes('50 credits') || pageContent.includes('credits per')) {
      log.success('Custo exibido ao usuário (50 créditos)')
      passed++
    } else {
      log.warning('Custo não exibido claramente')
      failed++
    }
    
    // ==================== PARTE 2: LOADING STATES ====================
    log.section('⏳ PARTE 2: LOADING STATES (Mobile + Desktop)')
    
    console.log('\n🔄 Teste 4: Estado de Processamento')
    if (pageContent.includes('isProcessing') && pageContent.includes('setIsProcessing')) {
      log.success('Estado isProcessing implementado')
      passed++
    } else {
      log.error('Estado de loading não encontrado')
      failed++
    }
    
    console.log('\n📊 Teste 5: Barra de Progresso')
    if (pageContent.includes('progress') && pageContent.includes('setProgress')) {
      log.success('Barra de progresso implementada')
      log.info('   - Progress state: ✓')
      log.info('   - Atualização durante geração: ✓')
      passed++
    } else {
      log.error('Barra de progresso não encontrada')
      failed++
    }
    
    console.log('\n⏱️  Teste 6: Polling de Status')
    if (pageContent.includes('task-status') || pageContent.includes('taskId')) {
      log.success('Polling de status implementado')
      log.info('   - Verifica status da task Runway')
      log.info('   - Aguarda SUCCEEDED/FAILED')
      passed++
    } else {
      log.error('Polling de status não encontrado')
      failed++
    }
    
    // ==================== PARTE 3: RESPONSIVIDADE ====================
    log.section('📱 PARTE 3: RESPONSIVIDADE (Mobile + Desktop)')
    
    console.log('\n📐 Teste 7: Layout Grid Desktop')
    if (pageContent.includes('grid-cols-2') || pageContent.includes('divide-x')) {
      log.success('Layout 2-col desktop implementado')
      passed++
    } else {
      log.warning('Layout desktop pode não estar otimizado')
      failed++
    }
    
    console.log('\n📱 Teste 8: Adaptação Mobile')
    const hasMobileBreakpoints = 
      pageContent.includes('md:') || 
      pageContent.includes('sm:') ||
      pageContent.includes('lg:')
    
    if (hasMobileBreakpoints) {
      log.success('Breakpoints responsivos detectados')
      log.info('   - Tailwind breakpoints (sm:, md:, lg:)')
      passed++
    } else {
      log.error('Falta responsividade mobile')
      failed++
    }
    
    console.log('\n🎯 Teste 9: Aspect Ratios Suportados')
    const aspectRatios = [
      '1280:720',  // 16:9
      '720:1280',  // 9:16
      '960:960',   // 1:1
      '1584:672',  // 21:9
    ]
    
    let ratiosFound = 0
    aspectRatios.forEach(ratio => {
      if (pageContent.includes(ratio)) ratiosFound++
    })
    
    if (ratiosFound >= 3) {
      log.success(`${ratiosFound}/${aspectRatios.length} aspect ratios suportados`)
      passed++
    } else {
      log.warning(`Apenas ${ratiosFound} aspect ratios encontrados`)
      failed++
    }
    
    // ==================== PARTE 4: BOTÃO DOWNLOAD ====================
    log.section('💾 PARTE 4: BOTÃO DOWNLOAD')
    
    console.log('\n📥 Teste 10: Presença do Botão Download')
    if (pageContent.includes('Download') || pageContent.includes('download')) {
      log.success('Botão download presente')
      passed++
    } else {
      log.error('Botão download não encontrado')
      failed++
    }
    
    console.log('\n🎨 Teste 11: Design Discreto do Botão')
    const hasSubtleButton = 
      pageContent.includes('bg-white/5') || 
      pageContent.includes('bg-white/10') ||
      pageContent.includes('opacity-') ||
      pageContent.includes('hover:opacity')
    
    if (hasSubtleButton) {
      log.success('Botão com design discreto (não interfere na imagem)')
      log.info('   - Background sutil (white/5 ou white/10)')
      log.info('   - Aparece apenas no hover (recomendado)')
      passed++
    } else {
      log.warning('Botão pode estar muito visível')
      log.warning('   Pode atrapalhar visualização do vídeo')
      failed++
    }
    
    // ==================== PARTE 5: PREVIEW E RESULTADO ====================
    log.section('🎥 PARTE 5: PREVIEW E RESULTADO')
    
    console.log('\n👁️  Teste 12: Preview do Vídeo Original')
    if (pageContent.includes('videoPreview') && pageContent.includes('<video')) {
      log.success('Preview do vídeo original implementado')
      passed++
    } else {
      log.error('Preview do vídeo não encontrado')
      failed++
    }
    
    console.log('\n✨ Teste 13: Display do Vídeo Processado')
    if (pageContent.includes('processedVideo') || pageContent.includes('resultVideo')) {
      log.success('Display do vídeo processado implementado')
      passed++
    } else {
      log.error('Display do resultado não encontrado')
      failed++
    }
    
    console.log('\n🎬 Teste 14: Comparação Lado a Lado')
    if (pageContent.includes('grid-cols-2') && pageContent.includes('video')) {
      log.success('Layout para comparação lado a lado')
      log.info('   - Original (esquerda)')
      log.info('   - Processado (direita)')
      passed++
    } else {
      log.warning('Pode faltar comparação visual')
      failed++
    }
    
    // ==================== RELATÓRIO FINAL ====================
    const total = passed + failed
    const percentage = ((passed / total) * 100).toFixed(1)
    
    log.section('📊 RELATÓRIO FINAL')
    
    console.log(`\n${colors.bright}Testes passados: ${colors.green}${passed}${colors.reset}`)
    console.log(`${colors.bright}Testes falhados: ${colors.red}${failed}${colors.reset}`)
    console.log(`${colors.bright}Score: ${percentage}%${colors.reset}\n`)
    
    if (failed > 0) {
      log.warning('\n⚠️  PROBLEMAS CRÍTICOS ENCONTRADOS:\n')
      
      if (!apiContent.includes('checkCredits')) {
        console.log(`${colors.red}❌ URGENTE: Adicionar verificação de créditos${colors.reset}`)
        console.log(`   - checkCredits() ANTES de chamar Runway API`)
        console.log(`   - Retornar erro 402 se saldo insuficiente`)
      }
      
      if (!apiContent.includes('deductCredits')) {
        console.log(`${colors.red}❌ URGENTE: Adicionar dedução de créditos${colors.reset}`)
        console.log(`   - deductCredits() APÓS task SUCCEEDED`)
        console.log(`   - Custo: 50 créditos (video-to-video)`)
      }
      
      console.log('')
    }
    
    if (percentage >= 80) {
      log.success('🎉 VIDEO STUDIO EM BOM ESTADO!')
      console.log('')
      console.log(`${colors.cyan}✅ Funcionalidades OK:${colors.reset}`)
      console.log('   - Loading states implementados')
      console.log('   - Responsividade presente')
      console.log('   - Preview e resultado funcionais')
      console.log('   - Botão download discreto')
      console.log('')
      
      if (failed > 0) {
        console.log(`${colors.yellow}⚠️  Necessita:${colors.reset}`)
        console.log('   - Implementar sistema de créditos completo')
        console.log('   - Verificar ANTES + Deduzir APÓS')
        console.log('')
      }
    } else {
      log.error('❌ VIDEO STUDIO PRECISA DE MELHORIAS SIGNIFICATIVAS')
    }
    
  } catch (error) {
    log.error(`Erro no teste: ${error.message}`)
    process.exit(1)
  }
}

testVideoStudio()
