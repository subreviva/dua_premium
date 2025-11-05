import { type NextRequest, NextResponse } from "next/server"
import { SunoAPIClient } from "@/lib/suno-api"

export async function GET(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const apiKey = process.env.SUNO_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "SUNO_API_KEY not configured" }, { status: 500 })
    }

    const sunoAPI = new SunoAPIClient({ apiKey })
    const result = await sunoAPI.getMusicDetails(params.taskId)

    return NextResponse.json(result)
  } catch (error) {
    // console.error("[v0] Failed to get music details:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get music details" },
      { status: 500 },
    )
  }
}
