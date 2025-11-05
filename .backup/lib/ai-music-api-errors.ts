// AI Music API Error Types
// Based on official documentation: https://aimusicapi.ai/

export interface ApiError {
  code: number
  message: string
  type: ErrorType
}

export type ErrorType =
  | "ValidationError"
  | "Unauthorized"
  | "Forbidden"
  | "NotFound"
  | "Timeout"
  | "ServerError"

export const ERROR_MESSAGES = {
  // Validation Errors (400)
  INVALID_MV: "The 'mv' field is invalid. The model should be 'chirp-v3-5','chirp-v4' or 'chirp-v4-5'.",
  PERSONA_REQUIRED: "The 'persona_id' field is required when task_type = persona_music.",
  INVALID_INSTRUMENTAL: "The 'make_instrumental' field should be boolean.",
  INVALID_CUSTOM_MODE: "The 'custom_mode' field should be boolean.",
  PROMPT_TOO_LONG: "The prompt character length should be less than 3000.",
  GPT_DESCRIPTION_TOO_LONG:
    "The 'gpt_description_prompt' character length should be less than 200.",
  TAGS_TOO_LONG: "The tags character length should be less than 200.",
  TITLE_TOO_LONG: "The title character length should be less than 80.",
  DESCRIPTION_REQUIRED: "description is required.",
  DESCRIPTION_TOO_LONG: "The description character length should be less than 120.",
  NAME_AND_CONTINUE_REQUIRED: "name and continue_clip_id are required fields.",
  NAME_TOO_LONG: "The name character length should be less than 80.",
  TASK_NOT_FOUND: "task not found.",
  MISSING_TASK_ID: "missing task id.",

  // Unauthorized (401)
  MISSING_AUTH: "Authorization header is missing.",
  INVALID_AUTH_FORMAT: "Invalid authorization format.",

  // Forbidden (403)
  INSUFFICIENT_CREDITS:
    "The remaining credits are not enough. You can buy more one-time credit packs or subscribe.",
  NO_ACTIVE_SUBSCRIPTION:
    "You do not have an active subscription. Please check whether your renewal was successful.",
  INVALID_LYRICS_FORMAT: "The lyrics format is invalid. Please check and try again.",
  COPYRIGHTED_LYRICS: "The lyrics contain copyrighted content: 'specificError'. Please use original lyrics.",
  INAPPROPRIATE_LYRICS: "The lyrics contain inappropriate content: 'specificError'.",
  DESCRIPTION_NEEDS_REVIEW: "The song description needs moderation review.",
  ARTIST_NAMES_NOT_ALLOWED:
    "The song description contains artist names: 'specificError' which is not allowed.",
  PRODUCER_TAGS_NOT_ALLOWED:
    "The song description contains producer tags: 'specificError' which is not allowed.",

  // Timeout (504)
  TASK_TIMEOUT: "Task failed due to timeout. Credits were previously refunded.",

  // Server Error (500)
  INTERNAL_ERROR: "Internal Server Error.",
} as const

export class AiMusicApiError extends Error {
  constructor(
    public code: number,
    public type: ErrorType,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = "AiMusicApiError"
  }

  static fromResponse(code: number, message: string, details?: unknown): AiMusicApiError {
    let type: ErrorType = "ServerError"

    if (code === 400) type = "ValidationError"
    else if (code === 401) type = "Unauthorized"
    else if (code === 403) type = "Forbidden"
    else if (code === 404) type = "NotFound"
    else if (code === 504) type = "Timeout"
    else if (code === 500) type = "ServerError"

    return new AiMusicApiError(code, type, message, details)
  }

  isRetryable(): boolean {
    return this.code >= 500 || this.code === 504
  }

  isCreditsError(): boolean {
    return (
      this.message.includes("credits") ||
      this.message.includes("subscription") ||
      this.code === 403
    )
  }

  isValidationError(): boolean {
    return this.code === 400
  }
}

// Validation helpers
export class ApiValidator {
  static validatePrompt(prompt: string, model: string): void {
    const isV4Plus = ["chirp-v4-5", "chirp-v4-5-plus", "chirp-v5"].includes(model)
    const maxLength = isV4Plus ? 5000 : 3000

    if (prompt.length > maxLength) {
      throw new AiMusicApiError(
        400,
        "ValidationError",
        `The prompt character length should be less than ${maxLength}.`
      )
    }
  }

  static validateTags(tags: string, model: string): void {
    const isV4Plus = ["chirp-v4-5", "chirp-v4-5-plus", "chirp-v5"].includes(model)
    const maxLength = isV4Plus ? 1000 : 200

    if (tags.length > maxLength) {
      throw new AiMusicApiError(
        400,
        "ValidationError",
        `The tags character length should be less than ${maxLength}.`
      )
    }
  }

  static validateTitle(title: string): void {
    if (title.length > 120) {
      throw new AiMusicApiError(
        400,
        "ValidationError",
        "The title character length should be less than 120."
      )
    }
  }

  static validateGptDescription(description: string): void {
    if (description.length > 400) {
      throw new AiMusicApiError(
        400,
        "ValidationError",
        "The 'gpt_description_prompt' character length should be less than 400."
      )
    }
  }

  static validateModel(model: string): void {
    const validModels = ["chirp-v3-5", "chirp-v4", "chirp-v4-5", "chirp-v4-5-plus", "chirp-v5"]
    if (!validModels.includes(model)) {
      throw new AiMusicApiError(
        400,
        "ValidationError",
        `The 'mv' field is invalid. The model should be ${validModels.map(m => `'${m}'`).join(",")}.`
      )
    }
  }

  static validateRange(value: number, min: number, max: number, fieldName: string): void {
    if (value < min || value > max) {
      throw new AiMusicApiError(
        400,
        "ValidationError",
        `The '${fieldName}' field should be between ${min} and ${max}.`
      )
    }
  }
}
