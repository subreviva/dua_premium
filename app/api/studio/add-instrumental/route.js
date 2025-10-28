/**
 * POST /api/studio/add-instrumental
 * Cria acompanhamento musical para vocal isolado
 * Custo: 12 créditos
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const { audioId, style, prompt } = body

    if (!audioId) {
      return Response.json(
        { error: "audioId é obrigatório" },
        { status: 400 }
      )
    }

    const apiKey = process.env.SUNOAPI_KEY
    const baseUrl = process.env.SUNOAPI_BASE_URL || "https://api.sunoapi.org"

    console.log("[Suno API - Add Instrumental] Enviando pedido:", {
      audioId,
      style,
      prompt,
    })

    const response = await fetch(`${baseUrl}/api/add_instrumental`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        audio_id: audioId,
        style: style || "auto",
        prompt: prompt || "Create instrumental accompaniment",
        model: "chirp-v3-5",
      }),
    })

    const data = await response.json()

    console.log("[Suno API - Add Instrumental] Resposta recebida:", data)

    if (!response.ok) {
      return Response.json(
        { error: data.error || "Erro ao adicionar instrumental" },
        { status: response.status }
      )
    }

    return Response.json({
      success: true,
      clipIds: data.clip_ids || data.clipIds || data.ids || [],
      taskId: data.task_id || data.taskId || data.id,
      message: "Instrumental em criação",
    })
  } catch (error) {
    console.error("[Suno API - Add Instrumental] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
