import { type NextRequest, NextResponse } from "next/server"
import { getSunoClient } from "@/lib/suno-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const client = getSunoClient()

    const params = {
      ...body,
      // Ensure vocal gender is in correct format
      vocalGender: body.vocalGender === "male" ? "m" : body.vocalGender === "female" ? "f" : body.vocalGender,
      // Ensure weights are in 0-1 range
      styleWeight: body.styleWeight !== undefined && body.styleWeight > 1 ? body.styleWeight / 100 : body.styleWeight,
      weirdnessConstraint:
        body.weirdnessConstraint !== undefined && body.weirdnessConstraint > 1
          ? body.weirdnessConstraint / 100
          : body.weirdnessConstraint,
      audioWeight: body.audioWeight !== undefined && body.audioWeight > 1 ? body.audioWeight / 100 : body.audioWeight,
    }

    const result = await client.generateMusic(params)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error generating music:", error)
    return NextResponse.json({ error: "Failed to generate music" }, { status: 500 })
  }
}
