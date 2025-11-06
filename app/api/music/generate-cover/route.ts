import { NextRequest, NextResponse } from "next/server"
import { generateCover } from "@/lib/suno-api"

export const runtime = "edge"

/**
 * Generate Music Cover API Endpoint
 * Create personalized cover images for generated music
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract parameters
    const { taskId, callBackUrl: providedCallBackUrl } = body

    // Validate required fields
    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 })
    }

    // Get callback URL from request or environment or use default
    const callBackUrl =
      providedCallBackUrl || process.env.SUNO_COVER_CALLBACK_URL || `${request.nextUrl.origin}/api/music/cover-callback`

    // Validate callback URL format
    try {
      new URL(callBackUrl)
    } catch {
      return NextResponse.json({ error: "callBackUrl must be a valid URL" }, { status: 400 })
    }

    // Call Suno API
    const result = await generateCover({
      taskId,
      callBackUrl,
    })

    return NextResponse.json(result)
  } catch (error) {
    // console.error("Generate cover error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate cover",
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
    endpoint: "/api/music/generate-cover",
    method: "POST",
    description: "Create personalized cover images for generated music",
    requiredFields: {
      taskId: "Original music task ID from music generation (required)",
      callBackUrl: "URL to receive cover generation completion notifications (required)",
    },
    exampleRequest: {
      taskId: "73d6128b3523a0079df10da9471017c8",
      callBackUrl: "https://api.example.com/callback",
    },
    response: {
      code: 200,
      msg: "success",
      data: {
        taskId: "21aee3c3c2a01fa5e030b3799fa4dd56",
      },
    },
    callbackFormat: {
      description: "The system will send POST requests to callBackUrl when cover generation is complete",
      successCallback: {
        code: 200,
        msg: "success",
        data: {
          taskId: "21aee3c3c2a01fa5e030b3799fa4dd56",
          images: [
            "https://tempfile.aiquickdraw.com/s/1753958521_6c1b3015141849d1a9bf17b738ce9347.png",
            "https://tempfile.aiquickdraw.com/s/1753958524_c153143acc6340908431cf0e90cbce9e.png",
          ],
        },
      },
      failureCallback: {
        code: 501,
        msg: "Cover generation failed",
        data: {
          taskId: "21aee3c3c2a01fa5e030b3799fa4dd56",
          images: null,
        },
      },
    },
    statusCodes: {
      200: "Success - Request processed successfully",
      400: "Validation error - Cover already generated or invalid parameters",
      401: "Unauthorized - Authentication credentials missing or invalid",
      402: "Insufficient credits",
      404: "Not found - Requested resource doesn't exist",
      409: "Conflict - Cover record already exists",
      422: "Validation error - Request parameters failed validation",
      429: "Rate limited - Too many requests",
      455: "Service unavailable - System maintenance",
      500: "Server error",
      501: "Cover generation failed",
      531: "Generation failed - Credits refunded",
    },
    notes: [
      "Usually generates 2 different style cover images for selection",
      "Your callback endpoint must respond within 15 seconds",
      "Cover image URLs may have validity periods - download and save promptly",
      "The system will retry callbacks up to 3 times if failures occur",
      "Use the taskId from a completed music generation task",
    ],
  })
}
