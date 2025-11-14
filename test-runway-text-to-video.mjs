#!/usr/bin/env node

/**
 * RUNWAY API - TESTE TEXT-TO-VIDEO (MAIS SIMPLES)
 * Text-to-video é mais simples pois não precisa de upload de arquivo
 */

const RUNWAY_API_KEY = 'key_1d0820d75b451974c91be5ffefe9850190cef3be243422b2363aee9b145d6a0aae3d9b00a4af08d9e94fcb191384d5fdecd7a41fd9b31a5225b1fa382fbe7edb'
const API_BASE = 'https://api.dev.runwayml.com/v1'
const API_VERSION = '2024-11-06'

console.log('\n' + '='.repeat(70))
console.log('RUNWAY TEXT-TO-VIDEO - GERACAO REAL')
console.log('='.repeat(70))
console.log('')

async function testTextToVideo() {
  const startTime = Date.now()
  
  try {
    console.log('[1/4] Criando task text-to-video...')
    console.log('Prompt: "A beautiful sunset over the ocean with golden light"')
    console.log('Modelo: gen3a_turbo (rapido)')
    console.log('Duracao: 5 segundos')
    console.log('')
    
    const createResponse = await fetch(`${API_BASE}/text_to_video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'X-Runway-Version': API_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gen3a_turbo',
        promptText: 'A beautiful sunset over the ocean with golden light',
        duration: 5,
        ratio: '1280:720'
      })
    })
    
    if (!createResponse.ok) {
      const error = await createResponse.json()
      throw new Error(`HTTP ${createResponse.status}: ${JSON.stringify(error)}`)
    }
    
    const taskData = await createResponse.json()
    const taskId = taskData.id
    
    console.log(`Task criada! ID: ${taskId}`)
    console.log(`Status inicial: ${taskData.status}`)
    console.log('')
    
    // Polling
    console.log('[2/4] Aguardando geracao (polling a cada 10s)...')
    console.log('')
    
    let attempts = 0
    const MAX_ATTEMPTS = 60 // 10 minutos
    let status = taskData.status
    let videoUrl = null
    
    while (status !== 'SUCCEEDED' && status !== 'FAILED' && attempts < MAX_ATTEMPTS) {
      attempts++
      await new Promise(resolve => setTimeout(resolve, 10000))
      
      const statusResponse = await fetch(`${API_BASE}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${RUNWAY_API_KEY}`,
          'X-Runway-Version': API_VERSION
        }
      })
      
      const statusData = await statusResponse.json()
      status = statusData.status
      const progress = statusData.progress || 0
      
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const progressBar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5))
      
      console.log(`[${attempts}/${MAX_ATTEMPTS}] ${progressBar} ${progress}% | ${status} | ${elapsed}s`)
      
      if (statusData.output && statusData.output.length > 0) {
        videoUrl = statusData.output[0]
      }
      
      if (status === 'SUCCEEDED' || status === 'FAILED') break
    }
    
    const totalTime = Math.floor((Date.now() - startTime) / 1000)
    
    console.log('')
    console.log('[3/4] Resultado:')
    console.log(`Status final: ${status}`)
    console.log(`Tempo total: ${totalTime}s`)
    console.log(`Tentativas: ${attempts}`)
    console.log('')
    
    if (status === 'SUCCEEDED' && videoUrl) {
      console.log('[4/4] VIDEO GERADO COM SUCESSO!')
      console.log('')
      console.log('URL do video:')
      console.log(videoUrl)
      console.log('')
      console.log('='.repeat(70))
      console.log('TESTE COMPLETO - FLUXO 100% FUNCIONAL')
      console.log('='.repeat(70))
      console.log('')
      console.log('Processo verificado:')
      console.log('  ✓ API key valida')
      console.log('  ✓ Task criada com sucesso')
      console.log('  ✓ Polling funcionando')
      console.log('  ✓ Video gerado e disponivel')
      console.log(`  ✓ Tempo total: ${totalTime}s`)
      console.log('')
    } else {
      console.log(`FALHA: ${status}`)
    }
    
  } catch (error) {
    console.error('\nERRO:', error.message)
    console.error(error)
    process.exit(1)
  }
}

testTextToVideo()
