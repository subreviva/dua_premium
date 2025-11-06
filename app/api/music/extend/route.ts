import { NextRequest, NextResponse } from "next/server"
import { SunoAPIClient } from "@/lib/suno-api-official"

/**
 * POST /api/music/extend
 * 
 * Extends existing music tracks while maintaining style consistency.
 * 
 * ⚠️ OFFICIAL IMPLEMENTATION per Suno_API_MegaDetalhada.txt Section 5
 * 
 * Required Parameters:
 * - audioId: string - ID of track to extend
 * - defaultParamFlag: boolean - Use custom params (true) or inherit (false)
 * - model: "V3_5" | "V4" | "V4_5" | "V4_5PLUS" | "V5"
 * - callBackUrl: string - HTTPS URL for callbacks
 * 
 * Conditional Parameters (if defaultParamFlag: true):
 * - prompt: string - Description of extension (max 3000 chars)
 * - style: string - Musical style (max 200 chars)
 * - title: string - Song title (max 80 chars)
 * - continueAt: number - Start point in seconds
 * 
 * Optional Parameters:
 * - vocalGender: "m" | "f"
 * - styleWeight: number (0-1)
 * - weirdnessConstraint: number (0-1)
 * - audioWeight: number (0-1)
 * - personaId: string
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const apiKey = process.env.SUNO_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "SUNO_API_KEY not configured" },
        { status: 500 }
      )
    }

    // Validate required parameters
    if (!body.audioId) {
      return NextResponse.json(
        { success: false, error: "audioId is required" },
        { status: 400 }
      )
    }

    if (typeof body.defaultParamFlag !== "boolean") {
      return NextResponse.json(
        { success: false, error: "defaultParamFlag (boolean) is required" },
        { status: 400 }
      )
    }

    if (!body.model) {
      return NextResponse.json(
        { success: false, error: "model is required" },
        { status: 400 }
      )
    }

    // Validate conditional parameters if defaultParamFlag: true
    if (body.defaultParamFlag === true) {
      if (!body.prompt) {
        return NextResponse.json(
          { success: false, error: "prompt is required when defaultParamFlag: true" },
          { status: 400 }
        )
      }
      if (!body.style) {
        return NextResponse.json(
          { success: false, error: "style is required when defaultParamFlag: true" },
          { status: 400 }
        )
      }
      if (!body.title) {
        return NextResponse.json(
          { success: false, error: "title is required when defaultParamFlag: true" },
          { status: 400 }
        )
      }
      if (typeof body.continueAt !== "number") {
        return NextResponse.json(
          { success: false, error: "continueAt (number) is required when defaultParamFlag: true" },
          { status: 400 }
        )
      }
    }

    const client = new SunoAPIClient({ apiKey })

    // ⚠️ OFFICIAL PARAMETERS per MegaDetalhada.txt Section 5
    const params: any = {
      audioId: body.audioId,
      defaultParamFlag: body.defaultParamFlag,
      model: body.model,
      callBackUrl: body.callBackUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/music/callback`,

      // Conditional parameters (only if defaultParamFlag: true)
      ...(body.defaultParamFlag && {
        prompt: body.prompt,
        style: body.style,
        title: body.title,
        continueAt: body.continueAt,
      }),

      // Optional parameters
      ...(body.vocalGender && { vocalGender: body.vocalGender }),
      ...(body.styleWeight !== undefined && { styleWeight: body.styleWeight }),
      ...(body.weirdnessConstraint !== undefined && { weirdnessConstraint: body.weirdnessConstraint }),
      ...(body.audioWeight !== undefined && { audioWeight: body.audioWeight }),
      ...(body.personaId && { personaId: body.personaId }),
    }

    // console.log("[Extend] Sending request (camelCase):", JSON.stringify(params, null, 2))

    const result = await client.extendMusic(params)

    // console.log("[Extend] Response:", result)

    return NextResponse.json({
      success: true,
      data: {
        task_id: result.data.taskId,
        message: "Extension started successfully"
      }
    })

  } catch (error: any) {
    // console.error("[Extend] Error:", error)

    // Handle SunoAPIError with specific status codes
    if (error.name === "SunoAPIError") {
      const statusCode = error.statusCode || 500
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code
        },
        { status: statusCode }
      )
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to extend music"
      },
      { status: 500 }
    )
  }
}
