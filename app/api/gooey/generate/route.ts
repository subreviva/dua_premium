import { type NextRequest, NextResponse } from "next/server"

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate API key
    const apiKey = process.env.GOOEY_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GOOEY_API_KEY not configured" },
        { status: 500 }
      )
    }

    // Build payload
    const payload: any = {
      text_prompt: body.prompt,
      make_instrumental: body.instrumental || false,
      style_of_music: body.style || "",
      model_version: body.model || "v5",
      num_outputs: body.outputs || 1,
      duration_sec: body.duration || 120,
    }

    // Add input_audio if extending
    if (body.input_audio) {
      payload.input_audio = body.input_audio
    }

    console.log("[Gooey] Generating music:", payload)

    // Call Gooey.AI API
    const response = await fetch("https://api.gooey.ai/v2/SunoAI/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[Gooey] API Error:", error)
      return NextResponse.json(
        { error: "Failed to generate music", details: error },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log("[Gooey] Generation started:", data.run_id || data.id)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[Gooey] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
