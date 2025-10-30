import { NextRequest, NextResponse } from "next/server"
import { getVocalSeparationDetails } from "@/lib/suno-api"

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
    const result = await getVocalSeparationDetails(taskId)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Get vocal separation details error:", error)
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
    usage: "GET /api/music/vocal-separation-details?taskId={taskId}",
    description: "Retrieve detailed information about a vocal/stem separation task",
    parameters: {
      taskId: "string (required) - The task ID returned from Separate Vocals endpoint",
    },
    pollingRecommendation: {
      interval: "30 seconds",
      separate_vocal: "Typically completes within 1-2 minutes",
      split_stem: "Typically completes within 3-5 minutes",
      note: "Poll this endpoint until successFlag becomes SUCCESS or a failure state",
    },
    statusValues: {
      PENDING: "Separation is queued or in progress",
      SUCCESS: "Separation completed successfully",
      CREATE_TASK_FAILED: "Failed to create separation task",
      GENERATE_AUDIO_FAILED: "Separation process failed",
      CALLBACK_EXCEPTION: "Error occurred during callback notification",
    },
    responseFormat: {
      separate_vocal_example: {
        code: 200,
        msg: "success",
        data: {
          taskId: "3e63b4cc88d52611159371f6af5571e7",
          musicId: "376c687e-d439-42c1-b1e4-bcb43b095ec2",
          callbackUrl: "https://api.example.com/callback",
          musicIndex: 0,
          completeTime: "1753782937000",
          response: {
            originUrl: null,
            instrumentalUrl:
              "https://file.aiquickdraw.com/s/d92a13bf-c6f4-4ade-bb47-f69738435528_Instrumental.mp3",
            vocalUrl:
              "https://file.aiquickdraw.com/s/3d7021c9-fa8b-4eda-91d1-3b9297ddb172_Vocals.mp3",
            backingVocalsUrl: null,
            drumsUrl: null,
            bassUrl: null,
            guitarUrl: null,
            keyboardUrl: null,
            percussionUrl: null,
            stringsUrl: null,
            synthUrl: null,
            fxUrl: null,
            brassUrl: null,
            woodwindsUrl: null,
          },
          successFlag: "SUCCESS",
          createTime: "1753782854000",
          errorCode: null,
          errorMessage: null,
        },
      },
      split_stem_example: {
        code: 200,
        msg: "success",
        data: {
          taskId: "e649edb7abfd759285bd41a47a634b10",
          musicId: "376c687e-d439-42c1-b1e4-bcb43b095ec2",
          callbackUrl: "https://api.example.com/callback",
          musicIndex: 0,
          completeTime: "1753782459000",
          response: {
            originUrl: null,
            instrumentalUrl: null,
            vocalUrl:
              "https://file.aiquickdraw.com/s/07420749-29a2-4054-9b62-e6a6f8b90ccb_Vocals.mp3",
            backingVocalsUrl:
              "https://file.aiquickdraw.com/s/aadc51a3-4c88-4c8e-a4c8-e867c539673d_Backing_Vocals.mp3",
            drumsUrl: "https://file.aiquickdraw.com/s/ac75c5ea-ac77-4ad2-b7d9-66e140b78e44_Drums.mp3",
            bassUrl: "https://file.aiquickdraw.com/s/a3c2da5a-b364-4422-adb5-2692b9c26d33_Bass.mp3",
            guitarUrl: "https://file.aiquickdraw.com/s/064dd08e-d5d2-4201-9058-c5c40fb695b4_Guitar.mp3",
            keyboardUrl:
              "https://file.aiquickdraw.com/s/adc934e0-df7d-45da-8220-1dba160d74e0_Keyboard.mp3",
            percussionUrl:
              "https://file.aiquickdraw.com/s/0f70884d-047c-41f1-a6d0-7044618b7dc6_Percussion.mp3",
            stringsUrl: "https://file.aiquickdraw.com/s/49829425-a5b0-424e-857a-75d4c63a426b_Strings.mp3",
            synthUrl: "https://file.aiquickdraw.com/s/56b2d94a-eb92-4d21-bc43-3460de0c8348_Synth.mp3",
            fxUrl: "https://file.aiquickdraw.com/s/a8822c73-6629-4089-8f2a-d19f41f0007d_FX.mp3",
            brassUrl: "https://file.aiquickdraw.com/s/334b2d23-0c65-4a04-92c7-22f828afdd44_Brass.mp3",
            woodwindsUrl:
              "https://file.aiquickdraw.com/s/d81545b1-6f94-4388-9785-1aaa6ecabb02_Woodwinds.mp3",
          },
          successFlag: "SUCCESS",
          createTime: "1753782327000",
          errorCode: null,
          errorMessage: null,
        },
      },
      fields: {
        taskId: "Task identifier",
        musicId: "Source music track ID that was processed",
        callbackUrl: "The callback URL provided in separation request",
        musicIndex: "Track index position within the original task",
        completeTime: "Timestamp when separation completed",
        "response.originUrl": "Original mixed audio URL (may be null)",
        "response.instrumentalUrl": "Instrumental-only track (separate_vocal type)",
        "response.vocalUrl": "Vocals-only track (both types)",
        "response.backingVocalsUrl": "Backing vocals (split_stem type)",
        "response.drumsUrl": "Drums track (split_stem type)",
        "response.bassUrl": "Bass track (split_stem type)",
        "response.guitarUrl": "Guitar track (split_stem type)",
        "response.keyboardUrl": "Keyboard track (split_stem type)",
        "response.percussionUrl": "Percussion track (split_stem type)",
        "response.stringsUrl": "Strings track (split_stem type)",
        "response.synthUrl": "Synthesizer track (split_stem type)",
        "response.fxUrl": "Effects track (split_stem type)",
        "response.brassUrl": "Brass track (split_stem type)",
        "response.woodwindsUrl": "Woodwinds track (split_stem type)",
        successFlag: "Separation status (see statusValues above)",
        createTime: "Task creation timestamp",
        errorCode: "Error code number if task failed",
        errorMessage: "Error description if task failed",
      },
    },
    usageFlow: [
      "1. Call POST /api/music/separate-vocals to start separation",
      "2. Receive taskId in response",
      "3. Poll GET /api/music/vocal-separation-details?taskId={taskId} every 30 seconds",
      "4. Check successFlag field until it becomes SUCCESS or a failure state",
      "5. When SUCCESS, download separated audio files from response URLs",
      "6. Save files promptly as download URLs may expire",
      "7. For split_stem, check which instrument URLs are available (may vary by track)",
    ],
    separationTypeDetection: {
      method: "Check which fields are non-null in the response",
      separate_vocal: "Has instrumentalUrl and vocalUrl, other instrument URLs are null",
      split_stem:
        "Has vocalUrl and multiple instrument URLs (backing vocals, drums, bass, etc.), instrumentalUrl is null",
    },
    stemAvailability: {
      note: "Not all stems may be present in every track",
      reasons: [
        "Source track may not contain certain instruments",
        "AI separation quality varies by instrument prominence",
        "Some instruments may be too quiet to extract reliably",
      ],
      recommendation: "Check each URL field individually before attempting download",
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
      "separate_vocal typically completes in 1-2 minutes",
      "split_stem typically completes in 3-5 minutes",
      "split_stem produces 12+ separate audio files - ensure adequate storage",
      "Download URLs may have time limits - save files promptly",
      "Ensure proper error handling for missing or failed stems",
      "successFlag field transitions: PENDING → SUCCESS (or failure state)",
      "Only successfully generated audio can be separated",
      "Source audio quality affects separation results",
    ],
  })
}
