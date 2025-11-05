import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const { taskId } = await params
    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "SUNO_API_KEY not configured" }, { status: 500 })
    }

    const response = await fetch(`https://api.sunoapi.org/api/v1/separation/${taskId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    // console.error("[v0] Get separation details error:", error)
    return NextResponse.json({ error: "Failed to get separation details" }, { status: 500 })
  }
}
