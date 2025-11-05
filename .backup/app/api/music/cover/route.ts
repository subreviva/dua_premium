import { NextResponse } from 'next/server'
import { SunoAPIClient } from '@/lib/suno-api'

export const runtime = 'nodejs'
export const maxDuration = 50

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      continue_clip_id,
      clip_id,
      prompt,
      title,
      tags,
      negative_tags,
      model = 'chirp-v5',
      vocal_gender,
      style_weight,
      weirdness_constraint
    } = body

    const clipId = continue_clip_id || clip_id
    
    if (!clipId || typeof clipId !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'continue_clip_id is required' 
      }, { status: 400 })
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ 
        success: false, 
        error: 'prompt is required' 
      }, { status: 400 })
    }

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'SUNO_API_KEY not configured' 
      }, { status: 500 })
    }

    // console.log('🎵 [Cover] Request:', { continue_clip_id: clipId, model })

    const callBackUrl = `${new URL(req.url).origin}/api/music/callback`

    const payload: any = {
      custom_mode: true,
      continue_clip_id: clipId,
      prompt,
      mv: model,
      webhook_url: callBackUrl,
    }

    if (title) payload.title = title
    if (tags) payload.tags = tags
    if (negative_tags) payload.negative_tags = negative_tags
    if (vocal_gender) payload.vocal_gender = vocal_gender
    if (typeof style_weight === 'number') payload.style_weight = style_weight
    if (typeof weirdness_constraint === 'number') payload.weirdness_constraint = weirdness_constraint

    const sunoAPI = new SunoAPIClient({ apiKey })
    const res = await sunoAPI.coverMusic(payload)

    if (!res.data?.taskId) {
      // console.error('❌ [Cover] Error:', res)
      return NextResponse.json({ 
        success: false, 
        error: 'API error' 
      }, { status: 500 })
    }

    const taskId = res.data.taskId
    // console.log('✅ [Cover] Task created:', taskId)

    return NextResponse.json({
      success: true,
      data: {
        task_id: taskId,
        message: 'success'
      }
    })

  } catch (error: unknown) {
    // console.error('❌ [Cover] Error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Unknown error' 
    }, { status: 500 })
  }
}
