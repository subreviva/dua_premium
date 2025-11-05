/**
 * POST /api/studio/custom-generate
 * Gera música em modo personalizado (Custom Mode)
 * Suporta letras, estilo musical, título, etc.
 */
export async function POST(req) {
  try {
    const body = await req.json()
    const { 
      prompt, 
      tags, 
      title, 
      make_instrumental = false, 
      model = "chirp-v3-5",
      wait_audio = false,
      negative_tags = ""
    } = body

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

    // console.log("[Suno API - Custom Generate] Enviando pedido:", {
      prompt,
      tags,
      title,
      make_instrumental,
      model,
      wait_audio,
    })

    const response = await fetch(`${apiUrl}/api/custom_generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        tags,
        negative_tags,
        title,
        make_instrumental,
        model,
        wait_audio,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      // console.error("[Suno API - Custom Generate] Erro:", response.status, errorText)
      return Response.json(
        { error: errorText || "Erro ao gerar música personalizada" },
        { status: response.status }
      )
    }

    const data = await response.json()
    // console.log("[Suno API - Custom Generate] Resposta recebida:", data)

    return Response.json(data)
  } catch (error) {
    // console.error("[Suno API - Custom Generate] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
