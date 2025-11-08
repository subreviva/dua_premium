import { NextRequest, NextResponse } from 'next/server'

/**
 * PROXY DE STREAMING DE ÁUDIO
 * Contorna CORS fazendo proxy server-side do áudio
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const trackId = searchParams.get('id')

  if (!trackId) {
    return NextResponse.json({ error: 'Track ID required' }, { status: 400 })
  }

  try {
    // Lista de URLs para tentar
    const cdnUrls = [
      `https://cdn1.suno.ai/${trackId}.mp3`,
      `https://cdn2.suno.ai/${trackId}.mp3`,
      `https://audiopipe.suno.ai/?item_id=${trackId}`,
    ]

    // Tenta cada URL até encontrar uma que funcione
    for (const audioUrl of cdnUrls) {
      try {
        const audioResponse = await fetch(audioUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
            'Range': 'bytes=0-', // Suporta streaming
          },
        })

        if (audioResponse.ok) {
          // Faz streaming do áudio através do nosso servidor
          const audioBuffer = await audioResponse.arrayBuffer()
          
          return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Content-Length': audioBuffer.byteLength.toString(),
              'Accept-Ranges': 'bytes',
              'Cache-Control': 'public, max-age=31536000', // Cache por 1 ano
              'Access-Control-Allow-Origin': '*', // Permite CORS
            },
          })
        }
      } catch (error) {
        console.log(`Tentativa falhou para ${audioUrl}:`, error)
        continue
      }
    }

    // Se todas as tentativas falharem, retorna erro
    return NextResponse.json(
      { error: 'Audio not available', trackId },
      { status: 404 }
    )

  } catch (error) {
    console.error('Error proxying audio:', error)
    return NextResponse.json(
      { error: 'Failed to proxy audio', trackId },
      { status: 500 }
    )
  }
}
