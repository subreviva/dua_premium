/**
 * GET /api/studio/get-status?ids=xxx,yyy
 * Consulta status de músicas em geração
 * Custo: 0 créditos (FREE)
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const ids = searchParams.get("ids")

    if (!ids) {
      return Response.json(
        { error: "ids é obrigatório" },
        { status: 400 }
      )
    }

    const apiKey = process.env.SUNOAPI_KEY
    const baseUrl = process.env.SUNOAPI_BASE_URL || "https://api.sunoapi.org"

    console.log("[Suno API - Get Status] Consultando IDs:", ids)

    const response = await fetch(`${baseUrl}/api/get?ids=${ids}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    const data = await response.json()

    console.log("[Suno API - Get Status] Resposta recebida:", data)

    if (!response.ok) {
      return Response.json(
        { error: data.error || "Erro ao consultar status" },
        { status: response.status }
      )
    }

    // Normalizar resposta
    const songs = Array.isArray(data) ? data : data.data || []

    const normalizedSongs = songs.map((song) => ({
      id: song.id,
      title: song.title,
      status: song.status,
      audioUrl: song.audio_url || song.audioUrl,
      videoUrl: song.video_url || song.videoUrl,
      imageUrl: song.image_url || song.imageUrl || song.image_large_url,
      duration: song.duration,
      tags: song.tags,
      prompt: song.prompt,
      createdAt: song.created_at || song.createdAt,
    }))

    return Response.json({
      success: true,
      songs: normalizedSongs,
    })
  } catch (error) {
    console.error("[Suno API - Get Status] Erro:", error)
    return Response.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
