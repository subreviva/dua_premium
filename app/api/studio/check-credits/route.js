/**
 * GET /api/studio/check-credits
 * Consulta saldo de créditos disponível
 * Custo: 0 créditos (FREE)
 */
export async function GET(req) {
  try {
    const apiKey = process.env.SUNOAPI_KEY
    const baseUrl = process.env.SUNOAPI_BASE_URL || "https://api.sunoapi.org"

    console.log("[Suno API - Check Credits] Consultando créditos...")

    const response = await fetch(`${baseUrl}/api/get_credits`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    const data = await response.json()

    console.log("[Suno API - Check Credits] Resposta recebida:", data)

    if (!response.ok) {
      return Response.json(
        { error: data.error || "Erro ao consultar créditos" },
        { status: response.status }
      )
    }

    return Response.json({
      success: true,
      credits: data.credits || data.remaining_credits || 0,
      totalCredits: data.total_credits || 0,
      usedCredits: data.used_credits || 0,
    })
  } catch (error) {
    console.error("[Suno API - Check Credits] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
