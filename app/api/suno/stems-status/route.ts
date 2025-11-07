import { type NextRequest, NextResponse } from "next/server"
import type { StemSeparationStatus } from "@/lib/types/stems"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const taskId = searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json({ error: "Parâmetro taskId em falta" }, { status: 400 })
    }

    const apiKey = process.env.SUNO_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "SUNO_API_KEY não configurada" }, { status: 500 })
    }

    console.log(`[v0] A verificar estado dos stems para taskId: ${taskId}`)

    const response = await fetch(`https://api.kie.ai/api/v1/vocal-removal/record-info?taskId=${taskId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      console.error("[v0] Erro da API:", result)
      return NextResponse.json({ error: result.msg || "Falha ao obter estado dos stems" }, { status: response.status })
    }

    if (result.code !== 200) {
      console.error("[v0] Código de erro da API:", result.code, result.msg)
      return NextResponse.json({ error: result.msg || "Falha ao obter estado dos stems" }, { status: 400 })
    }

    const statusData: StemSeparationStatus = {
      taskId: result.data.taskId,
      successFlag: result.data.successFlag,
      response: result.data.response,
      errorCode: result.data.errorCode,
      errorMessage: result.data.errorMessage,
    }

    console.log(`[v0] Estado dos stems: ${statusData.successFlag}`)

    if (statusData.successFlag === "SUCCESS" && statusData.response) {
      const stemUrls = Object.entries(statusData.response).filter(
        ([key, value]) => key.endsWith("Url") && value && value !== "",
      )
      console.log(`[v0] ${stemUrls.length} stems disponíveis`)
      console.log(`[v0] Stems:`, stemUrls.map(([key]) => key).join(", "))
    }

    return NextResponse.json(statusData)
  } catch (error) {
    console.error("[v0] Erro ao verificar estado dos stems:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
