import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      characterType, 
      characterUri, 
      performanceUri, 
      bodyControl = true,
      facialExpressiveness = 3,
      seed 
    } = body

    if (!characterUri || !performanceUri) {
      return NextResponse.json(
        { error: 'Character URI and performance URI are required' },
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

    // Call Runway ML API for character performance (Act-Two)
    const response = await fetch('https://api.runwayml.com/v1/character_performance', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        model: 'act_two',
        character: {
          type: characterType, // 'image' or 'video'
          uri: characterUri,
        },
        reference: {
          type: 'video',
          uri: performanceUri,
        },
        seed: seed || Math.floor(Math.random() * 4294967295),
        bodyControl: bodyControl,
        expressionIntensity: facialExpressiveness,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Runway API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to start character performance', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      taskId: data.id,
      status: data.status,
    })
  } catch (error) {
    console.error('Error creating character performance:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
