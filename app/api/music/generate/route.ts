import { NextResponse } from 'next/server'

// CRITICAL: Edge Runtime (sem isso = timeout 10s)
export const runtime = 'edge'

// CRITICAL: Timeout maior para Edge (default é 25s, aumentamos para 50s)
export const maxDuration = 50

const SUNO_API = process.env.NEXT_PUBLIC_SUNO_API_URL || 'https://suno-production.up.railway.app'

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
      lyrics
    } = body

    if (!prompt && !lyrics) {
      return NextResponse.json(
        { error: 'Prompt or lyrics is required' },
        { status: 400 }
      )
    }

    console.log('[Music Generate] Creating music:', { 
      prompt: (prompt || lyrics)?.substring(0, 50) + '...', 
      instrumental, 
      model,
      is_custom
    })

    // Build request body
    const requestBody: any = {
      prompt: is_custom ? (lyrics || prompt) : prompt,
      is_custom,
      make_instrumental: instrumental,
      model_version: model,
      wait_audio: false // SEMPRE false!
    }

    // Add optional fields
    if (tags) requestBody.tags = tags
    if (title) requestBody.title = title

    // SEM AbortSignal.timeout! Deixa Edge Runtime gerir
    const response = await fetch(`${SUNO_API}/api/generate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
      // ❌ REMOVE: signal: AbortSignal.timeout(...)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Music Generate] API Error:', response.status, errorText)
      
      return NextResponse.json(
        { error: `Railway API error: ${response.status}` },
        { status: response.status }
      )
    }

    const songs = await response.json()
    
    console.log('[Music Generate] ✅ Success! IDs:', songs.map((s: any) => s.id))

    return NextResponse.json({
      success: true,
      songs: songs.map((s: any) => ({
        id: s.id,
        status: s.status || 'submitted',
        title: s.title || '',
        created_at: s.created_at,
        model_name: s.model_name,
        image_url: s.image_url || '',
        audio_url: s.audio_url || '',
        lyric: s.lyric || ''
      }))
    })

  } catch (error: any) {
    console.error('[Music Generate] Error:', error)

    // Se for timeout
    if (error.name === 'TimeoutError' || error.code === 23) {
      return NextResponse.json(
        { 
          error: 'Railway API demorou muito. Aguarda e verifica histórico.',
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
