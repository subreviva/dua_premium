/**
 * POST /api/studio/extend
 * Prolonga músicas existentes
 * Custo: 12 créditos
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const { audioId, continueAt, prompt } = body

    if (!audioId) {
      return Response.json(
        { error: "audioId é obrigatório" },
        { status: 400 }
      )
    }

    const apiKey = process.env.SUNOAPI_KEY
    const baseUrl = process.env.SUNOAPI_BASE_URL || "https://api.sunoapi.org"

    console.log("[Suno API - Extend] Enviando pedido:", {
      audioId,
      continueAt,
      prompt,
    })

    const response = await fetch(`${baseUrl}/api/extend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        audio_id: audioId,
        continue_at: continueAt || 0,
        prompt: prompt || "",
        model: "chirp-v3-5",
      }),
    })

    const data = await response.json()

    console.log("[Suno API - Extend] Resposta recebida:", data)

    if (!response.ok) {
      return Response.json(
        { error: data.error || "Erro ao estender música" },
        { status: response.status }
      )
    }

    return Response.json({
      success: true,
      clipIds: data.clip_ids || data.clipIds || data.ids || [],
      taskId: data.task_id || data.taskId || data.id,
      message: "Música em extensão",
    })
  } catch (error) {
    console.error("[Suno API - Extend] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
