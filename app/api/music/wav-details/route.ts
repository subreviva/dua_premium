import { NextRequest, NextResponse } from "next/server"
import { getWavDetails } from "@/lib/suno-api"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const taskId = searchParams.get("taskId")

    // Validate required parameter
    if (!taskId) {
      return NextResponse.json(
        {
          code: 400,
          msg: "Missing required parameter: taskId",
          data: null,
        },
        { status: 400 }
      )
    }

    // Call Suno API
    const result = await getWavDetails(taskId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Get WAV details error:", error)
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

export async function POST() {
  return NextResponse.json({
    error: "This endpoint only supports GET requests",
    usage: "GET /api/music/wav-details?taskId={taskId}",
    description: "Retrieve detailed information about a WAV format conversion task",
    parameters: {
      taskId: "string (required) - The task ID returned from Convert to WAV Format endpoint",
    },
    pollingRecommendation: {
      interval: "30 seconds",
      reason: "WAV conversion typically completes within 1-2 minutes",
      note: "Poll this endpoint until successFlag becomes SUCCESS or a failure state",
    },
    statusValues: {
      PENDING: "Conversion is queued or in progress",
      SUCCESS: "WAV conversion completed successfully",
      CREATE_TASK_FAILED: "Failed to create conversion task",
      GENERATE_WAV_FAILED: "WAV conversion process failed",
      CALLBACK_EXCEPTION: "Error occurred during callback notification",
    },
    responseFormat: {
      example: {
        code: 200,
        msg: "success",
        data: {
          taskId: "988e****c8d3",
          musicId: "8551****662c",
          callbackUrl: "https://api.example.com/callback",
          completeTime: "2025-01-01 00:10:00",
          response: {
            audioWavUrl: "https://example.com/s/04e6****e727.wav",
          },
          successFlag: "SUCCESS",
          createTime: "2025-01-01 00:00:00",
          errorCode: null,
          errorMessage: null,
        },
      },
      fields: {
        taskId: "Task identifier",
        musicId: "Source music track ID that was converted",
        callbackUrl: "The callback URL provided in conversion request",
        completeTime: "Timestamp when conversion completed",
        "response.audioWavUrl": "Download URL for converted WAV file",
        successFlag: "Conversion status (see statusValues above)",
        createTime: "Task creation timestamp",
        errorCode: "Error code number if task failed",
        errorMessage: "Error description if task failed",
      },
    },
    usageFlow: [
      "1. Call POST /api/music/convert-wav to start conversion",
      "2. Receive taskId in response",
      "3. Poll GET /api/music/wav-details?taskId={taskId} every 30 seconds",
      "4. Check successFlag field until it becomes SUCCESS or a failure state",
      "5. When SUCCESS, download WAV file from response.audioWavUrl",
      "6. Save WAV file promptly as download URLs may expire",
    ],
    examples: [
      {
        description: "Poll for WAV conversion status",
        request: "GET /api/music/wav-details?taskId=988e****c8d3",
        use_case: "Check if WAV conversion has completed",
      },
      {
        description: "Get completed WAV download URL",
        request: "GET /api/music/wav-details?taskId=5c79****be8e",
        use_case: "Retrieve WAV file download link after conversion",
      },
    ],
    wavFileInfo: {
      format: "WAV (Waveform Audio File Format)",
      quality: "Lossless, uncompressed audio",
      sizeComparison: "Typically 5-10x larger than MP3",
      bitDepth: "16-bit or 24-bit",
      sampleRate: "44.1kHz or 48kHz (depending on source)",
      useCases: [
        "Professional audio editing and mastering",
        "High-fidelity archival storage",
        "Input for audio processing software",
        "DJ and live performance applications",
      ],
    },
    statusCodes: {
      200: "Request successful",
      400: "Invalid parameters (missing taskId)",
      401: "Unauthorized access",
      404: "Invalid request method or path",
      405: "Rate limit exceeded",
      409: "Conflict - WAV record already exists",
      429: "Insufficient credits",
      430: "Call frequency too high. Please try again later.",
      455: "System maintenance",
      500: "Server error",
    },
    notes: [
      "This endpoint is an alternative to callback-based notifications",
      "Use polling if you cannot set up a callback URL",
      "Recommended polling interval: 30 seconds",
      "WAV conversion typically completes within 1-2 minutes",
      "WAV files are significantly larger than MP3 - ensure adequate storage",
      "Download URLs may have time limits - save files promptly",
      "Ensure proper error handling for download failures",
      "successFlag field transitions: PENDING → SUCCESS (or failure state)",
      "Only successfully generated audio can be converted to WAV",
    ],
  })
}
