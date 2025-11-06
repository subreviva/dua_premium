import { type NextRequest, NextResponse } from "next/server"
import { getSunoClient } from "@/lib/suno-api"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const client = getSunoClient()

    const result = await client.uploadBase64(body.file, body.fileName)

    return NextResponse.json(result)
  } catch (error) {
    // console.error("[v0] Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
