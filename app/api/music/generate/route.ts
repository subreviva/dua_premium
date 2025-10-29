import { NextRequest, NextResponse } from 'next/server'

const SUNO_API_URL = process.env.NEXT_PUBLIC_SUNO_API_URL || 'https://suno-production.up.railway.app'

// Vercel Free tier limit
export const maxDuration = 10

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      prompt, 
      instrumental = false, 
      model = 'chirp-v3-5', 
      tags, 
      title,
      is_custom = false, // Novo: para letras customizadas
      lyrics // Novo: para modo custom
    } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt é obrigatório' },
        { status: 400 }
      )
    }

    console.log('[Music Generate] Creating music:', { 
      prompt: prompt.substring(0, 100) + '...', 
      instrumental, 
      model, 
      tags, 
      title,
      is_custom 
    })

    // 🔥 CRUCIAL: wait_audio=false para retornar IDs IMEDIATAMENTE
    const requestBody: any = {
      prompt: is_custom ? (lyrics || prompt) : prompt, // Se custom, usa lyrics
      is_custom, // True = letras customizadas, False = descrição
      make_instrumental: instrumental,
      model_version: model,
      wait_audio: false // ⚡ KEY: Não espera processar!
    }

    // Adicionar campos opcionais se fornecidos
    if (tags) requestBody.tags = tags
    if (title) requestBody.title = title

    const response = await fetch(`${SUNO_API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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
