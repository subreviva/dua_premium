import { NextRequest } from 'next/server'

/**
 * PROXY DE ÁUDIO COM CORS
 * Faz proxy das requisições de áudio para contornar CORS
 */

export const runtime = 'edge' // Usa Edge Runtime para melhor performance

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const trackId = searchParams.get('id')

  if (!trackId) {
    return new Response('Track ID required', { status: 400 })
  }

  try {
    // Lista de CDNs para tentar
    const cdnUrls = [
      `https://cdn1.suno.ai/${trackId}.mp3`,
      `https://cdn2.suno.ai/${trackId}.mp3`,
    ]

    let lastError = null

    for (const audioUrl of cdnUrls) {
      try {
        const audioResponse = await fetch(audioUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        })

        if (audioResponse.ok) {
          // Retorna o stream de áudio com headers CORS corretos
          return new Response(audioResponse.body, {
            status: 200,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, OPTIONS',
              'Access-Control-Allow-Headers': 'Range',
              'Cache-Control': 'public, max-age=31536000, immutable',
              'Content-Disposition': 'inline',
            },
          })
        }
      } catch (error) {
        lastError = error
        console.log(`Falhou: ${audioUrl}`)
        continue
      }
    }

    // Se tudo falhar
    return new Response(`Audio not available: ${lastError}`, { status: 404 })

  } catch (error) {
    console.error('Proxy error:', error)
    return new Response('Internal error', { status: 500 })
  }
}

// Suporte para OPTIONS (CORS preflight)
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
    },
  })
}
