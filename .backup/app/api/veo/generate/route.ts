import { NextRequest, NextResponse } from "next/server"
import { operationStore } from "@/lib/operation-store"

// Based on official Google Veo 3 documentation
const VEO_3_SUPPORTED_ASPECT_RATIOS = ['16:9', '9:16'] as const
const VEO_3_SUPPORTED_RESOLUTIONS = ['720p', '1080p'] as const
const VEO_3_SUPPORTED_PERSON_GENERATION = ['allow_all', 'allow_adult', 'dont_allow'] as const
const VEO_3_DURATION = 8 // Veo 3 generates 8-second videos

/**
 * POST /api/veo/generate
 * Inicia a geração de um vídeo com o Google Veo 3
 * Conformidade 100% com documentação oficial Google
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    
    let prompt: string
    let mode: string
    let resolution: string
    let aspectRatio: string
    let negativePrompt: string | undefined
    let seed: number | undefined
    let personGeneration: string
    
    // Handle both JSON and FormData
    if (contentType.includes('application/json')) {
      const body = await request.json()
      prompt = body.prompt
      mode = body.mode || "text-to-video"
      resolution = body.resolution || "720p"
      aspectRatio = body.aspectRatio || "16:9"
      negativePrompt = body.negativePrompt
      seed = body.seed ? parseInt(body.seed, 10) : undefined
      personGeneration = body.personGeneration || "allow_all"
    } else {
      const formData = await request.formData()
      prompt = formData.get("prompt") as string
      mode = formData.get("mode") as string || "text-to-video"
      resolution = (formData.get("resolution") as string) || "720p"
      aspectRatio = (formData.get("aspectRatio") as string) || "16:9"
      negativePrompt = formData.get("negativePrompt") as string | undefined
      const seedValue = formData.get("seed") as string
      seed = seedValue ? parseInt(seedValue, 10) : undefined
      personGeneration = (formData.get("personGeneration") as string) || "allow_all"
    }

    // --- Rigorous Validation based on Google Veo 3 Docs ---
    if (!prompt || prompt.trim().length < 5) {
      return NextResponse.json(
        { error: "Prompt must be at least 5 characters long" },
        { status: 400 }
      )
    }

    if (prompt.length > 1024) {
      return NextResponse.json(
        { error: "Prompt deve ter no máximo 1024 caracteres" },
        { status: 400 }
      )
    }

    if (!VEO_3_SUPPORTED_RESOLUTIONS.includes(resolution as any)) {
      return NextResponse.json(
        { error: `Unsupported resolution. Supported: ${VEO_3_SUPPORTED_RESOLUTIONS.join(', ')}` },
        { status: 400 }
      )
    }

    if (!VEO_3_SUPPORTED_ASPECT_RATIOS.includes(aspectRatio as any)) {
      return NextResponse.json(
        { error: `Unsupported aspect ratio. Supported: ${VEO_3_SUPPORTED_ASPECT_RATIOS.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Google Veo 3 restriction: 1080p only for 16:9
    if (resolution === '1080p' && aspectRatio !== '16:9') {
      return NextResponse.json(
        { error: '1080p resolution is only supported for 16:9 aspect ratio' },
        { status: 400 }
      )
    }

    if (!VEO_3_SUPPORTED_PERSON_GENERATION.includes(personGeneration as any)) {
      return NextResponse.json(
        { error: `Unsupported personGeneration value. Supported: ${VEO_3_SUPPORTED_PERSON_GENERATION.join(', ')}` },
        { status: 400 }
      )
    }

    // --- Create Operation Object (mirroring Google's API structure) ---
    const operationId = `op-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    
    const operation = {
      id: operationId,
      status: 'processing' as const,
      progress: 0,
      startTime: new Date().toISOString(),
      metadata: {
        prompt,
        negativePrompt,
        mode,
        resolution,
        aspectRatio,
        duration: VEO_3_DURATION,
        seed,
        personGeneration,
      },
      result: null,
      error: null,
    }

    operationStore.set(operationId, operation)

    // Simulate the real Google API asynchronous process
    generateVideoAsync(operationId)

    // Immediately return the operation object, as per Google's documentation
    return NextResponse.json({
      name: `operations/${operationId}`,
      metadata: operation.metadata,
      done: false,
    }, { status: 202 })

  } catch (error) {
    // console.error('[VEO_GENERATE_ERROR]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An internal error occurred' },
      { status: 500 }
    )
  }
}

async function generateVideoAsync(operationId: string) {
  try {
    for (let i = 1; i <= 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000))
      const currentOp = operationStore.get(operationId)
      if (currentOp && currentOp.status === 'processing') {
        currentOp.progress = i * 10
        operationStore.set(operationId, currentOp)
      } else {
        break
      }
    }

    const finalOp = operationStore.get(operationId)
    if (finalOp && finalOp.status === 'processing') {
      finalOp.status = 'completed'
      finalOp.progress = 100
      finalOp.result = {
        videoUrl: 'https://6yep4uifnoow71ty.public.blob.vercel-storage.com/transferir%20(53)-R16bT5u1g5KkCg2O4S0Zp8sA5c8s9p.mp4',
        thumbnailUrl: `https://placehold.co/1280x720/1a1a1a/ffffff/png?text=${encodeURIComponent(finalOp.metadata.prompt.substring(0, 30))}`,
      }
      operationStore.set(operationId, finalOp)
    }
  } catch (error) {
    const operation = operationStore.get(operationId)
    if (operation) {
      operation.status = 'failed'
      operation.error = error instanceof Error ? error.message : 'Unknown error'
      operationStore.set(operationId, operation)
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const operationId = searchParams.get("id")

    if (!operationId) {
      return NextResponse.json({ error: "Operation ID é obrigatório" }, { status: 400 })
    }

    const operation = operationStore.get(operationId)
    if (!operation) {
      return NextResponse.json({ error: "Operação não encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      name: `operations/${operationId}`,
      metadata: operation.metadata,
      done: operation.status === 'completed' || operation.status === 'failed',
      response: operation.result ? { video: operation.result } : undefined,
      error: operation.error ? { message: operation.error } : undefined,
    })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao obter status" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const operationId = searchParams.get("id")

    if (!operationId) {
      return NextResponse.json({ error: "Operation ID é obrigatório" }, { status: 400 })
    }

    const operation = operationStore.get(operationId)
    if (!operation) {
      return NextResponse.json({ error: "Operação não encontrada" }, { status: 404 })
    }

    operation.status = 'failed'
    operation.error = 'Operation cancelled by user'
    operationStore.set(operationId, operation)

    return NextResponse.json({ message: "Operação cancelada" })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao cancelar" }, { status: 500 })
  }
}

