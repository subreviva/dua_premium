import { type NextRequest, NextResponse } from "next/server"
import { getSunoClient } from "@/lib/suno-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.content) {
      return NextResponse.json({ code: 400, msg: "content parameter is required", data: null }, { status: 400 })
    }

    const client = getSunoClient()
    const result = await client.boostMusicStyle(body)

    return NextResponse.json(result)
  } catch (error) {
    // console.error("[v0] Error boosting music style:", error)
    return NextResponse.json(
      {
        code: 500,
        msg: "Failed to boost music style",
        data: null,
      },
      { status: 500 },
    )
  }
}
