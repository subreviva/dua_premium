import { type NextRequest, NextResponse } from "next/server"
import { getSunoClient } from "@/lib/suno-api"

export async function GET(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const { taskId } = await params

    if (!taskId) {
      return NextResponse.json({ code: 400, msg: "taskId parameter is required", data: null }, { status: 400 })
    }

    const client = getSunoClient()
    const result = await client.getMusicDetails(taskId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error fetching music details:", error)
    return NextResponse.json(
      {
        code: 500,
        msg: "Failed to fetch music details",
        data: null,
      },
      { status: 500 },
    )
  }
}
