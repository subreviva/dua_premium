/**
 * POST /api/studio/separate-vocals
 * Separa música em vocal e instrumental
 * Custo: 10 créditos
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const { audioId } = body

    if (!audioId) {
      return Response.json(
        { error: "audioId é obrigatório" },
        { status: 400 }
      )
    }

    const apiKey = process.env.SUNOAPI_KEY
    const baseUrl = process.env.SUNOAPI_BASE_URL || "https://api.sunoapi.org"

    console.log("[Suno API - Separate Vocals] Enviando pedido:", { audioId })

    const response = await fetch(`${baseUrl}/api/separate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        audio_id: audioId,
      }),
    })

    const data = await response.json()

    console.log("[Suno API - Separate Vocals] Resposta recebida:", data)

    if (!response.ok) {
      return Response.json(
        { error: data.error || "Erro ao separar vocal" },
        { status: response.status }
      )
    }

    return Response.json({
      success: true,
      taskId: data.task_id || data.taskId || data.id,
      vocalUrl: data.vocal_url || data.vocalUrl,
      instrumentalUrl: data.instrumental_url || data.instrumentalUrl,
      message: "Separação em processamento",
    })
  } catch (error) {
    console.error("[Suno API - Separate Vocals] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
