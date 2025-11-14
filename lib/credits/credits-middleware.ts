/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🛡️ MIDDLEWARE DE CRÉDITOS - WRAPPER PARA APIs
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Simplifica integração do sistema de créditos nas rotas API
 * 
 * USAGE:
 * ```typescript
 * import { withCredits } from '@/lib/credits/credits-middleware';
 * 
 * export async function POST(req: NextRequest) {
 *   return withCredits(req, 'design_generate_image', async (userId) => {
 *     // Sua lógica aqui - créditos já foram validados e deduzidos
 *     const result = await generateImage(prompt);
 *     return NextResponse.json({ success: true, result });
 *   });
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server';
import { CreditOperation } from './credits-config';
import {
  checkCredits,
  deductCredits,
  refundCredits,
  CreditTransactionMetadata,
} from './credits-service';

// ═══════════════════════════════════════════════════════════════════════════
// 📊 TIPOS
// ═══════════════════════════════════════════════════════════════════════════
export interface CreditsContext {
  userId: string;
  operation: CreditOperation;
  creditCheck: Awaited<ReturnType<typeof checkCredits>>;
}

export type CreditsHandler = (
  userId: string,
  context: CreditsContext
) => Promise<NextResponse>;

// ═══════════════════════════════════════════════════════════════════════════
// 🛡️ WRAPPER PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Wrapper que gerencia todo o fluxo de créditos automaticamente
 * 
 * @param req - Next Request (ou null se userId for passado diretamente)
 * @param operation - Operação a ser executada
 * @param handler - Handler que executa a lógica (recebe userId)
 * @param metadata - Metadados opcionais para transação
 * @param directUserId - userId já extraído (opcional, evita re-parse do body)
 * @returns NextResponse
 */
export async function withCredits(
  req: NextRequest | null,
  operation: CreditOperation,
  handler: CreditsHandler,
  metadata?: Partial<CreditTransactionMetadata>,
  directUserId?: string
): Promise<NextResponse> {
  let creditDeducted = false;
  let userId: string | null = null;

  try {
    // ─────────────────────────────────────────────────────────────────────
    // STEP 1: Extrair userId do body OU usar directUserId
    // ─────────────────────────────────────────────────────────────────────
    if (directUserId) {
      userId = directUserId;
    } else if (req) {
      const body = await req.json();
      userId = body.userId || body.user_id;
    }

    if (!userId) {
      return NextResponse.json(
        {
          error: 'unauthorized',
          message: 'user_id é obrigatório',
        },
        { status: 401 }
      );
    }

    // ─────────────────────────────────────────────────────────────────────
    // STEP 2: Verificar créditos
    // ─────────────────────────────────────────────────────────────────────
    const creditCheck = await checkCredits(userId, operation);

    if (!creditCheck.hasCredits && !creditCheck.isFree) {
      return NextResponse.json(
        {
          error: 'insufficient_credits',
          message: creditCheck.message,
          required: creditCheck.required,
          current: creditCheck.currentBalance,
          deficit: creditCheck.deficit,
          redirect: '/comprar',
        },
        { status: 402 } // Payment Required
      );
    }

    // ─────────────────────────────────────────────────────────────────────
    // STEP 3: Executar handler
    // ─────────────────────────────────────────────────────────────────────
    const context: CreditsContext = {
      userId,
      operation,
      creditCheck,
    };

    const response = await handler(userId, context);

    // ─────────────────────────────────────────────────────────────────────
    // STEP 4: Deduzir créditos SOMENTE se handler teve sucesso
    // ─────────────────────────────────────────────────────────────────────
    if (response.ok && !creditCheck.isFree) {
      const deduction = await deductCredits(userId, operation, metadata);
      
      if (deduction.success) {
        creditDeducted = true;
        console.log(`✅ Credits deducted successfully for ${operation}`);
        
        // Adicionar saldo no header da resposta
        response.headers.set('X-Credits-Balance', deduction.newBalance.toString());
        response.headers.set('X-Credits-Deducted', creditCheck.required.toString());
      } else {
        console.error(`⚠️ Failed to deduct credits: ${deduction.error}`);
      }
    }

    return response;
  } catch (error: any) {
    console.error(`❌ Error in withCredits middleware:`, error);

    // ─────────────────────────────────────────────────────────────────────
    // ROLLBACK: Reembolsar créditos se foram deduzidos mas operação falhou
    // ─────────────────────────────────────────────────────────────────────
    if (creditDeducted && userId) {
      console.log(`🔄 Attempting refund due to error...`);
      await refundCredits(
        userId,
        operation,
        `Operation failed: ${error.message}`
      );
    }

    return NextResponse.json(
      {
        error: 'internal_error',
        message: error.message || 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 HELPER: Validação Manual de Créditos
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Validar créditos sem executar handler (para validações prévias)
 */
export async function validateCredits(
  userId: string,
  operation: CreditOperation
): Promise<{
  valid: boolean;
  response?: NextResponse;
  creditCheck?: Awaited<ReturnType<typeof checkCredits>>;
}> {
  const creditCheck = await checkCredits(userId, operation);

  if (!creditCheck.hasCredits && !creditCheck.isFree) {
    return {
      valid: false,
      response: NextResponse.json(
        {
          error: 'insufficient_credits',
          message: creditCheck.message,
          required: creditCheck.required,
          current: creditCheck.currentBalance,
          deficit: creditCheck.deficit,
          redirect: '/comprar',
        },
        { status: 402 }
      ),
      creditCheck,
    };
  }

  return {
    valid: true,
    creditCheck,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 HELPER: Dedução Manual
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Deduzir créditos manualmente (para fluxos customizados)
 */
export async function manualDeductCredits(
  userId: string,
  operation: CreditOperation,
  metadata?: Partial<CreditTransactionMetadata>
): Promise<{
  success: boolean;
  newBalance: number;
  error?: string;
}> {
  return deductCredits(userId, operation, metadata);
}

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 HELPER: Reembolso Manual
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Reembolsar créditos manualmente
 */
export async function manualRefundCredits(
  userId: string,
  operation: CreditOperation,
  reason: string
): Promise<{
  success: boolean;
  newBalance: number;
  error?: string;
}> {
  return refundCredits(userId, operation, reason);
}
