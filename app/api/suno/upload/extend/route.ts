import { type NextRequest, NextResponse } from "next/server"
import { uploadAndExtend, SunoAPIError } from "@/lib/suno-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await uploadAndExtend(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[API] Upload and extend error:", error)

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
        msg: "Failed to upload and extend audio",
      },
      { status: 500 },
    )
  }
}
