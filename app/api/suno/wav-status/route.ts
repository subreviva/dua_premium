import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const taskId = searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 })
    }

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "SUNO_API_KEY not configured" }, { status: 500 })
    }

    const response = await fetch(`https://api.kie.ai/api/v1/wav/record-info?taskId=${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    const result = await response.json()

    if (!response.ok || result.code !== 200) {
      console.error("[v0] WAV status check failed:", result)
      return NextResponse.json({ error: result.msg || "Failed to check WAV status" }, { status: response.status })
    }

    const data = result.data
    return NextResponse.json({
      taskId: data.taskId,
      musicId: data.musicId,
      status: data.successFlag,
      audioWavUrl: data.response?.audioWavUrl || null,
      createTime: data.createTime,
      completeTime: data.completeTime,
      errorCode: data.errorCode,
      errorMessage: data.errorMessage,
    })
  } catch (error) {
    console.error("[v0] WAV status check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
