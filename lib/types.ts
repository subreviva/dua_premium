export type SunoModel = "V3_5" | "V4" | "V4_5" | "V4_5PLUS" | "V5"
export type VocalGender = "m" | "f"
export type CallbackType = "text" | "first" | "complete" | "error"

export interface GenerateMusicRequest {
  prompt: string
  style?: string
  title?: string
  customMode: boolean
  instrumental: boolean
  personaId?: string
  model: SunoModel
  negativeTags?: string
  vocalGender?: VocalGender
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
  callBackUrl?: string
}

export interface MusicTrack {
  id: string
  audio_url: string
  source_audio_url: string
  stream_audio_url: string
  source_stream_audio_url: string
  image_url: string
  source_image_url: string
  prompt: string
  model_name: string
  title: string
  tags: string
  createTime: string
  duration: number
}

export interface GenerateMusicResponse {
  code: number
  msg: string
  data: {
    taskId: string
  }
}

export interface CallbackData {
  code: number
  msg: string
  data: {
    callbackType: CallbackType
    task_id: string
    data: MusicTrack[] | null
  }
}

export interface Song {
  id: string
  title: string
  artist: string
  duration: string
  coverUrl: string
  audioUrl: string
  tags: string[]
  prompt: string
  model: string
  createdAt: string
  isPlaying?: boolean
}

export interface ExtendMusicRequest {
  audioId: string
  defaultParamFlag: boolean
  prompt?: string
  style?: string
  title?: string
  continueAt?: number
  personaId?: string
  model: SunoModel
  negativeTags?: string
  vocalGender?: VocalGender
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
  callBackUrl?: string
}

export interface ExtendMusicResponse {
  code: number
  msg: string
  data: {
    taskId: string
  }
}
