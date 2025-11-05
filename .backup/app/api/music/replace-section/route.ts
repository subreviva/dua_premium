import { NextRequest, NextResponse } from "next/server"
import { replaceMusicSection } from "@/lib/suno-api"

export const runtime = "edge"

/**
 * Replace Music Section API Endpoint
 * Replace a specific time segment within existing music
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract parameters
    const { taskId, musicIndex, prompt, tags, title, negativeTags, infillStartS, infillEndS, callBackUrl: providedCallBackUrl } = body

    // Validate required fields
    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 })
    }

    if (musicIndex === undefined || musicIndex === null) {
      return NextResponse.json({ error: "musicIndex is required" }, { status: 400 })
    }

    if (!prompt) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 })
    }

    if (!tags) {
      return NextResponse.json({ error: "tags is required" }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 })
    }

    if (infillStartS === undefined || infillStartS === null) {
      return NextResponse.json({ error: "infillStartS is required" }, { status: 400 })
    }

    if (infillEndS === undefined || infillEndS === null) {
      return NextResponse.json({ error: "infillEndS is required" }, { status: 400 })
    }

    // Validate numeric types
    if (typeof musicIndex !== "number" || !Number.isInteger(musicIndex)) {
      return NextResponse.json({ error: "musicIndex must be an integer" }, { status: 400 })
    }

    if (typeof infillStartS !== "number" || infillStartS < 0) {
      return NextResponse.json({ error: "infillStartS must be a non-negative number" }, { status: 400 })
    }

    if (typeof infillEndS !== "number" || infillEndS < 0) {
      return NextResponse.json({ error: "infillEndS must be a non-negative number" }, { status: 400 })
    }

    // Validate time range
    if (infillStartS >= infillEndS) {
      return NextResponse.json({ error: "infillStartS must be less than infillEndS" }, { status: 400 })
    }

    // Get callback URL from request or environment or use default
    const callBackUrl =
      providedCallBackUrl ||
      process.env.SUNO_CALLBACK_URL ||
      `${request.nextUrl.origin}/api/music/callback`

    // Call Suno API
    const result = await replaceMusicSection({
      taskId,
      musicIndex,
      prompt,
      tags,
      title,
      negativeTags,
      infillStartS,
      infillEndS,
      callBackUrl,
    })

    return NextResponse.json(result)
  } catch (error) {
    // console.error("Replace music section error:", error)
    return NextResponse.json(
      {
        error: "Failed to replace music section",
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
    endpoint: "/api/music/replace-section",
    method: "POST",
    description: "Replace a specific time segment within existing music",
    requiredFields: {
      taskId: "Original task ID identifying the source music (required)",
      musicIndex: "Index of the song to replace (0 or 1) (required)",
      prompt: "Description of the replacement segment content (required)",
      tags: "Music style tags (e.g., Jazz, Electronic) (required)",
      title: "Music title (required)",
      infillStartS: "Start time for replacement in seconds (required, must be < infillEndS)",
      infillEndS: "End time for replacement in seconds (required, must be > infillStartS)",
    },
    optionalFields: {
      negativeTags: "Excluded music styles to avoid in the replacement",
      callBackUrl: "URL to receive task completion notifications",
    },
    exampleRequest: {
      taskId: "2fac****9f72",
      musicIndex: 0,
      prompt: "A calm and relaxing piano track.",
      tags: "Jazz",
      title: "Relaxing Piano",
      negativeTags: "Rock",
      infillStartS: 10.5,
      infillEndS: 20.75,
      callBackUrl: "https://example.com/callback",
    },
    response: {
      code: 200,
      msg: "success",
      data: {
        taskId: "5c79****be8e",
      },
    },
    callbackFormat: {
      description: "System will POST to callBackUrl when replacement is complete",
      successCallback: {
        code: 200,
        msg: "All generated successfully.",
        data: {
          callbackType: "complete",
          task_id: "2fac****9f72",
          data: [
            {
              id: "e231****-****-****-****-****8cadc7dc",
              audio_url: "https://example.cn/****.mp3",
              stream_audio_url: "https://example.cn/****",
              image_url: "https://example.cn/****.jpeg",
              prompt: "A calm and relaxing piano track.",
              model_name: "chirp-v3-5",
              title: "Relaxing Piano",
              tags: "Jazz",
              createTime: "2025-01-01 00:00:00",
              duration: 198.44,
            },
          ],
        },
      },
    },
    notes: [
      "infillStartS and infillEndS define the time range to replace (in seconds with 2 decimal places)",
      "The replacement will seamlessly blend with the existing audio",
      "Use the returned taskId to poll for status or wait for the callback",
      "Callback endpoint must respond within 10 seconds",
      "System will retry callbacks up to 3 times with exponential backoff",
    ],
  })
}
