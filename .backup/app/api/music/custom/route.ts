import { NextResponse } from "next/server"
import { SunoAPIClient } from "@/lib/suno-api-official"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 300

/**
 * POST /api/music/custom - Generate Music
 * @see Suno_API_MegaDetalhada.txt Section 3
 * 
 * Uses OFFICIAL camelCase parameters per Suno_API_MegaDetalhada.txt
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // console.log("[API] Music generation request:", {
      customMode: body.customMode,
      instrumental: body.instrumental,
      model: body.model
    })

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "SUNO_API_KEY not configured" },
        { status: 500 }
      )
    }

    const client = new SunoAPIClient({ apiKey })

    const result = await client.generateMusic({
      prompt: body.prompt,
      customMode: body.customMode !== false,
      instrumental: body.instrumental === true,
      model: body.model || "V4_5",
      style: body.style,
      title: body.title,
      negativeTags: body.negativeTags,
      vocalGender: body.vocalGender,
      styleWeight: body.styleWeight,
      weirdnessConstraint: body.weirdnessConstraint,
      audioWeight: body.audioWeight,
      personaId: body.personaId,
      callBackUrl: body.callBackUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/music/callback`
    })

    // console.log("[API] Task started:", result.data.taskId)

    return NextResponse.json({
      success: true,
      data: result.data
    })

  } catch (error: any) {
    // console.error("[API] Error:", error)

    if (error.name === "SunoAPIError") {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.code >= 500 ? 500 : 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate music" },
      { status: 500 }
    )
  }
}
