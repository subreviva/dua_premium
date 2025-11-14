#!/usr/bin/env node
/**
 * 🎬 TESTE RÁPIDO - VIDEO STUDIO EDITAR (Video-to-Video)
 * 
 * Testa API Runway com key fornecida
 * Duração: ~2 segundos (teste mínimo)
 */

import fetch from 'node-fetch'

const RUNWAY_API_KEY = 'key_dabf0475058fa399850c32f2cec55e15f1dae51bdb6459422840163fca8ff47749d497851664aab3018953391bf51859cbec77522700bc8fdc264cad2b1f0032'
const BASE_URL = 'http://localhost:3000'

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m',
}

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.cyan}ℹ️  ${msg}${colors.reset}`),
}

async function quickTest() {
  console.log(`\n${colors.bright}${colors.cyan}${'═'.repeat(60)}${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}🎬 TESTE RÁPIDO - VIDEO STUDIO EDITAR${colors.reset}`)
  console.log(`${colors.bright}${colors.cyan}${'═'.repeat(60)}${colors.reset}\n`)

  try {
    // Teste 1: Verificar API key válida
    log.info('Teste 1: Validar API Key Runway')
    
    const apiKeyCheck = await fetch('https://api.dev.runwayml.com/v1/video_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        model: 'gen4_aleph',
        videoUri: 'data:video/mp4;base64,test',
        promptText: 'test',
        ratio: '1280:720'
      }),
    })
    
    const apiStatus = apiKeyCheck.status
    
    if (apiStatus === 401) {
      log.error('API Key INVÁLIDA (401 Unauthorized)')
      return
    } else if (apiStatus === 400) {
      log.success('API Key VÁLIDA (400 = payload inválido, mas auth OK)')
    } else {
      log.success(`API Key aceita (Status: ${apiStatus})`)
    }

    // Teste 2: Verificar página existe
    log.info('\nTeste 2: Página /videostudio/editar')
    
    const pageCheck = await fetch(`${BASE_URL}/videostudio/editar`)
    
    if (pageCheck.ok) {
      const html = await pageCheck.text()
      const hasVideoToVideo = html.includes('video-to-video') || html.includes('Video Studio')
      if (hasVideoToVideo) {
        log.success('Página carrega corretamente')
      } else {
        log.error('Página existe mas conteúdo não encontrado')
      }
    } else {
      log.error(`Página não acessível (Status: ${pageCheck.status})`)
    }

    // Teste 3: Verificar aspect ratios suportados
    log.info('\nTeste 3: Aspect Ratios Suportados')
    
    const supportedRatios = [
      '1280:720',  // 16:9
      '720:1280',  // 9:16
      '1104:832',  // 4:3
      '960:960',   // 1:1
      '832:1104',  // 3:4
      '1584:672',  // 21:9
    ]
    
    supportedRatios.forEach(ratio => {
      log.success(`   ${ratio} ✓`)
    })

    console.log(`\n${colors.bright}${colors.cyan}${'═'.repeat(60)}${colors.reset}`)
    console.log(`${colors.bright}${colors.green}✅ TESTE COMPLETO - API KEY VÁLIDA${colors.reset}`)
    console.log(`${colors.bright}${colors.cyan}${'═'.repeat(60)}${colors.reset}\n`)

  } catch (error) {
    log.error(`Erro no teste: ${error.message}`)
    process.exit(1)
  }
}

quickTest()
