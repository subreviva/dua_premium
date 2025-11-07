import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { stems, genre, mood } = await request.json()

    if (!stems || !Array.isArray(stems)) {
      return NextResponse.json({ error: "Invalid stems data" }, { status: 400 })
    }

    // Build context about the current mix
    const mixContext = stems
      .map((stem) => {
        return `${stem.name}: Volume ${stem.volume}%, Pan ${stem.pan}, EQ (Low: ${stem.effects.eq.low}dB, Mid: ${stem.effects.eq.mid}dB, High: ${stem.effects.eq.high}dB), Reverb: ${stem.effects.reverb}%, Delay: ${stem.effects.delay.mix}%`
      })
      .join("\n")

    const prompt = `You are a professional mixing engineer. Analyze this mix and provide specific, actionable suggestions to improve it.

Current Mix Settings:
${mixContext}

Genre: ${genre || "Unknown"}
Mood: ${mood || "Unknown"}

Provide 3-5 specific mixing suggestions with exact parameter values. Focus on:
1. EQ adjustments for clarity and separation
2. Volume balance between stems
3. Panning for stereo width
4. Reverb and delay for space and depth
5. Overall mix balance

Format your response as a JSON array of suggestions, each with:
- stem: which stem to adjust
- parameter: what to adjust (volume, pan, eq.low, eq.mid, eq.high, reverb, delay.mix)
- currentValue: current value
- suggestedValue: suggested value
- reason: why this change will improve the mix

Example:
[
  {
    "stem": "vocal",
    "parameter": "eq.high",
    "currentValue": 0,
    "suggestedValue": 3,
    "reason": "Boost high frequencies to add air and presence to vocals"
  }
]`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    // Parse the AI response
    let suggestions
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0])
      } else {
        suggestions = JSON.parse(text)
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      return NextResponse.json(
        {
          error: "Failed to parse AI suggestions",
          rawResponse: text,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      suggestions,
    })
  } catch (error) {
    console.error("AI Mixing Assistant error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
