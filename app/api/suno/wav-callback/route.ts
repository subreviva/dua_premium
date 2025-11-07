import { type NextRequest, NextResponse } from "next/server"
import { trackDB } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] WAV conversion callback received:", JSON.stringify(body, null, 2))

    const { taskId, musicId, successFlag, response, errorCode, errorMessage } = body

    if (successFlag === "SUCCESS" && response?.audioWavUrl) {
      console.log("[v0] WAV conversion completed successfully!")
      console.log("[v0] WAV URL:", response.audioWavUrl)
      console.log("[v0] Task ID:", taskId)
      console.log("[v0] Music ID:", musicId)

      const updated = trackDB.updateTrackWavUrl(musicId, response.audioWavUrl)
      if (updated) {
        console.log("[v0] WAV URL saved to database for track:", musicId)
      } else {
        console.error("[v0] Failed to save WAV URL - track not found:", musicId)
      }
    } else if (successFlag === "CREATE_TASK_FAILED" || successFlag === "GENERATE_AUDIO_FAILED") {
      console.error("[v0] WAV conversion failed:", errorMessage || errorCode)
    } else {
      console.log("[v0] WAV conversion status:", successFlag)
    }

    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error("[v0] WAV callback error:", error)
    return NextResponse.json({ success: false, error: "Callback processing failed" }, { status: 200 })
  }
}
