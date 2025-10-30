import { type NextRequest, NextResponse } from "next/server"
import { getSunoClient } from "@/lib/suno-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required parameters
    const { taskId, callBackUrl } = body

    if (!taskId || !callBackUrl) {
      return NextResponse.json(
        {
          code: 422,
          msg: "Missing required parameters: taskId and callBackUrl are required",
        },
        { status: 422 },
      )
    }

    const client = getSunoClient()
    const result = await client.generateMusicCover(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error generating music cover:", error)
    return NextResponse.json(
      {
        code: 500,
        msg: error instanceof Error ? error.message : "Failed to generate music cover",
      },
      { status: 500 },
    )
  }
}
