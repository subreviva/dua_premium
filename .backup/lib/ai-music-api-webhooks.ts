// AI Music API Webhook Types
// Based on official documentation: https://aimusicapi.ai/

export interface WebhookConfig {
  webhook_url?: string // Callback URL (HTTPS recommended)
  webhook_secret?: string // Secret for HMAC signature verification
}

export interface WebhookHeaders {
  "x-webhook-id": string // Unique event ID
  "x-webhook-event": WebhookEvent // Event type
  "x-webhook-timestamp": string // Unix timestamp (seconds)
  "x-webhook-signature": string // sha256=<hex> HMAC signature
  "idempotency-key": string // Same as x-webhook-id
}

export type WebhookEvent =
  | "song.completed"
  | "song.streaming"
  | "song.failed"

export type Platform = "suno" | "nuro" | "producer"

export type TaskState = "succeeded" | "running" | "failed"

// Base webhook payload
export interface BaseWebhookPayload {
  task_id: string
  platform: Platform
  event: WebhookEvent
}

// Suno song data
export interface SunoSongData {
  clip_id: string
  state: TaskState
  title: string
  tags: string
  lyrics: string
  image_url: string
  audio_url: string
  video_url: string | null
  created_at: string
  gpt_description_prompt: string | null
  duration: string | null
  negative_tags: string | null
  style_weight: number | null
  weirdness_constraint: number | null
  mv: string
}

// Suno completed webhook
export interface SunoCompletedWebhook extends BaseWebhookPayload {
  platform: "suno"
  event: "song.completed"
  code: 200
  data: SunoSongData[]
  message: "success"
}

// Suno streaming webhook
export interface SunoStreamingWebhook extends BaseWebhookPayload {
  platform: "suno"
  event: "song.streaming"
  code: 200
  data: SunoSongData[]
  message: "streaming"
}

// Nuro completed webhook
export interface NuroCompletedWebhook extends BaseWebhookPayload {
  platform: "nuro"
  event: "song.completed"
  status: "succeeded"
  progress: number
  audio_url: string
  lyrics: string
  duration: number
  genre: string
  mood: string
  gender: string
  timbre: string
  prompt: string
  theme: string
  instrument: string
}

// Producer song data
export interface ProducerSongData {
  clip_id: string
  title: string
  sound: string
  lyrics: string
  image_url: string
  audio_url: string
  video_url: string | null
  created_at: string
  mv: string
  seed: string
  duration: number
  state: TaskState
}

// Producer completed webhook
export interface ProducerCompletedWebhook extends BaseWebhookPayload {
  platform: "producer"
  event: "song.completed"
  code: 200
  data: ProducerSongData[]
  message: "success"
}

// Failed webhook (generic for all platforms)
export interface FailedWebhook extends BaseWebhookPayload {
  event: "song.failed"
  type: "failed"
  message: string
  refund_processed: boolean
}

// Union type for all webhook payloads
export type WebhookPayload =
  | SunoCompletedWebhook
  | SunoStreamingWebhook
  | NuroCompletedWebhook
  | ProducerCompletedWebhook
  | FailedWebhook

// Webhook verification utility
export class WebhookVerifier {
  constructor(private secret: string) {}

  /**
   * Verify webhook signature
   * @param timestamp - X-Webhook-Timestamp header
   * @param signature - X-Webhook-Signature header
   * @param rawBody - Raw request body (before JSON parsing)
   * @returns true if signature is valid
   */
  async verify(timestamp: string, signature: string, rawBody: string): Promise<boolean> {
    const providedSig = signature.replace(/^sha256=/i, "")

    // Build message: timestamp.rawBody
    const message = `${timestamp}.${rawBody}`

    // Calculate expected signature
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(this.secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )

    const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(message))
    const expectedSig = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")

    // Timing-safe comparison
    if (providedSig.length !== expectedSig.length) return false

    let result = 0
    for (let i = 0; i < providedSig.length; i++) {
      result |= providedSig.charCodeAt(i) ^ expectedSig.charCodeAt(i)
    }

    return result === 0
  }

  /**
   * Check if timestamp is within acceptable window (5 minutes)
   */
  isTimestampValid(timestamp: string, windowSeconds = 300): boolean {
    const ts = parseInt(timestamp, 10)
    if (isNaN(ts)) return false

    const now = Math.floor(Date.now() / 1000)
    const age = Math.abs(now - ts)

    return age <= windowSeconds
  }

  /**
   * Verify complete webhook request
   */
  async verifyRequest(headers: WebhookHeaders, rawBody: string): Promise<{
    valid: boolean
    error?: string
  }> {
    const { "x-webhook-timestamp": timestamp, "x-webhook-signature": signature } = headers

    if (!timestamp || !signature) {
      return { valid: false, error: "Missing signature headers" }
    }

    if (!this.isTimestampValid(timestamp)) {
      return { valid: false, error: "Timestamp expired or invalid" }
    }

    const valid = await this.verify(timestamp, signature, rawBody)
    if (!valid) {
      return { valid: false, error: "Invalid signature" }
    }

    return { valid: true }
  }
}

// Type guards
export function isSunoWebhook(
  payload: WebhookPayload
): payload is SunoCompletedWebhook | SunoStreamingWebhook {
  return payload.platform === "suno"
}

export function isNuroWebhook(payload: WebhookPayload): payload is NuroCompletedWebhook {
  return payload.platform === "nuro"
}

export function isProducerWebhook(payload: WebhookPayload): payload is ProducerCompletedWebhook {
  return payload.platform === "producer"
}

export function isFailedWebhook(payload: WebhookPayload): payload is FailedWebhook {
  return payload.event === "song.failed"
}

export function isCompletedWebhook(
  payload: WebhookPayload
): payload is SunoCompletedWebhook | NuroCompletedWebhook | ProducerCompletedWebhook {
  return payload.event === "song.completed"
}

export function isStreamingWebhook(payload: WebhookPayload): payload is SunoStreamingWebhook {
  return payload.event === "song.streaming"
}
