import { NextResponse } from 'next/server'
import { SunoAPIClient } from '@/lib/suno-api'

export const runtime = 'edge'
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

    console.log('🎵 [Stems Full] Request:', { clip_id: effectiveClipId })

    const sunoAPI = new SunoAPIClient({ apiKey })
    const res = await sunoAPI.stemsFull({ clip_id: effectiveClipId })

    if (!res.data?.taskId) {
      console.error('❌ [Stems Full] Suno API error:', res)
      return NextResponse.json({ 
        success: false, 
        error: 'Suno API error' 
      }, { status: 500 })
    }

    const taskId = res.data.taskId
    console.log('✅ [Stems Full] Task created:', taskId)

    return NextResponse.json({
      success: true,
      data: {
        task_id: taskId,
        message: 'success'
      }
    })

  } catch (error: unknown) {
    console.error('❌ [Stems Full] Error:', error)
    
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
