import { NextRequest, NextResponse } from "next/server"

export const runtime = 'nodejs'

interface CallbackData {
  code: number
  msg: string
  data: {
    task_id: string
    callbackType?: string
    data?: Array<{
      id: string
      title: string
      created_at: string
      audio_url: string
      video_url: string
      image_url: string
      lyric: string
      model_name: string
      status: string
    }>
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: CallbackData = await request.json()

    // Log callback reception for debugging
    console.log("Received callback for task:", data.data.task_id)

    if (data.code === 200) {
      console.log("Music generation completed successfully")
      const musicData = data.data.data || []

      console.log(`Processing ${musicData.length} music tracks`)
      musicData.forEach((music, index) => {
        console.log(`Track ${index + 1}:`, {
          id: music.id,
          title: music.title,
          status: music.status
        })
      })

      // Here you can process the completed music data
      // e.g., save to database, notify user, etc.

      return NextResponse.json({ 
        success: true, 
        message: "Callback processed successfully",
        tracksCount: musicData.length 
      })
    } else {
      console.log("Callback received with error:", data.msg)
      return NextResponse.json({ 
        success: false, 
        message: data.msg 
      })
    }
  } catch (error) {
    console.error("Error processing callback:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
