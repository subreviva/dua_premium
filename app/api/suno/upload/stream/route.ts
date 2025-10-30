import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "SUNO_API_KEY not configured" }, { status: 500 })
    }

    const uploadFormData = new FormData()
    uploadFormData.append("file", file)

    const response = await fetch("https://api.sunoapi.org/api/v1/file/upload-stream", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: uploadFormData,
    })

    const data = await response.json()
    console.log("[v0] File stream upload response:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] File stream upload error:", error)
    return NextResponse.json({ error: "Failed to upload file stream" }, { status: 500 })
  }
}
