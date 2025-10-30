import { NextRequest, NextResponse } from "next/server"
import { getMusicVideoDetails } from "@/lib/suno-api"

export const runtime = "edge"

/**
 * Get Music Video Details API Endpoint
 * 
 * GET /api/music/video-details?taskId={taskId}
 * 
 * Retrieves the current status and details of a music video generation task.
 * Use this endpoint to poll video generation progress and retrieve download URL.
 * 
 * Query Parameters:
 * - taskId: string (required) - Task ID from create-video response
 * 
 * Response (Success):
 * {
 *   code: 0,
 *   msg: "success",
 *   data: {
 *     taskId: string,              // Task identifier
 *     musicId: string,             // Associated audio track ID
 *     callbackUrl: string,         // Callback URL if provided
 *     musicIndex: number,          // Internal index
 *     completeTime?: string,       // ISO timestamp when generation completed
 *     response?: {
 *       videoUrl: string           // Direct download link (available when SUCCESS)
 *     },
 *     successFlag: string,         // Current status (see below)
 *     createTime: string,          // ISO timestamp when task was created
 *     errorCode?: number,          // Error code if failed
 *     errorMessage?: string        // Error description if failed
 *   }
 * }
 * 
 * Status Values (successFlag):
 * - "PENDING": Video generation in progress (2-5 minutes typical)
 * - "SUCCESS": Video ready, videoUrl available for download
 * - "CREATE_TASK_FAILED": Failed to initialize generation task
 * - "GENERATE_MP4_FAILED": Failed during video rendering
 * - "CALLBACK_EXCEPTION": Callback notification failed (video may still be available)
 * 
 * Video Details:
 * - Format: MP4 (H.264 codec)
 * - Resolution: 1920x1080 (Full HD)
 * - Features: Animated waveforms, album art, metadata
 * - Availability: S3 URL valid for 7 days from completion
 * - File size: Typically 20-100 MB depending on duration
 * 
 * Polling Recommendations:
 * - Start polling immediately after creating video
 * - Poll every 30 seconds while status is PENDING
 * - Stop polling when status is SUCCESS or any failure state
 * - Maximum generation time: 10 minutes (timeout)
 * 
 * Download Handling:
 * - videoUrl is a direct S3 download link
 * - No authentication required for download
 * - URL expires after 7 days
 * - Save video to your storage for permanent access
 * 
 * Error Response:
 * {
 *   code: number,        // Error code (non-zero)
 *   msg: string          // Error description
 * }
 * 
 * Common Error Codes:
 * - 400: Missing or invalid taskId
 * - 404: Task not found (invalid taskId or expired)
 * - 429: Rate limit exceeded (too many polls)
 * - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json(
        {
          code: 400,
          msg: "taskId query parameter is required",
        },
        { status: 400 },
      )
    }

    const result = await getMusicVideoDetails(taskId)

    if (result.code !== 0) {
      return NextResponse.json(result, { status: result.code === 404 ? 404 : 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching music video details:", error)
    return NextResponse.json(
      {
        code: 500,
        msg: error instanceof Error ? error.message : "Failed to fetch video details",
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/music/video-details
 * 
 * Alternative endpoint that accepts taskId in request body instead of query parameter.
 * Provides the same functionality as GET endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId } = body

    if (!taskId || typeof taskId !== "string") {
      return NextResponse.json(
        {
          code: 400,
          msg: "taskId is required and must be a string",
        },
        { status: 400 },
      )
    }

    const result = await getMusicVideoDetails(taskId)

    if (result.code !== 0) {
      return NextResponse.json(result, { status: result.code === 404 ? 404 : 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching music video details:", error)
    return NextResponse.json(
      {
        code: 500,
        msg: error instanceof Error ? error.message : "Failed to fetch video details",
      },
      { status: 500 },
    )
  }
}
