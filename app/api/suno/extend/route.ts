import { type NextRequest, NextResponse } from "next/server"
import { SunoAPI } from "@/lib/suno-api"
import { checkCredits, deductCredits } from "@/lib/credits/credits-service"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.SUNO_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "SUNO_API_KEY not configured" }, { status: 500 })
    }

    const body = await request.json()
    const {
      userId, // 🔥 OBRIGATÓRIO
      audioId,
      defaultParamFlag,
      model,
      prompt,
      style,
      title,
      continueAt,
      negativeTags,
      vocalGender,
      styleWeight,
      weirdnessConstraint,
      audioWeight,
    } = body

    // 🔥 VALIDAÇÃO: userId é obrigatório
    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório para estender música" },
        { status: 400 }
      )
    }

    // Validate required parameters
    if (!audioId) {
      return NextResponse.json({ error: "audioId is required" }, { status: 400 })
    }

    // Validate custom parameters if defaultParamFlag is true
    if (defaultParamFlag && (!prompt || !style || !title || continueAt === undefined)) {
      return NextResponse.json(
        { error: "prompt, style, title, and continueAt are required when using custom parameters" },
        { status: 400 },
      )
    }

    // 🔥 PASSO 1: VERIFICAR CRÉDITOS ANTES DE ESTENDER
    console.log(`🎵 [Suno Extend] Verificando créditos para usuário ${userId}...`)
    const creditCheck = await checkCredits(userId, 'music_extend')

    if (!creditCheck.hasCredits) {
      console.log(`❌ [Suno Extend] Créditos insuficientes: ${creditCheck.message}`)
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

    console.log(`✅ [Suno Extend] Créditos OK (saldo: ${creditCheck.currentBalance}, necessário: ${creditCheck.required})`)

    const client = new SunoAPI(apiKey)

    const callBackUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/suno/callback`
      : `${request.nextUrl.origin}/api/suno/callback`

    // 🔥 PASSO 2: EXECUTAR OPERAÇÃO
    const taskId = await client.extendMusic({
      audioId,
      defaultParamFlag: defaultParamFlag || false,
      model: model || "V3_5",
      callBackUrl,
      prompt,
      style,
      title,
      continueAt,
      negativeTags,
      vocalGender,
      styleWeight,
      weirdnessConstraint,
      audioWeight,
    })

    // 🔥 PASSO 3: DEDUZIR CRÉDITOS APÓS SUCESSO
    console.log(`💰 [Suno Extend] Deduzindo ${creditCheck.required} créditos...`)
    const deduction = await deductCredits(userId, 'music_extend', {
      audioId,
      model: model || "V3_5",
      prompt: (prompt || '').substring(0, 100),
    })

    if (!deduction.success) {
      console.error(`❌ [Suno Extend] Falha ao deduzir créditos: ${deduction.error}`)
    } else {
      console.log(`✅ [Suno Extend] Créditos deduzidos. Novo saldo: ${deduction.newBalance}`)
    }

    return NextResponse.json({ 
      taskId,
      creditsUsed: creditCheck.required,
      newBalance: deduction.newBalance,
      transactionId: deduction.transactionId,
    })
  } catch (error) {
    console.error("[v0] Suno extension error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Extension failed" }, { status: 500 })
  }
}
