import { NextResponse } from 'next/server'
import { SunoAPIClient } from '@/lib/suno-api'

export const runtime = 'nodejs'
export const maxDuration = 50

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      continue_clip_id,
      clip_id  // Support legacy field name
    } = body

    // Support both new and legacy field names
    const clipId = continue_clip_id || clip_id
    
    if (!clipId || typeof clipId !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'continue_clip_id (or clip_id) is required' 
      }, { status: 400 })
    }

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'SUNO_API_KEY not configured' 
      }, { status: 500 })
    }

    // console.log('🎵 [Concat] Request:', { continue_clip_id: clipId })

    const sunoAPI = new SunoAPIClient({ apiKey })
    const res = await sunoAPI.concatMusic({
      continue_clip_id: clipId
    })

    if (!res.data?.taskId) {
      // console.error('❌ [Concat] Suno API error:', res)
      return NextResponse.json({ 
        success: false, 
        error: 'Suno API error' 
      }, { status: 500 })
    }

    const taskId = res.data.taskId
    // console.log('✅ [Concat] Task created:', taskId)

    return NextResponse.json({
      success: true,
      data: {
        task_id: taskId,
        message: 'success'
      }
    })

  } catch (error: unknown) {
    // console.error('❌ [Concat] Error:', error)
    
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
