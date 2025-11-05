import { type NextRequest, NextResponse } from "next/server"
import { getSunoClient } from "@/lib/suno-api"

export async function GET(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const { taskId } = await params
    const client = getSunoClient()

    const result = await client.getWavDetails(taskId)

    return NextResponse.json(result)
  } catch (error) {
    // console.error("[v0] Get WAV details error:", error)
    return NextResponse.json(
      {
        code: 500,
        msg: "Failed to get WAV details",
        data: null,
      },
      { status: 500 },
    )
  }
}
