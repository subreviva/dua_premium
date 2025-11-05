/**
 * POST /api/studio/add-vocals
 * Adiciona voz gerada a faixas instrumentais
 * Custo: 12 créditos
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const { audioId, lyrics, vocalStyle } = body

    if (!audioId || !lyrics) {
      return Response.json(
        { error: "audioId e lyrics são obrigatórios" },
        { status: 400 }
      )
    }const apiUrl = process.env.NEXT_PUBLIC_SUNO_API_URL || "https://suno-gold.vercel.app"

    if (!apiUrl) {
      return Response.json(
        { error: "NEXT_PUBLIC_SUNO_API_URL não configurado" },
        { status: 500 }
      )
    }

    // console.log("[Suno API - Add Vocals] Enviando pedido:", {
      audioId,
      lyrics,
      vocalStyle,
    })

    const response = await fetch(`${apiUrl}/api/add_vocals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_id: audioId,
        lyrics,
        style: vocalStyle || "default",
      }),
    })

    const data = await response.json()

    // console.log("[Suno API - Add Vocals] Resposta recebida:", data)

    if (!response.ok) {
      return Response.json(
        { error: data.error || "Erro ao adicionar vocal" },
        { status: response.status }
      )
    }

    return Response.json({
      success: true,
      clipIds: data.clip_ids || data.clipIds || data.ids || [],
      taskId: data.task_id || data.taskId || data.id,
      message: "Vocal em processamento",
    })
  } catch (error) {
    // console.error("[Suno API - Add Vocals] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
