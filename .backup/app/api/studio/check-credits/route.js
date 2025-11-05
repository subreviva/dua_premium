/**
 * GET /api/studio/check-credits
 * Consulta informações de quota/créditos
 * Usa /api/get_limit da Suno API
 */
export async function GET(req) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_SUNO_API_URL

    if (!apiUrl) {
      return Response.json(
        { error: "NEXT_PUBLIC_SUNO_API_URL não configurado" },
        { status: 500 }
      )
    }

    // console.log("[Suno API - Get Limit] Consultando créditos")

    const response = await fetch(`${apiUrl}/api/get_limit`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      // console.error("[Suno API - Get Limit] Erro:", response.status, errorText)
      return Response.json(
        { error: errorText || "Erro ao consultar créditos" },
        { status: response.status }
      )
    }

    const data = await response.json()
    // console.log("[Suno API - Get Limit] Resposta recebida:", data)

    // API retorna: { credits_left, period, monthly_limit, monthly_usage }
    return Response.json(data)
  } catch (error) {
    // console.error("[Suno API - Get Limit] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
