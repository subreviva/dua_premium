/**
 * Suno API Client
 * Integração com API Suno hospedada no Railway
 */

const SUNO_API_URL = process.env.NEXT_PUBLIC_SUNO_API_URL || 'https://suno-production.up.railway.app'

export interface SunoSong {
  id: string
  title: string
  audio_url: string
  video_url?: string
  image_url: string
  lyric: string
  status: 'submitted' | 'streaming' | 'complete' | 'error'
  created_at?: string
  model_name?: string
  gpt_description_prompt?: string
  prompt?: string
  type?: string
  tags?: string
  duration?: number
}

export interface CreateMusicParams {
  prompt: string
  instrumental?: boolean
  make_instrumental?: boolean
  wait_audio?: boolean
}

export interface CreateMusicResponse {
  success: boolean
  songs?: SunoSong[]
  error?: string
}

/**
 * Cria uma nova música usando a API Suno
 */
export async function createMusic(
  prompt: string, 
  instrumental: boolean = false
): Promise<CreateMusicResponse> {
  try {
    const response = await fetch(`${SUNO_API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        make_instrumental: instrumental,
        wait_audio: false
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // API retorna array de songs diretamente
    if (Array.isArray(data)) {
      return {
        success: true,
        songs: data
      }
    }

    return {
      success: false,
      error: 'Invalid response format'
    }
  } catch (error) {
    console.error('createMusic error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Obtém o status de múltiplas músicas
 */
export async function getSongStatus(ids: string[]): Promise<SunoSong[]> {
  try {
    const idsParam = ids.join(',')
    const response = await fetch(`${SUNO_API_URL}/api/get?ids=${idsParam}`)

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (Array.isArray(data)) {
      return data
    }

    return []
  } catch (error) {
    console.error('getSongStatus error:', error)
    return []
  }
}

/**
 * Obtém informações de uma música específica por ID
 */
export async function getSongById(id: string): Promise<SunoSong | null> {
  try {
    const songs = await getSongStatus([id])
    return songs.length > 0 ? songs[0] : null
  } catch (error) {
    console.error('getSongById error:', error)
    return null
  }
}

/**
 * Estende uma música existente
 */
export async function extendMusic(
  audioId: string,
  prompt: string,
  continueAt?: string
): Promise<CreateMusicResponse> {
  try {
    const response = await fetch(`${SUNO_API_URL}/api/extend_audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_id: audioId,
        prompt,
        continue_at: continueAt
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (Array.isArray(data)) {
      return {
        success: true,
        songs: data
      }
    }

    return {
      success: false,
      error: 'Invalid response format'
    }
  } catch (error) {
    console.error('extendMusic error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Gera letras para uma música
 */
export async function generateLyrics(prompt: string): Promise<{ text: string; title: string } | null> {
  try {
    const response = await fetch(`${SUNO_API_URL}/api/generate_lyrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('generateLyrics error:', error)
    return null
  }
}

/**
 * Separa vocais e instrumental de uma música
 */
export async function separateStems(audioId: string): Promise<CreateMusicResponse> {
  try {
    const response = await fetch(`${SUNO_API_URL}/api/generate_stems`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audio_id: audioId })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      songs: [data]
    }
  } catch (error) {
    console.error('separateStems error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
