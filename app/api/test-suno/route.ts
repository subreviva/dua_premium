import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.SUNO_API_KEY
  
  if (!apiKey) {
    return NextResponse.json({ 
      error: 'API key não encontrada',
      env: process.env.NODE_ENV 
    }, { status: 500 })
  }

  try {
    const BASE_URL = "https://api.kie.ai/api/v1"
    
    // Teste simples de conectividade
    const response = await fetch(`${BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: "Test API connection",
        customMode: false,
        instrumental: true,
        model: "V3_5",
        callBackUrl: "https://example.com/callback"
      })
    })

    const data = await response.json()

    return NextResponse.json({
      success: data.code === 200,
      status: response.status,
      apiKeyConfigured: true,
      apiKeyPreview: `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`,
      response: data,
      taskId: data.data?.taskId
    })
    
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      apiKeyConfigured: true,
      apiKeyPreview: `${apiKey.substring(0, 8)}...`
    }, { status: 500 })
  }
}
