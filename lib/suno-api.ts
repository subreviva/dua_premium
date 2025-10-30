/**
 * Suno API Client - Official Implementation
 * 
 * Base URL: https://api.aimusicapi.ai/api/v1
 * Alternative: https://api.sunoapi.com/api/v1
 * Documentation: https://docs.sunoapi.com/create-suno-music
 * Dashboard: https://aimusicapi.ai/dashboard
 * API Keys: https://aimusicapi.ai/dashboard/apikey
 * 
 * @see SUNO_API_OFFICIAL_DOCS.md for complete field reference
 */

import { ApiValidator, AiMusicApiError } from "./ai-music-api-errors"
import type { WebhookConfig } from "./ai-music-api-webhooks"

export interface SunoConfig {
  apiKey: string
  baseUrl?: string
}

/**
 * Music Generation Parameters (Official API Specification)
 * 
 * KEY FIELD USAGE:
 * 1. Custom Mode (custom_mode = true):
 *    - Customize song's title, style, and lyrics via: title, tags, prompt
 *    - With auto_lyrics = true: Auto-generate lyrics from prompt description
 * 
 * 2. Non-Custom Mode (custom_mode = false):
 *    - Only need gpt_description_prompt to describe the music
 * 
 * 3. Instrumental Control:
 *    - Use make_instrumental to generate instrumental-only music
 * 
 * @see https://docs.sunoapi.com/create-suno-music
 */
export interface GenerateMusicParams extends WebhookConfig {
  // ============= REQUIRED FIELDS =============
  
  /** 
   * Boolean switch for enabling custom mode
   * - true: Control title, style, and lyrics (via title, tags, prompt)
   * - false: Only need gpt_description_prompt
   */
  custom_mode: boolean
  
  /** 
   * Model version for generation
   * Recommended: chirp-v5 (8 min duration, best quality)
   */
  mv: "chirp-v3-5" | "chirp-v4" | "chirp-v4-5" | "chirp-v4-5-plus" | "chirp-v5"
  
  // ============= CUSTOM MODE FIELDS (custom_mode = true) =============
  
  /** 
   * Song lyrics (Required if custom_mode = true and not using auto_lyrics)
   * Max length: 
   * - v4 and below: 3000 characters
   * - v4.5+, v4.5-plus, v5: 5000 characters
   */
  prompt?: string
  
  /** 
   * Song title
   * Max length: 80 characters (120 in some endpoints)
   */
  title?: string
  
  /** 
   * Song's style or genre
   * Max length:
   * - v4 and below: 200 characters
   * - v4.5+, v4.5-plus, v5: 1000 characters
   */
  tags?: string
  
  // ============= NON-CUSTOM MODE FIELD (custom_mode = false) =============
  
  /** 
   * Description of the song (Required if custom_mode = false)
   * Max length: 400 characters
   */
  gpt_description_prompt?: string
  
  // ============= OPTIONAL FIELDS (ALL MODES) =============
  
  /** Generate instrumental-only music */
  make_instrumental?: boolean
  
  /** Elements to avoid in your songs */
  negative_tags?: string
  
  /** Weight of the tags field (style). Range: 0-1 */
  style_weight?: number
  
  /** Randomness or weirdness of the song. Range: 0-1 */
  weirdness_constraint?: number
  
  /** 
   * Control vocal gender: "f" (Female) or "m" (Male)
   * Support: chirp-v4-5, chirp-v4-5-plus, chirp-v5
   */
  vocal_gender?: "f" | "m"
  
  /** 
   * Auto generate lyrics and style
   * Must be used with custom_mode: true
   */
  auto_lyrics?: boolean
  
  /** 
   * ID of a persona created via "create persona" API
   * Required if task_type = persona_music
   */
  persona_id?: string
  
  // ============= LEGACY COMPATIBILITY (DEPRECATED) =============
  // These fields are kept for backward compatibility and will be mapped internally
  
  /** @deprecated Use custom_mode instead */
  customMode?: boolean
  /** @deprecated Use make_instrumental instead */
  instrumental?: boolean
  /** @deprecated Use mv instead */
  model?: string
  /** @deprecated Use tags instead */
  style?: string
  /** @deprecated Use negative_tags instead */
  negativeTags?: string
  /** @deprecated Use vocal_gender instead */
  vocalGender?: "m" | "f"
  /** @deprecated Use style_weight instead */
  styleWeight?: number
  /** @deprecated Use weirdness_constraint instead */
  weirdnessConstraint?: number
  /** @deprecated Use webhook_url instead */
  callBackUrl?: string
}

/**
 * Extend Music Parameters (Official API Specification)
 * 
 * Use the clip id of the song generated on the platform to extend the song
 * 
 * REQUIRED FIELDS:
 * - task_type: "extend_music"
 * - custom_mode: true (always required for extend)
 * - prompt: Song lyrics
 * - continue_clip_id: Clip ID of song to extend
 * - continue_at: Starting number of seconds to extend
 * - mv: Model version
 * 
 * @see https://docs.sunoapi.com/create-suno-music
 */
export interface ExtendMusicParams {
  /** Clip ID of the song to be extended (REQUIRED) */
  audioId: string
  
  /** Custom parameters flag */
  defaultParamFlag?: boolean
  
  /** 
   * Song lyrics (REQUIRED when defaultParamFlag = true)
   * Max length: 
   * - v4 and below: 3000 characters
   * - v4.5+: 5000 characters
   */
  prompt?: string
  
  /** 
   * Song's style or genre (REQUIRED when defaultParamFlag = true)
   * Max length:
   * - v4 and below: 200 characters
   * - v4.5+: 1000 characters
   */
  style?: string
  
  /** Song title (REQUIRED when defaultParamFlag = true) */
  title?: string
  
  /** Starting number of seconds to extend (REQUIRED when defaultParamFlag = true) */
  continueAt?: number
  
  /** Persona ID (optional) */
  personaId?: string
  
  /** Model version */
  model?: "V3_5" | "V4" | "V4_5" | "V4_5PLUS" | "V5"
  
  /** Elements to avoid in your songs */
  negativeTags?: string
  
  /** Control vocal gender: "f" (Female) or "m" (Male) */
  vocalGender?: "m" | "f"
  
  /** Weight of the tags field (style). Range: 0-1 */
  styleWeight?: number
  
  /** Randomness or weirdness of the song. Range: 0-1 */
  weirdnessConstraint?: number
  
  /** Audio weight. Range: 0-1 */
  audioWeight?: number
  
  /** Webhook callback URL (will be auto-generated if not provided) */
  callBackUrl?: string
}

/**
 * Concat Music Parameters (Official API Specification)
 * 
 * Get the complete song corresponding to the extend operation
 * 
 * REQUIRED FIELDS:
 * - task_type: "concat_music"
 * - continue_clip_id: The clip id you get after extend
 * 
 * @see https://docs.sunoapi.com/create-suno-music
 */
export interface ConcatMusicParams {
  /** The clip id you get after extend (REQUIRED) */
  continue_clip_id: string
}

/**
 * Cover Music Parameters (Official API Specification)
 * 
 * Cover the specified song (must be generated on the platform)
 * 
 * REQUIRED FIELDS:
 * - task_type: "cover_music"
 * - custom_mode: true
 * - continue_clip_id: Clip ID of original song you want to cover
 * - prompt: Song lyrics
 * - mv: Model version
 * 
 * @see https://docs.sunoapi.com/create-suno-music
 */
export interface CoverMusicParams {
  /** Clip ID of the original song you want to cover (REQUIRED) */
  continue_clip_id: string
  
  /** Custom mode flag (REQUIRED - must be true) */
  custom_mode: boolean
  
  /** 
   * Song lyrics (REQUIRED)
   * Max length: 
   * - v4 and below: 3000 characters
   * - v4.5+: 5000 characters
   */
  prompt: string
  
  /** 
   * Model version (REQUIRED)
   * Values: chirp-v3-5, chirp-v4, chirp-v4-5, chirp-v4-5-plus, chirp-v5
   */
  mv: "chirp-v3-5" | "chirp-v4" | "chirp-v4-5" | "chirp-v4-5-plus" | "chirp-v5"
  
  /** 
   * Song title (Optional)
   * Max length: 120 characters
   */
  title?: string
  
  /** 
   * Song's style or genre (Optional)
   * Max length:
   * - v4 and below: 200 characters
   * - v4.5+: 1000 characters
   */
  tags?: string
  
  // Legacy fields for backward compatibility
  /** @deprecated Use continue_clip_id instead */
  uploadUrl?: string
  /** @deprecated Use custom_mode instead */
  customMode?: boolean
  /** @deprecated Use make_instrumental instead */
  instrumental?: boolean
  /** @deprecated Use mv instead */
  model?: "V3_5" | "V4" | "V4_5" | "V4_5PLUS" | "V5"
  /** @deprecated Use tags instead */
  style?: string
  /** @deprecated */
  personaId?: string
  /** @deprecated Use negative_tags instead */
  negativeTags?: string
  /** @deprecated Use vocal_gender instead */
  vocalGender?: "male" | "female" | "mixed"
  /** @deprecated Use style_weight instead */
  styleWeight?: number
  /** @deprecated Use weirdness_constraint instead */
  weirdnessConstraint?: number
  /** @deprecated */
  audioWeight?: number
  /** @deprecated Use webhook_url instead */
  callBackUrl?: string
}

// Generate Lyrics
export interface GenerateLyricsParams {
  prompt: string
  callBackUrl: string // Required per official documentation
}

// Add Vocals
export interface AddVocalsParams {
  prompt: string
  title: string
  negativeTags: string
  style: string
  uploadUrl: string
  callBackUrl: string
  vocalGender?: "m" | "f"
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
  model?: "V4_5PLUS" | "V5"
}

// Add Instrumental
export interface AddInstrumentalParams {
  uploadUrl: string
  title: string
  negativeTags: string
  tags: string
  callBackUrl: string
  vocalGender?: "m" | "f"
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
  model?: "V4_5PLUS" | "V5"
}

// Boost Music Style
export interface BoostMusicStyleParams {
  content: string
}

// Generate Persona
export interface GeneratePersonaParams {
  taskId: string
  musicIndex: number
  name: string
  description: string
}

// Convert to WAV
export interface ConvertToWavParams {
  taskId: string
  audioId: string
  callBackUrl: string
}

// Separate Vocals
export interface SeparateVocalsParams {
  taskId: string
  audioId: string
  type?: "separate_vocal" | "split_stem" // Optional, defaults to "separate_vocal"
  callBackUrl: string // Required per official documentation
}

// Create Music Video
export interface CreateMusicVideoParams {
  taskId: string
  audioId: string
  callBackUrl: string // Required per official documentation
  author?: string // Optional, max 50 chars
  domainName?: string // Optional, max 50 chars
}

// Get Timestamped Lyrics
export interface GetTimestampedLyricsParams {
  taskId: string
  audioId?: string
  musicIndex?: 0 | 1
}

// Replace Music Section
export interface ReplaceMusicSectionParams {
  taskId: string
  musicIndex: number
  prompt: string
  tags: string
  title: string
  negativeTags?: string
  infillStartS: number
  infillEndS: number
  callBackUrl?: string
}

// Generate Music Cover Image
export interface GenerateMusicCoverParams {
  taskId: string
  callBackUrl: string
}

// API Response Types
export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

export interface TaskResponse {
  taskId: string
}

export interface MusicGenerationResult {
  id: string
  audioUrl: string
  streamAudioUrl: string
  videoUrl?: string
  imageUrl: string
  prompt: string
  modelName: string
  title: string
  tags: string
  duration: number
  status: "pending" | "processing" | "complete" | "error"
  createTime: string
  lyrics?: string
}

export interface CreditsResponse {
  credits: number
  usedCredits?: number
  totalCredits?: number
}

export interface MusicVideoDetailsResponse {
  taskId: string
  musicId: string
  callbackUrl: string
  musicIndex: number
  completeTime?: string
  response?: {
    videoUrl: string
  }
  successFlag: "PENDING" | "SUCCESS" | "CREATE_TASK_FAILED" | "GENERATE_MP4_FAILED" | "CALLBACK_EXCEPTION"
  createTime: string
  errorCode?: number
  errorMessage?: string
}

// File Upload Interfaces
export interface Base64UploadParams {
  base64Data: string // Base64 encoded file data or data URL format
  uploadPath: string // File upload path without leading/trailing slashes
  fileName?: string // Optional filename with extension
}

export interface StreamUploadParams {
  file: File | Blob // File to upload (binary data)
  uploadPath: string // File upload path without leading/trailing slashes
  fileName?: string // Optional filename with extension
}

export interface UrlUploadParams {
  fileUrl: string // File download URL (HTTP or HTTPS)
  uploadPath: string // File upload path without leading/trailing slashes
  fileName?: string // Optional filename with extension
}

export interface FileUploadResult {
  fileName: string // File name
  filePath: string // Complete file path in storage
  downloadUrl: string // File download URL
  fileSize: number // File size in bytes
  mimeType: string // File MIME type
  uploadedAt: string // Upload timestamp (ISO format)
}

export interface LyricsResult {
  alignedWords?: Array<{
    word: string
    success: boolean
    startS: number
    endS: number
    palign: number
  }>
  waveformData?: number[]
  hootCer?: number
  isStreamed?: boolean
  lyrics?: string
  timestampedLyrics?: Array<{
    timestamp: number
    text: string
  }>
}

export interface LyricsGenerationResult {
  text: string
  title: string
  status: "complete" | "failed"
  errorMessage: string
}

export interface LyricsDetailsResponse {
  taskId: string
  param: string
  response: {
    taskId: string
    data: LyricsGenerationResult[]
  }
  status:
    | "PENDING"
    | "SUCCESS"
    | "CREATE_TASK_FAILED"
    | "GENERATE_LYRICS_FAILED"
    | "CALLBACK_EXCEPTION"
    | "SENSITIVE_WORD_ERROR"
  type: "LYRICS"
  errorCode?: number
  errorMessage?: string
}

export interface SeparationResult {
  vocalUrl: string
  instrumentalUrl: string
}

export interface VocalSeparationDetailsResponse {
  taskId: string
  musicId: string
  callbackUrl: string
  musicIndex: number
  completeTime?: string
  response?: {
    originUrl?: string
    instrumentalUrl?: string
    vocalUrl?: string
    backingVocalsUrl?: string
    drumsUrl?: string
    bassUrl?: string
    guitarUrl?: string
    keyboardUrl?: string
    percussionUrl?: string
    stringsUrl?: string
    synthUrl?: string
    fxUrl?: string
    brassUrl?: string
    woodwindsUrl?: string
  }
  successFlag: "PENDING" | "SUCCESS" | "CREATE_TASK_FAILED" | "GENERATE_AUDIO_FAILED" | "CALLBACK_EXCEPTION"
  createTime: string
  errorCode?: number
  errorMessage?: string
}

export interface MusicGenerationDetailsResponse {
  taskId: string
  parentMusicId?: string
  param: string
  response: {
    taskId: string
    sunoData: Array<{
      id: string
      audioUrl: string
      streamAudioUrl: string
      imageUrl: string
      prompt: string
      modelName: string
      title: string
      tags: string
      createTime: string
      duration: number
    }>
  }
  status:
    | "PENDING"
    | "TEXT_SUCCESS"
    | "FIRST_SUCCESS"
    | "SUCCESS"
    | "CREATE_TASK_FAILED"
    | "GENERATE_AUDIO_FAILED"
    | "CALLBACK_EXCEPTION"
    | "SENSITIVE_WORD_ERROR"
  type: "GENERATE" | "EXTEND" | "UPLOAD_COVER" | "UPLOAD_EXTEND"
  operationType?: "generate" | "extend" | "upload_cover" | "upload_extend"
  errorCode?: number
  errorMessage?: string
}

// CoverDetailsResponse interface for cover generation details
export interface CoverDetailsResponse {
  taskId: string
  parentTaskId: string
  callbackUrl: string
  completeTime?: string
  response?: {
    images: string[]
  }
  successFlag: 0 | 1 | 2 | 3 // 0-Pending, 1-Success, 2-Generating, 3-Generation failed
  createTime: string
  errorCode?: number
  errorMessage?: string
}

// PersonaResponse interface for persona generation
export interface PersonaResponse {
  personaId: string
  name: string
  description: string
}

export interface BoostStyleResponse {
  // Define the structure of BoostStyleResponse here
  id: string
  styleUrl: string
}

export class SunoAPIClient {
  private apiKey: string
  private baseUrl: string

  constructor(config: SunoConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || "https://api.aimusicapi.ai/api/v1"
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  // Music Generation APIs
  async generateMusic(params: GenerateMusicParams): Promise<ApiResponse<TaskResponse>> {
    // Validate based on official documentation at https://docs.sunoapi.org/
    
    if (params.customMode) {
      // CUSTOM MODE validation
      // If gpt_description_prompt is provided, it auto-generates everything (style, title, lyrics)
      // Otherwise, requires manual inputs
      
      if (!params.gpt_description_prompt) {
        // Manual mode: need explicit inputs
        
        if (params.instrumental === false) {
          // Custom Mode + NOT instrumental: requires style, title, AND prompt (as exact lyrics)
          if (!params.style) {
            throw new SunoAPIError("style is required in Custom Mode (or use gpt_description_prompt)", 400)
          }
          if (!params.title) {
            throw new SunoAPIError("title is required in Custom Mode (or use gpt_description_prompt)", 400)
          }
          if (!params.prompt) {
            throw new SunoAPIError("prompt (lyrics) is required in Custom Mode when instrumental is false", 400)
          }
        } else if (params.instrumental === true) {
          // Custom Mode + instrumental: requires only style and title
          if (!params.style) {
            throw new SunoAPIError("style is required in Custom Mode (or use gpt_description_prompt)", 400)
          }
          if (!params.title) {
            throw new SunoAPIError("title is required in Custom Mode (or use gpt_description_prompt)", 400)
          }
        } else {
          // instrumental is undefined - treat as auto-mode, requires at least description
          if (!params.style && !params.title && !params.prompt) {
            throw new SunoAPIError("Custom Mode requires either gpt_description_prompt, or style+title, or prompt", 400)
          }
        }
      }
      // If gpt_description_prompt is provided, no other validation needed - API will auto-generate
    } else {
      // NON-CUSTOM MODE validation
      // Always requires prompt (used as idea, lyrics auto-generated)
      if (!params.prompt) {
        throw new SunoAPIError("prompt is required in Non-custom Mode", 400)
      }
      // Validate max 500 characters for non-custom mode
      if (params.prompt.length > 500) {
        throw new SunoAPIError("Prompt in Non-custom Mode exceeds maximum of 500 characters", 413)
      }
    }

    // Validate prompt length for Custom Mode (model-specific limits)
    if (params.customMode && params.prompt) {
      const isV3OrV4 = params.model === "V3_5" || params.model === "V4"
      const maxLength = isV3OrV4 ? 3000 : 5000
      if (params.prompt.length > maxLength) {
        throw new SunoAPIError(
          `Prompt exceeds maximum character limit of ${maxLength} for ${params.model}`,
          413,
        )
      }
    }

    // Validate style length (model-specific limits)
    if (params.style) {
      const isV3OrV4 = params.model === "V3_5" || params.model === "V4"
      const maxLength = isV3OrV4 ? 200 : 1000
      if (params.style.length > maxLength) {
        throw new SunoAPIError(`Style exceeds maximum character limit of ${maxLength} for ${params.model}`, 413)
      }
    }

    // Validate title length (max 80 characters)
    if (params.title && params.title.length > 80) {
      throw new SunoAPIError("Title exceeds maximum character limit of 80 characters", 413)
    }

    // Validate optional range parameters (0-1)
    if (params.styleWeight !== undefined && (params.styleWeight < 0 || params.styleWeight > 1)) {
      throw new SunoAPIError("styleWeight must be between 0 and 1", 400)
    }

    if (
      params.weirdnessConstraint !== undefined &&
      (params.weirdnessConstraint < 0 || params.weirdnessConstraint > 1)
    ) {
      throw new SunoAPIError("weirdnessConstraint must be between 0 and 1", 400)
    }

    return this.request("/generate", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async extendMusic(params: ExtendMusicParams): Promise<ApiResponse<TaskResponse>> {
    // Validate based on official documentation at https://docs.sunoapi.org/
    
    // audioId is ALWAYS required
    if (!params.audioId) {
      throw new SunoAPIError("audioId is required", 400)
    }

    if (params.defaultParamFlag) {
      // CUSTOM PARAMETERS MODE: requires continueAt, prompt, style, and title
      if (params.continueAt === undefined) {
        throw new SunoAPIError("continueAt is required when defaultParamFlag is true", 400)
      }
      if (!params.prompt) {
        throw new SunoAPIError("prompt is required when defaultParamFlag is true", 400)
      }
      if (!params.style) {
        throw new SunoAPIError("style is required when defaultParamFlag is true", 400)
      }
      if (!params.title) {
        throw new SunoAPIError("title is required when defaultParamFlag is true", 400)
      }

      // Validate continueAt range (must be > 0 and < audio duration)
      if (params.continueAt <= 0) {
        throw new SunoAPIError("continueAt must be greater than 0", 400)
      }
    }
    // When defaultParamFlag is false: only audioId is required (uses original audio parameters)

    // Validate optional range parameters (0-1)
    if (params.styleWeight !== undefined && (params.styleWeight < 0 || params.styleWeight > 1)) {
      throw new SunoAPIError("styleWeight must be between 0 and 1", 400)
    }

    if (
      params.weirdnessConstraint !== undefined &&
      (params.weirdnessConstraint < 0 || params.weirdnessConstraint > 1)
    ) {
      throw new SunoAPIError("weirdnessConstraint must be between 0 and 1", 400)
    }

    if (params.audioWeight !== undefined && (params.audioWeight < 0 || params.audioWeight > 1)) {
      throw new SunoAPIError("audioWeight must be between 0 and 1", 400)
    }

    return this.request("/generate/extend", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async coverMusic(params: CoverMusicParams): Promise<ApiResponse<TaskResponse>> {
    // Validate based on official documentation at https://docs.sunoapi.org/
    
    // uploadUrl is ALWAYS required (audio file URL, max 2 minutes)
    if (!params.uploadUrl) {
      throw new SunoAPIError("uploadUrl is required", 400)
    }

    // Validate URL format
    try {
      new URL(params.uploadUrl)
    } catch {
      throw new SunoAPIError("uploadUrl must be a valid URL", 400)
    }

    // Validate based on customMode (same logic as generateMusic)
    if (params.customMode) {
      // CUSTOM MODE validation
      if (!params.instrumental) {
        // Custom Mode + NOT instrumental: requires style, title, AND prompt (as exact lyrics)
        if (!params.style) {
          throw new SunoAPIError("style is required in Custom Mode", 400)
        }
        if (!params.title) {
          throw new SunoAPIError("title is required in Custom Mode", 400)
        }
        if (!params.prompt) {
          throw new SunoAPIError("prompt (lyrics) is required in Custom Mode when instrumental is false", 400)
        }
      } else {
        // Custom Mode + instrumental: requires only style and title
        if (!params.style) {
          throw new SunoAPIError("style is required in Custom Mode", 400)
        }
        if (!params.title) {
          throw new SunoAPIError("title is required in Custom Mode", 400)
        }
      }
    } else {
      // NON-CUSTOM MODE validation
      // Always requires prompt (used as idea, lyrics auto-generated)
      if (!params.prompt) {
        throw new SunoAPIError("prompt is required in Non-custom Mode", 400)
      }
      // Validate max 500 characters for non-custom mode
      if (params.prompt.length > 500) {
        throw new SunoAPIError("Prompt in Non-custom Mode exceeds maximum of 500 characters", 413)
      }
    }

    // Validate prompt length for Custom Mode (model-specific limits)
    if (params.customMode && params.prompt) {
      const isV3OrV4 = params.model === "V3_5" || params.model === "V4"
      const maxLength = isV3OrV4 ? 3000 : 5000
      if (params.prompt.length > maxLength) {
        throw new SunoAPIError(
          `Prompt exceeds maximum character limit of ${maxLength} for ${params.model}`,
          413,
        )
      }
    }

    // Validate style length (model-specific limits)
    if (params.style) {
      const isV3OrV4 = params.model === "V3_5" || params.model === "V4"
      const maxLength = isV3OrV4 ? 200 : 1000
      if (params.style.length > maxLength) {
        throw new SunoAPIError(`Style exceeds maximum character limit of ${maxLength} for ${params.model}`, 413)
      }
    }

    // Validate title length (model-specific limits)
    if (params.title) {
      const isV3OrV4 = params.model === "V3_5" || params.model === "V4"
      const maxLength = isV3OrV4 ? 80 : 100
      if (params.title.length > maxLength) {
        throw new SunoAPIError(`Title exceeds maximum character limit of ${maxLength} for ${params.model}`, 413)
      }
    }

    // Validate optional range parameters (0-1)
    if (params.styleWeight !== undefined && (params.styleWeight < 0 || params.styleWeight > 1)) {
      throw new SunoAPIError("styleWeight must be between 0 and 1", 400)
    }

    if (
      params.weirdnessConstraint !== undefined &&
      (params.weirdnessConstraint < 0 || params.weirdnessConstraint > 1)
    ) {
      throw new SunoAPIError("weirdnessConstraint must be between 0 and 1", 400)
    }

    if (params.audioWeight !== undefined && (params.audioWeight < 0 || params.audioWeight > 1)) {
      throw new SunoAPIError("audioWeight must be between 0 and 1", 400)
    }

    return this.request("/cover", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Concat Music - Get the complete song corresponding to the extend operation
   * @see https://docs.sunoapi.com/create-suno-music
   */
  async concatMusic(params: ConcatMusicParams): Promise<ApiResponse<TaskResponse>> {
    // Validate required field
    if (!params.continue_clip_id) {
      throw new SunoAPIError("continue_clip_id is required", 400)
    }

    return this.request("/suno/create", {
      method: "POST",
      body: JSON.stringify({
        task_type: "concat_music",
        continue_clip_id: params.continue_clip_id,
      }),
    })
  }

  async addVocals(params: AddVocalsParams): Promise<ApiResponse<TaskResponse>> {
    // Validate based on official documentation at https://docs.sunoapi.org/
    
    // Validate all required parameters
    if (!params.prompt) {
      throw new SunoAPIError("prompt is required", 400)
    }

    if (!params.title) {
      throw new SunoAPIError("title is required", 400)
    }

    if (!params.negativeTags) {
      throw new SunoAPIError("negativeTags is required", 400)
    }

    if (!params.style) {
      throw new SunoAPIError("style is required", 400)
    }

    if (!params.uploadUrl) {
      throw new SunoAPIError("uploadUrl is required", 400)
    }

    if (!params.callBackUrl) {
      throw new SunoAPIError("callBackUrl is required", 400)
    }

    // Validate URL format for uploadUrl
    try {
      new URL(params.uploadUrl)
    } catch {
      throw new SunoAPIError("uploadUrl must be a valid URL", 400)
    }

    // Validate URL format for callBackUrl
    try {
      new URL(params.callBackUrl)
    } catch {
      throw new SunoAPIError("callBackUrl must be a valid URL", 400)
    }

    // Validate optional range parameters (0-1)
    if (params.styleWeight !== undefined && (params.styleWeight < 0 || params.styleWeight > 1)) {
      throw new SunoAPIError("styleWeight must be between 0 and 1", 400)
    }

    if (
      params.weirdnessConstraint !== undefined &&
      (params.weirdnessConstraint < 0 || params.weirdnessConstraint > 1)
    ) {
      throw new SunoAPIError("weirdnessConstraint must be between 0 and 1", 400)
    }

    if (params.audioWeight !== undefined && (params.audioWeight < 0 || params.audioWeight > 1)) {
      throw new SunoAPIError("audioWeight must be between 0 and 1", 400)
    }

    return this.request("/generate/add-vocals", {
      method: "POST",
      body: JSON.stringify({
        ...params,
        model: params.model || "V4_5PLUS",
      }),
    })
  }

  async addInstrumental(params: AddInstrumentalParams): Promise<ApiResponse<TaskResponse>> {
    // Validate based on official documentation at https://docs.sunoapi.org/
    
    // Validate all required parameters
    if (!params.uploadUrl) {
      throw new SunoAPIError("uploadUrl is required", 400)
    }

    if (!params.title) {
      throw new SunoAPIError("title is required", 400)
    }

    if (!params.negativeTags) {
      throw new SunoAPIError("negativeTags is required", 400)
    }

    if (!params.tags) {
      throw new SunoAPIError("tags is required", 400)
    }

    if (!params.callBackUrl) {
      throw new SunoAPIError("callBackUrl is required", 400)
    }

    // Validate URL format for uploadUrl
    try {
      new URL(params.uploadUrl)
    } catch {
      throw new SunoAPIError("uploadUrl must be a valid URL", 400)
    }

    // Validate URL format for callBackUrl
    try {
      new URL(params.callBackUrl)
    } catch {
      throw new SunoAPIError("callBackUrl must be a valid URL", 400)
    }

    // Validate optional range parameters (0-1)
    if (params.styleWeight !== undefined && (params.styleWeight < 0 || params.styleWeight > 1)) {
      throw new SunoAPIError("styleWeight must be between 0 and 1", 400)
    }

    if (
      params.weirdnessConstraint !== undefined &&
      (params.weirdnessConstraint < 0 || params.weirdnessConstraint > 1)
    ) {
      throw new SunoAPIError("weirdnessConstraint must be between 0 and 1", 400)
    }

    if (params.audioWeight !== undefined && (params.audioWeight < 0 || params.audioWeight > 1)) {
      throw new SunoAPIError("audioWeight must be between 0 and 1", 400)
    }

    return this.request("/generate/add-instrumental", {
      method: "POST",
      body: JSON.stringify({
        ...params,
        model: params.model || "V4_5PLUS",
      }),
    })
  }

  async boostMusicStyle(params: BoostMusicStyleParams): Promise<ApiResponse<BoostStyleResponse>> {
    // Validate based on official documentation at https://docs.sunoapi.org/
    
    // content is REQUIRED - Style description in concise and clear language
    // Example: 'Pop, Mysterious'
    if (!params.content || params.content.trim() === "") {
      throw new SunoAPIError("content is required", 400)
    }

    // Validate content length (reasonable limit for style descriptions)
    if (params.content.length > 1000) {
      throw new SunoAPIError("Content exceeds maximum character limit of 1000 characters", 413)
    }

    return this.request("/style/generate", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async generatePersona(params: GeneratePersonaParams): Promise<ApiResponse<PersonaResponse>> {
    // Validate required parameters individually
    if (!params.taskId || params.taskId.trim() === "") {
      throw new SunoAPIError("taskId is required", 400)
    }
    
    if (params.musicIndex === undefined || params.musicIndex === null) {
      throw new SunoAPIError("musicIndex is required", 400)
    }
    
    if (typeof params.musicIndex !== "number" || params.musicIndex < 0) {
      throw new SunoAPIError("musicIndex must be a non-negative integer (0 or 1)", 400)
    }
    
    if (!params.name || params.name.trim() === "") {
      throw new SunoAPIError("name is required", 400)
    }
    
    if (!params.description || params.description.trim() === "") {
      throw new SunoAPIError("description is required", 400)
    }

    return this.request("/generate/generate-persona", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async replaceMusicSection(params: ReplaceMusicSectionParams): Promise<ApiResponse<TaskResponse>> {
    // Validate based on official documentation at https://docs.sunoapi.org/
    
    // taskId is REQUIRED - Original task ID (parent task)
    if (!params.taskId || params.taskId.trim() === "") {
      throw new SunoAPIError("taskId is required", 400)
    }

    // musicIndex is REQUIRED - Specifies which song to replace (starting from 0)
    if (params.musicIndex === undefined || params.musicIndex === null) {
      throw new SunoAPIError("musicIndex is required", 400)
    }

    if (params.musicIndex < 0) {
      throw new SunoAPIError("musicIndex must be non-negative (0 or greater)", 400)
    }

    // prompt is REQUIRED - Text describing the audio content
    if (!params.prompt || params.prompt.trim() === "") {
      throw new SunoAPIError("prompt is required", 400)
    }

    // tags is REQUIRED - Music style tags
    if (!params.tags || params.tags.trim() === "") {
      throw new SunoAPIError("tags is required", 400)
    }

    // title is REQUIRED - Music title
    if (!params.title || params.title.trim() === "") {
      throw new SunoAPIError("title is required", 400)
    }

    // infillStartS is REQUIRED - Start time point (seconds, 2 decimal places)
    if (params.infillStartS === undefined || params.infillStartS === null) {
      throw new SunoAPIError("infillStartS is required", 400)
    }

    // infillEndS is REQUIRED - End time point (seconds, 2 decimal places)
    if (params.infillEndS === undefined || params.infillEndS === null) {
      throw new SunoAPIError("infillEndS is required", 400)
    }

    // Validate time range
    if (params.infillStartS < 0 || params.infillEndS < 0) {
      throw new SunoAPIError("infillStartS and infillEndS must be non-negative", 400)
    }

    if (params.infillStartS >= params.infillEndS) {
      throw new SunoAPIError("infillStartS must be less than infillEndS", 400)
    }

    // Validate callBackUrl format if provided
    if (params.callBackUrl) {
      try {
        new URL(params.callBackUrl)
      } catch {
        throw new SunoAPIError("callBackUrl must be a valid URL", 400)
      }
    }

    return this.request("/generate/replace-section", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async generateCover(params: GenerateCoverParams): Promise<ApiResponse<CoverResponse>> {
    // Validate based on official documentation at https://docs.sunoapi.org/
    
    // taskId is REQUIRED - Original music task ID from generation interface
    if (!params.taskId || params.taskId.trim() === "") {
      throw new SunoAPIError("taskId is required", 400)
    }

    // callBackUrl is REQUIRED - URL for receiving cover generation completion updates
    if (!params.callBackUrl || params.callBackUrl.trim() === "") {
      throw new SunoAPIError("callBackUrl is required", 400)
    }

    // Validate URL format for callBackUrl
    try {
      new URL(params.callBackUrl)
    } catch {
      throw new SunoAPIError("callBackUrl must be a valid URL", 400)
    }

    return this.request("/suno/cover/generate", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async getMusicDetails(taskId: string): Promise<ApiResponse<MusicGenerationDetailsResponse>> {
    // Validate based on official documentation at https://docs.sunoapi.org/
    
    // taskId is REQUIRED
    if (!taskId || taskId.trim() === "") {
      throw new SunoAPIError("taskId is required", 400)
    }

    return this.request(`/generate/record-info?taskId=${encodeURIComponent(taskId)}`, {
      method: "GET",
    })
  }

  // Lyrics APIs
  async generateLyrics(params: GenerateLyricsParams): Promise<ApiResponse<TaskResponse>> {
    // Validate required parameters individually
    if (!params.prompt || params.prompt.trim() === "") {
      throw new SunoAPIError("prompt is required", 400)
    }

    if (!params.callBackUrl || params.callBackUrl.trim() === "") {
      throw new SunoAPIError("callBackUrl is required", 400)
    }

    // Validate callBackUrl format
    try {
      new URL(params.callBackUrl)
    } catch {
      throw new SunoAPIError("callBackUrl must be a valid URL", 400)
    }

    // Validate prompt length (max 200 words)
    const wordCount = params.prompt.trim().split(/\s+/).filter(word => word.length > 0).length
    if (wordCount > 200) {
      throw new SunoAPIError(`Prompt exceeds maximum word limit of 200 words (current: ${wordCount} words)`, 413)
    }

    return this.request("/lyrics", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async getTimestampedLyrics(params: GetTimestampedLyricsParams): Promise<ApiResponse<LyricsResult>> {
    // Validate based on official documentation at https://docs.sunoapi.org/
    
    // taskId is REQUIRED
    if (!params.taskId) {
      throw new SunoAPIError("taskId is required", 400)
    }

    // Either audioId OR musicIndex should be provided to identify the exact track
    if (!params.audioId && params.musicIndex === undefined) {
      throw new SunoAPIError("Either audioId or musicIndex should be provided", 400)
    }

    return this.request("/generate/get-timestamped-lyrics", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async getLyricsDetails(taskId: string): Promise<ApiResponse<LyricsDetailsResponse>> {
    // Validate taskId
    if (!taskId || taskId.trim() === "") {
      throw new SunoAPIError("taskId is required", 400)
    }

    return this.request(`/lyrics/record-info?taskId=${encodeURIComponent(taskId)}`, {
      method: "GET",
    })
  }

  // Audio Processing APIs
  async convertToWav(params: ConvertToWavParams): Promise<ApiResponse<TaskResponse>> {
    // Validate required parameters individually
    if (!params.taskId || params.taskId.trim() === "") {
      throw new SunoAPIError("taskId is required", 400)
    }

    if (!params.audioId || params.audioId.trim() === "") {
      throw new SunoAPIError("audioId is required", 400)
    }

    if (!params.callBackUrl || params.callBackUrl.trim() === "") {
      throw new SunoAPIError("callBackUrl is required", 400)
    }

    // Validate callBackUrl format
    try {
      new URL(params.callBackUrl)
    } catch {
      throw new SunoAPIError("callBackUrl must be a valid URL", 400)
    }

    return this.request("/wav/generate", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async getWavDetails(taskId: string): Promise<ApiResponse<WavDetailsResponse>> {
    // Validate taskId
    if (!taskId || taskId.trim() === "") {
      throw new SunoAPIError("taskId is required", 400)
    }

    return this.request(`/wav/record-info?taskId=${encodeURIComponent(taskId)}`, {
      method: "GET",
    })
  }

  async separateVocals(params: SeparateVocalsParams): Promise<ApiResponse<TaskResponse>> {
    // Validate required parameters individually
    if (!params.taskId || params.taskId.trim() === "") {
      throw new SunoAPIError("taskId is required", 400)
    }

    if (!params.audioId || params.audioId.trim() === "") {
      throw new SunoAPIError("audioId is required", 400)
    }

    if (!params.callBackUrl || params.callBackUrl.trim() === "") {
      throw new SunoAPIError("callBackUrl is required", 400)
    }

    // Validate callBackUrl format
    try {
      new URL(params.callBackUrl)
    } catch {
      throw new SunoAPIError("callBackUrl must be a valid URL", 400)
    }

    // Validate type if provided
    if (params.type && !["separate_vocal", "split_stem"].includes(params.type)) {
      throw new SunoAPIError("type must be either 'separate_vocal' or 'split_stem'", 400)
    }

    return this.request("/vocal-removal/generate", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async getVocalSeparationDetails(taskId: string): Promise<ApiResponse<VocalSeparationDetailsResponse>> {
    // Validate taskId
    if (!taskId || taskId.trim() === "") {
      throw new SunoAPIError("taskId is required", 400)
    }

    return this.request(`/vocal-removal/record-info?taskId=${encodeURIComponent(taskId)}`, {
      method: "GET",
    })
  }

  // File Upload APIs
  async uploadFileBase64(params: Base64UploadParams): Promise<ApiResponse<FileUploadResult>> {
    // Validate required parameters individually
    if (!params.base64Data || params.base64Data.trim() === "") {
      throw new SunoAPIError("base64Data is required", 400)
    }

    if (!params.uploadPath || params.uploadPath.trim() === "") {
      throw new SunoAPIError("uploadPath is required", 400)
    }

    // Validate uploadPath format (no leading/trailing slashes)
    if (params.uploadPath.startsWith("/") || params.uploadPath.endsWith("/")) {
      throw new SunoAPIError("uploadPath must not have leading or trailing slashes", 400)
    }

    // Validate base64 format (supports data URL or pure base64)
    const base64Pattern = /^(?:data:[a-zA-Z0-9\/+\-]+;base64,)?[A-Za-z0-9+/]+=*$/
    if (!base64Pattern.test(params.base64Data.replace(/\s/g, ""))) {
      throw new SunoAPIError("Invalid base64Data format", 400)
    }

    return this.request("/file-base64-upload", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async uploadFileStream(params: StreamUploadParams): Promise<ApiResponse<FileUploadResult>> {
    // Validate required parameters individually
    if (!params.file) {
      throw new SunoAPIError("file is required", 400)
    }

    if (!params.uploadPath || params.uploadPath.trim() === "") {
      throw new SunoAPIError("uploadPath is required", 400)
    }

    // Validate uploadPath format (no leading/trailing slashes)
    if (params.uploadPath.startsWith("/") || params.uploadPath.endsWith("/")) {
      throw new SunoAPIError("uploadPath must not have leading or trailing slashes", 400)
    }

    const formData = new FormData()
    formData.append("file", params.file)
    formData.append("uploadPath", params.uploadPath)
    if (params.fileName) {
      formData.append("fileName", params.fileName)
    }

    return this.request("/file-stream-upload", {
      method: "POST",
      body: formData,
    })
  }

  async uploadFileUrl(params: UrlUploadParams): Promise<ApiResponse<FileUploadResult>> {
    // Validate required parameters individually
    if (!params.fileUrl || params.fileUrl.trim() === "") {
      throw new SunoAPIError("fileUrl is required", 400)
    }

    if (!params.uploadPath || params.uploadPath.trim() === "") {
      throw new SunoAPIError("uploadPath is required", 400)
    }

    // Validate uploadPath format (no leading/trailing slashes)
    if (params.uploadPath.startsWith("/") || params.uploadPath.endsWith("/")) {
      throw new SunoAPIError("uploadPath must not have leading or trailing slashes", 400)
    }

    // Validate URL format
    try {
      new URL(params.fileUrl)
    } catch {
      throw new SunoAPIError("fileUrl must be a valid URL", 400)
    }

    return this.request("/file-url-upload", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  // Video APIs
  async createMusicVideo(params: CreateMusicVideoParams): Promise<ApiResponse<TaskResponse>> {
    // Validate required parameters individually
    if (!params.taskId || params.taskId.trim() === "") {
      throw new SunoAPIError("taskId is required", 400)
    }

    if (!params.audioId || params.audioId.trim() === "") {
      throw new SunoAPIError("audioId is required", 400)
    }

    if (!params.callBackUrl || params.callBackUrl.trim() === "") {
      throw new SunoAPIError("callBackUrl is required", 400)
    }

    // Validate callBackUrl format
    try {
      new URL(params.callBackUrl)
    } catch {
      throw new SunoAPIError("callBackUrl must be a valid URL", 400)
    }

    // Validate optional parameters if provided
    if (params.author && params.author.length > 50) {
      throw new SunoAPIError("author must not exceed 50 characters", 400)
    }

    if (params.domainName && params.domainName.length > 50) {
      throw new SunoAPIError("domainName must not exceed 50 characters", 400)
    }

    return this.request("/mp4/generate", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async getMusicVideoDetails(taskId: string): Promise<ApiResponse<MusicVideoDetailsResponse>> {
    // Validate taskId
    if (!taskId || taskId.trim() === "") {
      throw new SunoAPIError("taskId is required", 400)
    }

    return this.request(`/mp4/record-info?taskId=${encodeURIComponent(taskId)}`, {
      method: "GET",
    })
  }

  async getCoverDetails(taskId: string): Promise<ApiResponse<CoverDetailsResponse>> {
    // Validate taskId
    if (!taskId || taskId.trim() === "") {
      throw new SunoAPIError("taskId is required", 400)
    }

    return this.request(`/suno/cover/record-info?taskId=${encodeURIComponent(taskId)}`, {
      method: "GET",
    })
  }

  // Account Management
  async getRemainingCredits(): Promise<ApiResponse<CreditsResponse>> {
    return this.request("/user/subscription", {
      method: "GET",
    })
  }

  // File Upload APIs
  async uploadBase64(file: string, fileName: string): Promise<ApiResponse<{ uploadUrl: string }>> {
    return this.request("/file/upload-base64", {
      method: "POST",
      body: JSON.stringify({ file, fileName }),
    })
  }

  async uploadFromUrl(url: string): Promise<ApiResponse<{ uploadUrl: string }>> {
    return this.request("/file/upload-url", {
      method: "POST",
      body: JSON.stringify({ url }),
    })
  }

  async waitForCompletion(taskId: string, maxWaitTime = 600000): Promise<MusicGenerationDetailsResponse> {
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      const response = await this.getMusicDetails(taskId)

      if (response.code === 200 && response.data) {
        if (response.data.status === "SUCCESS") {
          return response.data
        }

        if (
          ["CREATE_TASK_FAILED", "GENERATE_AUDIO_FAILED", "CALLBACK_EXCEPTION", "SENSITIVE_WORD_ERROR"].includes(
            response.data.status,
          )
        ) {
          throw new SunoAPIError(response.data.errorMessage || "Task failed", response.data.errorCode || 500)
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 5000))
    }

    throw new Error("Task timeout")
  }

  async replaceSection(params: ReplaceMusicSectionParams): Promise<ApiResponse<TaskResponse>> {
    // Validate based on official documentation at https://docs.sunoapi.org/
    
    // taskId is REQUIRED
    if (!params.taskId || params.taskId.trim() === "") {
      throw new SunoAPIError("taskId is required", 400)
    }

    // musicIndex is REQUIRED
    if (params.musicIndex === undefined || params.musicIndex === null) {
      throw new SunoAPIError("musicIndex is required", 400)
    }

    if (params.musicIndex < 0) {
      throw new SunoAPIError("musicIndex must be non-negative", 400)
    }

    // prompt is REQUIRED
    if (!params.prompt || params.prompt.trim() === "") {
      throw new SunoAPIError("prompt is required", 400)
    }

    // tags is REQUIRED
    if (!params.tags || params.tags.trim() === "") {
      throw new SunoAPIError("tags is required", 400)
    }

    // title is REQUIRED
    if (!params.title || params.title.trim() === "") {
      throw new SunoAPIError("title is required", 400)
    }

    // infillStartS and infillEndS are REQUIRED
    if (params.infillStartS === undefined || params.infillStartS === null) {
      throw new SunoAPIError("infillStartS is required", 400)
    }

    if (params.infillEndS === undefined || params.infillEndS === null) {
      throw new SunoAPIError("infillEndS is required", 400)
    }

    // Validate time range
    if (params.infillStartS < 0 || params.infillEndS < 0) {
      throw new SunoAPIError("infillStartS and infillEndS must be non-negative", 400)
    }

    if (params.infillStartS >= params.infillEndS) {
      throw new SunoAPIError("infillStartS must be less than infillEndS", 400)
    }

    // Validate callBackUrl if provided
    if (params.callBackUrl) {
      try {
        new URL(params.callBackUrl)
      } catch {
        throw new SunoAPIError("callBackUrl must be a valid URL", 400)
      }
    }

    return this.request("/generate/replace-section", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async generateMusicCover(params: GenerateMusicCoverParams): Promise<ApiResponse<TaskResponse>> {
    // Validate based on official documentation at https://docs.sunoapi.org/
    
    // taskId is REQUIRED - Original music task ID from generation interface
    if (!params.taskId || params.taskId.trim() === "") {
      throw new SunoAPIError("taskId is required", 400)
    }

    // callBackUrl is REQUIRED - URL for receiving cover generation completion updates
    if (!params.callBackUrl || params.callBackUrl.trim() === "") {
      throw new SunoAPIError("callBackUrl is required", 400)
    }

    // Validate URL format for callBackUrl
    try {
      new URL(params.callBackUrl)
    } catch {
      throw new SunoAPIError("callBackUrl must be a valid URL", 400)
    }

    return this.request("/suno/cover/generate", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async uploadAndCover(params: UploadAndCoverParams): Promise<ApiResponse<TaskResponse>> {
    // Validate required parameters
    if (!params.uploadUrl) {
      throw new SunoAPIError("uploadUrl is required", 400)
    }

    // Validate URL format
    try {
      new URL(params.uploadUrl)
    } catch {
      throw new SunoAPIError("uploadUrl must be a valid URL", 400)
    }

    // Validate optional range parameters
    if (params.styleWeight !== undefined && (params.styleWeight < 0 || params.styleWeight > 1)) {
      throw new SunoAPIError("styleWeight must be between 0 and 1", 400)
    }

    if (
      params.weirdnessConstraint !== undefined &&
      (params.weirdnessConstraint < 0 || params.weirdnessConstraint > 1)
    ) {
      throw new SunoAPIError("weirdnessConstraint must be between 0 and 1", 400)
    }

    if (params.audioWeight !== undefined && (params.audioWeight < 0 || params.audioWeight > 1)) {
      throw new SunoAPIError("audioWeight must be between 0 and 1", 400)
    }

    return this.request("/upload/cover", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async uploadAndExtend(params: UploadAndExtendParams): Promise<ApiResponse<TaskResponse>> {
    // Validate based on official documentation at https://docs.sunoapi.org/
    
    // uploadUrl is ALWAYS required (audio file URL, max 2 minutes)
    if (!params.uploadUrl) {
      throw new SunoAPIError("uploadUrl is required", 400)
    }

    // Validate URL format
    try {
      new URL(params.uploadUrl)
    } catch {
      throw new SunoAPIError("uploadUrl must be a valid URL", 400)
    }

    if (params.defaultParamFlag) {
      // CUSTOM PARAMETER MODE: requires style, title, continueAt
      // + prompt if instrumental is false
      if (!params.style) {
        throw new SunoAPIError("style is required when defaultParamFlag is true", 400)
      }
      if (!params.title) {
        throw new SunoAPIError("title is required when defaultParamFlag is true", 400)
      }
      if (params.continueAt === undefined) {
        throw new SunoAPIError("continueAt is required when defaultParamFlag is true", 400)
      }

      // Validate continueAt range (must be > 0 and < audio duration)
      if (params.continueAt <= 0) {
        throw new SunoAPIError("continueAt must be greater than 0", 400)
      }

      // If NOT instrumental, prompt is required (used as exact lyrics)
      if (params.instrumental === false && !params.prompt) {
        throw new SunoAPIError("prompt is required when defaultParamFlag is true and instrumental is false", 400)
      }

      // Validate prompt length for custom mode (model-specific limits)
      if (params.prompt) {
        const isV3OrV4 = params.model === "V3_5" || params.model === "V4"
        const maxLength = isV3OrV4 ? 3000 : 5000
        if (params.prompt.length > maxLength) {
          throw new SunoAPIError(
            `Prompt exceeds maximum character limit of ${maxLength} for ${params.model}`,
            413,
          )
        }
      }

      // Validate style length (model-specific limits)
      if (params.style) {
        const isV3OrV4 = params.model === "V3_5" || params.model === "V4"
        const maxLength = isV3OrV4 ? 200 : 1000
        if (params.style.length > maxLength) {
          throw new SunoAPIError(`Style exceeds maximum character limit of ${maxLength} for ${params.model}`, 413)
        }
      }

      // Validate title length (model-specific limits)
      if (params.title) {
        const isV3OrV4 = params.model === "V3_5" || params.model === "V4"
        const maxLength = isV3OrV4 ? 80 : 100
        if (params.title.length > maxLength) {
          throw new SunoAPIError(`Title exceeds maximum character limit of ${maxLength} for ${params.model}`, 413)
        }
      }
    }
    // When defaultParamFlag is false: only uploadUrl is required

    // Validate optional range parameters (0-1)
    if (params.styleWeight !== undefined && (params.styleWeight < 0 || params.styleWeight > 1)) {
      throw new SunoAPIError("styleWeight must be between 0 and 1", 400)
    }

    if (
      params.weirdnessConstraint !== undefined &&
      (params.weirdnessConstraint < 0 || params.weirdnessConstraint > 1)
    ) {
      throw new SunoAPIError("weirdnessConstraint must be between 0 and 1", 400)
    }

    if (params.audioWeight !== undefined && (params.audioWeight < 0 || params.audioWeight > 1)) {
      throw new SunoAPIError("audioWeight must be between 0 and 1", 400)
    }

    return this.request("/upload/extend", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }
}

export interface UploadAndCoverParams {
  uploadUrl: string
  prompt?: string
  style?: string
  title?: string
  customMode: boolean
  instrumental: boolean
  personaId?: string
  model?: "V3_5" | "V4" | "V4_5" | "V4_5PLUS" | "V5"
  negativeTags?: string
  vocalGender?: "m" | "f"
  styleWeight?: number // 0-1
  weirdnessConstraint?: number // 0-1
  audioWeight?: number // 0-1
  callBackUrl?: string
}

export interface UploadAndExtendParams {
  uploadUrl: string
  defaultParamFlag: boolean
  model: "V3_5" | "V4" | "V4_5" | "V4_5PLUS" | "V5"
  callBackUrl: string
  instrumental?: boolean
  prompt?: string
  style?: string
  title?: string
  continueAt?: number
  personaId?: string
  negativeTags?: string
  vocalGender?: "male" | "female" | "mixed"
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
}

export interface BoostStyleResponse {
  taskId: string
  param: string
  result: string
  creditsConsumed: number
  creditsRemaining: number
  successFlag: string
  errorCode?: number
  errorMessage?: string
  createTime: string
}

export interface GenerateCoverParams {
  taskId: string
  callBackUrl: string
}

export interface CoverResponse {
  taskId: string
}

export class SunoAPIError extends Error {
  constructor(
    message: string,
    public code: number,
    public details?: unknown,
  ) {
    super(message)
    this.name = "SunoAPIError"
  }
}

let sunoClient: SunoAPIClient | null = null

export function getSunoClient(): SunoAPIClient {
  if (!sunoClient) {
    const apiKey = process.env.SUNO_API_KEY || ""
    if (!apiKey) {
      throw new Error("SUNO_API_KEY environment variable is not set")
    }
    sunoClient = new SunoAPIClient({ apiKey })
  }
  return sunoClient
}

export async function generateMusic(params: GenerateMusicParams): Promise<ApiResponse<TaskResponse>> {
  const client = getSunoClient()
  return client.generateMusic(params)
}

export async function generateLyrics(params: GenerateLyricsParams): Promise<ApiResponse<TaskResponse>> {
  const client = getSunoClient()
  return client.generateLyrics(params)
}

export async function getMusicDetails(taskId: string): Promise<ApiResponse<MusicGenerationDetailsResponse>> {
  const client = getSunoClient()
  return client.getMusicDetails(taskId)
}

export async function getLyricsDetails(taskId: string): Promise<ApiResponse<LyricsDetailsResponse>> {
  const client = getSunoClient()
  return client.getLyricsDetails(taskId)
}

export async function getRemainingCredits(): Promise<ApiResponse<CreditsResponse>> {
  const client = getSunoClient()
  return client.getRemainingCredits()
}

export async function uploadAndCover(params: UploadAndCoverParams): Promise<ApiResponse<TaskResponse>> {
  const client = getSunoClient()
  return client.uploadAndCover(params)
}

export async function uploadAndExtend(params: UploadAndExtendParams): Promise<ApiResponse<TaskResponse>> {
  const client = getSunoClient()
  return client.uploadAndExtend(params)
}

export async function addInstrumental(params: AddInstrumentalParams): Promise<ApiResponse<TaskResponse>> {
  const client = getSunoClient()
  return client.addInstrumental(params)
}

export async function addVocals(params: AddVocalsParams): Promise<ApiResponse<TaskResponse>> {
  const client = getSunoClient()
  return client.addVocals(params)
}

export async function getTimestampedLyrics(
  params: GetTimestampedLyricsParams,
): Promise<ApiResponse<LyricsResult>> {
  const client = getSunoClient()
  return client.getTimestampedLyrics(params)
}

export async function boostMusicStyle(params: BoostMusicStyleParams): Promise<ApiResponse<BoostStyleResponse>> {
  const client = getSunoClient()
  return client.boostMusicStyle(params)
}

export async function generateCover(params: GenerateCoverParams): Promise<ApiResponse<CoverResponse>> {
  const client = getSunoClient()
  return client.generateCover(params)
}

export async function replaceMusicSection(
  params: ReplaceMusicSectionParams,
): Promise<ApiResponse<TaskResponse>> {
  const client = getSunoClient()
  return client.replaceMusicSection(params)
}

export async function getCoverDetails(taskId: string): Promise<ApiResponse<CoverDetailsResponse>> {
  const client = getSunoClient()
  return client.getCoverDetails(taskId)
}

export async function generatePersona(params: GeneratePersonaParams): Promise<ApiResponse<PersonaResponse>> {
  const client = getSunoClient()
  return client.generatePersona(params)
}

export async function createMusicVideo(params: CreateMusicVideoParams): Promise<ApiResponse<TaskResponse>> {
  const client = getSunoClient()
  return client.createMusicVideo(params)
}

export async function getMusicVideoDetails(taskId: string): Promise<ApiResponse<MusicVideoDetailsResponse>> {
  const client = getSunoClient()
  return client.getMusicVideoDetails(taskId)
}

export async function uploadFileBase64(params: Base64UploadParams): Promise<ApiResponse<FileUploadResult>> {
  const client = getSunoClient()
  return client.uploadFileBase64(params)
}

export async function uploadFileStream(params: StreamUploadParams): Promise<ApiResponse<FileUploadResult>> {
  const client = getSunoClient()
  return client.uploadFileStream(params)
}

export async function uploadFileUrl(params: UrlUploadParams): Promise<ApiResponse<FileUploadResult>> {
  const client = getSunoClient()
  return client.uploadFileUrl(params)
}

export const SunoAPI = SunoAPIClient

export async function pollMusicStatus(taskId: string): Promise<
  ApiResponse<{
    callbackType: CallbackType
    task_id: string
    data: MusicGenerationDetailsResponse | null
  }>
> {
  const client = getSunoClient()
  const result = await client.getMusicDetails(taskId)

  let callbackType: CallbackType = "first"
  if (result.data.status === "SUCCESS") {
    callbackType = "complete"
  } else if (result.data.status === "TEXT_SUCCESS") {
    callbackType = "text"
  } else if (
    ["CREATE_TASK_FAILED", "GENERATE_AUDIO_FAILED", "CALLBACK_EXCEPTION", "SENSITIVE_WORD_ERROR"].includes(
      result.data.status,
    )
  ) {
    callbackType = "error"
  }

  return {
    code: result.code,
    msg: result.msg,
    data: {
      callbackType,
      task_id: taskId,
      data: result.data,
    },
  }
}

type CallbackType = "text" | "first" | "complete" | "error"

// WavDetailsResponse interface to match API documentation
export interface WavDetailsResponse {
  taskId: string
  musicId: string
  callbackUrl: string
  completeTime?: string
  response?: {
    audioWavUrl: string
  }
  successFlag: "PENDING" | "SUCCESS" | "CREATE_TASK_FAILED" | "GENERATE_WAV_FAILED" | "CALLBACK_EXCEPTION"
  createTime: string
  errorCode?: number
  errorMessage?: string
}

// Backward compatibility aliases for old API routes
export const getTaskStatus = getMusicDetails
export const getCredits = getRemainingCredits

// Wrapper function for backward compatibility with old extend music route
export async function extendMusic(params: ExtendMusicParams): Promise<ApiResponse<TaskResponse>> {
  const client = getSunoClient()
  return client.extendMusic(params)
}

// Export wrapper for convertToWav
export async function convertToWav(params: ConvertToWavParams): Promise<ApiResponse<TaskResponse>> {
  const client = getSunoClient()
  return client.convertToWav(params)
}

// Export wrapper for getWavDetails
export async function getWavDetails(taskId: string): Promise<ApiResponse<WavDetailsResponse>> {
  const client = getSunoClient()
  return client.getWavDetails(taskId)
}

// Export wrapper for separateVocals
export async function separateVocals(params: SeparateVocalsParams): Promise<ApiResponse<TaskResponse>> {
  const client = getSunoClient()
  return client.separateVocals(params)
}

// Export wrapper for getVocalSeparationDetails
export async function getVocalSeparationDetails(taskId: string): Promise<ApiResponse<VocalSeparationDetailsResponse>> {
  const client = getSunoClient()
  return client.getVocalSeparationDetails(taskId)
}

// Export type aliases for backward compatibility
export type SunoRecordInfoResponse = MusicGenerationDetailsResponse
