/**
 * GET /api/studio/timestamped-lyrics?audioId=xxx
 * Devolve letras com timestamp palavra-por-palavra
 * Custo: 0.5 créditos
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const audioId = searchParams.get("audioId")

    if (!audioId) {
      return Response.json(
        { error: "audioId é obrigatório" },
        { status: 400 }
      )
    }

    const apiKey = process.env.SUNOAPI_KEY
    const baseUrl = process.env.SUNOAPI_BASE_URL || "https://api.sunoapi.org"

    console.log("[Suno API - Timestamped Lyrics] Consultando:", audioId)

    const response = await fetch(`${baseUrl}/api/get_lyrics?audio_id=${audioId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    const data = await response.json()

    console.log("[Suno API - Timestamped Lyrics] Resposta recebida:", data)

    if (!response.ok) {
      return Response.json(
        { error: data.error || "Erro ao obter letras sincronizadas" },
        { status: response.status }
      )
    }

    return Response.json({
      success: true,
      lyrics: data.lyrics || [],
      text: data.text || "",
    })
  } catch (error) {
    console.error("[Suno API - Timestamped Lyrics] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
