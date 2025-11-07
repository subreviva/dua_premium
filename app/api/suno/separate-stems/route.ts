import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, audioId, type } = body

    if (!taskId || !audioId || !type) {
      return NextResponse.json({ error: "Campos obrigatórios em falta: taskId, audioId, type" }, { status: 400 })
    }

    if (type !== "separate_vocal" && type !== "split_stem") {
      return NextResponse.json(
        { error: "Tipo inválido. Deve ser 'separate_vocal' (2-stem) ou 'split_stem' (12-stem)" },
        { status: 400 },
      )
    }

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "SUNO_API_KEY não configurada" }, { status: 500 })
    }

    const callBackUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/suno/stems-callback`

    console.log(`[v0] A iniciar separação de stems: ${type}`)
    console.log(`[v0] TaskId: ${taskId}, AudioId: ${audioId}`)

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

    return NextResponse.json({ taskId: result.data.taskId, type })
  } catch (error) {
    console.error("[v0] Erro na separação de stems:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
