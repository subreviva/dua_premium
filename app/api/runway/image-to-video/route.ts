import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      promptImage, 
      promptText, 
      model = 'gen4_turbo', // gen4_turbo ou gen3a_turbo
      ratio = '1280:720',
      duration = 5, // 2-10 segundos
      seed,
      contentModeration 
    } = body

    if (!promptImage) {
      return NextResponse.json(
        { error: 'promptImage is required' },
        { status: 400 }
      )
    }

    // Validar ratio aceito
    const validRatios = ['1280:720', '720:1280', '1104:832', '832:1104', '960:960', '1584:672']
    if (!validRatios.includes(ratio)) {
      return NextResponse.json(
        { error: `Invalid ratio. Must be one of: ${validRatios.join(', ')}` },
        { status: 400 }
      )
    }

    // Validar duration (2-10 segundos)
    if (duration < 2 || duration > 10) {
      return NextResponse.json(
        { error: 'Duration must be between 2 and 10 seconds' },
        { status: 400 }
      )
    }

    // Validar modelo
    const validModels = ['gen4_turbo', 'gen3a_turbo']
    if (!validModels.includes(model)) {
      return NextResponse.json(
        { error: `Invalid model. Must be one of: ${validModels.join(', ')}` },
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

    // Montar payload seguindo a documentação oficial
    const payload: any = {
      model,
      promptImage,
      ratio,
      duration,
    }

    // Adicionar campos opcionais
    if (promptText && promptText.trim().length > 0) {
      payload.promptText = promptText.trim()
    }

    if (seed !== undefined && seed !== null) {
      payload.seed = Math.min(Math.max(0, seed), 4294967295) // 0 to 4294967295
    }

    if (contentModeration) {
      payload.contentModeration = contentModeration
    } else {
      // Default content moderation
      payload.contentModeration = {
        publicFigureThreshold: 'auto'
      }
    }

    console.log('🎬 Runway Image-to-Video Request:', {
      model,
      ratio,
      duration,
      hasImage: !!promptImage,
      hasText: !!promptText,
      seed: payload.seed
    })

    // Call Runway ML API for image-to-video
    const response = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify(payload),
    })

    const responseText = await response.text()
    console.log('🎬 Runway API Response Status:', response.status)
    console.log('🎬 Runway API Response:', responseText)

    if (!response.ok) {
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { message: responseText }
      }
      
      console.error('❌ Runway API error:', errorData)
      return NextResponse.json(
        { 
          error: 'Failed to start image-to-video task',
          details: errorData,
          status: response.status
        },
        { status: response.status }
      )
    }

    const data = JSON.parse(responseText)

    console.log('✅ Runway task created:', data.id)

    return NextResponse.json({
      success: true,
      taskId: data.id,
      model,
      ratio,
      duration,
      message: 'Image-to-video task started successfully'
    })
  } catch (error) {
    console.error('❌ Error creating image-to-video:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

