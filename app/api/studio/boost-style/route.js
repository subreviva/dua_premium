/**
 * POST /api/studio/boost-style
 * Reforça características do género musical
 * Custo: 0.4 créditos
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const { audioId, style } = body

    if (!audioId || !style) {
      return Response.json(
        { error: "audioId e style são obrigatórios" },
        { status: 400 }
      )
    }

    const apiKey = process.env.SUNOAPI_KEY
    const baseUrl = process.env.SUNOAPI_BASE_URL || "https://api.sunoapi.org"

    console.log("[Suno API - Boost Style] Enviando pedido:", {
      audioId,
      style,
    })

    const response = await fetch(`${baseUrl}/api/boost_style`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        audio_id: audioId,
        style,
      }),
    })

    const data = await response.json()

    console.log("[Suno API - Boost Style] Resposta recebida:", data)

    if (!response.ok) {
      return Response.json(
        { error: data.error || "Erro ao intensificar estilo" },
        { status: response.status }
      )
    }

    return Response.json({
      success: true,
      clipIds: data.clip_ids || data.clipIds || data.ids || [],
      taskId: data.task_id || data.taskId || data.id,
      message: "Estilo em intensificação",
    })
  } catch (error) {
    console.error("[Suno API - Boost Style] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
