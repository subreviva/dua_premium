/**
 * POST /api/studio/generate
 * Gera música completa a partir de descrição de texto
 * Custo: 12 créditos
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const { prompt, tags, title, make_instrumental = false } = body

    if (!prompt) {
      return Response.json(
        { error: "Prompt é obrigatório" },
        { status: 400 }
      )
    }

    const apiKey = process.env.SUNOAPI_KEY
    const baseUrl = process.env.SUNOAPI_BASE_URL || "https://api.sunoapi.org"

    console.log("[Suno API - Generate] Enviando pedido:", {
      prompt,
      tags,
      title,
      make_instrumental,
    })

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        tags,
        title,
        make_instrumental,
        model: "chirp-v3-5",
      }),
    })

    const data = await response.json()

    console.log("[Suno API - Generate] Resposta recebida:", data)

    if (!response.ok) {
      return Response.json(
        { error: data.error || "Erro ao gerar música" },
        { status: response.status }
      )
    }

    return Response.json({
      success: true,
      clipIds: data.clip_ids || data.clipIds || data.ids || [],
      taskId: data.task_id || data.taskId || data.id,
      message: "Música em geração",
    })
  } catch (error) {
    console.error("[Suno API - Generate] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
