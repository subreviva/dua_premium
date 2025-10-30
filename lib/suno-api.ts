/**
 * Suno API Client (Official)
 * Base: https://api.sunoapi.org/api/v1
 * Auth: Bearer token in Authorization header
 */

const SUNO_API_URL = 'https://api.sunoapi.org/api/v1'
// Use server-only env var (do NOT expose publicly)
const SUNO_API_KEY = process.env.SUNO_API_KEY

export interface SunoTaskResponse {
  code: number
  msg: string
  data: {
    taskId: string
  } | null
}

export type SunoRecordStatus =
  | 'PENDING'
  | 'TEXT_SUCCESS'
  | 'FIRST_SUCCESS'
  | 'SUCCESS'
  | 'CREATE_TASK_FAILED'
  | 'GENERATE_AUDIO_FAILED'
  | 'CALLBACK_EXCEPTION'
  | 'SENSITIVE_WORD_ERROR'

export interface SunoRecordItem {
  id: string
  audioUrl?: string
  streamAudioUrl?: string
  imageUrl?: string
  prompt?: string
  modelName?: string
  title?: string
  tags?: string
  lyric?: string
  duration?: number
  createTime?: string
}

export interface SunoRecordInfoData {
  status: SunoRecordStatus
  sunoData: SunoRecordItem[]
}

export interface SunoRecordInfoResponse {
  code: number
  msg: string
  data: SunoRecordInfoData | null
}

export interface SunoCreditResponse {
  code: number
  msg: string
  data: number
}

// Legacy UI compatibility type (matches UI expectations)
export interface SunoSong {
  id: string
  title: string
  image_url: string
  lyric: string
  audio_url: string
  video_url: string
  created_at: string
  model_name: string
  status: 'submitted' | 'streaming' | 'complete' | 'error'
  gpt_description_prompt: string
  prompt: string
  type: string
  tags: string
  duration: number
}

async function postSunoAPI<T>(endpoint: string, body: object): Promise<T> {
  if (!SUNO_API_KEY) {
    throw new Error('Missing SUNO_API_KEY environment variable')
  }

  console.log('[Suno API] POST request:', {
    endpoint,
    url: `${SUNO_API_URL}${endpoint}`,
    body: JSON.stringify(body, null, 2)
  })

  const response = await fetch(`${SUNO_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUNO_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  const responseData = await response.json()
  
  console.log('[Suno API] Response:', {
    status: response.status,
    ok: response.ok,
    data: responseData
  })

  if (!response.ok) {
    const errorText = JSON.stringify(responseData)
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  return responseData
}

async function getSunoAPI<T>(endpoint: string): Promise<T> {
  if (!SUNO_API_KEY) {
    throw new Error('Missing SUNO_API_KEY environment variable')
  }
  const response = await fetch(`${SUNO_API_URL}${endpoint}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${SUNO_API_KEY}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  return response.json()
}

export async function generateMusic(params: {
  prompt: string
  style?: string
  title?: string
  customMode?: boolean
  instrumental?: boolean
  model?: string
  callBackUrl: string // REQUIRED by Suno API
  negativeTags?: string
  vocalGender?: 'm' | 'f'
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
  personaId?: string
}): Promise<SunoTaskResponse> {
  // Map camelCase to API format (keeping camelCase per docs)
  const apiParams: any = {
    prompt: params.prompt,
    customMode: params.customMode,
    instrumental: params.instrumental,
    model: params.model,
    callBackUrl: params.callBackUrl, // camelCase per docs!
  }
  
  // Only add optional fields if they have values
  if (params.style) apiParams.style = params.style
  if (params.title) apiParams.title = params.title
  if (params.negativeTags) apiParams.negativeTags = params.negativeTags
  if (params.vocalGender) apiParams.vocalGender = params.vocalGender
  if (params.styleWeight !== undefined) apiParams.styleWeight = params.styleWeight
  if (params.weirdnessConstraint !== undefined) apiParams.weirdnessConstraint = params.weirdnessConstraint
  if (params.audioWeight !== undefined) apiParams.audioWeight = params.audioWeight
  if (params.personaId) apiParams.personaId = params.personaId
  
  return postSunoAPI<SunoTaskResponse>('/generate', apiParams)
}

export async function extendMusic(params: {
  audioId: string
  prompt?: string
  style?: string
  title?: string
  continueAt?: number
  defaultParamFlag: boolean
  model: string
  callBackUrl: string // REQUIRED by Suno API
  negativeTags?: string
  vocalGender?: 'm' | 'f'
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
  personaId?: string
}): Promise<SunoTaskResponse> {
  // Map to API format (keeping camelCase per docs)
  const apiParams: any = {
    audioId: params.audioId,
    defaultParamFlag: params.defaultParamFlag,
    model: params.model,
    callBackUrl: params.callBackUrl,
  }
  
  // Only add optional fields if they have values
  if (params.prompt) apiParams.prompt = params.prompt
  if (params.style) apiParams.style = params.style
  if (params.title) apiParams.title = params.title
  if (params.continueAt !== undefined) apiParams.continueAt = params.continueAt
  if (params.negativeTags) apiParams.negativeTags = params.negativeTags
  if (params.vocalGender) apiParams.vocalGender = params.vocalGender
  if (params.styleWeight !== undefined) apiParams.styleWeight = params.styleWeight
  if (params.weirdnessConstraint !== undefined) apiParams.weirdnessConstraint = params.weirdnessConstraint
  if (params.audioWeight !== undefined) apiParams.audioWeight = params.audioWeight
  if (params.personaId) apiParams.personaId = params.personaId
  
  return postSunoAPI<SunoTaskResponse>('/generate/extend', apiParams)
}

export async function generateLyrics(params: {
  prompt: string
  callBackUrl: string // REQUIRED per docs
}): Promise<SunoTaskResponse> {
  return postSunoAPI<SunoTaskResponse>('/lyrics', params)
}

export async function getTaskStatus(taskId: string): Promise<SunoRecordInfoResponse> {
  // Official docs: GET /generate/record-info?taskId=...
  const params = new URLSearchParams({ taskId })
  return getSunoAPI<SunoRecordInfoResponse>(`/generate/record-info?${params.toString()}`)
}

export async function getCredits(): Promise<SunoCreditResponse> {
  return getSunoAPI<SunoCreditResponse>('/generate/credit')
}

// ========== Additional Endpoints per Official Docs ==========

/**
 * POST /generate/upload-cover
 * Upload an audio and create a cover preserving original melody
 */
export async function uploadCover(params: {
  uploadUrl: string
  prompt?: string // Required if customMode=false OR if customMode=true + instrumental=false
  style?: string // Required if customMode=true
  title?: string // Required if customMode=true
  customMode: boolean
  instrumental?: boolean
  model?: string
  callBackUrl: string
  negativeTags?: string
  vocalGender?: 'm' | 'f'
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
  personaId?: string
}): Promise<SunoTaskResponse> {
  const apiParams: any = {
    uploadUrl: params.uploadUrl,
    customMode: params.customMode,
    callBackUrl: params.callBackUrl,
  }
  
  if (params.prompt) apiParams.prompt = params.prompt
  if (params.style) apiParams.style = params.style
  if (params.title) apiParams.title = params.title
  if (params.instrumental !== undefined) apiParams.instrumental = params.instrumental
  if (params.model) apiParams.model = params.model
  if (params.negativeTags) apiParams.negativeTags = params.negativeTags
  if (params.vocalGender) apiParams.vocalGender = params.vocalGender
  if (params.styleWeight !== undefined) apiParams.styleWeight = params.styleWeight
  if (params.weirdnessConstraint !== undefined) apiParams.weirdnessConstraint = params.weirdnessConstraint
  if (params.audioWeight !== undefined) apiParams.audioWeight = params.audioWeight
  if (params.personaId) apiParams.personaId = params.personaId
  
  return postSunoAPI<SunoTaskResponse>('/generate/upload-cover', apiParams)
}

/**
 * POST /generate/upload-extend
 * Extend a user-provided audio file
 */
export async function uploadExtend(params: {
  uploadUrl: string
  prompt?: string
  style?: string
  title?: string
  continueAt?: number
  defaultParamFlag: boolean
  model?: string
  callBackUrl: string
  instrumental?: boolean
  negativeTags?: string
  vocalGender?: 'm' | 'f'
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
  personaId?: string
}): Promise<SunoTaskResponse> {
  const apiParams: any = {
    uploadUrl: params.uploadUrl,
    defaultParamFlag: params.defaultParamFlag,
    callBackUrl: params.callBackUrl,
  }
  
  if (params.prompt) apiParams.prompt = params.prompt
  if (params.style) apiParams.style = params.style
  if (params.title) apiParams.title = params.title
  if (params.continueAt !== undefined) apiParams.continueAt = params.continueAt
  if (params.model) apiParams.model = params.model
  if (params.instrumental !== undefined) apiParams.instrumental = params.instrumental
  if (params.negativeTags) apiParams.negativeTags = params.negativeTags
  if (params.vocalGender) apiParams.vocalGender = params.vocalGender
  if (params.styleWeight !== undefined) apiParams.styleWeight = params.styleWeight
  if (params.weirdnessConstraint !== undefined) apiParams.weirdnessConstraint = params.weirdnessConstraint
  if (params.audioWeight !== undefined) apiParams.audioWeight = params.audioWeight
  if (params.personaId) apiParams.personaId = params.personaId
  
  return postSunoAPI<SunoTaskResponse>('/generate/upload-extend', apiParams)
}

/**
 * POST /generate/add-instrumental
 * Create instrumental accompaniment from audio (voice or melody)
 */
export async function addInstrumental(params: {
  uploadUrl: string
  title: string
  tags: string
  callBackUrl: string
  negativeTags?: string
  vocalGender?: 'm' | 'f'
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
  model?: 'V4_5PLUS' | 'V5'
}): Promise<SunoTaskResponse> {
  const apiParams: any = {
    uploadUrl: params.uploadUrl,
    title: params.title,
    tags: params.tags,
    callBackUrl: params.callBackUrl,
  }
  
  if (params.negativeTags) apiParams.negativeTags = params.negativeTags
  if (params.vocalGender) apiParams.vocalGender = params.vocalGender
  if (params.styleWeight !== undefined) apiParams.styleWeight = params.styleWeight
  if (params.weirdnessConstraint !== undefined) apiParams.weirdnessConstraint = params.weirdnessConstraint
  if (params.audioWeight !== undefined) apiParams.audioWeight = params.audioWeight
  if (params.model) apiParams.model = params.model
  
  return postSunoAPI<SunoTaskResponse>('/generate/add-instrumental', apiParams)
}

/**
 * POST /generate/add-vocals
 * Add AI-generated vocals to instrumental track
 */
export async function addVocals(params: {
  uploadUrl: string
  prompt: string
  title: string
  style: string
  callBackUrl: string
  negativeTags?: string
  vocalGender?: 'm' | 'f'
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
  model?: 'V4_5PLUS' | 'V5'
}): Promise<SunoTaskResponse> {
  const apiParams: any = {
    uploadUrl: params.uploadUrl,
    prompt: params.prompt,
    title: params.title,
    style: params.style,
    callBackUrl: params.callBackUrl,
  }
  
  if (params.negativeTags) apiParams.negativeTags = params.negativeTags
  if (params.vocalGender) apiParams.vocalGender = params.vocalGender
  if (params.styleWeight !== undefined) apiParams.styleWeight = params.styleWeight
  if (params.weirdnessConstraint !== undefined) apiParams.weirdnessConstraint = params.weirdnessConstraint
  if (params.audioWeight !== undefined) apiParams.audioWeight = params.audioWeight
  if (params.model) apiParams.model = params.model
  
  return postSunoAPI<SunoTaskResponse>('/generate/add-vocals', apiParams)
}

/**
 * POST /generate/get-timestamped-lyrics
 * Generate timestamped lyrics for karaoke-style display
 */
export async function getTimestampedLyrics(params: {
  taskId: string
  audioId?: string
  musicIndex?: number
}): Promise<any> {
  return postSunoAPI<any>('/generate/get-timestamped-lyrics', params)
}

/**
 * POST /vocal-removal/generate
 * Separate tracks into stems (vocal/instrumental or multi-stem)
 */
export async function separateStems(params: {
  taskId: string
  audioId: string
  type: 'separate_vocal' | 'split_stem' // separate_vocal=1 credit, split_stem=5 credits
  callBackUrl: string
}): Promise<SunoTaskResponse> {
  return postSunoAPI<SunoTaskResponse>('/vocal-removal/generate', params)
}

/**
 * GET /vocal-removal/record-info
 * Get stem separation details
 */
export async function getStemStatus(taskId: string): Promise<any> {
  const params = new URLSearchParams({ taskId })
  return getSunoAPI<any>(`/vocal-removal/record-info?${params.toString()}`)
}

/**
 * POST /wav/generate
 * Convert existing track to high-quality WAV
 */
export async function convertToWav(params: {
  taskId: string
  audioId: string
  callBackUrl: string
}): Promise<SunoTaskResponse> {
  return postSunoAPI<SunoTaskResponse>('/wav/generate', params)
}

/**
 * GET /wav/record-info
 * Get WAV conversion status
 */
export async function getWavStatus(taskId: string): Promise<any> {
  const params = new URLSearchParams({ taskId })
  return getSunoAPI<any>(`/wav/record-info?${params.toString()}`)
}

/**
 * POST /mp4/generate
 * Create music video with animated visualization
 */
export async function generateMusicVideo(params: {
  taskId: string
  audioId: string
  callBackUrl: string
  author?: string // max 50 chars
  domainName?: string // max 50 chars
}): Promise<SunoTaskResponse> {
  const apiParams: any = {
    taskId: params.taskId,
    audioId: params.audioId,
    callBackUrl: params.callBackUrl,
  }
  
  if (params.author) apiParams.author = params.author
  if (params.domainName) apiParams.domainName = params.domainName
  
  return postSunoAPI<SunoTaskResponse>('/mp4/generate', apiParams)
}

/**
 * GET /mp4/record-info
 * Get music video generation status
 */
export async function getVideoStatus(taskId: string): Promise<any> {
  const params = new URLSearchParams({ taskId })
  return getSunoAPI<any>(`/mp4/record-info?${params.toString()}`)
}

/**
 * POST /suno/cover/generate
 * Generate custom cover images for existing music
 */
export async function generateCover(params: {
  taskId: string
  callBackUrl: string
}): Promise<SunoTaskResponse> {
  return postSunoAPI<SunoTaskResponse>('/suno/cover/generate', params)
}

/**
 * GET /suno/cover/record-info
 * Get cover generation details
 */
export async function getCoverStatus(taskId: string): Promise<any> {
  const params = new URLSearchParams({ taskId })
  return getSunoAPI<any>(`/suno/cover/record-info?${params.toString()}`)
}

/**
 * POST /style/generate
 * Boost music style for V4_5+ models (more detailed style control)
 */
export async function boostStyle(params: {
  content: string // longer style description
}): Promise<SunoTaskResponse> {
  return postSunoAPI<SunoTaskResponse>('/style/generate', params)
}

/**
 * POST /generate/generate-persona
 * Create custom persona from existing music for reuse
 */
export async function generatePersona(params: {
  taskId: string
  musicIndex: number
  name: string
  description: string
}): Promise<SunoTaskResponse> {
  return postSunoAPI<SunoTaskResponse>('/generate/generate-persona', params)
}

/**
 * GET /lyrics/record-info
 * Get lyrics generation details and status
 */
export async function getLyricsStatus(taskId: string): Promise<any> {
  const params = new URLSearchParams({ taskId })
  return getSunoAPI<any>(`/lyrics/record-info?${params.toString()}`)
}
