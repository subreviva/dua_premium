import { NextResponse } from "next/server"
import { trackDB } from "@/lib/db"

export async function GET() {
  try {
    const tracks = trackDB.getAllTracks()
    console.log("[v0] Fetching tracks from database, count:", tracks.length)
    if (tracks.length > 0) {
      console.log("[v0] Sample track structure:", {
        id: tracks[0].id,
        audioId: tracks[0].audioId,
        taskId: tracks[0].taskId,
        title: tracks[0].title,
        hasAudioId: !!tracks[0].audioId,
        hasTaskId: !!tracks[0].taskId,
      })
    }
    return NextResponse.json({ tracks })
  } catch (error) {
    console.error("[v0] Error fetching tracks:", error)
    return NextResponse.json({ error: "Failed to fetch tracks" }, { status: 500 })
  }
}
