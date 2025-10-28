/**
 * POST /api/studio/upload-extend
 * Transforma melodia/assobio em música completa
 * Custo: 12 créditos
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const { audioUrl, prompt, tags, title, make_instrumental = false } = body

    if (!audioUrl) {
      return Response.json(
        { error: "audioUrl é obrigatório" },
        { status: 400 }
      )
    }

    const apiKey = process.env.SUNOAPI_KEY
    const baseUrl = process.env.SUNOAPI_BASE_URL || "https://api.sunoapi.org"

    console.log("[Suno API - Upload Extend] Enviando pedido:", {
      audioUrl,
      prompt,
      tags,
      title,
    })

    const response = await fetch(`${baseUrl}/api/custom_generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: prompt || "Continue this melody",
        tags,
        title,
        make_instrumental,
        continue_at: 0,
        continue_clip_id: audioUrl,
        model: "chirp-v3-5",
      }),
    })

    const data = await response.json()

    console.log("[Suno API - Upload Extend] Resposta recebida:", data)

    if (!response.ok) {
      return Response.json(
        { error: data.error || "Erro ao processar áudio" },
        { status: response.status }
      )
    }

    return Response.json({
      success: true,
      clipIds: data.clip_ids || data.clipIds || data.ids || [],
      taskId: data.task_id || data.taskId || data.id,
      message: "Áudio em processamento",
    })
  } catch (error) {
    console.error("[Suno API - Upload Extend] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
