import { type NextRequest, NextResponse } from "next/server"
import { getSunoClient } from "@/lib/suno-api"

export async function GET(request: NextRequest) {
  try {
    const client = getSunoClient()
    const result = await client.getRemainingCredits()

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error fetching credits:", error)
    return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 })
  }
}
