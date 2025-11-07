import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload audio API called")

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.error("[v0] No audio file provided")
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    console.log("[v0] File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Validate file type (audio only)
    if (!file.type.startsWith("audio/")) {
      console.error("[v0] Invalid file type:", file.type)
      return NextResponse.json({ error: "File must be an audio file" }, { status: 400 })
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.error("[v0] File too large:", file.size)
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // Upload to Vercel Blob with a unique name
    const timestamp = Date.now()
    const filename = `melody-${timestamp}-${file.name}`

    console.log("[v0] Uploading to Vercel Blob:", filename)
    const blob = await put(filename, file, {
      access: "public",
    })

    console.log("[v0] Upload successful, URL:", blob.url)
    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("[v0] Audio upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload audio file" },
      { status: 500 },
    )
  }
}
