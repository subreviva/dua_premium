/**
 * POST /api/studio/concat
 * Concatena clips de áudio para gerar música completa
 * Usa /api/concat da Suno API
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const { clip_id } = body

    if (!clip_id) {
      return Response.json(
        { error: "clip_id é obrigatório" },
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

    // console.log("[Suno API - Concat] Concatenando clip:", clip_id)

    const response = await fetch(`${apiUrl}/api/concat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clip_id }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      // console.error("[Suno API - Concat] Erro:", response.status, errorText)
      return Response.json(
        { error: errorText || "Erro ao concatenar clips" },
        { status: response.status }
      )
    }

    const data = await response.json()
    // console.log("[Suno API - Concat] Resposta recebida:", data)

    return Response.json(data)
  } catch (error) {
    // console.error("[Suno API - Concat] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
