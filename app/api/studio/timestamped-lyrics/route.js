/**
 * GET /api/studio/timestamped-lyrics?song_id=xxx
 * Obtém letras com timestamps (karaoke)
 * Usa /api/get_aligned_lyrics da Suno API
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const song_id = searchParams.get("song_id") || searchParams.get("audioId")

    if (!song_id) {
      return Response.json(
        { error: "song_id é obrigatório" },
        { status: 400 }
      )
    }

    const apiUrl = process.env.NEXT_PUBLIC_SUNO_API_URL || "https://suno-gold.vercel.app"

    if (!apiUrl) {
      return Response.json(
        { error: "NEXT_PUBLIC_SUNO_API_URL não configurado" },
        { status: 500 }
      )
    }

    console.log("[Suno API - Aligned Lyrics] Consultando:", { song_id })

    const response = await fetch(`${apiUrl}/api/get_aligned_lyrics?song_id=${song_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Suno API - Aligned Lyrics] Erro:", response.status, errorText)
      return Response.json(
        { error: errorText || "Erro ao obter letras sincronizadas" },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("[Suno API - Aligned Lyrics] Resposta recebida:", data)

    return Response.json(data)
  } catch (error) {
    console.error("[Suno API - Aligned Lyrics] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
