/**
 * Suno API Examples - TypeScript/JavaScript
 * 
 * Complete implementation examples for all Suno API v1 endpoints.
 * Replace YOUR_API_KEY with your actual API token.
 * 
 * Requirements:
 * - Node.js 16+ or modern browser with fetch API
 * - TypeScript (optional, but recommended)
 */

const API_BASE_URL = 'https://api.sunoapi.org/api/v1'
const API_KEY = 'YOUR_API_KEY' // Replace with your actual token

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
}

// ========== Core Generation Endpoints ==========

/**
 * 1. Generate Music
 * POST /generate
 */
export async function generateMusic(params: {
  prompt: string
  customMode: boolean
  instrumental?: boolean
  style?: string
  title?: string
  model?: string
  callBackUrl: string
  negativeTags?: string
  vocalGender?: 'm' | 'f'
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
  personaId?: string
}) {
  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  })
  return response.json()
}

/**
 * 2. Extend Music
 * POST /generate/extend
 */
export async function extendMusic(params: {
  audioId: string
  defaultParamFlag: boolean
  model: string
  callBackUrl: string
  prompt?: string
  style?: string
  title?: string
  continueAt?: number
  negativeTags?: string
}) {
  const response = await fetch(`${API_BASE_URL}/generate/extend`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  })
  return response.json()
}

/**
 * 3. Generate Lyrics Only
 * POST /lyrics
 */
export async function generateLyrics(params: {
  prompt: string
  callBackUrl: string
}) {
  const response = await fetch(`${API_BASE_URL}/lyrics`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  })
  return response.json()
}

// ========== Upload & Transform Endpoints ==========

/**
 * 4. Upload & Cover
 * POST /generate/upload-cover
 */
export async function uploadCover(params: {
  uploadUrl: string
  customMode: boolean
  callBackUrl: string
  prompt?: string
  style?: string
  title?: string
  instrumental?: boolean
  model?: string
}) {
  const response = await fetch(`${API_BASE_URL}/generate/upload-cover`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  })
  return response.json()
}

/**
 * 5. Upload & Extend
 * POST /generate/upload-extend
 */
export async function uploadExtend(params: {
  uploadUrl: string
  defaultParamFlag: boolean
  callBackUrl: string
  prompt?: string
  style?: string
  title?: string
  continueAt?: number
  model?: string
}) {
  const response = await fetch(`${API_BASE_URL}/generate/upload-extend`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  })
  return response.json()
}

/**
 * 6. Add Instrumental
 * POST /generate/add-instrumental
 */
export async function addInstrumental(params: {
  uploadUrl: string
  title: string
  tags: string
  callBackUrl: string
  negativeTags?: string
  model?: 'V4_5PLUS' | 'V5'
}) {
  const response = await fetch(`${API_BASE_URL}/generate/add-instrumental`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  })
  return response.json()
}

/**
 * 7. Add Vocals
 * POST /generate/add-vocals
 */
export async function addVocals(params: {
  uploadUrl: string
  prompt: string
  title: string
  style: string
  callBackUrl: string
  negativeTags?: string
  model?: 'V4_5PLUS' | 'V5'
}) {
  const response = await fetch(`${API_BASE_URL}/generate/add-vocals`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  })
  return response.json()
}

// ========== Status & Info Endpoints ==========

/**
 * 8. Get Task Status
 * GET /generate/record-info
 */
export async function getTaskStatus(taskId: string) {
  const response = await fetch(
    `${API_BASE_URL}/generate/record-info?taskId=${taskId}`,
    { headers }
  )
  return response.json()
}

/**
 * 9. Get Lyrics Status
 * GET /lyrics/record-info
 */
export async function getLyricsStatus(taskId: string) {
  const response = await fetch(
    `${API_BASE_URL}/lyrics/record-info?taskId=${taskId}`,
    { headers }
  )
  return response.json()
}

/**
 * 10. Get Credits
 * GET /generate/credit
 */
export async function getCredits() {
  const response = await fetch(`${API_BASE_URL}/generate/credit`, { headers })
  return response.json()
}

// ========== Advanced Features ==========

/**
 * 11. Get Timestamped Lyrics (Karaoke)
 * POST /generate/get-timestamped-lyrics
 */
export async function getTimestampedLyrics(params: {
  taskId: string
  audioId?: string
  musicIndex?: number
}) {
  const response = await fetch(
    `${API_BASE_URL}/generate/get-timestamped-lyrics`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(params)
    }
  )
  return response.json()
}

/**
 * 12. Separate Stems (Vocal/Instrumental)
 * POST /vocal-removal/generate
 */
export async function separateStems(params: {
  taskId: string
  audioId: string
  type: 'separate_vocal' | 'split_stem'
  callBackUrl: string
}) {
  const response = await fetch(`${API_BASE_URL}/vocal-removal/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  })
  return response.json()
}

/**
 * 13. Get Stem Status
 * GET /vocal-removal/record-info
 */
export async function getStemStatus(taskId: string) {
  const response = await fetch(
    `${API_BASE_URL}/vocal-removal/record-info?taskId=${taskId}`,
    { headers }
  )
  return response.json()
}

/**
 * 14. Convert to WAV
 * POST /wav/generate
 */
export async function convertToWav(params: {
  taskId: string
  audioId: string
  callBackUrl: string
}) {
  const response = await fetch(`${API_BASE_URL}/wav/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  })
  return response.json()
}

/**
 * 15. Get WAV Status
 * GET /wav/record-info
 */
export async function getWavStatus(taskId: string) {
  const response = await fetch(
    `${API_BASE_URL}/wav/record-info?taskId=${taskId}`,
    { headers }
  )
  return response.json()
}

/**
 * 16. Generate Music Video
 * POST /mp4/generate
 */
export async function generateMusicVideo(params: {
  taskId: string
  audioId: string
  callBackUrl: string
  author?: string
  domainName?: string
}) {
  const response = await fetch(`${API_BASE_URL}/mp4/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  })
  return response.json()
}

/**
 * 17. Get Video Status
 * GET /mp4/record-info
 */
export async function getVideoStatus(taskId: string) {
  const response = await fetch(
    `${API_BASE_URL}/mp4/record-info?taskId=${taskId}`,
    { headers }
  )
  return response.json()
}

/**
 * 18. Generate Cover Art
 * POST /suno/cover/generate
 */
export async function generateCover(params: {
  taskId: string
  callBackUrl: string
}) {
  const response = await fetch(`${API_BASE_URL}/suno/cover/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  })
  return response.json()
}

/**
 * 19. Get Cover Status
 * GET /suno/cover/record-info
 */
export async function getCoverStatus(taskId: string) {
  const response = await fetch(
    `${API_BASE_URL}/suno/cover/record-info?taskId=${taskId}`,
    { headers }
  )
  return response.json()
}

/**
 * 20. Boost Style (V4_5+)
 * POST /style/generate
 */
export async function boostStyle(content: string) {
  const response = await fetch(`${API_BASE_URL}/style/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content })
  })
  return response.json()
}

/**
 * 21. Generate Persona
 * POST /generate/generate-persona
 */
export async function generatePersona(params: {
  taskId: string
  musicIndex: number
  name: string
  description: string
}) {
  const response = await fetch(`${API_BASE_URL}/generate/generate-persona`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params)
  })
  return response.json()
}

// ========== File Upload Endpoints ==========

/**
 * 22. Base64 Upload
 * POST /file-base64-upload
 */
export async function uploadBase64(params: {
  base64Data: string
  uploadPath: string
  fileName?: string
}) {
  const response = await fetch(
    `${API_BASE_URL.replace('/api/v1', '')}/api/file-base64-upload`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(params)
    }
  )
  return response.json()
}

/**
 * 23. Stream Upload (Browser)
 * POST /file-stream-upload
 */
export async function uploadFile(file: File, uploadPath: string, fileName?: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('uploadPath', uploadPath)
  if (fileName) formData.append('fileName', fileName)

  const response = await fetch(
    `${API_BASE_URL.replace('/api/v1', '')}/api/file-stream-upload`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      },
      body: formData
    }
  )
  return response.json()
}

/**
 * 24. URL Upload
 * POST /file-url-upload
 */
export async function uploadFromUrl(params: {
  fileUrl: string
  uploadPath: string
  fileName?: string
}) {
  const response = await fetch(
    `${API_BASE_URL.replace('/api/v1', '')}/api/file-url-upload`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(params)
    }
  )
  return response.json()
}

// ========== Usage Example ==========

async function example() {
  try {
    // 1. Check credits
    const credits = await getCredits()
    console.log('Available credits:', credits.data)

    // 2. Generate simple music
    const musicResult = await generateMusic({
      prompt: 'A relaxing piano melody about sunset in Portugal',
      customMode: false,
      callBackUrl: 'https://your-domain.com/api/music/callback'
    })
    console.log('Music generation started:', musicResult.data.taskId)

    // 3. Poll for status (alternative to callback)
    const taskId = musicResult.data.taskId
    const status = await getTaskStatus(taskId)
    console.log('Status:', status.data.status)

    // 4. When complete, get audio URL
    if (status.data.status === 'SUCCESS') {
      const audioUrl = status.data.sunoData[0].audioUrl
      console.log('Audio ready:', audioUrl)
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

// Uncomment to run example
// example()
