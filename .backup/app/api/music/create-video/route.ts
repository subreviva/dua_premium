import { NextRequest, NextResponse } from "next/server"
import { createMusicVideo, CreateMusicVideoParams } from "@/lib/suno-api"

export const runtime = "edge"

/**
 * Create Music Video API Endpoint
 * 
 * POST /api/music/create-video
 * 
 * Creates an MP4 music video with animated visualizations for an audio track.
 * Videos feature waveform animations, album artwork, and customizable branding.
 * 
 * Request Body:
 * {
 *   taskId: string         // Required: Unique task identifier
 *   audioId: string        // Required: ID of audio track to create video for
 *   callBackUrl?: string   // Optional: URL for completion notifications
 *   author?: string        // Optional: Author name (max 50 chars, displayed prominently in video)
 *   domainName?: string    // Optional: Domain watermark (max 50 chars, subtle bottom watermark)
 * }
 * 
 * Response (Success):
 * {
 *   code: 0,
 *   msg: "success",
 *   data: {
 *     taskId: string       // Task ID for tracking generation progress
 *   }
 * }
 * 
 * Video Generation:
 * - Format: MP4 with H.264 codec
 * - Duration: Matches audio track length
 * - Features: Animated waveforms, album art, metadata display
 * - Resolution: 1920x1080 (Full HD)
 * - Processing: 2-5 minutes depending on track length
 * 
 * Callback Format (when callBackUrl is provided):
 * {
 *   callbackType: "complete" | "error",
 *   taskId: string,
 *   data: {
 *     videoUrl: string     // Direct download link (S3 URL, available for 7 days)
 *   }
 * }
 * 
 * Branding Options:
 * - author: Displayed prominently at video start/end
 * - domainName: Subtle watermark at bottom throughout video
 * - Both optional, useful for content creators, labels, platforms
 * 
 * Status Tracking:
 * Use GET /api/music/video-details?taskId={taskId} to poll generation status
 * Recommended polling: Every 30 seconds
 * 
 * Error Response:
 * {
 *   code: number,        // Error code (non-zero)
 *   msg: string          // Error description
 * }
 * 
 * Common Error Codes:
 * - 400: Invalid parameters (missing taskId/audioId, author/domainName too long)
 * - 404: Audio track not found
 * - 429: Rate limit exceeded
 * - 500: Server error during video generation
 * - 503: Service temporarily unavailable
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required parameters
    if (!body.taskId || typeof body.taskId !== "string") {
      return NextResponse.json(
        {
          code: 400,
          msg: "taskId is required and must be a string",
        },
        { status: 400 },
      )
    }

    if (!body.audioId || typeof body.audioId !== "string") {
      return NextResponse.json(
        {
          code: 400,
          msg: "audioId is required and must be a string",
        },
        { status: 400 },
      )
    }

    // Validate optional parameters
    if (body.author && typeof body.author === "string" && body.author.length > 50) {
      return NextResponse.json(
        {
          code: 400,
          msg: "author must be 50 characters or less",
        },
        { status: 400 },
      )
    }

    if (body.domainName && typeof body.domainName === "string" && body.domainName.length > 50) {
      return NextResponse.json(
        {
          code: 400,
          msg: "domainName must be 50 characters or less",
        },
        { status: 400 },
      )
    }

    const params: CreateMusicVideoParams = {
      taskId: body.taskId,
      audioId: body.audioId,
      callBackUrl: body.callBackUrl,
      author: body.author,
      domainName: body.domainName,
    }

    const result = await createMusicVideo(params)

    if (result.code !== 0) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    // console.error("Error creating music video:", error)
    return NextResponse.json(
      {
        code: 500,
        msg: error instanceof Error ? error.message : "Failed to create music video",
      },
      { status: 500 },
    )
  }
}

/**
 * GET /api/music/create-video
 * 
 * Returns API documentation for the Create Music Video endpoint.
 * This is a convenience endpoint for developers to view the API specification.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/music/create-video",
    description: "Create an MP4 music video with animated visualizations for an audio track",
    parameters: {
      taskId: {
        type: "string",
        required: true,
        description: "Unique task identifier",
      },
      audioId: {
        type: "string",
        required: true,
        description: "ID of audio track to create video for",
      },
      callBackUrl: {
        type: "string",
        required: false,
        description: "URL for completion notifications",
      },
      author: {
        type: "string",
        required: false,
        maxLength: 50,
        description: "Author name displayed prominently in video",
      },
      domainName: {
        type: "string",
        required: false,
        maxLength: 50,
        description: "Domain watermark shown subtly at bottom of video",
      },
    },
    response: {
      success: {
        code: 0,
        msg: "success",
        data: {
          taskId: "string - Task ID for tracking generation progress",
        },
      },
      error: {
        code: "number - Error code (non-zero)",
        msg: "string - Error description",
      },
    },
    videoFormat: {
      format: "MP4 (H.264 codec)",
      resolution: "1920x1080 (Full HD)",
      duration: "Matches audio track length",
      features: ["Animated waveforms", "Album artwork", "Metadata display"],
      processingTime: "2-5 minutes depending on track length",
      availability: "S3 download URL valid for 7 days",
    },
    callbackFormat: {
      callbackType: '"complete" | "error"',
      taskId: "string",
      data: {
        videoUrl: "string - Direct download link when complete",
      },
    },
    brandingOptions: {
      author: "Displayed prominently at video start and end",
      domainName: "Subtle watermark at bottom throughout video",
      useCases: ["Content creators", "Record labels", "Music platforms"],
    },
    statusTracking: {
      endpoint: "GET /api/music/video-details",
      polling: "Every 30 seconds recommended",
      states: ["PENDING", "SUCCESS", "CREATE_TASK_FAILED", "GENERATE_MP4_FAILED", "CALLBACK_EXCEPTION"],
    },
    example: {
      request: {
        taskId: "vid_abc123",
        audioId: "audio_xyz789",
        callBackUrl: "https://your-domain.com/webhook",
        author: "Artist Name",
        domainName: "yourdomain.com",
      },
      response: {
        code: 0,
        msg: "success",
        data: {
          taskId: "vid_abc123",
        },
      },
    },
  })
}
