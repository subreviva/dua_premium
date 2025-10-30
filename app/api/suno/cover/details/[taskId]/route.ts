import { type NextRequest, NextResponse } from "next/server"
import { getSunoClient } from "@/lib/suno-api"

export async function GET(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const { taskId } = await params

    if (!taskId) {
      return NextResponse.json({ code: 422, msg: "taskId is required" }, { status: 422 })
    }

    const client = getSunoClient()
    const result = await client.getCoverDetails(taskId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error getting cover details:", error)
    return NextResponse.json(
      {
        code: 500,
        msg: error instanceof Error ? error.message : "Failed to get cover details",
      },
      { status: 500 },
    )
  }
}
