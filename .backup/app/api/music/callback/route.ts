import { NextResponse } from 'next/server'

export const runtime = 'edge'

/**
 * Callback endpoint for Suno API notifications
 * The Suno API will POST here when tasks complete
 * 
 * Callback format according to official docs:
 * {
 *   code: 200,
 *   msg: "success",
 *   data: {
 *     callbackType: "text" | "first" | "complete" | "error",
 *     task_id: "string",
 *     data: [{...musicTrack}] | null
 *   }
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, msg, data } = body
    const { callbackType, task_id, data: musicData } = data || {}
    
    // console.log('[Suno Callback] Received notification:', {
      code,
      msg,
      taskId: task_id,
      callbackType,
      tracksCount: Array.isArray(musicData) ? musicData.length : 0,
      timestamp: new Date().toISOString()
    })

    if (code === 200 && callbackType === 'complete') {
      // console.log('[Suno Callback] ✅ Music generation completed:', {
        taskId: task_id,
        tracks: musicData?.length || 0
      })
      
      // Log track details
      if (Array.isArray(musicData)) {
        musicData.forEach((track, idx) => {
          // console.log(`[Suno Callback] Track ${idx + 1}:`, {
            id: track.id,
            title: track.title,
            duration: track.duration,
            audioUrl: track.audio_url
          })
        })
      }
    } else if (code !== 200 || callbackType === 'error') {
      // console.error('[Suno Callback] ❌ Generation failed:', {
        taskId: task_id,
        code,
        message: msg
      })
    } else {
      // console.log(`[Suno Callback] 🔄 Progress update (${callbackType}):`, task_id)
    }

    // You can store this in a database or cache if needed
    // For now, we just log it since the UI polls /api/music/status
    
    // Return 200 to confirm callback received
    return NextResponse.json({ status: 'received' })
  } catch (error: any) {
    // console.error('[Suno Callback] Error parsing callback:', error)
    // Still return 200 to avoid Suno retrying
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 200 }
    )
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({
    message: 'Suno API callback endpoint',
    method: 'POST',
    usage: 'This endpoint receives notifications from Suno API'
  })
}
