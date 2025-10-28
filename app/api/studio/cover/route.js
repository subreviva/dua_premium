/**
 * POST /api/studio/cover
 * Transforma músicas em novos estilos (cover)
 * Custo: 12 créditos
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const { audioId, newStyle, prompt } = body

    if (!audioId || !newStyle) {
      return Response.json(
        { error: "audioId e newStyle são obrigatórios" },
        { status: 400 }
      )
    }

    const apiKey = process.env.SUNOAPI_KEY
    const baseUrl = process.env.SUNOAPI_BASE_URL || "https://api.sunoapi.org"

    console.log("[Suno API - Cover] Enviando pedido:", {
      audioId,
      newStyle,
      prompt,
    })

    const response = await fetch(`${baseUrl}/api/cover`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        audio_id: audioId,
        style: newStyle,
        prompt: prompt || `Convert to ${newStyle} style`,
        model: "chirp-v3-5",
      }),
    })

    const data = await response.json()

    console.log("[Suno API - Cover] Resposta recebida:", data)

    if (!response.ok) {
      return Response.json(
        { error: data.error || "Erro ao criar cover" },
        { status: response.status }
      )
    }

    return Response.json({
      success: true,
      clipIds: data.clip_ids || data.clipIds || data.ids || [],
      taskId: data.task_id || data.taskId || data.id,
      message: "Cover em criação",
    })
  } catch (error) {
    console.error("[Suno API - Cover] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
