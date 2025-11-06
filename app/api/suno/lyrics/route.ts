import { type NextRequest, NextResponse } from "next/server"
import { generateLyrics, SunoAPIError } from "@/lib/suno-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await generateLyrics(body)

    return NextResponse.json({
      code: 200,
      msg: "success",
      data: result,
    })
  } catch (error) {
    // console.error("[API] Lyrics generation error:", error)

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
        msg: "Internal server error",
      },
      { status: 500 },
    )
  }
}
