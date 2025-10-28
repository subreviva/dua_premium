/**
 * POST /api/studio/generate-lyrics
 * Gera letras baseadas no prompt
 * Usa /api/generate_lyrics da Suno API
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

    const apiUrl = process.env.NEXT_PUBLIC_SUNO_API_URL

    if (!apiUrl) {
      return Response.json(
        { error: "NEXT_PUBLIC_SUNO_API_URL não configurado" },
        { status: 500 }
      )
    }

    console.log("[Suno API - Generate Lyrics] Enviando pedido:", { prompt })

    const response = await fetch(`${apiUrl}/api/generate_lyrics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Suno API - Generate Lyrics] Erro:", response.status, errorText)
      return Response.json(
        { error: errorText || "Erro ao gerar letras" },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("[Suno API - Generate Lyrics] Resposta recebida:", data)

    // API retorna: { text, title, status }
    return Response.json(data)
  } catch (error) {
    console.error("[Suno API - Generate Lyrics] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
