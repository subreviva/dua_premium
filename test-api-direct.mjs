#!/usr/bin/env node
import fetch from 'node-fetch'

const API_URL = 'http://localhost:3000'

console.log('\n🎵 TESTE REAL: Music Studio API\n')

// Vou criar música SEM autenticação primeiro para testar a API
async function testAPI() {
  console.log('📤 Testando /api/suno/generate...\n')
  
  try {
    const response = await fetch(`${API_URL}/api/suno/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: '00000000-0000-0000-0000-000000000000', // UUID fake para teste
        prompt: 'Uma música calma e relaxante com piano',
        customMode: false,
        instrumental: true,
        model: 'V3_5',
      }),
    })
    
    const data = await response.json()
    
    console.log('Status:', response.status)
    console.log('Response:', JSON.stringify(data, null, 2))
    
    if (response.ok) {
      console.log('\n✅ API respondeu com sucesso!')
      console.log(`Task ID: ${data.taskId}`)
      
      if (data.taskId) {
        console.log('\n⏳ Testando polling...\n')
        
        for (let i = 0; i < 3; i++) {
          const statusRes = await fetch(`${API_URL}/api/suno/status?taskId=${data.taskId}`)
          const statusData = await statusRes.json()
          
          console.log(`[${i + 1}] Status: ${statusData.status}`)
          
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    } else {
      console.log('\n❌ Erro na API')
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

testAPI()
