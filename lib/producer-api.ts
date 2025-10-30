/**
 * Producer API Client
 * 
 * Advanced AI-powered music generation with Suno v5-level quality at lightning speed.
 * Powered by FUZZ-2.0 model for professional-grade tracks in ~30 seconds.
 * 
 * Base URL: https://api.sunoapi.com/api/v1/producer
 * Alternative: https://api.aimusicapi.ai/api/v1/producer
 * 
 * @see https://docs.sunoapi.com/producer
 */

// ============================================================================
// Configuration & Error Handling
// ============================================================================

export interface ProducerConfig {
  apiKey: string
  baseUrl?: string
}

export class ProducerAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errorCode?: string
  ) {
    super(message)
    this.name = "ProducerAPIError"
  }
}

// ============================================================================
// Request Parameter Interfaces
// ============================================================================

/**
 * Task Types for Producer API
 */
export type ProducerTaskType =
  | "create_music"
  | "extend_music"
  | "cover_music"
  | "replace_music"
  | "swap_music_vocals"
  | "swap_music_sound"
  | "music_variation"

/**
 * Model Versions for Producer API
 */
export type ProducerModelVersion =
  | "FUZZ-2.0 Pro"
  | "FUZZ-2.0"
  | "FUZZ-2.0 Raw"
  | "FUZZ-1.1 Pro"
  | "FUZZ-1.1"
  | "FUZZ-1.0 Pro"
  | "FUZZ-1.0"
  | "FUZZ-0.8"

/**
 * Create Music Parameters
 * 
 * Generate new music tracks with vocals or instrumentals.
 * 
 * API Endpoint: POST /api/v1/producer/create
 * 
 * Required Fields:
 * - task_type: 'create_music'
 * - mv: Model version
 * - sound OR lyrics: At least one must be provided
 * 
 * @see https://docs.sunoapi.com/producer
 */
export interface ProducerCreateMusicParams {
  /** Task type (REQUIRED) */
  task_type: "create_music"
  
  /** 
   * Model version (REQUIRED)
   * Default: FUZZ-2.0
   * Recommended for production: FUZZ-2.0 Pro
   */
  mv: ProducerModelVersion
  
  /** 
   * Audio style prompt (REQUIRED if lyrics is empty)
   * Must be detailed and descriptive (minimum 10 words recommended)
   * Example: "upbeat electronic dance music with energetic synths, pulsing bass"
   */
  sound?: string
  
  /** 
   * Song lyrics (REQUIRED if sound is empty)
   * Minimum 20-30 words recommended
   * Include verse/chorus markers like [Verse 1], [Chorus]
   */
  lyrics?: string
  
  /** 
   * Track title (Optional)
   * Max length: 80 characters
   */
  title?: string
  
  /** 
   * Generate instrumental only (Optional)
   * Default: false
   * When true, ignores lyrics parameter
   */
  make_instrumental?: boolean
  
  /** 
   * Custom cover image URL (Optional)
   * Must be a valid HTTPS URL
   */
  cover_url?: string
  
  /** 
   * Random seed for reproducibility (Optional)
   * Use same seed for consistent results
   */
  seed?: string
  
  /** 
   * Lyrics adherence strength (Optional)
   * Range: 0-1
   * Default: 0.5
   * - 0-0.3: Loose interpretation
   * - 0.4-0.6: Balanced
   * - 0.7-1.0: Strict fidelity
   */
  lyrics_strength?: number
  
  /** 
   * Sound prompt strength (Optional)
   * Range: 0.2-1
   * Default: 0.5
   * - 0.2-0.4: Loose interpretation
   * - 0.5-0.7: Balanced
   * - 0.8-1.0: Strict adherence
   */
  sound_strength?: number
  
  /** 
   * Creative variation level (Optional)
   * Range: 0-1
   * Default: 0.5
   * - 0-0.3: Conventional
   * - 0.4-0.6: Moderate creativity
   * - 0.7-1.0: Experimental
   */
  weirdness?: number
}

/**
 * Extend Music Parameters
 * 
 * Continue an existing track from a specific timestamp.
 * 
 * Required Fields:
 * - task_type: 'extend_music'
 * - mv: Model version
 * - clip_id: Parent clip ID
 * - sound OR lyrics: At least one must be provided
 */
export interface ProducerExtendMusicParams {
  task_type: "extend_music"
  mv: ProducerModelVersion
  
  /** Parent clip ID (REQUIRED) */
  clip_id: string
  
  /** Description of extension (REQUIRED if lyrics empty) */
  sound?: string
  
  /** Lyrics for extension (REQUIRED if sound empty) */
  lyrics?: string
  
  /** 
   * Start time in seconds (Optional)
   * Default: 30
   */
  starts_at?: number
  
  title?: string
  lyrics_strength?: number
  sound_strength?: number
  weirdness?: number
  seed?: string
}

/**
 * Cover Music Parameters
 * 
 * Create a new version with different style or arrangement.
 * 
 * Required Fields:
 * - task_type: 'cover_music'
 * - mv: Model version
 * - clip_id: Original clip ID
 * - sound OR lyrics: At least one must be provided
 */
export interface ProducerCoverMusicParams {
  task_type: "cover_music"
  mv: ProducerModelVersion
  
  /** Original clip ID (REQUIRED) */
  clip_id: string
  
  /** New style description (REQUIRED if lyrics empty) */
  sound?: string
  
  /** New or same lyrics (REQUIRED if sound empty) */
  lyrics?: string
  
  /** 
   * Cover intensity (Optional)
   * Range: 0.2-1.0
   * - 0.2-0.5: Subtle reinterpretation
   * - 0.6-0.8: Moderate transformation
   * - 0.9-1.0: Dramatic reimagining
   */
  cover_strength?: number
  
  title?: string
  cover_url?: string
  lyrics_strength?: number
  sound_strength?: number
  weirdness?: number
  seed?: string
}

/**
 * Replace Music Section Parameters
 * 
 * Replace a specific segment with new content.
 * 
 * Required Fields:
 * - task_type: 'replace_music'
 * - mv: Model version
 * - clip_id: Clip ID to modify
 * - starts_at: Start time
 * - sound OR lyrics: At least one must be provided
 */
export interface ProducerReplaceMusicParams {
  task_type: "replace_music"
  mv: ProducerModelVersion
  
  /** Clip ID to modify (REQUIRED) */
  clip_id: string
  
  /** Start time in seconds (REQUIRED) */
  starts_at: number
  
  /** 
   * End time in seconds (Optional)
   * Omit to replace until end of track
   */
  ends_at?: number
  
  /** Replacement content description (REQUIRED if lyrics empty) */
  sound?: string
  
  /** Replacement lyrics (REQUIRED if sound empty) */
  lyrics?: string
  
  title?: string
  lyrics_strength?: number
  sound_strength?: number
  weirdness?: number
  seed?: string
}

/**
 * Swap Music Vocals Parameters
 * 
 * Replace vocal performance while keeping instrumentals.
 * 
 * Required Fields:
 * - task_type: 'swap_music_vocals'
 * - mv: Model version
 * - clip_id: Clip ID
 * - sound: Vocal style description
 * - lyrics: New or same lyrics
 */
export interface ProducerSwapVocalsParams {
  task_type: "swap_music_vocals"
  mv: ProducerModelVersion
  
  /** Clip ID (REQUIRED) */
  clip_id: string
  
  /** Vocal style description (REQUIRED) */
  sound: string
  
  /** Lyrics (REQUIRED) */
  lyrics: string
  
  /** 
   * Vocal transformation intensity (Optional)
   * Range: 0.2-1.0
   */
  cover_strength?: number
  
  title?: string
  lyrics_strength?: number
  sound_strength?: number
  weirdness?: number
  seed?: string
}

/**
 * Swap Music Sound Parameters
 * 
 * Replace instrumental arrangement while keeping vocals.
 * 
 * Required Fields:
 * - task_type: 'swap_music_sound'
 * - mv: Model version
 * - clip_id: Clip ID
 * - sound: Instrumental style description
 * - lyrics: Usually same lyrics
 */
export interface ProducerSwapSoundParams {
  task_type: "swap_music_sound"
  mv: ProducerModelVersion
  
  /** Clip ID (REQUIRED) */
  clip_id: string
  
  /** Instrumental style description (REQUIRED) */
  sound: string
  
  /** Lyrics (REQUIRED, typically same) */
  lyrics: string
  
  /** 
   * Instrumental transformation intensity (Optional)
   * Range: 0.2-1.0
   */
  cover_strength?: number
  
  title?: string
  lyrics_strength?: number
  sound_strength?: number
  weirdness?: number
  seed?: string
}

/**
 * Music Variation Parameters
 * 
 * Generate a different version with similar characteristics.
 * 
 * Required Fields:
 * - task_type: 'music_variation'
 * - mv: Model version
 * - clip_id: Original clip ID
 */
export interface ProducerMusicVariationParams {
  task_type: "music_variation"
  mv: ProducerModelVersion
  
  /** Original clip ID (REQUIRED) */
  clip_id: string
  
  seed?: string
}

/**
 * Upload Music Parameters
 * 
 * Upload your own audio for processing (costs 2 credits).
 * 
 * API Endpoint: POST /api/v1/producer/upload
 * 
 * Required Fields:
 * - audio_url: Public online music URL
 */
export interface ProducerUploadParams {
  /** Public online music URL (REQUIRED) */
  audio_url: string
}

/**
 * Download Music Parameters
 * 
 * Export track to MP3 or WAV format (costs 2 credits).
 * 
 * API Endpoint: POST /api/v1/producer/download
 * 
 * Required Fields:
 * - clip_id: Music clip ID
 * - format: Output format (mp3 or wav)
 */
export interface ProducerDownloadParams {
  /** Music clip ID (REQUIRED) */
  clip_id: string
  
  /** Output format (REQUIRED) */
  format: "mp3" | "wav"
}

// Union type for all create operations
export type ProducerCreateParams =
  | ProducerCreateMusicParams
  | ProducerExtendMusicParams
  | ProducerCoverMusicParams
  | ProducerReplaceMusicParams
  | ProducerSwapVocalsParams
  | ProducerSwapSoundParams
  | ProducerMusicVariationParams

// ============================================================================
// Response Interfaces
// ============================================================================

/**
 * Task Response (after creating a task)
 */
export interface ProducerTaskResponse {
  message: string
  task_id: string
}

/**
 * Music Data (single track)
 */
export interface ProducerMusicData {
  clip_id: string
  title: string | null
  sound: string
  lyrics: string
  image_url: string
  audio_url: string
  video_url: string | null
  created_at: string
  mv: string
  seed: string
  duration: number
  /** pending | running | succeeded */
  state: "pending" | "running" | "succeeded"
}

/**
 * Task Status Response (when polling)
 */
export interface ProducerTaskStatusResponse {
  code: number
  data: ProducerMusicData[]
  message: string
}

/**
 * Processing Response (202)
 */
export interface ProducerProcessingResponse {
  code: number
  type: string
  error: string
}

/**
 * Generic API Response
 */
export interface ProducerApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
}

// ============================================================================
// Producer API Client
// ============================================================================

export class ProducerAPIClient {
  private apiKey: string
  private baseUrl: string

  constructor(config: ProducerConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || "https://api.aimusicapi.ai/api/v1/producer"
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ProducerApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ProducerAPIError(
          data.error || data.message || `API request failed: ${response.statusText}`,
          response.status,
          data.code
        )
      }

      return {
        success: true,
        data,
        statusCode: response.status,
      }
    } catch (error) {
      if (error instanceof ProducerAPIError) {
        throw error
      }
      throw new ProducerAPIError(
        error instanceof Error ? error.message : "Unknown error occurred",
        500
      )
    }
  }

  /**
   * Create Music Task
   * 
   * Generate, extend, cover, replace, swap, or create variations of music.
   * 
   * API Endpoint: POST /api/v1/producer/create
   * 
   * @param params - Music creation parameters
   * @returns Promise with task_id for polling
   * 
   * @example
   * ```typescript
   * const result = await client.createMusic({
   *   task_type: 'create_music',
   *   mv: 'FUZZ-2.0',
   *   sound: 'emotional pop with gentle piano',
   *   lyrics: '[Verse 1]\\nCity lights shine bright...',
   *   title: 'City Dreams'
   * });
   * console.log(result.data.task_id);
   * ```
   * 
   * @see https://docs.sunoapi.com/producer
   */
  async createMusic(params: ProducerCreateParams): Promise<ProducerApiResponse<ProducerTaskResponse>> {
    // Validate task_type and mv are present
    if (!params.task_type) {
      throw new ProducerAPIError("task_type is required", 400)
    }
    if (!params.mv) {
      throw new ProducerAPIError("mv (model version) is required", 400)
    }

    // Validate sound/lyrics requirement for most task types
    if (params.task_type !== "music_variation") {
      const hasSound = "sound" in params && params.sound
      const hasLyrics = "lyrics" in params && params.lyrics
      
      if (!hasSound && !hasLyrics) {
        throw new ProducerAPIError(
          "Either 'sound' or 'lyrics' parameter must be provided and non-empty",
          400
        )
      }

      // Validate sound quality
      if (hasSound && params.sound) {
        if (params.sound.length < 10) {
          throw new ProducerAPIError(
            "sound parameter must be at least 10 characters for meaningful generation",
            400
          )
        }
        // Check for placeholder text
        const lowercaseSound = params.sound.toLowerCase()
        if (["test", "music", "song", "aaa", "123"].some(bad => lowercaseSound === bad)) {
          throw new ProducerAPIError(
            "sound parameter contains placeholder text. Please provide detailed musical description",
            400
          )
        }
      }

      // Validate lyrics quality
      if (hasLyrics && params.lyrics) {
        if (params.lyrics.length < 20) {
          throw new ProducerAPIError(
            "lyrics parameter must be at least 20 characters for meaningful generation",
            400
          )
        }
        // Check for placeholder text
        const lowercaseLyrics = params.lyrics.toLowerCase()
        if (["test", "aaa", "123", "test lyrics"].some(bad => lowercaseLyrics.includes(bad))) {
          throw new ProducerAPIError(
            "lyrics parameter contains placeholder text. Please provide real song lyrics",
            400
          )
        }
      }
    }

    // Validate clip_id for operations that require it
    if (
      params.task_type !== "create_music" &&
      !("clip_id" in params && params.clip_id)
    ) {
      throw new ProducerAPIError(
        `clip_id is required for task_type: ${params.task_type}`,
        400
      )
    }

    // Validate title length
    if ("title" in params && params.title && params.title.length > 80) {
      throw new ProducerAPIError("title exceeds maximum length of 80 characters", 413)
    }

    // Validate numeric ranges
    if ("lyrics_strength" in params && params.lyrics_strength !== undefined) {
      if (params.lyrics_strength < 0 || params.lyrics_strength > 1) {
        throw new ProducerAPIError("lyrics_strength must be between 0 and 1", 400)
      }
    }

    if ("sound_strength" in params && params.sound_strength !== undefined) {
      if (params.sound_strength < 0.2 || params.sound_strength > 1) {
        throw new ProducerAPIError("sound_strength must be between 0.2 and 1", 400)
      }
    }

    if ("weirdness" in params && params.weirdness !== undefined) {
      if (params.weirdness < 0 || params.weirdness > 1) {
        throw new ProducerAPIError("weirdness must be between 0 and 1", 400)
      }
    }

    if ("cover_strength" in params && params.cover_strength !== undefined) {
      if (params.cover_strength < 0.2 || params.cover_strength > 1) {
        throw new ProducerAPIError("cover_strength must be between 0.2 and 1", 400)
      }
    }

    // Validate starts_at for replace_music
    if (params.task_type === "replace_music" && !("starts_at" in params)) {
      throw new ProducerAPIError("starts_at is required for replace_music", 400)
    }

    // Validate cover_url format
    if ("cover_url" in params && params.cover_url) {
      try {
        const url = new URL(params.cover_url)
        if (url.protocol !== "https:") {
          throw new ProducerAPIError("cover_url must use HTTPS protocol", 400)
        }
      } catch {
        throw new ProducerAPIError("cover_url must be a valid URL", 400)
      }
    }

    return this.request("/create", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Upload Music
   * 
   * Upload your own audio for processing (costs 2 credits).
   * 
   * API Endpoint: POST /api/v1/producer/upload
   * 
   * @param params - Upload parameters
   * @returns Promise with task_id for polling
   * 
   * @example
   * ```typescript
   * const result = await client.uploadMusic({
   *   audio_url: 'https://example.com/audio/song.mp3'
   * });
   * // Poll with getMusic(result.data.task_id)
   * ```
   */
  async uploadMusic(params: ProducerUploadParams): Promise<ProducerApiResponse<ProducerTaskResponse>> {
    if (!params.audio_url) {
      throw new ProducerAPIError("audio_url is required", 400)
    }

    // Validate URL format
    try {
      new URL(params.audio_url)
    } catch {
      throw new ProducerAPIError("audio_url must be a valid URL", 400)
    }

    return this.request("/upload", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Download Music
   * 
   * Export track to MP3 or WAV format (costs 2 credits).
   * 
   * API Endpoint: POST /api/v1/producer/download
   * 
   * @param params - Download parameters
   * @returns Promise with task_id for polling
   * 
   * @example
   * ```typescript
   * const result = await client.downloadMusic({
   *   clip_id: '370c650a-88cd-4f4b-960d-801e686c8a7a',
   *   format: 'wav'
   * });
   * // Poll with getMusic(result.data.task_id)
   * ```
   */
  async downloadMusic(params: ProducerDownloadParams): Promise<ProducerApiResponse<ProducerTaskResponse>> {
    if (!params.clip_id) {
      throw new ProducerAPIError("clip_id is required", 400)
    }

    if (!params.format) {
      throw new ProducerAPIError("format is required", 400)
    }

    if (params.format !== "mp3" && params.format !== "wav") {
      throw new ProducerAPIError("format must be 'mp3' or 'wav'", 400)
    }

    return this.request("/download", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Get Music (Task Polling)
   * 
   * Poll for task completion and retrieve results.
   * Recommended polling interval: 5-10 seconds.
   * 
   * API Endpoint: GET /api/v1/producer/task/{task_id}
   * 
   * @param taskId - Task ID from create/upload/download
   * @returns Promise with music data or processing status
   * 
   * @example
   * ```typescript
   * // Poll every 10 seconds
   * const pollInterval = setInterval(async () => {
   *   const result = await client.getMusic(taskId);
   *   
   *   if (result.data?.code === 200) {
   *     const songs = result.data.data;
   *     if (songs[0].state === 'succeeded') {
   *       clearInterval(pollInterval);
   *       console.log('Completed!', songs[0].audio_url);
   *     }
   *   }
   * }, 10000);
   * ```
   */
  async getMusic(
    taskId: string
  ): Promise<ProducerApiResponse<ProducerTaskStatusResponse | ProducerProcessingResponse>> {
    if (!taskId) {
      throw new ProducerAPIError("taskId is required", 400)
    }

    return this.request(`/task/${taskId}`, {
      method: "GET",
    })
  }
}

// ============================================================================
// Export convenience function
// ============================================================================

/**
 * Create a new Producer API client
 * 
 * @param config - API configuration with key and optional base URL
 * @returns ProducerAPIClient instance
 * 
 * @example
 * ```typescript
 * const client = createProducerClient({
 *   apiKey: process.env.MUSICAPI_KEY!
 * });
 * ```
 */
export function createProducerClient(config: ProducerConfig): ProducerAPIClient {
  return new ProducerAPIClient(config)
}
