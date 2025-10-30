import { type NextRequest, NextResponse } from "next/server"
import { generateLyrics, SunoAPIError } from "@/lib/suno-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.prompt) {
      return NextResponse.json(
        {
          code: 400,
          msg: "prompt is required",
        },
        { status: 400 },
      )
    }

    if (!body.callBackUrl) {
      return NextResponse.json(
        {
          code: 400,
          msg: "callBackUrl is required",
        },
        { status: 400 },
      )
    }

    const result = await generateLyrics(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[API] Error generating lyrics:", error)

    if (error instanceof SunoAPIError) {
      return NextResponse.json(
        {
          code: error.code,
          msg: error.message,
          details: error.details,
        },
        { status: error.code >= 500 ? 500 : 400 },
      )
    }

    return NextResponse.json(
      {
        code: 500,
        msg: "Failed to generate lyrics",
      },
      { status: 500 },
    )
  }
}
