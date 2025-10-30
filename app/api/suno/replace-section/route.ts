import { type NextRequest, NextResponse } from "next/server"
import { getSunoClient } from "@/lib/suno-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required parameters
    const { taskId, musicIndex, prompt, tags, title, infillStartS, infillEndS } = body

    if (
      !taskId ||
      musicIndex === undefined ||
      !prompt ||
      !tags ||
      !title ||
      infillStartS === undefined ||
      infillEndS === undefined
    ) {
      return NextResponse.json(
        {
          code: 422,
          msg: "Missing required parameters: taskId, musicIndex, prompt, tags, title, infillStartS, infillEndS",
        },
        { status: 422 },
      )
    }

    // Validate time range
    if (infillStartS < 0 || infillEndS < 0) {
      return NextResponse.json({ code: 422, msg: "Time values must be non-negative" }, { status: 422 })
    }

    if (infillStartS >= infillEndS) {
      return NextResponse.json({ code: 422, msg: "infillStartS must be less than infillEndS" }, { status: 422 })
    }

    const client = getSunoClient()
    const result = await client.replaceSection(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error replacing music section:", error)
    return NextResponse.json(
      {
        code: 500,
        msg: error instanceof Error ? error.message : "Failed to replace music section",
      },
      { status: 500 },
    )
  }
}
