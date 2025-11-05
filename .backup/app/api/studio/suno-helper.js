/**
 * Helper centralizado para chamadas à Suno API
 */

export const SUNO_API_URL = process.env.NEXT_PUBLIC_SUNO_API_URL

export async function callSunoAPI(endpoint, options = {}) {
  if (!SUNO_API_URL) {
    throw new Error("NEXT_PUBLIC_SUNO_API_URL não configurado")
  }

  const url = `${SUNO_API_URL}${endpoint}`
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Erro ${response.status}: ${errorText}`)
  }

  return response.json()
}

export function normalizeSunoResponse(data) {
  // Estrutura esperada: [{ id, title, status, audio_url, image_url }]
  if (!Array.isArray(data)) {
    return []
  }

  return data.map(item => ({
    id: item.id,
    title: item.title,
    status: item.status === "streaming" ? "complete" : item.status,
    audioUrl: item.audio_url,
    videoUrl: item.video_url,
    imageUrl: item.image_url,
    duration: item.duration,
    tags: item.tags,
    prompt: item.prompt,
  }))
}
