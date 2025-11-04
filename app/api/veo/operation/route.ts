import { NextRequest, NextResponse } from "next/server"
import { operationStore } from "@/lib/operation-store"

/**
 * GET /api/veo/operation?id=<operationId>
 * Obtém o status de uma operação existente - Google Veo 3 compliant
 */
export async function GET(request: NextRequest) {
  try {
    const operationId = request.nextUrl.searchParams.get("id")

    if (!operationId) {
      return NextResponse.json(
        { error: "Operation ID é obrigatório" },
        { status: 400 }
      )
    }

    const operation = operationStore.get(operationId)

    if (!operation) {
      return NextResponse.json(
        { error: "Operação não encontrada" },
        { status: 404 }
      )
    }

    // Return Google-compliant format
    return NextResponse.json({
      name: `operations/${operationId}`,
      metadata: operation.metadata,
      done: operation.status === 'completed' || operation.status === 'failed',
      response: operation.result ? {
        video: operation.result,
      } : undefined,
      error: operation.error ? {
        message: operation.error,
      } : undefined,
      // Include progress for UI
      progress: operation.progress,
    })
  } catch (error) {
    console.error("[VEO_OPERATION_ERROR]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao obter status da operação" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/veo/operation?id=<operationId>
 * Cancela uma operação
 */
export async function DELETE(request: NextRequest) {
  try {
    const operationId = request.nextUrl.searchParams.get("id")

    if (!operationId) {
      return NextResponse.json(
        { error: "Operation ID é obrigatório" },
        { status: 400 }
      )
    }

    const operation = operationStore.get(operationId)
    if (!operation) {
      return NextResponse.json(
        { error: "Operação não encontrada" },
        { status: 404 }
      )
    }

    // Cancel the operation
    operation.status = 'failed'
    operation.error = 'Operation cancelled by user'
    operationStore.set(operationId, operation)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[VEO_OPERATION_DELETE]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao cancelar operação" },
      { status: 500 }
    )
  }
}
