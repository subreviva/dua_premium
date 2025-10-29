import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const maxDuration = 50

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      lyrics, 
      tags, 
      title,
      negative_tags,
      instrumental = false, 
      model = 'chirp-v3-5'
    } = body

    if (!lyrics || typeof lyrics !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Lyrics are required' 
      }, { status: 400 })
    }

    if (!tags || typeof tags !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Tags are required' 
      }, { status: 400 })
    }

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Title is required' 
      }, { status: 400 })
    }

    const sunoApiUrl = process.env.NEXT_PUBLIC_SUNO_API_URL || 'https://suno-production.up.railway.app'
    
    const requestBody = {
      prompt: lyrics,
      tags,
      title,
      make_instrumental: instrumental,
      model_version: model,
      wait_audio: false,
      ...(negative_tags && { negative_tags })
    }

    console.log('🎵 [Custom] Request:', { 
      model, 
      title,
      tags,
      lyricsLength: lyrics.length,
      hasNegativeTags: !!negative_tags
    })

    const response = await fetch(`${sunoApiUrl}/api/custom_generate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
      // ❌ REMOVE: signal: AbortSignal.timeout(...)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ [Custom] Suno API error:', response.status, errorText)
      return NextResponse.json({ 
        success: false, 
        error: `API error: ${response.status}` 
      }, { status: response.status })
    }

    const data = await response.json()
    
    console.log('✅ [Custom] Success:', data.length, 'songs IDs returned')
    
    return NextResponse.json({ 
      success: true, 
      songs: data 
    })

  } catch (error: unknown) {
    console.error('❌ [Custom] Error:', error)
    
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
