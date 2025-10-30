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
  const response = await fetch(`${SUNO_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUNO_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  return response.json()
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
}): Promise<SunoTaskResponse> {
  return postSunoAPI<SunoTaskResponse>('/generate', params)
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
}): Promise<SunoTaskResponse> {
  return postSunoAPI<SunoTaskResponse>('/generate/extend', params)
}

export async function generateLyrics(params: {
  prompt: string
  callBackUrl?: string
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
