import { NextResponse } from 'next/server'

export const runtime = 'edge'

/**
 * Callback endpoint for Suno API notifications
 * The Suno API will POST here when tasks complete
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('[Suno Callback] Received notification:', {
      taskId: body.taskId,
      status: body.status,
      timestamp: new Date().toISOString()
    })

    // You can store this in a database or cache if needed
    // For now, we just log it since the UI polls /api/music/status
    
    return NextResponse.json({ 
      success: true,
      message: 'Callback received'
    })
  } catch (error: any) {
    console.error('[Suno Callback] Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
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
