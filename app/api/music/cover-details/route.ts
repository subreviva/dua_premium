import { NextRequest, NextResponse } from "next/server"
import { getCoverDetails } from "@/lib/suno-api"

export const runtime = "edge"

/**
 * Get Music Cover Details API Endpoint
 * Retrieve detailed information about music cover generation tasks
 */
export async function GET(request: NextRequest) {
  try {
    // Get taskId from query parameters
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("taskId")

    // Validate required parameter
    if (!taskId) {
      return NextResponse.json({ error: "taskId query parameter is required" }, { status: 400 })
    }

    // Call Suno API
    const result = await getCoverDetails(taskId)

    return NextResponse.json(result)
  } catch (error) {
    // console.error("Get cover details error:", error)
    return NextResponse.json(
      {
        error: "Failed to get cover details",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

/**
 * POST endpoint for documentation (returns info about GET endpoint)
 */
export async function POST() {
  return NextResponse.json({
    note: "This endpoint uses GET method, not POST",
    endpoint: "/api/music/cover-details",
    method: "GET",
    description: "Get detailed information about music cover generation tasks",
    requiredQueryParams: {
      taskId: "Unique identifier of the cover generation task",
    },
    exampleUsage: "/api/music/cover-details?taskId=21aee3c3c2a01fa5e030b3799fa4dd56",
    response: {
      code: 200,
      msg: "success",
      data: {
        taskId: "21aee3c3c2a01fa5e030b3799fa4dd56",
        parentTaskId: "73d6128b3523a0079df10da9471017c8",
        callbackUrl: "https://api.example.com/callback",
        completeTime: "2025-01-15T10:35:27.000Z",
        response: {
          images: [
            "https://tempfile.aiquickdraw.com/s/1753958521_6c1b3015141849d1a9bf17b738ce9347.png",
            "https://tempfile.aiquickdraw.com/s/1753958524_c153143acc6340908431cf0e90cbce9e.png",
          ],
        },
        successFlag: 1,
        createTime: "2025-01-15T10:33:01.000Z",
        errorCode: 200,
        errorMessage: "",
      },
    },
    successFlags: {
      0: "Pending - Task is queued",
      1: "Success - Cover images generated successfully",
      2: "Generating - Cover generation in progress",
      3: "Generation failed - Task failed",
    },
    statusCodes: {
      200: "Success - Task completed",
      400: "Format error - Invalid JSON parameters",
      401: "Unauthorized - Invalid credentials",
      402: "Insufficient credits",
      404: "Not found - Resource doesn't exist",
      409: "Conflict - Cover record already exists",
      422: "Validation error",
      429: "Rate limited",
      455: "Service unavailable - System maintenance",
      500: "Server error",
    },
    notes: [
      "Use this endpoint to poll cover generation status if not using callbacks",
      "successFlag indicates the current task status (0=pending, 1=success, 2=generating, 3=failed)",
      "The response.images array contains URLs to the generated cover images",
      "Usually generates 2 different style cover images",
      "Recommended polling interval: every 30 seconds",
      "Images should be downloaded and saved as URLs may have validity periods",
    ],
  })
}
