import { NextResponse } from "next/server"
import { trackDB } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { audioId: string } }) {
  try {
    const track = trackDB.getTrackByAudioId(params.audioId)
    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 })
    }
    return NextResponse.json({ track })
  } catch (error) {
    console.error("[v0] Error fetching track:", error)
    return NextResponse.json({ error: "Failed to fetch track" }, { status: 500 })
  }
}
