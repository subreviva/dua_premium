import { NextRequest, NextResponse } from 'next/server'

/**
 * API Proxy para obter URLs de áudio de tracks externas
 * Busca múltiplas fontes CDN para garantir disponibilidade
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const trackId = searchParams.get('id')

  if (!trackId) {
    return NextResponse.json({ error: 'Track ID required' }, { status: 400 })
  }

  try {
    // Tenta diferentes CDNs automaticamente
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

    // Fallback: retorna URL padrão mesmo se não validado
    return NextResponse.json({ 
      success: true,
      audioUrl: cdnUrls[0],
      trackId: trackId
    })

  } catch (error) {
    console.error('Error fetching audio URL:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch audio URL',
        trackId: trackId,
        audioUrl: `https://cdn1.suno.ai/${trackId}.mp3`
      },
      { status: 200 } // Retorna 200 com fallback URL
    )
  }
}
