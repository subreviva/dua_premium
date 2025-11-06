import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Console log removed for production build compatibility

    const { code, msg, data } = body

    if (code === 200) {
      // Task completed successfully
      // console.log("[v0] Lyrics generation completed")
      const lyricsData = data?.data || []

      // console.log(`[v0] Generated ${lyricsData.length} lyrics variants`)
      lyricsData.forEach((lyrics: any, index: number) => {
        // console.log(`[v0] Lyrics variant ${index + 1}:`)
        // console.log(`[v0]   Title: ${lyrics.title}`)
        // console.log(`[v0]   Status: ${lyrics.status}`)
        if (lyrics.status === "complete") {
          // console.log(`[v0]   Lyrics content preview: ${lyrics.text.substring(0, 100)}...`)
        } else {
          // console.log(`[v0]   Error message: ${lyrics.errorMessage}`)
        }
      })

      // TODO: Store lyrics in database or process as needed
      // Example: await saveLyricsToDatabase(data.taskId, lyricsData)
    } else {
      // Task failed
      // console.log("[v0] Lyrics generation failed:", msg)

      // Handle failure cases
      if (code === 400) {
        // console.log("[v0] Parameter error or content violation")
      } else if (code === 451) {
        // console.log("[v0] File download failed")
      } else if (code === 500) {
        // console.log("[v0] Server internal error")
      }

      // TODO: Update task status in database
      // Example: await updateTaskStatus(data.taskId, 'failed', msg)
    }

    // Return 200 status code to confirm callback received
    return NextResponse.json({ status: "received" }, { status: 200 })
  } catch (error) {
    // console.error("[v0] Error processing lyrics callback:", error)

    // Still return 200 to prevent retries for malformed requests
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 },
    )
  }
}
