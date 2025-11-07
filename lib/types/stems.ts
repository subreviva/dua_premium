export interface StemData {
  id: string
  name: string
  url: string
  icon: string
  color: string
  volume: number
  muted: boolean
}

export interface StemSeparationResponse {
  // Common fields for both types
  originUrl?: string | null
  vocalUrl?: string | null

  // 2-stem (separate_vocal) specific
  instrumentalUrl?: string | null

  // 12-stem (split_stem) specific
  backingVocalsUrl?: string | null
  drumsUrl?: string | null
  bassUrl?: string | null
  guitarUrl?: string | null
  pianoUrl?: string | null
  keyboardUrl?: string | null
  percussionUrl?: string | null
  stringsUrl?: string | null
  synthUrl?: string | null
  fxUrl?: string | null
  brassUrl?: string | null
  woodwindsUrl?: string | null
}

export interface StemSeparationStatus {
  taskId: string
  successFlag: "PENDING" | "SUCCESS" | "CREATE_TASK_FAILED" | "GENERATE_AUDIO_FAILED" | "CALLBACK_EXCEPTION"
  response?: StemSeparationResponse
  errorCode?: number | null
  errorMessage?: string | null
}

export interface SavedStems {
  taskId: string
  type: "2-stem" | "12-stem"
  stems: StemData[]
  timestamp: number
}
