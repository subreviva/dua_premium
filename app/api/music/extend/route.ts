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
      model = 'chirp-v3-5',
      default_param_flag = true,
      persona_id,
      vocal_gender,
      style_weight,
      weirdness_constraint,
      audio_weight
    } = body

    if (!audio_id || typeof audio_id !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'Audio ID is required' 
      }, { status: 400 })
    }

    // Prompt is only required when default_param_flag is true
    if (default_param_flag && !prompt) {
      return NextResponse.json({ 
        success: false, 
        error: 'Prompt is required when using custom parameters' 
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

    console.log('🎵 [Extend] Request (Suno API):', { 
      audio_id, 
      model, 
      defaultParamFlag: default_param_flag,
      continueAt: continue_at 
    })

    const callBackUrl = `${new URL(req.url).origin}/api/music/callback`

    // Build payload according to official API spec
    const payload: any = {
      audioId: audio_id,
      defaultParamFlag: default_param_flag,
      model: mapModel(model),
      callBackUrl, // REQUIRED by Suno API
    }

    // Add optional fields based on defaultParamFlag
    if (default_param_flag) {
      // Custom parameters mode - requires continueAt, prompt, style, title
      if (prompt) payload.prompt = prompt
      if (tags) payload.style = tags
      if (title) payload.title = title
      if (typeof continue_at === 'number') payload.continueAt = continue_at
    }
    
    // Optional advanced parameters (work in both modes)
    if (persona_id) payload.personaId = persona_id
    if (negative_tags) payload.negativeTags = negative_tags
    if (vocal_gender) payload.vocalGender = vocal_gender
    if (typeof style_weight === 'number') payload.styleWeight = style_weight
    if (typeof weirdness_constraint === 'number') payload.weirdnessConstraint = weirdness_constraint
    if (typeof audio_weight === 'number') payload.audioWeight = audio_weight

    console.log('🎵 [Extend] Payload:', JSON.stringify(payload, null, 2))

    const res = await extendMusic(payload)

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
