/**
 * POST /api/studio/create-video
 * Gera vídeo automático com visualizações
 * Custo: 2 créditos
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const { audioId, visualStyle } = body

    if (!audioId) {
      return Response.json(
        { error: "audioId é obrigatório" },
        { status: 400 }
      )
    }

    const apiKey = process.env.SUNOAPI_KEY
    const baseUrl = process.env.SUNOAPI_BASE_URL || "https://api.sunoapi.org"

    console.log("[Suno API - Create Video] Enviando pedido:", {
      audioId,
      visualStyle,
    })

    const response = await fetch(`${baseUrl}/api/create_video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        audio_id: audioId,
        visual_style: visualStyle || "auto",
      }),
    })

    const data = await response.json()

    console.log("[Suno API - Create Video] Resposta recebida:", data)

    if (!response.ok) {
      return Response.json(
        { error: data.error || "Erro ao criar vídeo" },
        { status: response.status }
      )
    }

    return Response.json({
      success: true,
      videoUrl: data.video_url || data.videoUrl || data.url,
      taskId: data.task_id || data.taskId || data.id,
      message: "Vídeo em criação",
    })
  } catch (error) {
    console.error("[Suno API - Create Video] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
