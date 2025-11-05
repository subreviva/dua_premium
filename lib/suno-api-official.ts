/**
 * ⚠️ SUNO API CLIENT - OFFICIAL IMPLEMENTATION
 * 
 * BASE URL: https://api.kie.ai/api/v1
 * DOCUMENTATION: Suno_API_MegaDetalhada.txt (MANDATORY REFERENCE)
 * 
 * This implementation follows the MEGA-DETAILED documentation with:
 * - camelCase parameters (customMode, audioId, callBackUrl)
 * - Only /generate and /generate/extend endpoints
 * - Callback system support
 * - Proper error codes (200, 400, 401, 402, 404, 408, 409, 413, 422, 429, 451, 455, 500, 501, 531)
 * 
 * CRITICAL: This is the ONLY correct implementation per Suno_API_MegaDetalhada.txt
 */

export interface SunoConfig {
  apiKey: string
  baseUrl?: string
}

/**
 * Generate Music Parameters
 * @see Suno_API_MegaDetalhada.txt Section 3
 */
export interface GenerateMusicParams {
  // REQUIRED FIELDS
  prompt: string           // Non-custom: max 500 chars | Custom V3_5/V4: max 3000 | Custom V4_5+: max 5000
  customMode: boolean      // false: simple mode | true: advanced control
  instrumental: boolean    // true: no vocals | false: with vocals
  model: "V3_5" | "V4" | "V4_5" | "V4_5PLUS" | "V5"
  callBackUrl: string      // HTTPS URL for callbacks (text → first → complete)

  // CONDITIONAL FIELDS (required if customMode: true)
  style?: string           // V3_5/V4: max 200 chars | V4_5+: max 1000 chars
  title?: string           // Max 80 characters

  // OPTIONAL FIELDS
  negativeTags?: string    // Styles to exclude
  vocalGender?: "m" | "f"  // Vocal preference
  styleWeight?: number     // 0-1 (2 decimals)
  weirdnessConstraint?: number  // 0-1 (2 decimals)
  audioWeight?: number     // 0-1 (2 decimals)
  personaId?: string       // Persona ID from Generate Persona
}

/**
 * Extend Music Parameters
 * @see Suno_API_MegaDetalhada.txt Section 5
 */
export interface ExtendMusicParams {
  // REQUIRED FIELDS
  audioId: string          // ID of track to extend
  defaultParamFlag: boolean  // true: use custom params | false: inherit original
  model: "V3_5" | "V4" | "V4_5" | "V4_5PLUS" | "V5"
  callBackUrl: string

  // CONDITIONAL FIELDS (required if defaultParamFlag: true)
  prompt?: string          // Extension lyrics/description
  style?: string
  title?: string
  continueAt?: number      // Start point in seconds

  // OPTIONAL FIELDS
  negativeTags?: string
  vocalGender?: "m" | "f"
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
  personaId?: string
}

/**
 * API Response Structure
 */
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

export interface TaskResponse {
  taskId: string
}

export interface TaskStatusResponse {
  taskId: string
  status: "PENDING" | "TEXT_SUCCESS" | "FIRST_SUCCESS" | "SUCCESS" | "CREATE_TASK_FAILED" | "GENERATE_AUDIO_FAILED" | "CALLBACK_EXCEPTION" | "SENSITIVE_WORD_ERROR"
  response?: {
    sunoData: Array<{
      id: string
      audioUrl: string
      streamAudioUrl: string
      imageUrl: string
      prompt: string
      title: string
      tags: string
      duration: number
      createTime: string
      model_name?: string
    }>
  }
  errorMessage?: string
  errorCode?: number
}

/**
 * Callback Request Structure
 * @see Suno_API_MegaDetalhada.txt Section 4 & 6
 */
export interface CallbackRequest {
  code: number
  msg: string
  data: {
    callbackType: "text" | "first" | "complete" | "error"
    task_id: string
    data: Array<{
      id: string
      audio_url: string
      stream_audio_url: string
      image_url: string
      prompt: string
      model_name: string
      title: string
      tags: string
      createTime: string
      duration: number
    }>
  }
}

export class SunoAPIError extends Error {
  constructor(
    message: string,
    public code: number,
    public details?: any
  ) {
    super(message)
    this.name = "SunoAPIError"
  }
}

export class SunoAPIClient {
  private apiKey: string
  private baseUrl: string

  constructor(config: SunoConfig) {
    this.apiKey = config.apiKey
    // ⚠️ OFFICIAL BASE URL per Suno_API_MegaDetalhada.txt Section 1
    this.baseUrl = config.baseUrl || "https://api.kie.ai/api/v1"
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    const result = await response.json()

    // Handle error codes per Suno_API_MegaDetalhada.txt Section 3
    if (!response.ok || result.code !== 200) {
      const errorMessages: Record<number, string> = {
        400: "Validation error - content may contain copyrighted material",
        401: "Unauthorized - missing or invalid credentials",
        402: "Insufficient credits",
        404: "Resource or endpoint not found",
        408: "Rate limited - timeout",
        409: "Conflict - WAV record already exists",
        413: "Conflict - audio matches existing work",
        422: "Validation error - parameters failed validation",
        429: "Rate limit exceeded - too many requests",
        451: "Unauthorized - failed to retrieve image",
        455: "Service unavailable - system under maintenance",
        500: "Server error - unexpected error occurred",
        501: "Audio generation failed",
        531: "Server error - credits refunded",
      }

      throw new SunoAPIError(
        errorMessages[result.code] || result.msg || "Unknown error",
        result.code,
        result
      )
    }

    return result
  }

  /**
   * Generate Music
   * @see Suno_API_MegaDetalhada.txt Section 3
   * 
   * ENDPOINT: POST /api/v1/generate
   * 
   * Creates original music tracks with or without lyrics.
   * Multiple variations generated per request.
   * Files retained for 14 days.
   * 
   * @param params Generation parameters
   * @returns Promise with taskId
   */
  async generateMusic(params: GenerateMusicParams): Promise<ApiResponse<TaskResponse>> {
    // Validate required fields
    if (!params.prompt || params.prompt.trim() === "") {
      throw new SunoAPIError("prompt is required", 400)
    }

    if (params.customMode === undefined) {
      throw new SunoAPIError("customMode is required", 400)
    }

    if (params.instrumental === undefined) {
      throw new SunoAPIError("instrumental is required", 400)
    }

    if (!params.model) {
      throw new SunoAPIError("model is required", 400)
    }

    if (!params.callBackUrl) {
      throw new SunoAPIError("callBackUrl is required", 400)
    }

    // Validate URL format
    try {
      new URL(params.callBackUrl)
    } catch {
      throw new SunoAPIError("callBackUrl must be a valid HTTPS URL", 400)
    }

    // Custom mode requires style and title
    if (params.customMode) {
      if (!params.style) {
        throw new SunoAPIError("style is required when customMode is true", 400)
      }
      if (!params.title) {
        throw new SunoAPIError("title is required when customMode is true", 400)
      }
    }

    // Validate character limits based on model
    const isV3OrV4 = params.model === "V3_5" || params.model === "V4"
    
    if (params.customMode) {
      const maxPromptLength = isV3OrV4 ? 3000 : 5000
      if (params.prompt.length > maxPromptLength) {
        throw new SunoAPIError(
          `prompt exceeds maximum of ${maxPromptLength} characters for ${params.model}`,
          413
        )
      }

      if (params.style) {
        const maxStyleLength = isV3OrV4 ? 200 : 1000
        if (params.style.length > maxStyleLength) {
          throw new SunoAPIError(
            `style exceeds maximum of ${maxStyleLength} characters for ${params.model}`,
            413
          )
        }
      }

      if (params.title && params.title.length > 80) {
        throw new SunoAPIError("title exceeds maximum of 80 characters", 413)
      }
    } else {
      // Non-custom mode has 500 char limit
      if (params.prompt.length > 500) {
        throw new SunoAPIError("prompt exceeds maximum of 500 characters in non-custom mode", 413)
      }
    }

    // Validate range parameters (0-1, 2 decimals)
    if (params.styleWeight !== undefined && (params.styleWeight < 0 || params.styleWeight > 1)) {
      throw new SunoAPIError("styleWeight must be between 0 and 1", 400)
    }

    if (params.weirdnessConstraint !== undefined && (params.weirdnessConstraint < 0 || params.weirdnessConstraint > 1)) {
      throw new SunoAPIError("weirdnessConstraint must be between 0 and 1", 400)
    }

    if (params.audioWeight !== undefined && (params.audioWeight < 0 || params.audioWeight > 1)) {
      throw new SunoAPIError("audioWeight must be between 0 and 1", 400)
    }

    // ⚠️ OFFICIAL ENDPOINT per Suno_API_MegaDetalhada.txt Section 3
    return this.request("/generate", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Extend Music
   * @see Suno_API_MegaDetalhada.txt Section 5
   * 
   * ENDPOINT: POST /api/v1/generate/extend
   * 
   * Extends existing music tracks maintaining style consistency.
   * Multiple variations generated per request.
   * 
   * @param params Extension parameters
   * @returns Promise with taskId
   */
  async extendMusic(params: ExtendMusicParams): Promise<ApiResponse<TaskResponse>> {
    // Validate required fields
    if (!params.audioId || params.audioId.trim() === "") {
      throw new SunoAPIError("audioId is required", 400)
    }

    if (params.defaultParamFlag === undefined) {
      throw new SunoAPIError("defaultParamFlag is required", 400)
    }

    if (!params.model) {
      throw new SunoAPIError("model is required", 400)
    }

    if (!params.callBackUrl) {
      throw new SunoAPIError("callBackUrl is required", 400)
    }

    // Validate URL format
    try {
      new URL(params.callBackUrl)
    } catch {
      throw new SunoAPIError("callBackUrl must be a valid HTTPS URL", 400)
    }

    // Custom params mode requires additional fields
    if (params.defaultParamFlag) {
      if (!params.prompt) {
        throw new SunoAPIError("prompt is required when defaultParamFlag is true", 400)
      }
      if (!params.style) {
        throw new SunoAPIError("style is required when defaultParamFlag is true", 400)
      }
      if (!params.title) {
        throw new SunoAPIError("title is required when defaultParamFlag is true", 400)
      }
      if (params.continueAt === undefined || params.continueAt < 0) {
        throw new SunoAPIError("continueAt is required and must be >= 0 when defaultParamFlag is true", 400)
      }
    }

    // ⚠️ OFFICIAL ENDPOINT per Suno_API_MegaDetalhada.txt Section 5
    return this.request("/generate/extend", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  /**
   * Get Task Status (Polling Method)
   * @see Suno_API_MegaDetalhada.txt Section 2 (Step 2)
   * 
   * ENDPOINT: GET /api/v1/generate/record-info?taskId={taskId}
   * 
   * Poll for generation status. Recommended interval: 30 seconds.
   * Prefer using callbacks instead of polling.
   * 
   * @param taskId Task ID from generate/extend
   * @returns Promise with task status and audio data
   */
  async getTaskStatus(taskId: string): Promise<ApiResponse<TaskStatusResponse>> {
    if (!taskId || taskId.trim() === "") {
      throw new SunoAPIError("taskId is required", 400)
    }

    return this.request(`/generate/record-info?taskId=${encodeURIComponent(taskId)}`, {
      method: "GET",
    })
  }

  /**
   * Wait for Completion (Polling Helper)
   * @see Suno_API_MegaDetalhada.txt Section 7
   * 
   * Polls API until task completes or times out.
   * Recommended: Use callbacks instead of polling.
   * 
   * @param taskId Task ID to monitor
   * @param maxWaitTime Max wait in milliseconds (default: 10 minutes)
   * @returns Promise with final response
   */
  async waitForCompletion(taskId: string, maxWaitTime = 600000): Promise<TaskStatusResponse["response"]> {
    const startTime = Date.now()
    const pollInterval = 30000 // 30 seconds per Suno_API_MegaDetalhada.txt recommendation

    while (Date.now() - startTime < maxWaitTime) {
      const response = await this.getTaskStatus(taskId)
      const status = response.data

      switch (status.status) {
        case "SUCCESS":
          return status.response!

        case "FIRST_SUCCESS":
          // PRODUCTION: Removed console.log("[Suno] First track generated")
          break

        case "TEXT_SUCCESS":
          // PRODUCTION: Removed console.log("[Suno] Lyrics generated")
          break

        case "PENDING":
          // PRODUCTION: Removed console.log("[Suno] Waiting for generation...")
          break

        case "CREATE_TASK_FAILED":
        case "GENERATE_AUDIO_FAILED":
        case "CALLBACK_EXCEPTION":
        case "SENSITIVE_WORD_ERROR":
          throw new SunoAPIError(
            `Generation failed: ${status.status}`,
            status.errorCode || 500,
            status
          )
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval))
    }

    throw new SunoAPIError("Generation timeout", 408)
  }
}

export default SunoAPIClient
