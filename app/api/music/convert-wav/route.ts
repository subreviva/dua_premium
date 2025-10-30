import { NextRequest, NextResponse } from "next/server"
import { convertToWav } from "@/lib/suno-api"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.taskId) {
      return NextResponse.json(
        {
          code: 400,
          msg: "Missing required field: taskId",
          data: null,
        },
        { status: 400 }
      )
    }

    if (!body.audioId) {
      return NextResponse.json(
        {
          code: 400,
          msg: "Missing required field: audioId",
          data: null,
        },
        { status: 400 }
      )
    }

    // Set default callback URL if not provided
    const callBackUrl =
      body.callBackUrl || `${request.nextUrl.origin}/api/music/callback`

    // Call Suno API
    const result = await convertToWav({
      taskId: body.taskId,
      audioId: body.audioId,
      callBackUrl,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Convert to WAV error:", error)
    return NextResponse.json(
      {
        code: 500,
        msg: error instanceof Error ? error.message : "Internal server error",
        data: null,
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/music/convert-wav",
    description: "Convert existing music tracks to high-quality WAV format",
    usage: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        taskId: "string (required) - Task ID from a music generation task",
        audioId: "string (required) - Audio ID of the specific track to convert",
        callBackUrl:
          "string (optional) - URL to receive WAV conversion completion notification. If not provided, uses default callback URL.",
      },
    },
    wavConversion: {
      features: [
        "High-quality WAV format conversion",
        "Lossless audio quality",
        "Larger file size than MP3 format",
        "Suitable for professional audio production",
        "Callback notification when conversion completes",
        "Downloadable WAV file URL in callback",
      ],
      fileCharacteristics: [
        "Format: WAV (Waveform Audio File Format)",
        "Quality: Lossless, uncompressed audio",
        "Size: Typically 5-10x larger than MP3",
        "Use cases: Professional editing, mastering, archival",
      ],
    },
    callbackSystem: {
      callbackFormat: {
        success: {
          code: 200,
          msg: "success",
          data: {
            audioWavUrl: "https://example.com/s/04e6****e727.wav",
            task_id: "988e****c8d3",
          },
        },
        error: {
          code: 400,
          msg: "WAV format conversion failed",
          data: {
            audioWavUrl: null,
            task_id: "988e****c8d3",
          },
        },
      },
      callbackCodes: {
        200: "Success - WAV conversion completed",
        400: "Bad Request - Parameter error or unsupported source format",
        451: "Download Failed - Unable to download source audio file",
        500: "Server Error - Please try again later",
      },
      pollingAlternative:
        "Use GET /api/music/wav-details?taskId={taskId} to poll task status instead of using callbacks",
    },
    examples: [
      {
        description: "Convert a generated track to WAV format",
        request: {
          taskId: "5c79****be8e",
          audioId: "e231****-****-****-****-****8cadc7dc",
          callBackUrl: "https://api.example.com/wav-callback",
        },
      },
      {
        description: "Convert with default callback",
        request: {
          taskId: "11dc****8b0f",
          audioId: "a1b2****-****-****-****-****c3d4e5f6",
        },
      },
    ],
    response: {
      success: {
        code: 200,
        msg: "success",
        data: {
          taskId: "988e****c8d3",
        },
      },
      error: {
        code: 400,
        msg: "Error message description",
        data: null,
      },
    },
    statusCodes: {
      200: "Request successful",
      400: "Invalid parameters",
      401: "Unauthorized access",
      404: "Invalid request method or path",
      405: "Rate limit exceeded",
      409: "Conflict - WAV record already exists",
      413: "Theme or prompt too long",
      429: "Insufficient credits",
      430: "Call frequency too high. Please try again later.",
      455: "System maintenance",
      500: "Server error",
    },
    notes: [
      "WAV files are uncompressed and significantly larger than MP3 files",
      "Ensure sufficient storage space for WAV file downloads",
      "WAV format preserves original audio quality without any loss",
      "Ideal for professional audio editing and production workflows",
      "Download URLs may have time limits - save files promptly",
      "Conversion typically completes within 1-2 minutes",
      "Use specific audioId to ensure correct track is converted",
      "Can only convert audio that has been successfully generated",
    ],
  })
}
