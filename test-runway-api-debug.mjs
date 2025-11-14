#!/usr/bin/env node

/**
 * DEBUG DA RUNWAY API
 * Testa a API step-by-step para encontrar o problema
 */

// Testar múltiplas keys
const API_KEYS = [
  'key_abcfbca74812e2dde2b5c7a9c1f5ff18a6dbe9ef56ed1b58ce31a',
  'key_abcfbca74812e2dde2b5c7a9c1f5ff18a6dbe9ef56ed1b58ce31a3254544eb68a2add9b18cf16660a7aOa828958fa4426f2652b7309edbba8e2ca310fd41ca44'
]

const API_BASE = 'https://api.dev.runwayml.com/v1'
const API_VERSION = '2024-11-06'

console.log('='.repeat(70))
console.log('RUNWAY API - DEBUG')
console.log('='.repeat(70))
console.log('')

async function testKey(apiKey, index) {
  console.log(`\nTESTE ${index + 1}: Key ${apiKey.substring(0, 30)}...`)
  console.log('-'.repeat(70))
  
  try {
    // Testar com endpoint /me (se existir)
    console.log('1. Testando autenticacao...')
    
    const testResponse = await fetch(`${API_BASE}/video_to_video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Runway-Version': API_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gen4_aleph',
        promptText: 'test',
        videoUri: 'https://4j8t2e2ihcbtrish.public.blob.vercel-storage.com/v2v-gen4_aleph-input.mp4',
        ratio: '1280:720'
      })
    })
    
    const responseText = await testResponse.text()
    console.log(`   Status: ${testResponse.status}`)
    
    if (testResponse.status === 401) {
      console.log('   ❌ Key invalida ou desativada')
      console.log(`   Resposta: ${responseText}`)
      return false
    } else if (testResponse.status === 400) {
      console.log('   ✅ Key VALIDA! (400 = erro de validacao de parametros)')
      console.log(`   Resposta: ${responseText}`)
      return true
    } else if (testResponse.status >= 200 && testResponse.status < 300) {
      console.log('   ✅ Key VALIDA! Task criada!')
      const data = JSON.parse(responseText)
      console.log(`   Task ID: ${data.id}`)
      return true
    } else {
      console.log(`   ⚠️  Status inesperado: ${testResponse.status}`)
      console.log(`   Resposta: ${responseText}`)
      return false
    }
    
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('Testando keys disponíveis...\n')
  
  for (let i = 0; i < API_KEYS.length; i++) {
    const isValid = await testKey(API_KEYS[i], i)
    if (isValid) {
      console.log(`\n✅ KEY VALIDA ENCONTRADA: ${API_KEYS[i].substring(0, 30)}...`)
      break
    }
  }
  
  console.log('\n' + '='.repeat(70))
  console.log('TESTE COMPLETO')
  console.log('='.repeat(70))
}

main().catch(console.error)
