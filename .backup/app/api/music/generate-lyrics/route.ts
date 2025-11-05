import { NextRequest, NextResponse } from "next/server"
import { generateLyrics } from "@/lib/suno-api"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.prompt) {
      return NextResponse.json(
        {
          code: 400,
          msg: "Missing required field: prompt",
          data: null,
        },
        { status: 400 }
      )
    }

    // Validate prompt length (max 200 words)
    const wordCount = body.prompt.trim().split(/\s+/).length
    if (wordCount > 200) {
      return NextResponse.json(
        {
          code: 413,
          msg: `Prompt exceeds maximum word limit. Current: ${wordCount} words, Maximum: 200 words`,
          data: null,
        },
        { status: 413 }
      )
    }

    // Set default callback URL if not provided
    const callBackUrl =
      body.callBackUrl || `${request.nextUrl.origin}/api/music/callback`

    // Call Suno API
    const result = await generateLyrics({
      prompt: body.prompt,
      callBackUrl,
    })

    return NextResponse.json(result)
  } catch (error) {
    // console.error("Generate lyrics error:", error)
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
    endpoint: "POST /api/music/generate-lyrics",
    description: "Generate lyrics for music using AI models without generating audio tracks",
    usage: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        prompt: "string (required) - Detailed description of desired lyrics content. Max 200 words.",
        callBackUrl:
          "string (optional) - URL to receive lyrics generation results. If not provided, uses default callback URL.",
      },
    },
    lyricsGeneration: {
      features: [
        "AI-powered lyrics generation",
        "No audio generation - lyrics only",
        "Typically generates 2 different lyrics variants",
        "Includes song structure markers ([Verse], [Chorus], etc.)",
        "Callback notification when generation completes",
      ],
      promptGuidelines: [
        "Be specific about themes, moods, and styles",
        "Mention desired song structure if needed",
        "Specify language or cultural context",
        "Include emotional tone or message",
        "More detail = better results",
      ],
    },
    callbackSystem: {
      callbackTypes: ["complete - Lyrics generation completed", "error - Task failed"],
      callbackFormat: {
        success: {
          code: 200,
          msg: "All generated successfully.",
          data: {
            callbackType: "complete",
            taskId: "11dc****8b0f",
            data: [
              {
                text: "[Verse]\\nWalking through the city's darkest night\\nWith dreams burning like a blazing fire",
                title: "Iron Man",
                status: "complete",
                errorMessage: "",
              },
            ],
          },
        },
        error: {
          code: 400,
          msg: "Lyrics generation failed",
          data: {
            callbackType: "error",
            taskId: "11dc****8b0f",
            data: null,
          },
        },
      },
      pollingAlternative:
        "Use GET /api/music/lyrics-details?taskId={taskId} to poll task status instead of using callbacks",
    },
    examples: [
      {
        description: "Generate lyrics about a peaceful night in the city",
        request: {
          prompt: "A song about peaceful night in the city",
          callBackUrl: "https://api.example.com/callback",
        },
      },
      {
        description: "Generate emotional ballad lyrics",
        request: {
          prompt:
            "A heartfelt ballad about finding hope after loss. Emotional, introspective, with themes of resilience and healing. Should have verses that tell a story and a powerful chorus.",
          callBackUrl: "https://api.example.com/lyrics-callback",
        },
      },
      {
        description: "Generate upbeat pop song lyrics",
        request: {
          prompt:
            "An upbeat pop song celebrating summer adventures and friendships. Fun, energetic, with catchy hooks and relatable lyrics about making memories.",
        },
      },
    ],
    response: {
      success: {
        code: 200,
        msg: "success",
        data: {
          taskId: "5c79****be8e",
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
      413: "Prompt too long (max 200 words)",
      429: "Insufficient credits",
      430: "Call frequency too high. Please try again later.",
      455: "System maintenance",
      500: "Server error",
    },
    notes: [
      "Unlike music generation, lyrics generation has only one callback stage: 'complete'",
      "Lyrics content may contain special characters and line breaks - ensure proper UTF-8 encoding",
      "Usually generates 2 different lyrics variants per request",
      "Lyrics include structure markers like [Verse], [Chorus], [Bridge], etc.",
      "Can be used independently or as input for music generation",
      "Check content policy compliance to avoid generation failures",
      "Save lyrics immediately upon callback to prevent data loss",
    ],
  })
}
