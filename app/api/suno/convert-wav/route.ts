import { type NextRequest, NextResponse } from "next/server"
import { checkCredits, deductCredits } from "@/lib/credits/credits-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, taskId, audioId } = body

    // 🔥 VALIDAÇÃO: userId é obrigatório
    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório para converter WAV" },
        { status: 400 }
      )
    }

    if (!taskId || !audioId) {
      return NextResponse.json({ error: "Missing required fields: taskId, audioId" }, { status: 400 })
    }

    // 🔥 PASSO 1: VERIFICAR CRÉDITOS ANTES DE CONVERTER
    console.log(`🎵 [WAV] Verificando créditos para usuário ${userId}...`)
    const creditCheck = await checkCredits(userId, 'music_convert_wav')

    if (!creditCheck.hasCredits) {
      console.log(`❌ [WAV] Créditos insuficientes: ${creditCheck.message}`)
      return NextResponse.json(
        {
          error: 'Créditos insuficientes',
          required: creditCheck.required,
          current: creditCheck.currentBalance,
          deficit: creditCheck.deficit,
          message: creditCheck.message,
        },
        { status: 402 } // 402 Payment Required
      )
    }

    console.log(`✅ [WAV] Créditos OK (saldo: ${creditCheck.currentBalance}, necessário: ${creditCheck.required})`)

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "SUNO_API_KEY not configured" }, { status: 500 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const callBackUrl = `${baseUrl}/api/suno/wav-callback`

    console.log("[v0] Starting WAV conversion:", { taskId, audioId, callBackUrl })

    // 🔥 PASSO 2: EXECUTAR CONVERSÃO
    const response = await fetch("https://api.kie.ai/api/v1/wav/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        taskId,
        audioId,
        callBackUrl,
      }),
    })

    const result = await response.json()

    if (result.code === 409 && result.data?.taskId) {
      console.log("[v0] WAV conversion already exists, using existing taskId:", result.data.taskId)
      return NextResponse.json({
        taskId: result.data.taskId,
        message: "WAV conversion already in progress",
        existing: true,
      })
    }

    if (!response.ok || result.code !== 200) {
      console.error("[v0] WAV conversion failed:", result)
      return NextResponse.json({ error: result.msg || "WAV conversion failed" }, { status: response.status })
    }

    console.log("[v0] WAV conversion started successfully:", result.data.taskId)

    // 🔥 PASSO 3: DEDUZIR CRÉDITOS APÓS SUCESSO
    console.log(`💰 [WAV] Deduzindo ${creditCheck.required} crédito...`)
    const deduction = await deductCredits(userId, 'music_convert_wav', {
      taskId,
      audioId,
    })

    if (!deduction.success) {
      console.error(`❌ [WAV] Falha ao deduzir créditos: ${deduction.error}`)
    } else {
      console.log(`✅ [WAV] Créditos deduzidos. Novo saldo: ${deduction.newBalance}`)
    }

    return NextResponse.json({
      taskId: result.data.taskId,
      message: "WAV conversion started successfully",
      creditsUsed: creditCheck.required,
      newBalance: deduction.newBalance,
      transactionId: deduction.transactionId,
    })
  } catch (error) {
    console.error("[v0] WAV conversion error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}
