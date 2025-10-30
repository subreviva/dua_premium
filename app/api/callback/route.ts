import { type NextRequest, NextResponse } from "next/server"
import type { MusicGenerationResult } from "@/lib/suno-api"

interface CallbackData {
  code: number
  msg: string
  data: {
    callbackType: "text" | "first" | "complete" | "error"
    task_id: string
    data: MusicGenerationResult[] | null
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: CallbackData = await request.json()

    console.log("[v0] Received music generation callback:", {
      taskId: data.data.task_id,
      callbackType: data.data.callbackType,
      status: data.code,
      message: data.msg,
    })

    if (data.code === 200) {
      console.log("[v0] Music generation completed successfully")
      const musicData = data.data.data || []

      console.log(`[v0] Generated ${musicData.length} music tracks`)
      musicData.forEach((music, index) => {
        console.log(`[v0] Music ${index + 1}:`, {
          title: music.title,
          duration: music.duration,
          tags: music.tags,
          audioUrl: music.audioUrl,
        })
      })

      // Here you could:
      // - Store the music in a database
      // - Send notifications to users
      // - Trigger webhooks
      // - Update UI via WebSocket/SSE
    } else {
      console.error("[v0] Music generation failed:", data.msg)
    }

    // Return 200 to acknowledge callback received
    return NextResponse.json({ status: "received" })
  } catch (error) {
    console.error("[v0] Callback processing error:", error)
    return NextResponse.json({ error: "Failed to process callback" }, { status: 500 })
  }
}
