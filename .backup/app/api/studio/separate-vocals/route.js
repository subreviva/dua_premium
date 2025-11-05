/**
 * POST /api/studio/separate-vocals
 * Separa faixas de áudio e música (stem tracks)
 * Usa /api/generate_stems da Suno API
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const { audio_id } = body

    if (!audio_id) {
      return Response.json(
        { error: "audio_id é obrigatório" },
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

    // console.log("[Suno API - Generate Stems] Enviando pedido:", { audio_id })

    const response = await fetch(`${apiUrl}/api/generate_stems`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ audio_id }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      // console.error("[Suno API - Generate Stems] Erro:", response.status, errorText)
      return Response.json(
        { error: errorText || "Erro ao separar stems" },
        { status: response.status }
      )
    }

    const data = await response.json()
    // console.log("[Suno API - Generate Stems] Resposta recebida:", data)

    return Response.json(data)
  } catch (error) {
    // console.error("[Suno API - Generate Stems] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
