import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const maxDuration = 50

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { audio_id } = body

    if (!audio_id || typeof audio_id !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Audio ID is required' 
      }, { status: 400 })
    }

    const sunoApiUrl = process.env.NEXT_PUBLIC_SUNO_API_URL || 'https://suno-production.up.railway.app'
    
    console.log('🎵 [Stems] Request:', { audio_id })

    const response = await fetch(`${sunoApiUrl}/api/generate_stems`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ audio_id })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Stems] Suno API error:', response.status, errorText)
      return NextResponse.json({ 
        success: false, 
        error: `API error: ${response.status}` 
      }, { status: response.status })
    }

    const data = await response.json()
    
    console.log('✅ [Stems] Success:', data)
    
    return NextResponse.json({ 
      success: true, 
      data 
    })

  } catch (error: unknown) {
    console.error('❌ [Stems] Error:', error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        return NextResponse.json({ 
          success: false, 
          error: 'Request timeout' 
        }, { status: 408 })
      }
      
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Unknown error occurred' 
    }, { status: 500 })
  }
}
