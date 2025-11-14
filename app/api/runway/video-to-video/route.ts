import { NextRequest, NextResponse } from 'next/server'
import { checkCredits, deductCredits } from '@/lib/credits/credits-service'
import type { CreditOperation } from '@/lib/credits/credits-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      videoUri, 
      promptText, 
      model = 'gen4_aleph', // Apenas gen4_aleph suportado
      ratio = '1280:720',
      seed,
      references, // Array de referências (imagem)
      contentModeration,
      userId // ID do usuário para verificar créditos
    } = body

    if (!videoUri || !promptText) {
      return NextResponse.json(
        { error: 'videoUri and promptText are required' },
        { status: 400 }
      )
    }

    // ✅ VERIFICAR CRÉDITOS ANTES (50 créditos para video-to-video)
    const operation: CreditOperation = 'video_to_video'
    
    if (userId) {
      const creditCheck = await checkCredits(userId, operation)
      
      if (!creditCheck.hasCredits) {
        return NextResponse.json(
          { 
            error: 'Créditos insuficientes',
            required: creditCheck.required,
            current: creditCheck.current
          },
          { status: 402 }
        )
      }
    }

    // Validar promptText (1-1000 caracteres)
    if (promptText.length < 1 || promptText.length > 1000) {
      return NextResponse.json(
        { error: 'promptText must be between 1 and 1000 characters' },
        { status: 400 }
      )
    }

    // Validar ratio aceito
    const validRatios = [
      '1280:720',  // 16:9
      '720:1280',  // 9:16
      '1104:832',  // 4:3
      '960:960',   // 1:1
      '832:1104',  // 3:4
      '1584:672',  // 21:9
      '848:480',   // 16:9 (menor)
      '640:480'    // 4:3 (menor)
    ]
    
    if (!validRatios.includes(ratio)) {
      return NextResponse.json(
        { error: `Invalid ratio. Must be one of: ${validRatios.join(', ')}` },
        { status: 400 }
      )
    }

    // Validar model (apenas gen4_aleph)
    if (model !== 'gen4_aleph') {
      return NextResponse.json(
        { error: 'Invalid model. Must be gen4_aleph' },
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
      model: 'gen4_aleph', // Fixo
      videoUri,
      promptText: promptText.trim(),
      ratio,
    }

    // Adicionar campos opcionais
    if (seed !== undefined && seed !== null) {
      payload.seed = Math.min(Math.max(0, seed), 4294967295) // 0 to 4294967295
    }

    // Adicionar referências (até 1 imagem)
    if (references && Array.isArray(references) && references.length > 0) {
      payload.references = references.slice(0, 1) // Máximo 1 referência
    }

    if (contentModeration) {
      payload.contentModeration = contentModeration
    } else {
      // Default content moderation
      payload.contentModeration = {
        publicFigureThreshold: 'auto'
      }
    }

    console.log('🎬 Runway Video-to-Video Request:', {
      model,
      ratio,
      hasVideo: !!videoUri,
      hasText: !!promptText,
      hasReferences: !!(references && references.length > 0),
      seed: payload.seed
    })

    // Call Runway ML API for video-to-video
    const response = await fetch('https://api.dev.runwayml.com/v1/video_to_video', {
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
          error: 'Failed to start video-to-video task',
          details: errorData,
          status: response.status
        },
        { status: response.status }
      )
    }

    const data = JSON.parse(responseText)

    console.log('✅ Runway task created:', data.id)

    // ✅ DEDUZIR CRÉDITOS APÓS SUCESSO
    if (userId) {
      await deductCredits(userId, operation, {
        taskId: data.id,
        model,
        ratio,
        service: 'runway_video_to_video'
      })
    }

    return NextResponse.json({
      success: true,
      taskId: data.id,
      model,
      ratio,
      creditsUsed: userId ? 50 : undefined,
      message: 'Video-to-video task started successfully'
    })
  } catch (error) {
    console.error('❌ Error creating video-to-video:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

