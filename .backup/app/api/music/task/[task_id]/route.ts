import { NextResponse } from 'next/server'
import { SunoAPIClient } from '@/lib/suno-api'

export const runtime = 'edge'
export const maxDuration = 50

export async function GET(
  req: Request,
  { params }: { params: { task_id: string } }
) {
  try {
    const { task_id } = params

    if (!task_id || typeof task_id !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'task_id is required' 
      }, { status: 400 })
    }

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'SUNO_API_KEY not configured' 
      }, { status: 500 })
    }

    // console.log('🎵 [Get Music] Request:', { task_id })

    const sunoAPI = new SunoAPIClient({ apiKey })
    const res = await sunoAPI.getMusic(task_id)

    if (!res.data?.data) {
      // console.error('❌ [Get Music] Suno API error:', res)
      return NextResponse.json({ 
        success: false, 
        error: 'Suno API error' 
      }, { status: 500 })
    }

    const tracks = Array.isArray(res.data.data) ? res.data.data : [res.data.data]
    
    // console.log('✅ [Get Music] Success:', {
      task_id,
      tracks_count: tracks.length,
      states: tracks.map(t => t.state)
    })

    return NextResponse.json({
      success: true,
      message: 'success',
      data: tracks
    })

  } catch (error: unknown) {
    // console.error('❌ [Get Music] Error:', error)
    
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
