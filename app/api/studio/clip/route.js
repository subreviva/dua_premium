/**
 * GET /api/studio/clip?id=xxx
 * Obtém informação específica de um clip
 * Usa /api/clip da Suno API
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return Response.json(
        { error: "id é obrigatório" },
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

    console.log("[Suno API - Get Clip] Consultando clip:", id)

    const response = await fetch(`${apiUrl}/api/clip?id=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[Suno API - Get Clip] Erro:", response.status, errorText)
      return Response.json(
        { error: errorText || "Erro ao consultar clip" },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("[Suno API - Get Clip] Resposta recebida:", data)

    return Response.json(data)
  } catch (error) {
    console.error("[Suno API - Get Clip] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
