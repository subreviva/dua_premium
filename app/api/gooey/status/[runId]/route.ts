import { type NextRequest, NextResponse } from "next/server"

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const { runId } = params

    if (!runId) {
      return NextResponse.json(
        { error: "Missing run_id" },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOEY_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOEY_API_KEY not configured" },
        { status: 500 }
      )
    }

    console.log("[Gooey] Checking status:", runId)

    const response = await fetch(`https://api.gooey.ai/v2/SunoAI/${runId}/`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[Gooey] Status check error:", error)
      return NextResponse.json(
        { error: "Failed to check status", details: error },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("[Gooey] Status:", data.status)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Gooey] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
