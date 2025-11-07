export interface SunoGenerateOptions {
  prompt: string
  customMode: boolean
  instrumental: boolean
  model: "V3_5" | "V4" | "V4_5" | "V4_5PLUS" | "V5"
  style?: string
  title?: string
  callBackUrl: string
  negativeTags?: string
  vocalGender?: "m" | "f"
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
  personaId?: string
}

export interface SunoExtendOptions {
  audioId: string
  defaultParamFlag: boolean
  model: "V3_5" | "V4" | "V4_5" | "V4_5PLUS" | "V5"
  callBackUrl: string
  prompt?: string
  style?: string
  title?: string
  continueAt?: number
  negativeTags?: string
  vocalGender?: "m" | "f"
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
  personaId?: string
}

export interface SunoUploadCoverOptions {
  uploadUrl: string
  customMode: boolean
  instrumental: boolean
  prompt?: string
  style?: string
  title?: string
  callBackUrl: string
  model?: "V3_5" | "V4" | "V4_5" | "V4_5PLUS" | "V5"
  negativeTags?: string
  vocalGender?: "m" | "f"
  styleWeight?: number
  weirdnessConstraint?: number
  audioWeight?: number
}

export interface SunoTrack {
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
}

export interface SunoTaskStatus {
  taskId: string
  status:
    | "PENDING"
    | "TEXT_SUCCESS"
    | "FIRST_SUCCESS"
    | "SUCCESS"
    | "CREATE_TASK_FAILED"
    | "GENERATE_AUDIO_FAILED"
    | "CALLBACK_EXCEPTION"
    | "SENSITIVE_WORD_ERROR"
  response?: {
    sunoData: SunoTrack[]
  }
}

export interface SunoWavConversionOptions {
  taskId: string
  audioId: string
  callBackUrl: string
}

export interface SunoWavStatus {
  taskId: string
  musicId: string
  status: "PENDING" | "SUCCESS" | "CREATE_TASK_FAILED" | "GENERATE_AUDIO_FAILED"
  audioWavUrl: string | null
  createTime: string
  completeTime: string | null
  errorCode: string | null
  errorMessage: string | null
}

export class SunoAPI {
  private apiKey: string
  private baseUrl = "https://api.kie.ai/api/v1"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateMusic(options: SunoGenerateOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    })

    const result = await response.json()

    if (!response.ok || result.code !== 200) {
      throw new Error(`Generation failed: ${result.msg}`)
    }

    return result.data.taskId
  }

  async getTaskStatus(taskId: string): Promise<SunoTaskStatus> {
    const response = await fetch(`${this.baseUrl}/generate/record-info?taskId=${taskId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    const result = await response.json()

    if (!response.ok || result.code !== 200) {
      throw new Error(`Status check failed: ${result.msg}`)
    }

    return result.data
  }

  async extendMusic(options: SunoExtendOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/generate/extend`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    })

    const result = await response.json()

    if (!response.ok || result.code !== 200) {
      throw new Error(`Extension failed: ${result.msg}`)
    }

    return result.data.taskId
  }

  async uploadCover(options: SunoUploadCoverOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/generate/upload-cover`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    })

    const result = await response.json()

    if (!response.ok || result.code !== 200) {
      throw new Error(`Upload cover failed: ${result.msg}`)
    }

    return result.data.taskId
  }

  async waitForCompletion(taskId: string, maxWaitTime = 600000): Promise<SunoTrack[]> {
    const startTime = Date.now()

    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getTaskStatus(taskId)

      switch (status.status) {
        case "SUCCESS":
          return status.response?.sunoData || []

        case "FIRST_SUCCESS":
          console.log("[v0] First track generated")
          break

        case "TEXT_SUCCESS":
          console.log("[v0] Lyrics generated")
          break

        case "PENDING":
          console.log("[v0] Waiting for generation...")
          break

        case "CREATE_TASK_FAILED":
        case "GENERATE_AUDIO_FAILED":
        case "CALLBACK_EXCEPTION":
        case "SENSITIVE_WORD_ERROR":
          throw new Error(`Generation failed: ${status.status}`)
      }

      await new Promise((resolve) => setTimeout(resolve, 10000))
    }

    throw new Error("Generation timeout")
  }

  async convertToWav(options: SunoWavConversionOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/wav/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options),
    })

    const result = await response.json()

    if (!response.ok || result.code !== 200) {
      throw new Error(`WAV conversion failed: ${result.msg}`)
    }

    return result.data.taskId
  }

  async getWavStatus(taskId: string): Promise<SunoWavStatus> {
    const response = await fetch(`${this.baseUrl}/wav/record-info?taskId=${taskId}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    })

    const result = await response.json()

    if (!response.ok || result.code !== 200) {
      throw new Error(`WAV status check failed: ${result.msg}`)
    }

    const data = result.data
    return {
      taskId: data.taskId,
      musicId: data.musicId,
      status: data.successFlag,
      audioWavUrl: data.response?.audioWavUrl || null,
      createTime: data.createTime,
      completeTime: data.completeTime,
      errorCode: data.errorCode,
      errorMessage: data.errorMessage,
    }
  }
}
