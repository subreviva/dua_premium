/**
 * POST /api/studio/generate-cover-art
 * Cria artwork/capa de álbum automaticamente
 * Custo: 0 créditos (FREE)
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const { audioId, prompt } = body

    if (!audioId) {
      return Response.json(
        { error: "audioId é obrigatório" },
        { status: 400 }
      )
    }const apiUrl = process.env.NEXT_PUBLIC_SUNO_API_URL || "https://suno-gold.vercel.app"

    if (!apiUrl) {
      return Response.json(
        { error: "NEXT_PUBLIC_SUNO_API_URL não configurado" },
        { status: 500 }
      )
    }

    // console.log("[Suno API - Generate Cover Art] Enviando pedido:", {
      audioId,
      prompt,
    })

    const response = await fetch(`${apiUrl}/api/generate_cover_art`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_id: audioId,
        prompt: prompt || "Create album cover art",
      }),
    })

    const data = await response.json()

    // console.log("[Suno API - Generate Cover Art] Resposta recebida:", data)

    if (!response.ok) {
      return Response.json(
        { error: data.error || "Erro ao gerar capa" },
        { status: response.status }
      )
    }

    return Response.json({
      success: true,
      coverUrl: data.cover_url || data.coverUrl || data.image_url || data.url,
      message: "Capa gerada",
    })
  } catch (error) {
    // console.error("[Suno API - Generate Cover Art] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
