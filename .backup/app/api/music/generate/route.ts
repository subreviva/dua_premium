import { NextResponse } from 'next/server'
import { generateMusic } from '@/lib/suno-api'

// CRITICAL: Node.js Runtime (necessário para crypto e melhor compatibilidade)
export const runtime = 'nodejs'

// CRITICAL: Timeout maior (default é 10s, aumentamos para 50s)
export const maxDuration = 50

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      prompt,
      instrumental = false,
      model = 'chirp-v3-5',
      tags,
      title,
      is_custom = false,
      lyrics,
      negative_tags
    } = body

    if (!prompt && !lyrics) {
      return NextResponse.json(
        { error: 'Prompt or lyrics is required' },
        { status: 400 }
      )
    }

    // console.log('[Music Generate] Creating music via Suno API:', {
      promptPreview: (prompt || lyrics)?.substring(0, 50) + '...',
      instrumental,
      model,
      is_custom
    })

    // Map legacy model names to official API models
    const mapModel = (m: string): string => {
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

    // Build official request body with required callBackUrl
    const callBackUrl = `${new URL(request.url).origin}/api/music/callback`
    
    const payload: any = {
      prompt: is_custom ? (lyrics || prompt) : prompt,
      customMode: !!is_custom,
      instrumental: !!instrumental,
      model: mapModel(model),
      callBackUrl, // REQUIRED by Suno API
    }

    // Only add optional fields if they have values
    if (tags) payload.style = tags
    if (title) payload.title = title
    if (negative_tags) payload.negativeTags = negative_tags

    // console.log('[Music Generate] Payload:', JSON.stringify(payload, null, 2))

    const result = await generateMusic(payload)

    if (result.code !== 200 || !result.data?.taskId) {
      // console.error('[Music Generate] Suno API error:', result)
      return NextResponse.json(
        { error: result.msg || 'Suno API error' },
        { status: 500 }
      )
    }

    const taskId = result.data.taskId
    // console.log('[Music Generate] ✅ Task created:', taskId)

    // Keep backward-compatible response shape for UI
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

  } catch (error: any) {
    // console.error('[Music Generate] Error:', error)

    // Se for timeout
    if (error.name === 'TimeoutError' || error.code === 23) {
      return NextResponse.json(
        { 
          error: 'Suno API demorou muito. Aguarda e verifica histórico.',
          code: 'TIMEOUT',
          retryable: true
        },
        { status: 408 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to generate' },
      { status: 500 }
    )
  }
}
