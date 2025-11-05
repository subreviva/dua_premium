/**
 * GET /api/studio/get-status?ids=xxx,yyy
 * Consulta status de músicas em geração
 * Usa /api/get da Suno API
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const ids = searchParams.get("ids") || searchParams.get("clip_id")
    const page = searchParams.get("page") || ""

    const apiUrl = process.env.NEXT_PUBLIC_SUNO_API_URL

    if (!apiUrl) {
      return Response.json(
        { error: "NEXT_PUBLIC_SUNO_API_URL não configurado" },
        { status: 500 }
      )
    }

    // console.log("[Suno API - Get Status] Consultando IDs:", ids)

    let url = `${apiUrl}/api/get`
    if (ids) url += `?ids=${ids}`
    if (page) url += ids ? `&page=${page}` : `?page=${page}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      // console.error("[Suno API - Get Status] Erro:", response.status, errorText)
      return Response.json(
        { error: errorText || "Erro ao consultar status" },
        { status: response.status }
      )
    }

    const data = await response.json()
    // console.log("[Suno API - Get Status] Resposta recebida:", data)

    // Retorna array de audio info conforme API docs
    return Response.json(data)
  } catch (error) {
    // console.error("[Suno API - Get Status] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
