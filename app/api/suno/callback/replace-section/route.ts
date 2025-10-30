import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, msg, data } = body

    console.log("[v0] Replace section callback received:", {
      code,
      msg,
      taskId: data?.task_id,
      callbackType: data?.callbackType,
    })

    if (code === 200 && data?.callbackType === "complete") {
      // Handle successful replacement
      console.log("[v0] Replacement completed successfully")
      const musicData = data.data || []

      musicData.forEach((music: any, index: number) => {
        console.log(`[v0] Music ${index + 1}:`, {
          id: music.id,
          title: music.title,
          duration: music.duration,
          audioUrl: music.audio_url,
        })
      })

      // TODO: Store results in database or update application state
      // You can add your custom logic here to handle the completed replacement
    } else if (data?.callbackType === "error") {
      // Handle failure
      console.error("[v0] Replacement failed:", msg)

      // TODO: Handle error cases (notify user, retry, etc.)
    }

    // Always respond with success to acknowledge receipt
    return NextResponse.json({ code: 200, msg: "success" })
  } catch (error) {
    console.error("[v0] Error processing replace section callback:", error)
    // Still return 200 to acknowledge receipt even if processing fails
    return NextResponse.json({ code: 200, msg: "received" })
  }
}
