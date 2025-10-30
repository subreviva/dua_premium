import { NextResponse } from 'next/server'
import { extendMusic } from '@/lib/suno-api'

export const runtime = 'edge'
export const maxDuration = 50

export async function POST(req: Request) {
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

    // Map legacy model names to official API models
    const mapModel = (m: string): "V3_5" | "V4" | "V4_5" | "V4_5PLUS" | "V5" => {
      switch (m) {
        case 'chirp-v3-5':
        case 'chirp-v3-0':
          return 'V3_5'
        case 'chirp-auk':
          return 'V4_5'
        case 'chirp-bluejay':
          return 'V4_5PLUS'
        case 'chirp-crow':
          return 'V5'
        default:
          return 'V5'
      }
    }

    console.log('🎵 [Extend] Request (Suno API):', { audio_id, model })

    const callBackUrl = `${new URL(req.url).origin}/api/music/callback`

    const res = await extendMusic({
      audioId: audio_id,
      prompt: prompt || undefined,
      title: title || undefined,
      style: tags || undefined,
      continueAt: typeof continue_at === 'number' ? continue_at : undefined,
      defaultParamFlag: true,
      model: mapModel(model),
      callBackUrl, // REQUIRED by Suno API
      // negative_tags is not directly supported; ignored here
    })

    if (res.code !== 200 || !res.data?.taskId) {
      console.error('❌ [Extend] Suno API error:', res)
      return NextResponse.json({ success: false, error: res.msg || 'Suno API error' }, { status: 500 })
    }

    const taskId = res.data.taskId
    console.log('✅ [Extend] Task created:', taskId)

    return NextResponse.json({
      success: true,
      songs: [
        {
          id: taskId,
          status: 'submitted',
          title: title || '',
          created_at: new Date().toISOString(),
          model_name: mapModel(model),
          image_url: '',
          audio_url: '',
          lyric: '',
        },
      ],
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
