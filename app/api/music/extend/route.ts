import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'
export const maxDuration = 10

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      audio_id, 
      prompt,
      continue_at,
      title,
      tags,
      negative_tags,
      model = 'chirp-v3-5'
    } = body

    if (!audio_id || typeof audio_id !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Audio ID is required' 
      }, { status: 400 })
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Prompt is required' 
      }, { status: 400 })
    }

    const sunoApiUrl = process.env.NEXT_PUBLIC_SUNO_API_URL || 'https://suno-production.up.railway.app'
    
    const requestBody = {
      audio_id,
      prompt,
      model_version: model,
      ...(continue_at && { continue_at }),
      ...(title && { title }),
      ...(tags && { tags }),
      ...(negative_tags && { negative_tags })
    }

    console.log('🎵 [Extend] Request:', { 
      audio_id, 
      model,
      hasContinueAt: !!continue_at,
      hasTags: !!tags
    })

    const response = await fetch(`${sunoApiUrl}/api/extend_audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Extend] Suno API error:', response.status, errorText)
      return NextResponse.json({ 
        success: false, 
        error: `API error: ${response.status}` 
      }, { status: response.status })
    }

    const data = await response.json()
    
    console.log('✅ [Extend] Success:', data.length, 'songs IDs returned')
    
    return NextResponse.json({ 
      success: true, 
      songs: data 
    })

  } catch (error: unknown) {
    console.error('❌ [Extend] Error:', error)
    
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
