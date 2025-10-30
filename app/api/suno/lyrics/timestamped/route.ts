import { type NextRequest, NextResponse } from "next/server"
import { getSunoClient } from "@/lib/suno-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.taskId) {
      return NextResponse.json({ code: 400, msg: "taskId parameter is required", data: null }, { status: 400 })
    }

    const client = getSunoClient()
    const result = await client.getTimestampedLyrics(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error getting timestamped lyrics:", error)
    return NextResponse.json(
      {
        code: 500,
        msg: "Failed to get timestamped lyrics",
        data: null,
      },
      { status: 500 },
    )
  }
}
