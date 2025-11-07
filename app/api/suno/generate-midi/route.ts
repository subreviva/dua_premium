import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId } = body

    if (!taskId) {
      return NextResponse.json({ error: "Missing required field: taskId" }, { status: 400 })
    }

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "SUNO_API_KEY not configured" }, { status: 500 })
    }

    const callBackUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/suno/midi-callback`

    const response = await fetch("https://api.kie.ai/api/v1/midi/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        taskId,
        callBackUrl,
      }),
    })

    const result = await response.json()

    if (!response.ok || result.code !== 200) {
      console.error("[v0] MIDI generation failed:", result)
      return NextResponse.json({ error: result.msg || "MIDI generation failed" }, { status: response.status })
    }

    return NextResponse.json({ taskId: result.data.taskId })
  } catch (error) {
    console.error("[v0] MIDI generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
