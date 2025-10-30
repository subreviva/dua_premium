import { type NextRequest, NextResponse } from "next/server"
import { getSunoClient, SunoAPIError } from "@/lib/suno-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const client = getSunoClient()

    // Validate required parameters according to Suno API documentation
    const requiredParams = ["uploadUrl", "prompt", "title", "style", "negativeTags"]
    const missingParams = requiredParams.filter((param) => !body[param])

    if (missingParams.length > 0) {
      return NextResponse.json(
        {
          code: 400,
          msg: `Missing required parameters: ${missingParams.join(", ")}`,
          data: null,
        },
        { status: 400 },
      )
    }

    // Call Suno API
    const result = await client.addVocals(body)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error adding vocals:", error)

    if (error instanceof SunoAPIError) {
      return NextResponse.json(
        {
          code: error.code,
          msg: error.message,
          data: null,
        },
        { status: error.code },
      )
    }

    return NextResponse.json(
      {
        code: 500,
        msg: "Failed to add vocals",
        data: null,
      },
      { status: 500 },
    )
  }
}
