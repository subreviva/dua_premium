import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, msg, data } = body

    console.log("[v0] Received Suno callback:", {
      code,
      msg,
      callbackType: data?.callbackType,
      taskId: data?.task_id,
      dataCount: data?.data?.length || 0,
    })

    if (code === 200) {
      const callbackType = data?.callbackType
      const resultData = data?.data || []

      switch (callbackType) {
        case "text":
          console.log("[v0] Text generation completed")
          break

        case "first":
          console.log("[v0] First track completed")
          if (resultData.length > 0) {
            console.log("[v0] First track:", {
              title: resultData[0].title,
              duration: resultData[0].duration,
              audioUrl: resultData[0].audio_url,
            })
          }
          break

        case "complete":
          console.log("[v0] All tracks completed successfully")
          console.log(`[v0] Generated ${resultData.length} tracks`)

          resultData.forEach((item: any, index: number) => {
            console.log(`[v0] Track ${index + 1}:`, {
              id: item.id,
              title: item.title,
              duration: item.duration,
              tags: item.tags,
              audioUrl: item.audio_url,
              streamAudioUrl: item.stream_audio_url,
              imageUrl: item.image_url,
              prompt: item.prompt,
              modelName: item.model_name,
              createTime: item.createTime,
            })
          })

          // TODO: Store completed tracks in database or trigger UI update
          break

        case "error":
          console.error("[v0] Generation error")
          break
      }
    } else {
      // Task failed
      console.error("[v0] Generation failed:", msg)

      // Handle specific error codes
      if (code === 400) {
        console.error("[v0] Bad Request - Parameter error or content violation")
      } else if (code === 451) {
        console.error("[v0] Download Failed - Unable to download related files")
      } else if (code === 500) {
        console.error("[v0] Server Error - Please try again later")
      }
    }

    // Return 200 status code to confirm callback received
    return NextResponse.json({ status: "received" }, { status: 200 })
  } catch (error) {
    console.error("[v0] Callback processing error:", error)
    return NextResponse.json({ status: "error" }, { status: 500 })
  }
}
