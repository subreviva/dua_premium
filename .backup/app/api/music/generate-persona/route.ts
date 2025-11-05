import { NextRequest, NextResponse } from "next/server"
import { generatePersona } from "@/lib/suno-api"

export const runtime = "edge"

/**
 * Generate Persona API Endpoint
 * Create a personalized music Persona based on generated music
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract parameters
    const { taskId, musicIndex, name, description } = body

    // Validate required fields
    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 })
    }

    if (musicIndex === undefined || musicIndex === null) {
      return NextResponse.json({ error: "musicIndex is required" }, { status: 400 })
    }

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    if (!description) {
      return NextResponse.json({ error: "description is required" }, { status: 400 })
    }

    // Validate types
    if (typeof musicIndex !== "number" || !Number.isInteger(musicIndex)) {
      return NextResponse.json({ error: "musicIndex must be an integer" }, { status: 400 })
    }

    if (musicIndex < 0) {
      return NextResponse.json({ error: "musicIndex must be non-negative" }, { status: 400 })
    }

    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "name must be a non-empty string" }, { status: 400 })
    }

    if (typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json({ error: "description must be a non-empty string" }, { status: 400 })
    }

    // Call Suno API
    const result = await generatePersona({
      taskId,
      musicIndex,
      name: name.trim(),
      description: description.trim(),
    })

    return NextResponse.json(result)
  } catch (error) {
    // console.error("Generate persona error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate persona",
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
    endpoint: "/api/music/generate-persona",
    method: "POST",
    description: "Create a personalized music Persona based on generated music, giving it a unique identity",
    requiredFields: {
      taskId: "Task ID from music generation (Generate, Extend, Upload-Cover, or Upload-Extend)",
      musicIndex: "Index of the music track (0 or 1) to create Persona from",
      name: "Name for the Persona (e.g., 'Electronic Pop Singer')",
      description:
        "Detailed description of the Persona's musical characteristics, style, and personality",
    },
    exampleRequest: {
      taskId: "5c79****be8e",
      musicIndex: 0,
      name: "Electronic Pop Singer",
      description: "A modern electronic music style pop singer, skilled in dynamic rhythms and synthesizer tones",
    },
    response: {
      code: 200,
      msg: "success",
      data: {
        personaId: "a1b2****c3d4",
        name: "Electronic Pop Singer",
        description:
          "A modern electronic music style pop singer, skilled in dynamic rhythms and synthesizer tones",
      },
    },
    usingPersonaId: {
      description: "Use the returned personaId in subsequent music generation requests",
      endpoints: [
        "Generate Music (/api/music/generate)",
        "Extend Music (/api/music/extend)",
        "Upload And Cover (/api/music/cover)",
        "Upload And Extend (/api/music/upload-extend)",
      ],
      example: {
        endpoint: "/api/music/generate",
        body: {
          prompt: "A calm piano melody",
          style: "Classical",
          personaId: "a1b2****c3d4",
          customMode: true,
          instrumental: false,
          model: "V5",
        },
      },
    },
    statusCodes: {
      200: "Success - Persona created",
      401: "Unauthorized - Invalid credentials",
      402: "Insufficient credits",
      404: "Not found - Music task doesn't exist",
      409: "Conflict - Persona already exists for this music",
      422: "Validation error - Invalid parameters",
      429: "Rate limited",
      451: "Unauthorized - Failed to fetch music data",
      455: "Service unavailable - System maintenance",
      500: "Server error",
    },
    notes: [
      "The Persona captures the unique musical style and characteristics of the selected track",
      "Use the personaId to generate new music with similar style and characteristics",
      "Be specific in the description about genre, mood, instrumentation, and vocal qualities",
      "Each music track can only have one Persona (409 error if already exists)",
      "The taskId must be from a completed music generation task",
    ],
  })
}
