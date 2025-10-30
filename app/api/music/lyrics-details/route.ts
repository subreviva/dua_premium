import { NextRequest, NextResponse } from "next/server"
import { getLyricsDetails } from "@/lib/suno-api"

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
    const result = await getLyricsDetails(taskId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Get lyrics details error:", error)
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
    usage: "GET /api/music/lyrics-details?taskId={taskId}",
    description: "Retrieve detailed information about a lyrics generation task",
    parameters: {
      taskId: "string (required) - The task ID returned from Generate Lyrics endpoint",
    },
    pollingRecommendation: {
      interval: "30 seconds",
      reason: "Lyrics generation typically completes within 1-2 minutes",
      note: "Poll this endpoint until status becomes SUCCESS or a failure state",
    },
    statusValues: {
      PENDING: "Task is queued or processing",
      SUCCESS: "Lyrics generation completed successfully",
      CREATE_TASK_FAILED: "Failed to create lyrics generation task",
      GENERATE_LYRICS_FAILED: "Lyrics generation process failed",
      CALLBACK_EXCEPTION: "Error occurred during callback notification",
      SENSITIVE_WORD_ERROR: "Content policy violation detected",
    },
    responseFormat: {
      example: {
        code: 200,
        msg: "success",
        data: {
          taskId: "11dc****8b0f",
          param: '{"prompt":"A song about peaceful night in the city"}',
          response: {
            taskId: "11dc****8b0f",
            data: [
              {
                text: "[Verse]\\n我穿越城市黑暗夜\\n心中燃烧梦想的烈火",
                title: "钢铁侠",
                status: "complete",
                errorMessage: "",
              },
            ],
          },
          status: "SUCCESS",
          type: "LYRICS",
          errorCode: null,
          errorMessage: null,
        },
      },
      fields: {
        taskId: "Task identifier",
        param: "JSON string of original generation parameters",
        "response.taskId": "Task ID (same as root taskId)",
        "response.data": "Array of generated lyrics (usually 2 variants)",
        "response.data[].text": "Lyrics content with structure markers",
        "response.data[].title": "Lyrics title",
        "response.data[].status": "complete or failed",
        "response.data[].errorMessage": "Error details if status is failed",
        status: "Overall task status (see statusValues above)",
        type: "Task type (always 'LYRICS' for lyrics generation)",
        errorCode: "Error code number if task failed",
        errorMessage: "Error description if task failed",
      },
    },
    usageFlow: [
      "1. Call POST /api/music/generate-lyrics to start generation",
      "2. Receive taskId in response",
      "3. Poll GET /api/music/lyrics-details?taskId={taskId} every 30 seconds",
      "4. Check status field until it becomes SUCCESS or a failure state",
      "5. Extract lyrics from response.data array",
      "6. Each request typically generates 2 different lyrics variants",
    ],
    examples: [
      {
        description: "Poll for lyrics generation status",
        request: "GET /api/music/lyrics-details?taskId=11dc****8b0f",
        use_case: "Check if lyrics generation has completed",
      },
      {
        description: "Get completed lyrics",
        request: "GET /api/music/lyrics-details?taskId=5c79****be8e",
        use_case: "Retrieve generated lyrics content after completion",
      },
    ],
    lyricsStructure: {
      markers: [
        "[Verse] - Verse sections",
        "[Chorus] - Chorus/refrain sections",
        "[Bridge] - Bridge sections",
        "[Pre-Chorus] - Pre-chorus sections",
        "[Outro] - Ending sections",
        "[Intro] - Introduction sections",
      ],
      note: "Lyrics include these structure markers to indicate different song sections",
    },
    statusCodes: {
      200: "Request successful",
      400: "Invalid parameters (missing taskId)",
      401: "Unauthorized access",
      404: "Invalid request method or path",
      405: "Rate limit exceeded",
      429: "Insufficient credits",
      430: "Call frequency too high. Please try again later.",
      455: "System maintenance",
      500: "Server error",
    },
    notes: [
      "This endpoint is an alternative to callback-based notifications",
      "Use polling if you cannot set up a callback URL",
      "Recommended polling interval: 30 seconds",
      "Lyrics generation typically completes within 1-2 minutes",
      "Each successful generation usually produces 2 different lyrics variants",
      "Lyrics content includes structure markers like [Verse], [Chorus], etc.",
      "Ensure proper UTF-8 encoding when handling lyrics content",
      "Status field transitions: PENDING → SUCCESS (or failure state)",
    ],
  })
}
