import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 })
    }

    // AI Mastering API endpoint
    const apiKey = process.env.AIMASTERING_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "AI Mastering API key not configured" }, { status: 500 })
    }

    // Create form data for AI Mastering API
    const masteringFormData = new FormData()
    masteringFormData.append("input_file", audioFile)
    masteringFormData.append("mode", "default") // Can be: default, pop, rock, hiphop, edm, etc.
    masteringFormData.append("mastering", "true")
    masteringFormData.append("reference", "auto") // Auto-detect reference
    masteringFormData.append("ceiling", "-0.3") // Ceiling level in dB
    masteringFormData.append("output_format", "wav")

    // Call AI Mastering API
    const response = await fetch("https://api.aimastering.com/v1/masters", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: masteringFormData,
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("AI Mastering API error:", error)
      return NextResponse.json({ error: "AI Mastering failed" }, { status: response.status })
    }

    const result = await response.json()

    // Return the mastered audio URL
    return NextResponse.json({
      success: true,
      masteredUrl: result.output_url,
      taskId: result.id,
      status: result.status,
    })
  } catch (error) {
    console.error("AI Mastering error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
