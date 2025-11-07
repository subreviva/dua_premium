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
      prompt,
      customMode,
      instrumental,
      model,
      style,
      title,
      negativeTags,
      vocalGender,
      styleWeight,
      weirdnessConstraint,
      audioWeight,
    } = body

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    if (customMode) {
      if (!style || typeof style !== "string" || !style.trim()) {
        return NextResponse.json({ error: "Style is required in custom mode" }, { status: 400 })
      }
      if (!title || typeof title !== "string" || !title.trim()) {
        return NextResponse.json({ error: "Title is required in custom mode" }, { status: 400 })
      }

      const isAdvancedModel = ["V4_5", "V4_5PLUS", "V5"].includes(model)
      const maxPromptLength = isAdvancedModel ? 5000 : 3000
      const maxStyleLength = isAdvancedModel ? 1000 : 200

      if (prompt.length > maxPromptLength) {
        return NextResponse.json(
          {
            error: `Prompt exceeds ${maxPromptLength} character limit for ${model}`,
          },
          { status: 400 },
        )
      }

      if (style.length > maxStyleLength) {
        return NextResponse.json(
          {
            error: `Style exceeds ${maxStyleLength} character limit for ${model}`,
          },
          { status: 400 },
        )
      }

      if (title.length > 80) {
        return NextResponse.json({ error: "Title exceeds 80 character limit" }, { status: 400 })
      }
    } else {
      if (prompt.length > 500) {
        return NextResponse.json(
          {
            error: "Prompt exceeds 500 character limit for simple mode",
          },
          { status: 400 },
        )
      }
    }

    if (styleWeight !== undefined && (styleWeight < 0 || styleWeight > 1)) {
      return NextResponse.json({ error: "styleWeight must be between 0 and 1" }, { status: 400 })
    }
    if (weirdnessConstraint !== undefined && (weirdnessConstraint < 0 || weirdnessConstraint > 1)) {
      return NextResponse.json({ error: "weirdnessConstraint must be between 0 and 1" }, { status: 400 })
    }
    if (audioWeight !== undefined && (audioWeight < 0 || audioWeight > 1)) {
      return NextResponse.json({ error: "audioWeight must be between 0 and 1" }, { status: 400 })
    }

    const client = new SunoAPI(apiKey)

    // Get the callback URL from environment or construct it
    const callBackUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/suno/callback`
      : `${request.nextUrl.origin}/api/suno/callback`

    console.log("[v0] Generating music with params:", {
      customMode,
      instrumental,
      model,
      promptLength: prompt.length,
      styleLength: style?.length,
      titleLength: title?.length,
    })

    const taskId = await client.generateMusic({
      prompt,
      customMode: customMode || false,
      instrumental: instrumental !== false,
      model: model || "V3_5",
      style,
      title,
      callBackUrl,
      negativeTags: negativeTags || undefined,
      vocalGender: vocalGender || undefined,
      styleWeight: styleWeight !== undefined ? Math.round(styleWeight * 100) / 100 : undefined,
      weirdnessConstraint: weirdnessConstraint !== undefined ? Math.round(weirdnessConstraint * 100) / 100 : undefined,
      audioWeight: audioWeight !== undefined ? Math.round(audioWeight * 100) / 100 : undefined,
    })

    return NextResponse.json({ taskId })
  } catch (error) {
    console.error("[v0] Suno generation error:", error)

    if (error instanceof Error) {
      if (error.message.includes("402")) {
        return NextResponse.json({ error: "Insufficient credits" }, { status: 402 })
      } else if (error.message.includes("429")) {
        return NextResponse.json({ error: "Rate limit exceeded. Please wait before retrying." }, { status: 429 })
      } else if (error.message.includes("400")) {
        return NextResponse.json({ error: "Validation error. Check for copyrighted content." }, { status: 400 })
      }
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Generation failed",
      },
      { status: 500 },
    )
  }
}
