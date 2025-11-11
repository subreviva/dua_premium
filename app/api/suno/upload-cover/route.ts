import { type NextRequest, NextResponse } from "next/server"
import { SunoAPI } from "@/lib/suno-api"
import { checkCredits, deductCredits } from "@/lib/credits/credits-service"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload cover API called")

    const body = await request.json()
    console.log("[v0] Request body:", JSON.stringify(body, null, 2))

    const {
      userId, // 🔥 NOVO: userId obrigatório
      uploadUrl,
      prompt,
      style,
      title,
      customMode = true,
      instrumental = false,
      model = "V4_5PLUS",
      negativeTags,
      vocalGender,
      styleWeight,
      weirdnessConstraint,
      audioWeight,
    } = body

    // 🔥 VALIDAÇÃO: userId é obrigatório
    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório para gerar música" },
        { status: 400 }
      )
    }

    // 🔥 PASSO 1: VERIFICAR CRÉDITOS ANTES DE GERAR
    console.log(`🎵 [Suno Upload] Verificando créditos para usuário ${userId}...`)
    const creditCheck = await checkCredits(userId, 'music_add_instrumental')

    if (!creditCheck.hasCredits) {
      console.log(`❌ [Suno Upload] Créditos insuficientes: ${creditCheck.message}`)
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

    console.log(`✅ [Suno Upload] Créditos OK (saldo: ${creditCheck.currentBalance}, necessário: ${creditCheck.required})`)

    if (!uploadUrl) {
      console.error("[v0] Missing uploadUrl")
      return NextResponse.json({ error: "Missing required field: uploadUrl" }, { status: 400 })
    }

    if (customMode) {
      if (instrumental) {
        // instrumental true: style, title, uploadUrl required
        if (!style || !title) {
          console.error("[v0] Missing style or title for instrumental mode")
          return NextResponse.json(
            { error: "Missing required fields: style and title are required for instrumental mode" },
            { status: 400 },
          )
        }
      } else {
        // instrumental false: style, prompt, title, uploadUrl required
        if (!style || !prompt || !title) {
          console.error("[v0] Missing style, prompt, or title for vocal mode")
          return NextResponse.json(
            { error: "Missing required fields: style, prompt, and title are required for vocal mode" },
            { status: 400 },
          )
        }
      }
    } else {
      // Non-custom mode: only prompt and uploadUrl required
      if (!prompt) {
        console.error("[v0] Missing prompt for non-custom mode")
        return NextResponse.json(
          { error: "Missing required field: prompt is required for non-custom mode" },
          { status: 400 },
        )
      }
    }

    if (styleWeight !== undefined && (styleWeight < 0 || styleWeight > 1)) {
      return NextResponse.json({ error: "styleWeight must be between 0 and 1" }, { status: 400 })
    }
    if (weirdnessConstraint !== undefined && (weirdnessConstraint < 0 || weirdnessConstraint > 1)) {
      return NextResponse.json({ error: "weirdnessConstraint must be between 0 and 1" }, { status: 400 })
    }
    if (audioWeight !== undefined && (audioWeight < 0 || audioWeight > 1)) {
      return NextResponse.json({ error: "audioWeight must be between 0 and 1" }, { status: 400 })
    }

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      console.error("[v0] SUNO_API_KEY not configured")
      return NextResponse.json(
        { error: "SUNO_API_KEY not configured. Please add it to your environment variables." },
        { status: 500 },
      )
    }

    const callBackUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/suno/callback`
    console.log("[v0] Callback URL:", callBackUrl)

    const sunoAPI = new SunoAPI(apiKey)

    console.log("[v0] Calling Suno API uploadCover with advanced parameters...")
    const taskId = await sunoAPI.uploadCover({
      uploadUrl,
      customMode,
      instrumental,
      prompt: prompt || undefined,
      style: style || undefined,
      title: title || undefined,
      callBackUrl,
      model,
      negativeTags: negativeTags || undefined,
      vocalGender: vocalGender || undefined,
      styleWeight: styleWeight !== undefined ? Math.round(styleWeight * 100) / 100 : undefined,
      weirdnessConstraint: weirdnessConstraint !== undefined ? Math.round(weirdnessConstraint * 100) / 100 : undefined,
      audioWeight: audioWeight !== undefined ? Math.round(audioWeight * 100) / 100 : undefined,
    })

    // 🔥 PASSO 2: DEDUZIR CRÉDITOS APÓS SUCESSO
    console.log(`💰 [Suno Upload] Deduzindo ${creditCheck.required} créditos...`)
    const deduction = await deductCredits(userId, 'music_add_instrumental', {
      operation: 'music_add_instrumental',
      cost: creditCheck.required,
      category: 'music',
      model: model,
      prompt: (prompt || title || 'Melodia').substring(0, 100),
    })

    if (!deduction.success) {
      console.error(`❌ [Suno Upload] Falha ao deduzir créditos: ${deduction.error}`)
      // Música já foi gerada, apenas loggar o erro
    } else {
      console.log(`✅ [Suno Upload] Créditos deduzidos. Novo saldo: ${deduction.newBalance}`)
    }

    console.log("[v0] Upload cover successful, taskId:", taskId)
    return NextResponse.json({ taskId })
  } catch (error) {
    console.error("[v0] Upload cover error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate music from audio" },
      { status: 500 },
    )
  }
}
