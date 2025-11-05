// AI Music API Webhook Handler Example
// Complete implementation with signature verification

import { NextRequest, NextResponse } from "next/server"
import {
  WebhookVerifier,
  WebhookPayload,
  FailedWebhook,
  isCompletedWebhook,
  isFailedWebhook,
  isStreamingWebhook,
  isSunoWebhook,
  isNuroWebhook,
  isProducerWebhook,
} from "@/lib/ai-music-api-webhooks"

export const runtime = "edge"

// Get webhook secret from environment
const WEBHOOK_SECRET = process.env.AI_MUSIC_WEBHOOK_SECRET || ""

export async function POST(request: NextRequest) {
  try {
    // 1. Get headers
    const headers = {
      "x-webhook-id": request.headers.get("x-webhook-id") || "",
      "x-webhook-event": request.headers.get("x-webhook-event") as any,
      "x-webhook-timestamp": request.headers.get("x-webhook-timestamp") || "",
      "x-webhook-signature": request.headers.get("x-webhook-signature") || "",
      "idempotency-key": request.headers.get("idempotency-key") || "",
    }

    // 2. Get raw body for verification
    const rawBody = await request.text()

    // 3. Verify signature
    if (WEBHOOK_SECRET) {
      const verifier = new WebhookVerifier(WEBHOOK_SECRET)
      const verification = await verifier.verifyRequest(headers, rawBody)

      if (!verification.valid) {
        // console.error("Webhook verification failed:", verification.error)
        return NextResponse.json({ error: verification.error }, { status: 401 })
      }
    }

    // 4. Parse payload
    const payload: WebhookPayload = JSON.parse(rawBody)

    // 5. Log event
    // Console log removed for production build compatibility

    // 6. Handle by event type
    if (isCompletedWebhook(payload)) {
      await handleCompletedWebhook(payload)
    } else if (isStreamingWebhook(payload)) {
      await handleStreamingWebhook(payload)
    } else if (isFailedWebhook(payload)) {
      await handleFailedWebhook(payload)
    }

    // 7. Return success
    return NextResponse.json({ received: true, task_id: payload.task_id })
  } catch (error) {
    // console.error("Webhook handler error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Handle completed songs
async function handleCompletedWebhook(payload: WebhookPayload) {
  if (isSunoWebhook(payload) && payload.event === "song.completed") {
    // console.log(`Suno songs completed: ${payload.data.length} tracks`)
    
    for (const song of payload.data) {
    // Console log removed for production build compatibility

      // TODO: Save to database, notify user, etc.
      // await saveSongToDatabase(song)
      // await notifyUser(payload.task_id, song)
    }
  } else if (isNuroWebhook(payload)) {
    // Console log removed for production build compatibility

    // TODO: Save to database
  } else if (isProducerWebhook(payload)) {
    // console.log(`Producer songs completed: ${payload.data.length} tracks`)

    for (const song of payload.data) {
    // Console log removed for production build compatibility

      // TODO: Save to database
    }
  }
}

// Handle streaming songs (Suno only)
async function handleStreamingWebhook(payload: WebhookPayload) {
  if (isSunoWebhook(payload)) {
    // console.log(`Suno songs streaming: ${payload.data.length} tracks`)

    for (const song of payload.data) {
    // Console log removed for production build compatibility

      // TODO: Update UI with streaming link
      // await notifyUserStreaming(payload.task_id, song)
    }
  }
}

// Handle failed songs
async function handleFailedWebhook(payload: FailedWebhook) {
