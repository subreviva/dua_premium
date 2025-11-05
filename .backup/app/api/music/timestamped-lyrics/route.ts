import { NextRequest, NextResponse } from "next/server"
import { getTimestampedLyrics } from "@/lib/suno-api"

export const runtime = "edge"

/**
 * Get Timestamped Lyrics API Endpoint
 * Retrieve timestamped lyrics for synchronized display during audio playback
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract parameters
    const { taskId, audioId, musicIndex } = body

    // Validate required fields
    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 })
    }

    // Validate musicIndex if provided
    if (musicIndex !== undefined && musicIndex !== 0 && musicIndex !== 1) {
      return NextResponse.json({ error: "musicIndex must be 0 or 1" }, { status: 400 })
    }

    // Call Suno API
    const result = await getTimestampedLyrics({
      taskId,
      audioId,
      musicIndex: musicIndex as 0 | 1 | undefined,
    })

    return NextResponse.json(result)
  } catch (error) {
    // console.error("Get timestamped lyrics error:", error)
    return NextResponse.json(
      {
        error: "Failed to get timestamped lyrics",
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
    endpoint: "/api/music/timestamped-lyrics",
    method: "POST",
    description: "Retrieve timestamped lyrics for synchronized display during audio playback",
    requiredFields: {
      taskId: "The task ID of the music generation task (required)",
    },
    optionalFields: {
      audioId: "The specific audio ID to retrieve lyrics for (takes priority over musicIndex)",
      musicIndex: "The index of the track (0 or 1) within the task (used if audioId not provided)",
    },
    exampleRequest: {
      taskId: "5c79****be8e",
      audioId: "e231****-****-****-****-****8cadc7dc",
      musicIndex: 0,
    },
    response: {
      code: 200,
      msg: "success",
      data: {
        alignedWords: [
          {
            word: "[Verse]\nWaggin'",
            success: true,
            startS: 1.36,
            endS: 1.79,
            palign: 0,
          },
        ],
        waveformData: [0, 1, 0.5, 0.75],
        hootCer: 0.3803191489361702,
        isStreamed: false,
      },
    },
    notes: [
      "Either audioId or musicIndex should be provided to identify the exact track",
      "audioId takes priority over musicIndex if both are provided",
      "The alignedWords array contains word-level timing information for synchronized display",
      "waveformData is used for audio visualization",
      "hootCer represents the lyrics alignment accuracy score",
    ],
  })
}
