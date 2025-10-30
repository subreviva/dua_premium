import { type NextRequest, NextResponse } from "next/server"
import { SunoAPIClient, type GenerateMusicParams } from "@/lib/suno-api"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.SUNO_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "SUNO_API_KEY not configured" }, { status: 500 })
    }

    const body: GenerateMusicParams = await request.json()

    // Validate required fields
    if (!body.customMode && !body.prompt && !body.gpt_description_prompt) {
      return NextResponse.json(
        { error: "prompt or gpt_description_prompt is required in non-custom mode" },
        { status: 400 },
      )
    }

    if (body.customMode && !body.instrumental && !body.prompt) {
      return NextResponse.json({ error: "prompt is required when not instrumental" }, { status: 400 })
    }

    if (body.customMode && (!body.style || !body.title)) {
      return NextResponse.json({ error: "style and title are required in custom mode" }, { status: 400 })
    }

    const sunoAPI = new SunoAPIClient({ apiKey })
    const result = await sunoAPI.generateMusic(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Music generation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate music" },
      { status: 500 },
    )
  }
}
