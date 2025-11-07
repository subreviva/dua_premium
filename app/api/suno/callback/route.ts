import { type NextRequest, NextResponse } from "next/server"
import { trackDB } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, msg, data } = body

    console.log("[v0] Suno callback received:", {
      code,
      callbackType: data?.callbackType,
      taskId: data?.task_id,
      tracksCount: data?.data?.length || 0,
    })

    if (code === 200 && data) {
      const { callbackType, task_id, data: tracks } = data

      switch (callbackType) {
        case "text":
          console.log("[v0] Text generation completed for task:", task_id)
          // Text generation complete, audio generation starting
          break

        case "first":
          console.log("[v0] First track completed for task:", task_id)
          // Save first track to database
          if (tracks && tracks.length > 0) {
            tracks.forEach((track: any) => {
              trackDB.addTrack(task_id, {
                id: track.id,
                audioId: track.id,
                title: track.title || "Untitled",
                prompt: track.prompt || "",
                tags: track.tags || "",
                duration: track.duration || 0,
                audioUrl: track.audio_url || "",
                streamAudioUrl: track.stream_audio_url || "",
                imageUrl: track.image_url || "",
                modelName: track.model_name || "unknown",
                createTime: track.createTime || new Date().toISOString(),
                taskId: task_id,
              })
              console.log("[v0] Saved first track:", track.title)
            })
          }
          break

        case "complete":
          console.log("[v0] All tracks completed for task:", task_id)
          console.log("[v0] Total tracks:", tracks?.length || 0)

          // Save all tracks to database
          if (tracks && Array.isArray(tracks)) {
            tracks.forEach((track: any) => {
              trackDB.addTrack(task_id, {
                id: track.id,
                audioId: track.id,
                title: track.title || "Untitled",
                prompt: track.prompt || "",
                tags: track.tags || "",
                duration: track.duration || 0,
                audioUrl: track.audio_url || "",
                streamAudioUrl: track.stream_audio_url || "",
                imageUrl: track.image_url || "",
                modelName: track.model_name || "unknown",
                createTime: track.createTime || new Date().toISOString(),
                taskId: task_id,
              })
              console.log("[v0] Saved track:", track.title, "- Duration:", track.duration, "s")
            })
          }
          break

        case "error":
          console.error("[v0] Generation error for task:", task_id, "- Message:", msg)
          break

        default:
          console.log("[v0] Unknown callback type:", callbackType)
      }
    } else {
      console.error("[v0] Suno callback error - Code:", code, "Message:", msg)

      switch (code) {
        case 400:
          console.error("[v0] Validation error - Content may contain copyrighted material")
          break
        case 408:
          console.error("[v0] Rate limited - Request timeout")
          break
        case 413:
          console.error("[v0] Content conflict - Audio matches existing work")
          break
        case 500:
          console.error("[v0] Server error - Unexpected error during processing")
          break
        case 501:
          console.error("[v0] Audio generation failed")
          break
        case 531:
          console.error("[v0] Server error - Credits refunded")
          break
        default:
          console.error("[v0] Unknown error code:", code)
      }
    }

    // Always return 200 to confirm callback received (per documentation)
    return NextResponse.json({ status: "received" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Callback processing error:", error)
    // Still return 200 to prevent retries (per documentation)
    return NextResponse.json({ status: "error", message: "Processing failed" }, { status: 200 })
  }
}
