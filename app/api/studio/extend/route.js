/**
 * POST /api/studio/extend
 * Prolonga músicas existentes
 * Usa /api/extend_audio da Suno API
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const { 
      audio_id, 
      prompt = "", 
      continue_at = "0", 
      title = "",
      tags = "",
      negative_tags = "",
      model = "chirp-v3-5"
    } = body

    if (!audio_id) {
      return Response.json(
        { error: "audio_id é obrigatório" },
        { status: 400 }
      )
    }

    const apiUrl = process.env.NEXT_PUBLIC_SUNO_API_URL

    if (!apiUrl) {
      return Response.json(
        { error: "NEXT_PUBLIC_SUNO_API_URL não configurado" },
        { status: 500 }
      )
    }

    console.log("[Suno API - Extend] Enviando pedido:", {
      audio_id,
      continue_at,
      prompt,
    })

    const response = await fetch(`${apiUrl}/api/extend_audio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_id,
        prompt,
        continue_at: String(continue_at),
        title,
        tags,
        negative_tags,
        model,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Suno API - Extend] Erro:", response.status, errorText)
      return Response.json(
        { error: errorText || "Erro ao estender música" },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("[Suno API - Extend] Resposta recebida:", data)

    return Response.json(data)
  } catch (error) {
    console.error("[Suno API - Extend] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
