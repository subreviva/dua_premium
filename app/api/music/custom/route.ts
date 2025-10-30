import { NextResponse } from 'next/server'
import { SunoAPIClient } from '@/lib/suno-api'

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

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'SUNO_API_KEY not configured' 
      }, { status: 500 })
    }

    console.log('🎵 [Custom] Request:', { 
      model, 
      title,
      tags,
      lyricsLength: lyrics.length,
      hasNegativeTags: !!negative_tags
    })

    const sunoAPI = new SunoAPIClient({ apiKey })
    const result = await sunoAPI.generateMusic({
      custom_mode: true,
      prompt: lyrics,
      title,
      tags,
      mv: model as any, // Type conversion for model versions
      make_instrumental: instrumental,
      negative_tags,
    })
    
    console.log('✅ [Custom] Success:', result)
    
    return NextResponse.json({ 
      success: true, 
      data: result.data
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
