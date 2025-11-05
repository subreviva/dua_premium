import { type NextRequest, NextResponse } from "next/server"
import { getLyricsDetails, SunoAPIError } from "@/lib/suno-api"

export async function GET(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const { taskId } = await params

    if (!taskId) {
      return NextResponse.json(
        {
          code: 400,
          msg: "taskId is required",
        },
        { status: 400 },
      )
    }

    const result = await getLyricsDetails(taskId)

    return NextResponse.json(result)
  } catch (error) {
    // console.error("[API] Get lyrics details error:", error)

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
        msg: "Failed to get lyrics details",
      },
      { status: 500 },
    )
  }
}
