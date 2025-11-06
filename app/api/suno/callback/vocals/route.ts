import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, msg, data } = body

    // Console log removed for production build compatibility

    if (code === 200) {
      // Task completed successfully
      const callbackType = data?.callbackType
      const vocalData = data?.data || []

      switch (callbackType) {
        case "text":
          // console.log("[v0] Vocals text generation completed")
          break

        case "first":
          // console.log("[v0] First vocal track completed")
          if (vocalData.length > 0) {
    // Console log removed for production build compatibility
          }
          break

        case "complete":
          // console.log("[v0] All vocal tracks completed")
          // console.log(`[v0] Generated ${vocalData.length} vocal tracks`)

          vocalData.forEach((vocal: any, index: number) => {
    // Console log removed for production build compatibility
          })

          // TODO: Store completed vocals in database or trigger UI update
          break

        case "error":
          // console.error("[v0] Vocal generation error")
          break
      }
    } else {
      // Task failed
      // console.error("[v0] Vocal generation failed:", msg)

      if (code === 400) {
        // console.error("[v0] Parameter error or content violation")
      } else if (code === 451) {
        // console.error("[v0] File download failed")
      } else if (code === 500) {
        // console.error("[v0] Server internal error")
      }
    }

    // Return 200 status code to confirm callback received
    return NextResponse.json({ status: "received" }, { status: 200 })
  } catch (error) {
    // console.error("[v0] Vocals callback processing error:", error)
    return NextResponse.json({ status: "error" }, { status: 500 })
  }
}
