import { NextRequest, NextResponse } from 'next/server'

const SUNO_API_URL = process.env.NEXT_PUBLIC_SUNO_API_URL || 'https://suno-production.up.railway.app'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, instrumental = false } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt é obrigatório' },
        { status: 400 }
      )
    }

    console.log('[Music Generate] Creating music:', { prompt, instrumental })

    // Chama a API Suno no Railway
    const response = await fetch(`${SUNO_API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        make_instrumental: instrumental,
        wait_audio: false // Modo assíncrono para polling
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Music Generate] API Error:', response.status, errorText)
      
      return NextResponse.json(
        { 
          success: false, 
          error: `API Error: ${response.status} - ${errorText}` 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    console.log('[Music Generate] Success:', data)

    // API retorna array de songs diretamente
    if (Array.isArray(data)) {
      return NextResponse.json({
        success: true,
        songs: data
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid response format from Suno API'
    }, { status: 500 })

  } catch (error) {
    console.error('[Music Generate] Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
