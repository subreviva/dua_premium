import { NextRequest, NextResponse } from "next/server"
import { boostMusicStyle } from "@/lib/suno-api"

export const runtime = "edge"

/**
 * Boost Music Style API Endpoint
 * Generate enhanced music style descriptions from simple inputs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract parameters
    const { content } = body

    // Validate required fields
    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 })
    }

    // Validate content is a string
    if (typeof content !== "string") {
      return NextResponse.json({ error: "content must be a string" }, { status: 400 })
    }

    // Validate content length (reasonable limit)
    if (content.trim().length === 0) {
      return NextResponse.json({ error: "content cannot be empty" }, { status: 400 })
    }

    if (content.length > 500) {
      return NextResponse.json({ error: "content must be 500 characters or less" }, { status: 400 })
    }

    // Call Suno API
    const result = await boostMusicStyle({
      content: content.trim(),
    })

    return NextResponse.json(result)
  } catch (error) {
    // console.error("Boost music style error:", error)
    return NextResponse.json(
      {
        error: "Failed to boost music style",
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
    endpoint: "/api/music/boost-style",
    method: "POST",
    description: "Generate enhanced music style descriptions from simple inputs using AI",
    requiredFields: {
      content: "Style description in concise language (max 500 characters)",
    },
    exampleRequest: {
      content: "Pop, Mysterious",
    },
    response: {
      code: 200,
      msg: "success",
      data: {
        taskId: "abc123...",
        param: '{"content":"Pop, Mysterious"}',
        result:
          "Upbeat pop with enigmatic melodies, layered synths, and haunting vocals creating an air of mystery",
        creditsConsumed: 1,
        creditsRemaining: 99,
        successFlag: "1",
        errorCode: null,
        errorMessage: null,
        createTime: "2025-10-30T12:00:00Z",
      },
    },
    usageExamples: [
      "Pop, Mysterious → Enhanced description with mood and instrumentation details",
      "Rock, Energetic → Detailed rock style with energy characteristics",
      "Jazz, Smooth → Sophisticated jazz description with mood elements",
      "Electronic, Dark → Atmospheric electronic style with dark elements",
    ],
    notes: [
      "The AI will expand your simple style description into a detailed, production-ready prompt",
      "Use concise, clear language describing the music style you want",
      "Combine genres and moods for more specific results (e.g., 'Pop, Mysterious')",
      "The result field contains the enhanced style description",
      "successFlag: 0=pending, 1=success, 2=failed",
    ],
  })
}
