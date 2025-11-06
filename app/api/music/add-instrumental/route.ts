import { NextResponse } from 'next/server'
import { addInstrumental } from '@/lib/suno-api'

export const runtime = 'edge'
export const maxDuration = 50

/**
 * Add Instrumental
 * Generates musical accompaniment for uploaded audio (vocals/melody)
 * 
 * Official Suno API: POST /api/v1/generate/add-instrumental
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      upload_url,
      title,
      tags,
      negative_tags,
      vocal_gender,
      style_weight,
      weirdness_constraint,
      audio_weight,
      model = 'V4_5PLUS'
    } = body

    // Required field validation
    if (!upload_url || typeof upload_url !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Upload URL is required'
      }, { status: 400 })
    }

    if (!title || typeof title !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Title is required'
      }, { status: 400 })
    }

    if (!tags || typeof tags !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Tags are required'
      }, { status: 400 })
    }

    if (!negative_tags || typeof negative_tags !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Negative tags are required'
      }, { status: 400 })
    }

    // Console log removed for production build compatibility

    const callBackUrl = `${new URL(req.url).origin}/api/music/callback`

    // Build payload according to official API spec
    const payload: any = {
      uploadUrl: upload_url,
      title,
      tags,
      negativeTags: negative_tags,
      model,
      callBackUrl, // REQUIRED by Suno API
    }

    // Optional parameters
    if (vocal_gender) payload.vocalGender = vocal_gender
    if (typeof style_weight === 'number') payload.styleWeight = style_weight
    if (typeof weirdness_constraint === 'number') payload.weirdnessConstraint = weirdness_constraint
    if (typeof audio_weight === 'number') payload.audioWeight = audio_weight

    // console.log('🎸 [Add-Instrumental] Payload:', JSON.stringify(payload, null, 2))

    const res = await addInstrumental(payload)

    if (res.code !== 200 || !res.data?.taskId) {
      // console.error('❌ [Add-Instrumental] Suno API error:', res)
      return NextResponse.json({
        success: false,
        error: res.msg || 'Suno API error'
      }, { status: 500 })
    }

    const taskId = res.data.taskId
    // console.log('✅ [Add-Instrumental] Task created:', taskId)

    return NextResponse.json({
      success: true,
      songs: [
        {
          id: taskId,
          status: 'submitted',
          title: title,
          created_at: new Date().toISOString(),
          model_name: model,
          tags: tags,
        }
      ]
    })

  } catch (error: any) {
    // console.error('❌ [Add-Instrumental] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/music/add-instrumental',
    method: 'POST',
    description: 'Generate musical accompaniment for uploaded audio',
    requiredFields: {
      upload_url: 'string (URL to vocal/melody audio file)',
      title: 'string (track title)',
      tags: 'string (desired instrumental style and characteristics)',
      negative_tags: 'string (styles/instruments to exclude)',
      model: 'V4_5PLUS | V5 (default: V4_5PLUS)'
    },
    optionalFields: {
      vocal_gender: 'm | f',
      style_weight: 'number (0-1)',
      weirdness_constraint: 'number (0-1)',
      audio_weight: 'number (0-1)'
    },
    examples: {
      tags: 'Relaxing Piano, Ambient, Peaceful',
      negative_tags: 'Heavy Metal, Aggressive Drums'
    },
    documentation: 'https://docs.sunoapi.org/'
  })
}
