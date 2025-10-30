import { type NextRequest, NextResponse } from "next/server"
import { getSunoClient } from "@/lib/suno-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required parameters
    const { taskId, musicIndex, name, description } = body

    if (!taskId || musicIndex === undefined || !name || !description) {
      return NextResponse.json(
        {
          code: 422,
          msg: "Missing required parameters: taskId, musicIndex, name, and description are required",
        },
        { status: 422 },
      )
    }

    if (typeof musicIndex !== "number" || musicIndex < 0) {
      return NextResponse.json(
        {
          code: 422,
          msg: "musicIndex must be a non-negative number (typically 0 or 1)",
        },
        { status: 422 },
      )
    }

    const client = getSunoClient()
    const result = await client.generatePersona(body)

    if (result.code === 409) {
      return NextResponse.json(
        {
          code: 409,
          msg: "A persona already exists for this music",
        },
        { status: 409 },
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error generating persona:", error)
    return NextResponse.json(
      {
        code: 500,
        msg: error instanceof Error ? error.message : "Failed to generate persona",
      },
      { status: 500 },
    )
  }
}
