import { type NextRequest, NextResponse } from "next/server"
import { getSunoClient } from "@/lib/suno-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const client = getSunoClient()

    // Validate required parameters
    if (!body.taskId || !body.audioId || !body.callBackUrl) {
      return NextResponse.json(
        {
          code: 400,
          msg: "Missing required parameters: taskId, audioId, and callBackUrl are required",
          data: null,
        },
        { status: 400 },
      )
    }

    const result = await client.convertToWav(body)

    return NextResponse.json(result)
  } catch (error) {
    // console.error("[v0] Error converting to WAV:", error)
    return NextResponse.json(
      {
        code: 500,
        msg: "Failed to convert to WAV",
        data: null,
      },
      { status: 500 },
    )
  }
}
