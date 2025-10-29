import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const maxDuration = 10

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prompt } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Prompt is required' 
      }, { status: 400 })
    }

    const sunoApiUrl = process.env.NEXT_PUBLIC_SUNO_API_URL || 'https://suno-production.up.railway.app'
    
    console.log('🎵 [Lyrics] Request:', { promptLength: prompt.length })

    const response = await fetch(`${sunoApiUrl}/api/generate_lyrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Lyrics] Suno API error:', response.status, errorText)
      return NextResponse.json({ 
        success: false, 
        error: `API error: ${response.status}` 
      }, { status: response.status })
    }

    const data = await response.json()
    
    console.log('✅ [Lyrics] Success')
    
    return NextResponse.json({ 
      success: true, 
      data 
    })

  } catch (error: unknown) {
    console.error('❌ [Lyrics] Error:', error)
    
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
