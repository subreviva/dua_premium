import { NextResponse } from 'next/server'
import { SunoAPIClient } from '@/lib/suno-api'

export const runtime = 'nodejs'
export const maxDuration = 50

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { clip_id, audio_id } = body

    // Support both clip_id and legacy audio_id
    const effectiveClipId = clip_id || audio_id
    
    if (!effectiveClipId || typeof effectiveClipId !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'clip_id (or audio_id) is required' 
      }, { status: 400 })
    }

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'SUNO_API_KEY not configured' 
      }, { status: 500 })
    }

    // console.log('🎵 [Get WAV] Request:', { clip_id: effectiveClipId })

    const sunoAPI = new SunoAPIClient({ apiKey })
    const res = await sunoAPI.getWav({ clip_id: effectiveClipId })

    if (!res.data?.data?.wav_url) {
      // console.error('❌ [Get WAV] Suno API error:', res)
      return NextResponse.json({ 
        success: false, 
        error: 'Suno API error' 
      }, { status: 500 })
    }

    const wavUrl = res.data.data.wav_url
    // console.log('✅ [Get WAV] Success:', wavUrl)

    return NextResponse.json({
      success: true,
      message: 'success',
      data: {
        wav_url: wavUrl
      }
    })

  } catch (error: unknown) {
    // console.error('❌ [Get WAV] Error:', error)
    
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
