import { NextRequest, NextResponse } from "next/server"
import { separateVocals } from "@/lib/suno-api"

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

    // Validate type if provided
    if (body.type && !["separate_vocal", "split_stem"].includes(body.type)) {
      return NextResponse.json(
        {
          code: 400,
          msg: "Invalid type. Must be 'separate_vocal' or 'split_stem'",
          data: null,
        },
        { status: 400 }
      )
    }

    // Set default callback URL if not provided
    const callBackUrl =
      body.callBackUrl || `${request.nextUrl.origin}/api/music/callback`

    // Call Suno API
    const result = await separateVocals({
      taskId: body.taskId,
      audioId: body.audioId,
      type: body.type || "separate_vocal",
      callBackUrl,
    })

    return NextResponse.json(result)
  } catch (error) {
    // console.error("Separate vocals error:", error)
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
    endpoint: "POST /api/music/separate-vocals",
    description:
      "Separate vocals and instruments from music tracks using state-of-the-art AI source separation",
    usage: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        taskId: "string (required) - Task ID from a music generation task",
        audioId: "string (required) - Audio ID of the specific track to separate",
        type: "string (optional) - Separation type: 'separate_vocal' (default) or 'split_stem'",
        callBackUrl:
          "string (optional) - URL to receive separation results. If not provided, uses default callback URL.",
      },
    },
    separationTypes: {
      separate_vocal: {
        description: "Basic vocal and instrumental separation (default)",
        outputs: [
          "Vocal track - isolated vocals only",
          "Instrumental track - accompaniment without vocals",
        ],
        useCase: "Creating karaoke tracks, remixing, vocal analysis",
      },
      split_stem: {
        description: "Advanced multi-instrument stem separation",
        outputs: [
          "Vocals - lead vocals",
          "Backing Vocals - background vocals",
          "Drums - percussion and beats",
          "Bass - bass lines",
          "Guitar - guitar tracks",
          "Keyboard - keyboard/piano",
          "Percussion - additional percussion",
          "Strings - string instruments",
          "Synthesizer - synth sounds",
          "Effects - sound effects",
          "Brass - brass instruments",
          "Woodwinds - woodwind instruments",
        ],
        useCase: "Professional remixing, detailed audio analysis, music production",
      },
    },
    callbackSystem: {
      callbackFormat: {
        separate_vocal_success: {
          code: 200,
          msg: "vocal Removal generated successfully.",
          data: {
            task_id: "3e63b4cc88d52611159371f6af5571e7",
            vocal_removal_info: {
              instrumental_url:
                "https://file.aiquickdraw.com/s/d92a13bf-c6f4-4ade-bb47-f69738435528_Instrumental.mp3",
              origin_url: "",
              vocal_url:
                "https://file.aiquickdraw.com/s/3d7021c9-fa8b-4eda-91d1-3b9297ddb172_Vocals.mp3",
            },
          },
        },
        split_stem_success: {
          code: 200,
          msg: "vocal Removal generated successfully.",
          data: {
            task_id: "e649edb7abfd759285bd41a47a634b10",
            vocal_removal_info: {
              origin_url: "",
              backing_vocals_url: "https://file.aiquickdraw.com/s/aadc51a3-4c88-4c8e-a4c8-e867c539673d_Backing_Vocals.mp3",
              bass_url: "https://file.aiquickdraw.com/s/a3c2da5a-b364-4422-adb5-2692b9c26d33_Bass.mp3",
              brass_url: "https://file.aiquickdraw.com/s/334b2d23-0c65-4a04-92c7-22f828afdd44_Brass.mp3",
              drums_url: "https://file.aiquickdraw.com/s/ac75c5ea-ac77-4ad2-b7d9-66e140b78e44_Drums.mp3",
              fx_url: "https://file.aiquickdraw.com/s/a8822c73-6629-4089-8f2a-d19f41f0007d_FX.mp3",
              guitar_url: "https://file.aiquickdraw.com/s/064dd08e-d5d2-4201-9058-c5c40fb695b4_Guitar.mp3",
              keyboard_url: "https://file.aiquickdraw.com/s/adc934e0-df7d-45da-8220-1dba160d74e0_Keyboard.mp3",
              percussion_url:
                "https://file.aiquickdraw.com/s/0f70884d-047c-41f1-a6d0-7044618b7dc6_Percussion.mp3",
              strings_url: "https://file.aiquickdraw.com/s/49829425-a5b0-424e-857a-75d4c63a426b_Strings.mp3",
              synth_url: "https://file.aiquickdraw.com/s/56b2d94a-eb92-4d21-bc43-3460de0c8348_Synth.mp3",
              vocal_url: "https://file.aiquickdraw.com/s/07420749-29a2-4054-9b62-e6a6f8b90ccb_Vocals.mp3",
              woodwinds_url: "https://file.aiquickdraw.com/s/d81545b1-6f94-4388-9785-1aaa6ecabb02_Woodwinds.mp3",
            },
          },
        },
        error: {
          code: 400,
          msg: "Vocal separation failed",
          data: {
            task_id: "5e72d367bdfbe44785e28d72cb1697c7",
            vocal_removal_info: null,
          },
        },
      },
      callbackCodes: {
        200: "Success - Vocal separation completed",
        400: "Bad Request - Parameter error or unsupported audio format",
        451: "Download Failed - Unable to download source audio file",
        500: "Server Error - Please try again later",
      },
      pollingAlternative:
        "Use GET /api/music/vocal-separation-details?taskId={taskId} to poll task status instead of using callbacks",
    },
    examples: [
      {
        description: "Basic vocal separation",
        request: {
          taskId: "5c79****be8e",
          audioId: "e231****-****-****-****-****8cadc7dc",
          type: "separate_vocal",
          callBackUrl: "https://api.example.com/vocal-callback",
        },
      },
      {
        description: "Advanced multi-stem separation",
        request: {
          taskId: "11dc****8b0f",
          audioId: "a1b2****-****-****-****-****c3d4e5f6",
          type: "split_stem",
          callBackUrl: "https://api.example.com/stem-callback",
        },
      },
      {
        description: "Vocal separation with default callback",
        request: {
          taskId: "8d9e****fg01",
          audioId: "b2c3****-****-****-****-****d4e5f6g7",
        },
      },
    ],
    response: {
      success: {
        code: 200,
        msg: "success",
        data: {
          taskId: "3e63b4cc88d52611159371f6af5571e7",
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
      413: "Theme or prompt too long",
      429: "Insufficient credits",
      430: "Call frequency too high. Please try again later.",
      455: "System maintenance",
      500: "Server error",
    },
    notes: [
      "State-of-the-art AI source separation technology",
      "separate_vocal is faster and uses fewer credits",
      "split_stem provides detailed per-instrument separation",
      "Best results with high-quality source audio",
      "Separation quality depends on source track complexity",
      "Download URLs may have time limits - save files promptly",
      "split_stem mode produces 12+ separate audio files",
      "Use specific audioId to ensure correct track is processed",
      "Can only separate audio that has been successfully generated",
      "Processing time varies: ~1-2 min for separate_vocal, ~3-5 min for split_stem",
    ],
  })
}
