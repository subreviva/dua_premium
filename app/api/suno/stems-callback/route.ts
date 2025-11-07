import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Callback de separação de stems recebido")
    console.log("[v0] Dados do callback:", JSON.stringify(body, null, 2))

    const { taskId, status, response } = body

    if (!taskId) {
      console.error("[v0] taskId em falta no callback")
      return NextResponse.json({ error: "taskId em falta" }, { status: 400 })
    }

    console.log(`[v0] TaskId: ${taskId}`)
    console.log(`[v0] Estado: ${status}`)

    if (status === "SUCCESS" && response?.stemsData) {
      const stemCount = Object.keys(response.stemsData).length
      console.log(`[v0] Separação concluída com sucesso: ${stemCount} stems`)
      console.log(`[v0] Stems disponíveis:`, Object.keys(response.stemsData).join(", "))
    } else if (status && status.includes("FAILED")) {
      console.error(`[v0] Separação falhada: ${status}`)
    } else {
      console.log(`[v0] Estado intermédio: ${status}`)
    }

    // O frontend usa polling para obter o estado atualizado
    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error("[v0] Erro no callback de stems:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
