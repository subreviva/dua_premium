/**
 * POST /api/studio/convert-wav
 * Exporta música em formato WAV de qualidade profissional
 * Custo: 0.4 créditos
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

    console.log("[Suno API - Convert WAV] Enviando pedido:", { audioId })

    const response = await fetch(`${baseUrl}/api/convert_to_wav`, {
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

    console.log("[Suno API - Convert WAV] Resposta recebida:", data)

    if (!response.ok) {
      return Response.json(
        { error: data.error || "Erro ao converter para WAV" },
        { status: response.status }
      )
    }

    return Response.json({
      success: true,
      wavUrl: data.wav_url || data.wavUrl || data.url,
      message: "Conversão concluída",
    })
  } catch (error) {
    console.error("[Suno API - Convert WAV] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
