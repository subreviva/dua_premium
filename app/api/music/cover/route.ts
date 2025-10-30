import { NextResponse } from 'next/server'
import { uploadAndCover } from '@/lib/suno-api'

export const runtime = 'edge'
export const maxDuration = 50

/**
 * Upload and Cover Audio
 * Covers an audio track by transforming it into a new style while retaining its core melody
 * 
 * Official Suno API: POST /api/v1/generate/upload-cover
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      upload_url,
      prompt,
      style,
      title,
      custom_mode = false,
      instrumental = false,
      persona_id,
      model = 'V5',
      negative_tags,
      vocal_gender,
      style_weight,
      weirdness_constraint,
      audio_weight
    } = body

    // Required field validation
    if (!upload_url || typeof upload_url !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Upload URL is required'
      }, { status: 400 })
    }

    // Validate customMode and instrumental requirements
    if (custom_mode && !instrumental && !prompt) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required in Custom Mode when not instrumental'
      }, { status: 400 })
    }

    if (custom_mode && (!style || !title)) {
      return NextResponse.json({
        success: false,
        error: 'Style and title are required in Custom Mode'
      }, { status: 400 })
    }

    console.log('🎨 [Cover] Request (Suno API):', {
      uploadUrl: upload_url.substring(0, 50) + '...',
      customMode: custom_mode,
      instrumental,
      model
    })

    const callBackUrl = `${new URL(req.url).origin}/api/music/callback`

    // Build payload according to official API spec
    const payload: any = {
      uploadUrl: upload_url,
      customMode: custom_mode,
      instrumental,
      model,
      callBackUrl, // REQUIRED by Suno API
    }

    // Add fields based on mode
    if (custom_mode) {
      if (style) payload.style = style
      if (title) payload.title = title
      if (!instrumental && prompt) payload.prompt = prompt
    } else {
      // Non-custom mode requires prompt
      if (!prompt) {
        return NextResponse.json({
          success: false,
          error: 'Prompt is required in Non-custom Mode'
        }, { status: 400 })
      }
      payload.prompt = prompt
    }

    // Optional advanced parameters
    if (persona_id) payload.personaId = persona_id
    if (negative_tags) payload.negativeTags = negative_tags
    if (vocal_gender) payload.vocalGender = vocal_gender
    if (typeof style_weight === 'number') payload.styleWeight = style_weight
    if (typeof weirdness_constraint === 'number') payload.weirdnessConstraint = weirdness_constraint
    if (typeof audio_weight === 'number') payload.audioWeight = audio_weight

    console.log('🎨 [Cover] Payload:', JSON.stringify(payload, null, 2))

    const res = await uploadAndCover(payload)

    if (res.code !== 200 || !res.data?.taskId) {
      console.error('❌ [Cover] Suno API error:', res)
      return NextResponse.json({
        success: false,
        error: res.msg || 'Suno API error'
      }, { status: 500 })
    }

    const taskId = res.data.taskId
    console.log('✅ [Cover] Task created:', taskId)

    return NextResponse.json({
      success: true,
      songs: [
        {
          id: taskId,
          status: 'submitted',
          title: title || 'Covering audio...',
          created_at: new Date().toISOString(),
          model_name: model,
        }
      ]
    })

  } catch (error: any) {
    console.error('❌ [Cover] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/music/cover',
    method: 'POST',
    description: 'Upload and cover audio with a new style',
    requiredFields: {
      upload_url: 'string (URL to audio file, max 2 minutes)',
      custom_mode: 'boolean',
      instrumental: 'boolean',
      model: 'V3_5 | V4 | V4_5 | V4_5PLUS | V5'
    },
    optionalFields: {
      prompt: 'string (lyrics or description)',
      style: 'string (music style/genre)',
      title: 'string (track title)',
      persona_id: 'string',
      negative_tags: 'string',
      vocal_gender: 'm | f',
      style_weight: 'number (0-1)',
      weirdness_constraint: 'number (0-1)',
      audio_weight: 'number (0-1)'
    },
    documentation: 'https://docs.sunoapi.org/'
  })
}
