import { NextResponse } from 'next/server'
import { uploadAndExtend } from '@/lib/suno-api'

export const runtime = 'edge'
export const maxDuration = 50

/**
 * Upload and Extend Audio
 * Extends audio tracks while preserving the original style
 * 
 * Official Suno API: POST /api/v1/generate/upload-extend
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      upload_url,
      default_param_flag = false,
      instrumental = false,
      prompt,
      style,
      title,
      continue_at,
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

    // Validate Custom Mode requirements
    if (default_param_flag) {
      if (!instrumental && !prompt) {
        return NextResponse.json({
          success: false,
          error: 'Prompt is required in Custom Mode when not instrumental'
        }, { status: 400 })
      }

      if (!style || !title) {
        return NextResponse.json({
          success: false,
          error: 'Style and title are required in Custom Mode'
        }, { status: 400 })
      }

      if (typeof continue_at !== 'number') {
        return NextResponse.json({
          success: false,
          error: 'continueAt is required in Custom Mode'
        }, { status: 400 })
      }
    }

    // console.log('🔄 [Upload-Extend] Request (Suno API):', {
      uploadUrl: upload_url.substring(0, 50) + '...',
      defaultParamFlag: default_param_flag,
      instrumental,
      model
    })

    const callBackUrl = `${new URL(req.url).origin}/api/music/callback`

    // Build payload according to official API spec
    const payload: any = {
      uploadUrl: upload_url,
      defaultParamFlag: default_param_flag,
      model,
      callBackUrl, // REQUIRED by Suno API
    }

    // Add fields based on mode
    if (default_param_flag) {
      payload.instrumental = instrumental
      if (style) payload.style = style
      if (title) payload.title = title
      if (typeof continue_at === 'number') payload.continueAt = continue_at
      if (!instrumental && prompt) payload.prompt = prompt
    }

    // Optional advanced parameters
    if (persona_id) payload.personaId = persona_id
    if (negative_tags) payload.negativeTags = negative_tags
    if (vocal_gender) payload.vocalGender = vocal_gender
    if (typeof style_weight === 'number') payload.styleWeight = style_weight
    if (typeof weirdness_constraint === 'number') payload.weirdnessConstraint = weirdness_constraint
    if (typeof audio_weight === 'number') payload.audioWeight = audio_weight

    // console.log('🔄 [Upload-Extend] Payload:', JSON.stringify(payload, null, 2))

    const res = await uploadAndExtend(payload)

    if (res.code !== 200 || !res.data?.taskId) {
      // console.error('❌ [Upload-Extend] Suno API error:', res)
      return NextResponse.json({
        success: false,
        error: res.msg || 'Suno API error'
      }, { status: 500 })
    }

    const taskId = res.data.taskId
    // console.log('✅ [Upload-Extend] Task created:', taskId)

    return NextResponse.json({
      success: true,
      songs: [
        {
          id: taskId,
          status: 'submitted',
          title: title || 'Extending audio...',
          created_at: new Date().toISOString(),
          model_name: model,
        }
      ]
    })

  } catch (error: any) {
    // console.error('❌ [Upload-Extend] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/music/upload-extend',
    method: 'POST',
    description: 'Extend uploaded audio while preserving original style',
    requiredFields: {
      upload_url: 'string (URL to audio file, max 2 minutes)',
      default_param_flag: 'boolean',
      model: 'V3_5 | V4 | V4_5 | V4_5PLUS | V5'
    },
    customModeRequirements: {
      style: 'string (music style/genre)',
      title: 'string (track title)',
      continue_at: 'number (seconds to start extending)',
      prompt: 'string (required if instrumental=false)'
    },
    optionalFields: {
      instrumental: 'boolean',
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
