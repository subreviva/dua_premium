import { type NextRequest, NextResponse } from "next/server"
import { checkCredits, deductCredits } from "@/lib/credits/credits-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, taskId, audioId, type } = body

    // 🔥 VALIDAÇÃO: userId é obrigatório
    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório para separar stems" },
        { status: 400 }
      )
    }

    if (!taskId || !audioId || !type) {
      return NextResponse.json({ error: "Campos obrigatórios em falta: taskId, audioId, type" }, { status: 400 })
    }

    if (type !== "separate_vocal" && type !== "split_stem") {
      return NextResponse.json(
        { error: "Tipo inválido. Deve ser 'separate_vocal' (2-stem) ou 'split_stem' (12-stem)" },
        { status: 400 },
      )
    }

    // 🔥 PASSO 1: VERIFICAR CRÉDITOS ANTES DE SEPARAR
    // Mapear tipo para operação de créditos
    const operation = type === "separate_vocal" ? "music_separate_vocals" : "music_split_stem_full"
    
    console.log(`🎵 [Stems] Verificando créditos para usuário ${userId} (${type})...`)
    const creditCheck = await checkCredits(userId, operation)

    if (!creditCheck.hasCredits) {
      console.log(`❌ [Stems] Créditos insuficientes: ${creditCheck.message}`)
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

    console.log(`✅ [Stems] Créditos OK (saldo: ${creditCheck.currentBalance}, necessário: ${creditCheck.required})`)

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "SUNO_API_KEY não configurada" }, { status: 500 })
    }

    const callBackUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/suno/stems-callback`

    console.log(`[v0] A iniciar separação de stems: ${type}`)
    console.log(`[v0] TaskId: ${taskId}, AudioId: ${audioId}`)

    // 🔥 PASSO 2: EXECUTAR SEPARAÇÃO
    const response = await fetch("https://api.kie.ai/api/v1/vocal-removal/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        taskId,
        audioId,
        type,
        callBackUrl,
      }),
    })

    const result = await response.json()

    if (!response.ok || result.code !== 200) {
      console.error("[v0] Falha na separação de stems:", result)
      return NextResponse.json({ error: result.msg || "Falha na separação de stems" }, { status: response.status })
    }

    console.log(`[v0] Separação iniciada com sucesso: ${result.data.taskId}`)

    // 🔥 PASSO 3: DEDUZIR CRÉDITOS APÓS SUCESSO
    console.log(`💰 [Stems] Deduzindo ${creditCheck.required} créditos (${operation})...`)
    const deduction = await deductCredits(userId, operation, {
      taskId,
      audioId,
      type,
      stemsType: type === "separate_vocal" ? "2-stem" : "12-stem",
    })

    if (!deduction.success) {
      console.error(`❌ [Stems] Falha ao deduzir créditos: ${deduction.error}`)
    } else {
      console.log(`✅ [Stems] Créditos deduzidos. Novo saldo: ${deduction.newBalance}`)
    }

    return NextResponse.json({ 
      taskId: result.data.taskId, 
      type,
      creditsUsed: creditCheck.required,
      newBalance: deduction.newBalance,
      transactionId: deduction.transactionId,
    })
  } catch (error) {
    console.error("[v0] Erro na separação de stems:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
