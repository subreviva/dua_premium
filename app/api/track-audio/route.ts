import { NextRequest, NextResponse } from 'next/server'

/**
 * API Proxy para obter URLs de áudio
 * Busca áudios de fontes externas e retorna URLs de streaming
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const trackId = searchParams.get('id')

  if (!trackId) {
    return NextResponse.json({ error: 'Track ID required' }, { status: 400 })
  }

  try {
    // Busca URLs alternativas de CDN
    const cdnUrls = [
      `https://cdn1.suno.ai/${trackId}.mp3`,
      `https://cdn2.suno.ai/${trackId}.mp3`,
    ]

    // Retorna a primeira URL disponível
    for (const url of cdnUrls) {
      try {
        const response = await fetch(url, { method: 'HEAD' })
        if (response.ok) {
          return NextResponse.json({ 
            success: true,
            audioUrl: url,
            trackId: trackId
          })
        }
      } catch {
        continue
      }
    }

    // Fallback: retorna primeira URL mesmo sem verificação
    return NextResponse.json({ 
      success: true,
      audioUrl: cdnUrls[0],
      trackId: trackId
    })

  } catch (error) {
    console.error('Erro ao buscar áudio:', error)
    return NextResponse.json(
      { 
        error: 'Falha ao buscar URL de áudio',
        trackId: trackId,
        audioUrl: `https://cdn1.suno.ai/${trackId}.mp3`
      },
      { status: 500 }
    )
  }
}
