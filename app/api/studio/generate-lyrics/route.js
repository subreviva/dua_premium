/**
 * POST /api/studio/generate-lyrics
 * Cria letras originais sobre qualquer tema
 * Custo: 0.4 créditos
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const { prompt } = body

    if (!prompt) {
      return Response.json(
        { error: "Prompt é obrigatório" },
        { status: 400 }
      )
    }

    const apiKey = process.env.SUNOAPI_KEY
    const baseUrl = process.env.SUNOAPI_BASE_URL || "https://api.sunoapi.org"

    console.log("[Suno API - Generate Lyrics] Enviando pedido:", { prompt })

    const response = await fetch(`${baseUrl}/api/generate_lyrics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
      }),
    })

    const data = await response.json()

    console.log("[Suno API - Generate Lyrics] Resposta recebida:", data)

    if (!response.ok) {
      return Response.json(
        { error: data.error || "Erro ao gerar letras" },
        { status: response.status }
      )
    }

    return Response.json({
      success: true,
      lyrics: data.text || data.lyrics || "",
      title: data.title || "",
    })
  } catch (error) {
    console.error("[Suno API - Generate Lyrics] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
