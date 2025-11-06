import { NextResponse } from 'next/server'
import { SunoAPIClient } from '@/lib/suno-api'

export const runtime = 'nodejs'
export const maxDuration = 50

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      persona_id,
      prompt,
      title,
      tags,
      mv = 'chirp-v5',
      custom_mode = true
    } = body

    if (!persona_id || typeof persona_id !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'persona_id is required' 
      }, { status: 400 })
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'prompt (lyrics) is required' 
      }, { status: 400 })
    }

    if (!mv) {
      return NextResponse.json({ 
        success: false, 
        error: 'mv (model version) is required' 
      }, { status: 400 })
    }

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'SUNO_API_KEY not configured' 
      }, { status: 500 })
    }

    // console.log('🎵 [Persona Music] Request:', { persona_id, mv, custom_mode, hasPrompt: !!prompt })

    const payload: any = {
      custom_mode: !!custom_mode,
      prompt,
      persona_id,
      mv
    }

    if (title) payload.title = title
    if (tags) payload.tags = tags

    const sunoAPI = new SunoAPIClient({ apiKey })
    const res = await sunoAPI.personaMusic(payload)

    if (!res.data?.taskId) {
      // console.error('❌ [Persona Music] Suno API error:', res)
      return NextResponse.json({ 
        success: false, 
        error: 'Suno API error' 
      }, { status: 500 })
    }

    const taskId = res.data.taskId
    // console.log('✅ [Persona Music] Task created:', taskId)

    return NextResponse.json({
      success: true,
      data: {
        task_id: taskId,
        message: 'success'
      }
    })

  } catch (error: unknown) {
    // console.error('❌ [Persona Music] Error:', error)
    
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
