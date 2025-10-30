import { NextRequest, NextResponse } from "next/server"
import { addVocals } from "@/lib/suno-api"

export const runtime = "edge"

/**
 * Add Vocals API Endpoint
 * Layers AI-generated vocals on top of an existing instrumental track
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract parameters
    const {
      uploadUrl,
      prompt,
      title,
      negativeTags,
      style,
      vocalGender,
      styleWeight,
      weirdnessConstraint,
      audioWeight,
      model,
    } = body

    // Validate required fields
    if (!uploadUrl) {
      return NextResponse.json({ error: "uploadUrl is required" }, { status: 400 })
    }

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 })
    }

    if (!negativeTags) {
      return NextResponse.json({ error: "negativeTags is required" }, { status: 400 })
    }

    if (!style) {
      return NextResponse.json({ error: "style is required" }, { status: 400 })
    }

    // Validate model if provided
    if (model && !["V4_5PLUS", "V5"].includes(model)) {
      return NextResponse.json({ error: "model must be V4_5PLUS or V5" }, { status: 400 })
    }

    // Validate vocalGender if provided
    if (vocalGender && !["m", "f"].includes(vocalGender)) {
      return NextResponse.json({ error: "vocalGender must be 'm' or 'f'" }, { status: 400 })
    }

    // Validate weight parameters if provided
    if (styleWeight !== undefined && (styleWeight < 0 || styleWeight > 1)) {
      return NextResponse.json({ error: "styleWeight must be between 0 and 1" }, { status: 400 })
    }

    if (weirdnessConstraint !== undefined && (weirdnessConstraint < 0 || weirdnessConstraint > 1)) {
      return NextResponse.json({ error: "weirdnessConstraint must be between 0 and 1" }, { status: 400 })
    }

    if (audioWeight !== undefined && (audioWeight < 0 || audioWeight > 1)) {
      return NextResponse.json({ error: "audioWeight must be between 0 and 1" }, { status: 400 })
    }

    // Get callback URL from environment or use default
    const callBackUrl = process.env.SUNO_CALLBACK_URL || `${request.nextUrl.origin}/api/music/callback`

    // Call Suno API
    const result = await addVocals({
      uploadUrl,
      prompt,
      title,
      negativeTags,
      style,
      vocalGender: vocalGender as "m" | "f" | undefined,
      styleWeight,
      weirdnessConstraint,
      audioWeight,
      model: (model as "V4_5PLUS" | "V5" | undefined) || "V4_5PLUS",
      callBackUrl,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Add vocals error:", error)
    return NextResponse.json(
      {
        error: "Failed to add vocals",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

/**
 * GET endpoint for documentation and testing
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/music/add-vocals",
    method: "POST",
    description: "Layer AI-generated vocals on top of an existing instrumental track",
    requiredFields: {
      uploadUrl: "URL of the uploaded instrumental audio file (required)",
      prompt: "Description of the desired vocal style and content (required)",
      title: "Title of the vocal track (required)",
      negativeTags: "Music styles or vocal traits to exclude (required)",
      style: "Music and vocal style/genre (required)",
    },
    optionalFields: {
      vocalGender: "Preferred vocal gender: 'm' (male) or 'f' (female)",
      styleWeight: "Style adherence weight (0-1, default: 0.61)",
      weirdnessConstraint: "Creativity/novelty constraint (0-1, default: 0.72)",
      audioWeight: "Audio consistency weight (0-1, default: 0.65)",
      model: "Model version: V4_5PLUS (default) or V5",
    },
    supportedModels: ["V4_5PLUS", "V5"],
    exampleRequest: {
      uploadUrl: "https://example.com/instrumental.mp3",
      prompt: "A calm and relaxing piano track with soothing vocals",
      title: "Relaxing Piano with Vocals",
      negativeTags: "Heavy Metal, Aggressive Vocals",
      style: "Jazz",
      vocalGender: "m",
      styleWeight: 0.61,
      weirdnessConstraint: 0.72,
      audioWeight: 0.65,
      model: "V4_5PLUS",
    },
    response: {
      code: 200,
      msg: "success",
      data: {
        taskId: "5c79****be8e",
      },
    },
    notes: [
      "All weight parameters accept values between 0 and 1 with two decimal places recommended",
      "The uploadUrl must be a valid, accessible audio file URL",
      "Callback notifications will be sent to the configured callback URL",
      "Use the taskId to poll for generation status via /api/music/status",
    ],
  })
}
