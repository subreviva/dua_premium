/**
 * POST /api/studio/generate
 * Gera música completa a partir de descrição de texto
 * Usa /api/generate da Suno API (modo simples com prompt)
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const { prompt, wait_audio = false } = body

    if (!prompt) {
      return Response.json(
        { error: "Prompt é obrigatório" },
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

    // console.log("[Suno API - Generate] Enviando pedido:", { prompt, wait_audio })

    const response = await fetch(`${apiUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        wait_audio,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      // console.error("[Suno API - Generate] Erro:", response.status, errorText)
      return Response.json(
        { error: errorText || "Erro ao gerar música" },
        { status: response.status }
      )
    }

    const data = await response.json()
    // console.log("[Suno API - Generate] Resposta recebida:", data)

    // Retorna array de clips conforme API docs
    return Response.json(data)
  } catch (error) {
    // console.error("[Suno API - Generate] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
