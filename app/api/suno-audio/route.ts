import { NextRequest, NextResponse } from 'next/server'

/**
 * API Proxy para obter URLs de áudio reais do Suno
 * Contorna restrições CORS e obtém URLs diretas de streaming
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const trackId = searchParams.get('id')

  if (!trackId) {
    return NextResponse.json({ error: 'Track ID required' }, { status: 400 })
  }

  try {
    // Busca a página pública da track no Suno
    const sunoUrl = `https://suno.com/song/${trackId}`
    
    const response = await fetch(sunoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch Suno page: ${response.status}`)
    }

    const html = await response.text()

    // Extrai a URL do áudio do HTML
    // O Suno usa diferentes formatos, então testamos vários padrões
    const patterns = [
      /"audio_url":"([^"]+)"/,
      /"mp3_url":"([^"]+)"/,
      /https:\/\/cdn[12]\.suno\.ai\/[a-zA-Z0-9-]+\.mp3/,
      /"url":"(https:\/\/[^"]*\.mp3)"/
    ]

    let audioUrl = null
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) {
        audioUrl = match[1] || match[0]
        break
      }
    }

    if (!audioUrl) {
      // Fallback: constrói URL baseada no padrão comum do Suno
      audioUrl = `https://cdn1.suno.ai/${trackId}.mp3`
    }

    // Retorna a URL para o cliente usar
    return NextResponse.json({ 
      success: true,
      audioUrl: audioUrl,
      trackId: trackId
    })

  } catch (error) {
    console.error('Error fetching Suno audio:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch audio URL',
        trackId: trackId,
        // Fallback URL
        audioUrl: `https://cdn1.suno.ai/${trackId}.mp3`
      },
      { status: 500 }
    )
  }
}
