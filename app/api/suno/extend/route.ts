import { type NextRequest, NextResponse } from "next/server"
import { SunoAPI } from "@/lib/suno-api"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.SUNO_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "SUNO_API_KEY not configured" }, { status: 500 })
    }

    const body = await request.json()
    const {
      audioId,
      defaultParamFlag,
      model,
      prompt,
      style,
      title,
      continueAt,
      negativeTags,
      vocalGender,
      styleWeight,
      weirdnessConstraint,
      audioWeight,
    } = body

    // Validate required parameters
    if (!audioId) {
      return NextResponse.json({ error: "audioId is required" }, { status: 400 })
    }

    // Validate custom parameters if defaultParamFlag is true
    if (defaultParamFlag && (!prompt || !style || !title || continueAt === undefined)) {
      return NextResponse.json(
        { error: "prompt, style, title, and continueAt are required when using custom parameters" },
        { status: 400 },
      )
    }

    const client = new SunoAPI(apiKey)

    const callBackUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/suno/callback`
      : `${request.nextUrl.origin}/api/suno/callback`

    const taskId = await client.extendMusic({
      audioId,
      defaultParamFlag: defaultParamFlag || false,
      model: model || "V3_5",
      callBackUrl,
      prompt,
      style,
      title,
      continueAt,
      negativeTags,
      vocalGender,
      styleWeight,
      weirdnessConstraint,
      audioWeight,
    })

    return NextResponse.json({ taskId })
  } catch (error) {
    console.error("[v0] Suno extension error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Extension failed" }, { status: 500 })
  }
}
