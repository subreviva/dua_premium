import { NextRequest, NextResponse } from 'next/server'

const SUNO_API_URL = process.env.NEXT_PUBLIC_SUNO_API_URL || 'https://suno-production.up.railway.app'

// Vercel Free tier limit
export const maxDuration = 10

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, instrumental = false, model = 'chirp-crow' } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt é obrigatório' },
        { status: 400 }
      )
    }

    console.log('[Music Generate] Creating music:', { prompt, instrumental, model })

    // 🔥 CRUCIAL: wait_audio=false para retornar IDs IMEDIATAMENTE
    const response = await fetch(`${SUNO_API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        make_instrumental: instrumental,
        model,
        wait_audio: false // ⚡ KEY: Não espera processar!
      }),
      signal: AbortSignal.timeout(8000) // 8s timeout (segurança)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Music Generate] API Error:', response.status, errorText)
      
      return NextResponse.json(
        { 
          success: false, 
          error: `API Error: ${response.status}` 
        },
        { status: response.status }
      )
    }

    const songs = await response.json()
    
    console.log('[Music Generate] IDs returned:', songs.map((s: any) => s.id))

    // Retorna IDs + status IMEDIATAMENTE (não espera audio_url)
    if (Array.isArray(songs)) {
      return NextResponse.json({
        success: true,
        songs: songs.map((s: any) => ({
          id: s.id,
          status: s.status || 'submitted',
          title: s.title,
          created_at: s.created_at,
          model_name: s.model_name
        }))
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid response format from Suno API'
    }, { status: 500 })

  } catch (error) {
    console.error('[Music Generate] Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
