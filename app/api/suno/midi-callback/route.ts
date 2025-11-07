import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] MIDI generation callback received:", JSON.stringify(body, null, 2))

    // Store MIDI URL in database or state management
    // For now, just log it

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] MIDI callback error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
