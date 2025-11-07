import { type NextRequest, NextResponse } from "next/server"
import { SunoAPI } from "@/lib/suno-api"

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.SUNO_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "SUNO_API_KEY not configured" }, { status: 500 })
    }

    const searchParams = request.nextUrl.searchParams
    const taskId = searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 })
    }

    const client = new SunoAPI(apiKey)
    const status = await client.getTaskStatus(taskId)

    return NextResponse.json(status)
  } catch (error) {
    console.error("[v0] Suno status check error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Status check failed" }, { status: 500 })
  }
}
