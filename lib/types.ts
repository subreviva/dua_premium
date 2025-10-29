/**
 * DUA Music Studio - TypeScript Types
 * Based on Suno API Official Documentation
 */

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

export interface CreditsInfo {
  credits_left: number
  period: string
  monthly_limit: number
  monthly_usage: number
}

export interface GenerationRequest {
  prompt: string
  make_instrumental: boolean
  model: string
  wait_audio: boolean
}

export interface CustomGenerationRequest {
  prompt: string // lyrics for custom mode
  tags: string
  negative_tags?: string
  title: string
  make_instrumental: boolean
  model: string
  wait_audio: boolean
}

export interface ExtendAudioRequest {
  audio_id: string
  prompt: string
  continue_at?: string
  title?: string
  tags?: string
  negative_tags?: string
  model?: string
}

export interface StemRequest {
  audio_id: string
}

export interface LyricsRequest {
  prompt: string
}

export interface LyricsResponse {
  text: string
  title: string
  status: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export type ModelVersion = 
  | 'chirp-v3-0'
  | 'chirp-v3-5'
  | 'chirp-auk'
  | 'chirp-bluejay'
  | 'chirp-crow'

export const MODELS: Record<ModelVersion, { name: string; badge: string; desc: string; maxDuration: string }> = {
  'chirp-v3-0': { name: 'v3.0', badge: 'Legacy', desc: 'Broad, versatile', maxDuration: '2 min' },
  'chirp-v3-5': { name: 'v3.5', badge: 'Standard', desc: 'Better structure', maxDuration: '4 min' },
  'chirp-auk': { name: 'v4.5', badge: 'Pro', desc: 'Professional quality', maxDuration: '4 min' },
  'chirp-bluejay': { name: 'v4.5+', badge: 'Pro+', desc: 'Enhanced quality', maxDuration: '4 min' },
  'chirp-crow': { name: 'v5', badge: 'Latest', desc: 'Newest model', maxDuration: '4 min' },
}

export const DEFAULT_MODEL: ModelVersion = 'chirp-v3-5'
