import { type NextRequest, NextResponse } from "next/server"
import { getSunoClient } from "@/lib/suno-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const client = getSunoClient()

    const result = await client.createMusicVideo(body)

    return NextResponse.json(result)
  } catch (error) {
    // console.error("[v0] Error creating video:", error)
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 })
  }
}
