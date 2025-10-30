import { NextResponse } from 'next/server'
import { SunoAPIClient } from '@/lib/suno-api'

export const runtime = 'edge'
export const maxDuration = 50

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      audio_id,       // Legacy field name
      clip_id,        // New field name (OpenAPI spec)
      prompt,
      continue_at,
      title,
      tags,
      negative_tags,
      model = 'chirp-v5',
      vocal_gender,
      style_weight,
      weirdness_constraint
    } = body

    // Support both legacy and new field names
    const continue_clip_id = clip_id || audio_id
    
    if (!continue_clip_id || typeof continue_clip_id !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'clip_id (or audio_id) is required' 
      }, { status: 400 })
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'prompt is required for extend music' 
      }, { status: 400 })
    }

    if (typeof continue_at !== 'number') {
      return NextResponse.json({ 
        success: false, 
        error: 'continue_at (number of seconds) is required' 
      }, { status: 400 })
    }

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'SUNO_API_KEY not configured' 
      }, { status: 500 })
    }

    console.log('🎵 [Extend] Request:', { 
      continue_clip_id, 
      model, 
      continue_at,
      hasPrompt: !!prompt,
      hasTags: !!tags
    })

    const callBackUrl = `${new URL(req.url).origin}/api/music/callback`

    // Build payload according to OpenAPI specification
    const payload: any = {
      custom_mode: true,           // REQUIRED (always true for extend)
      prompt,                       // REQUIRED (song lyrics)
      continue_clip_id,             // REQUIRED (clip ID to extend)
      continue_at,                  // REQUIRED (starting seconds)
      mv: model,                    // REQUIRED (model version)
      webhook_url: callBackUrl,     // Optional webhook
    }

    // Add optional fields
    if (title) payload.title = title
    if (tags) payload.tags = tags
    if (negative_tags) payload.negative_tags = negative_tags
    if (vocal_gender) payload.vocal_gender = vocal_gender
    if (typeof style_weight === 'number') payload.style_weight = style_weight
    if (typeof weirdness_constraint === 'number') payload.weirdness_constraint = weirdness_constraint

    console.log('🎵 [Extend] Payload:', JSON.stringify(payload, null, 2))

    const sunoAPI = new SunoAPIClient({ apiKey })
    const res = await sunoAPI.extendMusic(payload)

    if (!res.data?.taskId) {
      console.error('❌ [Extend] Suno API error:', res)
      return NextResponse.json({ 
        success: false, 
        error: 'Suno API error' 
      }, { status: 500 })
    }

    const taskId = res.data.taskId
    console.log('✅ [Extend] Task created:', taskId)

    return NextResponse.json({
      success: true,
      data: {
        task_id: taskId,
        message: 'success'
      }
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
