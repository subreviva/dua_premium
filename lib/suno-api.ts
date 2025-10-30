// Suno API Client - Complete implementation based on official documentation
// https://docs.sunoapi.org/

export interface SunoConfig {
  apiKey: string
  baseUrl?: string
}

// Music Generation
export interface GenerateMusicParams {
  prompt?: string
  gpt_description_prompt?: string
  customMode: boolean
  instrumental: boolean
  model: "V3_5" | "V4" | "V4_5" | "V4_5PLUS" | "V5"
  title?: string
  style?: string
  negativeTags?: string
  vocalGender?: "m" | "f"
  styleWeight?: number // 0-1
  weirdnessConstraint?: number // 0-1
  audioWeight?: number // 0-1
  generateVideo?: boolean
  personaId?: string
  callBackUrl?: string
}

// Extend Music
export interface ExtendMusicParams {
  audioId: string
  defaultParamFlag?: boolean
  prompt?: string
  style?: string
  title?: string
  continueAt?: number
  personaId?: string
  model?: "V3_5" | "V4" | "V4_5" | "V4_5PLUS" | "V5"
  negativeTags?: string
  vocalGender?: "m" | "f"
  styleWeight?: number // 0-1
  weirdnessConstraint?: number // 0-1
  audioWeight?: number // 0-1
  callBackUrl?: string
}

// Generate Lyrics
export interface GenerateLyricsParams {
  prompt: string
  callBackUrl?: string
}

// Add Vocals
export interface AddVocalsParams {
  uploadUrl: string
  prompt: string
  title: string
  style: string
  negativeTags: string
  vocalGender?: "m" | "f"
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
  model?: "V4_5PLUS" | "V5"
  callBackUrl?: string
}

// Add Instrumental
export interface AddInstrumentalParams {
  uploadUrl: string
  title: string
  tags: string
  negativeTags: string
  vocalGender?: "m" | "f"
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
  model?: "V4_5PLUS" | "V5"
  callBackUrl?: string
}

// Cover Music
export interface CoverMusicParams {
  uploadUrl: string
  prompt?: string
  tags?: string
  title?: string
  model?: "V4_5PLUS" | "V5"
  callBackUrl?: string
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
  audioId: string
  callBackUrl?: string
}

// Create Music Video
export interface CreateMusicVideoParams {
  audioId: string
  callBackUrl?: string
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
    this.baseUrl = config.baseUrl || "https://api.sunoapi.org/api/v1"
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
    return this.request("/generate", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async extendMusic(params: ExtendMusicParams): Promise<ApiResponse<TaskResponse>> {
    return this.request("/generate/extend", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async coverMusic(params: CoverMusicParams): Promise<ApiResponse<TaskResponse>> {
    return this.request("/cover", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async addVocals(params: AddVocalsParams): Promise<ApiResponse<TaskResponse>> {
    // Validate required parameters
    if (!params.uploadUrl || !params.prompt || !params.title || !params.style || !params.negativeTags) {
      throw new SunoAPIError("Missing required parameters for Add Vocals", 400)
    }

    // Validate optional parameters
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
    // Validate required parameters
    if (!params.uploadUrl || !params.title || !params.tags || !params.negativeTags) {
      throw new SunoAPIError("Missing required parameters for Add Instrumental", 400)
    }

    // Validate optional parameters
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
    return this.request("/style/generate", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async generatePersona(params: GeneratePersonaParams): Promise<ApiResponse<PersonaResponse>> {
    // Validate required parameters
    if (!params.taskId || params.musicIndex === undefined || !params.name || !params.description) {
      throw new SunoAPIError("Missing required parameters for Generate Persona", 400)
    }

    return this.request("/generate/generate-persona", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async getMusicDetails(taskId: string): Promise<ApiResponse<MusicGenerationDetailsResponse>> {
    return this.request(`/generate/record-info?taskId=${taskId}`, {
      method: "GET",
    })
  }

  // Lyrics APIs
  async generateLyrics(params: GenerateLyricsParams): Promise<ApiResponse<TaskResponse>> {
    // Validate required parameters
    if (!params.prompt) {
      throw new SunoAPIError("prompt is required", 400)
    }

    if (!params.callBackUrl) {
      throw new SunoAPIError("callBackUrl is required", 400)
    }

    // Validate prompt length (max 200 words)
    const wordCount = params.prompt.trim().split(/\s+/).length
    if (wordCount > 200) {
      throw new SunoAPIError("Prompt exceeds maximum word limit of 200 words", 413)
    }

    return this.request("/lyrics", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async getTimestampedLyrics(params: GetTimestampedLyricsParams): Promise<ApiResponse<LyricsResult>> {
    if (!params.taskId) {
      throw new SunoAPIError("taskId is required", 400)
    }

    return this.request("/generate/get-timestamped-lyrics", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async getLyricsDetails(taskId: string): Promise<ApiResponse<LyricsDetailsResponse>> {
    return this.request(`/lyrics/record-info?taskId=${taskId}`, {
      method: "GET",
    })
  }

  // Audio Processing APIs
  async convertToWav(params: ConvertToWavParams): Promise<ApiResponse<TaskResponse>> {
    // Validate required parameters
    if (!params.taskId || !params.audioId || !params.callBackUrl) {
      throw new SunoAPIError("Missing required parameters for Convert to WAV", 400)
    }

    return this.request("/wav/generate", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async getWavDetails(taskId: string): Promise<ApiResponse<WavDetailsResponse>> {
    return this.request(`/wav/record-info?taskId=${taskId}`, {
      method: "GET",
    })
  }

  async separateVocals(params: SeparateVocalsParams): Promise<ApiResponse<TaskResponse>> {
    return this.request("/separation/separate", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async getSeparationDetails(taskId: string): Promise<ApiResponse<SeparationResult>> {
    return this.request(`/separation/record-info?taskId=${taskId}`, {
      method: "GET",
    })
  }

  // Video APIs
  async createMusicVideo(params: CreateMusicVideoParams): Promise<ApiResponse<TaskResponse>> {
    return this.request("/video/create", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async getVideoDetails(taskId: string): Promise<ApiResponse<{ videoUrl: string }>> {
    return this.request(`/video/record-info?taskId=${taskId}`, {
      method: "GET",
    })
  }

  async getCoverDetails(taskId: string): Promise<ApiResponse<CoverDetailsResponse>> {
    return this.request(`/suno/cover/record-info?taskId=${taskId}`, {
      method: "GET",
    })
  }

  // Account Management
  async getRemainingCredits(): Promise<ApiResponse<CreditsResponse>> {
    return this.request("/generate/credit", {
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
    // Validate required parameters
    if (!params.taskId || !params.prompt || !params.tags || !params.title) {
      throw new SunoAPIError("Missing required parameters for Replace Section", 400)
    }

    // Validate time range
    if (params.infillStartS < 0 || params.infillEndS < 0) {
      throw new SunoAPIError("Time values must be non-negative", 400)
    }

    if (params.infillStartS >= params.infillEndS) {
      throw new SunoAPIError("infillStartS must be less than infillEndS", 400)
    }

    return this.request("/generate/replace-section", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async generateMusicCover(params: GenerateMusicCoverParams): Promise<ApiResponse<TaskResponse>> {
    // Validate required parameters
    if (!params.taskId || !params.callBackUrl) {
      throw new SunoAPIError("Missing required parameters for Generate Music Cover", 400)
    }

    return this.request("/suno/cover/generate", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async uploadAndCover(params: UploadAndCoverParams): Promise<ApiResponse<TaskResponse>> {
    return this.request("/upload/cover", {
      method: "POST",
      body: JSON.stringify(params),
    })
  }

  async uploadAndExtend(params: UploadAndExtendParams): Promise<ApiResponse<TaskResponse>> {
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
  prompt?: string
  style?: string
  title?: string
  continueAt?: number
  model?: "V4_5PLUS" | "V5"
  callBackUrl?: string
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

// Export type aliases for backward compatibility
export type SunoRecordInfoResponse = MusicGenerationDetailsResponse
