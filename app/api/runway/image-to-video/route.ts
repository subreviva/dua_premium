import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      promptImage, 
      promptText, 
      model = 'gen4_turbo',
      ratio = '1280:720',
      duration = 4,
      seed 
    } = body

    if (!promptImage) {
      return NextResponse.json(
        { error: 'promptImage is required' },
        { status: 400 }
      )
    }

    const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY

    if (!RUNWAY_API_KEY) {
      return NextResponse.json(
        { error: 'Runway API key not configured' },
        { status: 500 }
      )
    }

    // Call Runway ML API for image-to-video
    const response = await fetch('https://api.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        model,
        promptImage,
        promptText: promptText || undefined,
        ratio,
        duration,
        seed: seed || Math.floor(Math.random() * 4294967295),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Runway API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to start image-to-video', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      taskId: data.id,
      status: data.status,
    })
  } catch (error) {
    console.error('Error creating image-to-video:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
