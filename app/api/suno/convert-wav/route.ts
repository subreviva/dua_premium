import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, audioId } = body

    if (!taskId || !audioId) {
      return NextResponse.json({ error: "Missing required fields: taskId, audioId" }, { status: 400 })
    }

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "SUNO_API_KEY not configured" }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const callBackUrl = `${baseUrl}/api/suno/wav-callback`

    console.log("[v0] Starting WAV conversion:", { taskId, audioId, callBackUrl })

    const response = await fetch("https://api.kie.ai/api/v1/wav/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        taskId,
        audioId,
        callBackUrl,
      }),
    })

    const result = await response.json()

    if (result.code === 409 && result.data?.taskId) {
      console.log("[v0] WAV conversion already exists, using existing taskId:", result.data.taskId)
      return NextResponse.json({
        taskId: result.data.taskId,
        message: "WAV conversion already in progress",
        existing: true,
      })
    }

    if (!response.ok || result.code !== 200) {
      console.error("[v0] WAV conversion failed:", result)
      return NextResponse.json({ error: result.msg || "WAV conversion failed" }, { status: response.status })
    }

    console.log("[v0] WAV conversion started successfully:", result.data.taskId)

    return NextResponse.json({
      taskId: result.data.taskId,
      message: "WAV conversion started successfully",
    })
  } catch (error) {
    console.error("[v0] WAV conversion error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
