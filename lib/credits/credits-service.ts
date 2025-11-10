/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 💳 SERVIÇO DE CRÉDITOS DUA - ULTRA SEGURO E PROFISSIONAL
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * SERVIDOR APENAS - Nunca expor no cliente
 * 
 * WORKFLOW:
 * 1. checkCredits() - Verificar saldo ANTES de executar
 * 2. executeOperation() - Executar a operação
 * 3. deductCredits() - Deduzir créditos APÓS sucesso
 * 4. refundCredits() - Reembolsar se falhar (rollback)
 * 
 * SEGURANÇA:
 * - Usa SERVICE_ROLE_KEY (nunca ANON_KEY)
 * - Transações atômicas via RPC
 * - Audit trail completo
 * - Rate limiting integration ready
 * 
 * @author DUA Team
 * @version 2.0.0
 */

import { createClient } from '@supabase/supabase-js';
import {
  CreditOperation,
  getCreditCost,
  getOperationName,
  isFreeOperation,
} from './credits-config';

// ═══════════════════════════════════════════════════════════════════════════
// 🔒 CLIENTE SUPABASE SEGURO (SERVER-ONLY)
// ═══════════════════════════════════════════════════════════════════════════
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ═══════════════════════════════════════════════════════════════════════════
// 📊 TIPOS
// ═══════════════════════════════════════════════════════════════════════════
export interface CreditCheckResult {
  hasCredits: boolean;
  currentBalance: number;
  required: number;
  deficit: number;
  message: string;
  isFree: boolean;
}

export interface CreditDeductionResult {
  success: boolean;
  newBalance: number;
  transactionId?: string;
  error?: string;
}

export interface CreditTransactionMetadata {
  operation: CreditOperation;
  cost: number;
  category: string;
  prompt?: string;
  imageUrl?: string;
  resultUrl?: string;
  duration?: number;
  model?: string;
  [key: string]: any;
}

// ═══════════════════════════════════════════════════════════════════════════
// ✅ STEP 1: VERIFICAR CRÉDITOS
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Verificar se usuário tem créditos suficientes
 * 
 * @param userId - ID do usuário
 * @param operation - Operação a ser executada
 * @returns Resultado da verificação
 */
export async function checkCredits(
  userId: string,
  operation: CreditOperation
): Promise<CreditCheckResult> {
  try {
    const required = getCreditCost(operation);
    const operationName = getOperationName(operation);
    const isFree = isFreeOperation(operation);

    console.log(`💳 Checking credits for ${operationName} (user: ${userId})`);

    // Operações gratuitas passam direto
    if (isFree) {
      console.log(`✅ ${operationName} is FREE - no credit check needed`);
      return {
        hasCredits: true,
        currentBalance: 0,
        required: 0,
        deficit: 0,
        message: `✅ ${operationName} é GRATUITO`,
        isFree: true,
      };
    }

    // Buscar saldo atual de duaia_user_balances
    const { data: balance, error } = await supabase
      .from('duaia_user_balances')
      .select('servicos_creditos')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Error checking credits:', error);
      
      // Se usuário não existe em duaia_user_balances, criar registro
      if (error.code === 'PGRST116') {
        console.log('📝 Creating duaia_user_balances record for user:', userId);
        
        const { error: insertError } = await supabase
          .from('duaia_user_balances')
          .insert({
            user_id: userId,
            servicos_creditos: 0,
            duacoin_balance: 0,
          });

        if (insertError) {
          console.error('❌ Failed to create balance record:', insertError);
        }

        return {
          hasCredits: false,
          currentBalance: 0,
          required,
          deficit: required,
          message: `❌ Você precisa de ${required} créditos. Saldo atual: 0`,
          isFree: false,
        };
      }

      return {
        hasCredits: false,
        currentBalance: 0,
        required,
        deficit: required,
        message: `Erro ao verificar créditos: ${error.message}`,
        isFree: false,
      };
    }

    const currentBalance = balance?.servicos_creditos ?? 0;
    const hasCredits = currentBalance >= required;
    const deficit = hasCredits ? 0 : required - currentBalance;

    const message = hasCredits
      ? `✅ Créditos suficientes (${currentBalance} disponíveis, ${required} necessários)`
      : `❌ Créditos insuficientes. Você tem ${currentBalance}, precisa de ${required} (faltam ${deficit})`;

    console.log(message);

    return {
      hasCredits,
      currentBalance,
      required,
      deficit,
      message,
      isFree: false,
    };
  } catch (error) {
    console.error('❌ Fatal error checking credits:', error);
    return {
      hasCredits: false,
      currentBalance: 0,
      required: getCreditCost(operation),
      deficit: getCreditCost(operation),
      message: 'Erro fatal ao verificar créditos',
      isFree: false,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 💸 STEP 2: DEDUZIR CRÉDITOS (APÓS SUCESSO)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Deduzir créditos após operação bem-sucedida
 * ATÔMICA - Usa transação SQL
 * 
 * @param userId - ID do usuário
 * @param operation - Operação executada
 * @param metadata - Metadados da transação
 * @returns Resultado da dedução
 */
export async function deductCredits(
  userId: string,
  operation: CreditOperation,
  metadata?: Partial<CreditTransactionMetadata>
): Promise<CreditDeductionResult> {
  try {
    const cost = getCreditCost(operation);
    const operationName = getOperationName(operation);

    // Operações gratuitas não deduzem
    if (isFreeOperation(operation)) {
      console.log(`🎁 ${operationName} is FREE - no deduction`);
      return {
        success: true,
        newBalance: 0,
      };
    }

    console.log(`💳 Deducting ${cost} credits for ${operationName} (user: ${userId})`);

    // ✅ TRANSAÇÃO ATÔMICA COM AUDITORIA INTEGRADA
    const { data, error: deductError } = await supabase.rpc(
      'deduct_servicos_credits',
      {
        p_user_id: userId,
        p_amount: cost,
        p_operation: operation,
        p_description: operationName,
        p_metadata: metadata ? JSON.stringify(metadata) : null,
      }
    );

    if (deductError) {
      console.error('❌ Error deducting credits:', deductError);
      return {
        success: false,
        newBalance: 0,
        error: `Erro ao deduzir créditos: ${deductError.message}`,
      };
    }

    // RPC retorna JSONB com todas as informações
    const result = data as {
      success: boolean;
      balance_before: number;
      balance_after: number;
      amount_deducted: number;
      transaction_id: string;
      operation: string;
    };

    console.log(`✅ Credits deducted successfully!`);
    console.log(`   Before: ${result.balance_before} credits`);
    console.log(`   After: ${result.balance_after} credits`);
    console.log(`   Transaction ID: ${result.transaction_id}`);

    return {
      success: true,
      newBalance: result.balance_after,
      transactionId: result.transaction_id,
    };
  } catch (error) {
    console.error('❌ Fatal error deducting credits:', error);
    return {
      success: false,
      newBalance: 0,
      error: 'Erro fatal ao deduzir créditos',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔄 STEP 3: REEMBOLSAR CRÉDITOS (ROLLBACK)
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Reembolsar créditos se operação falhar
 * 
 * @param userId - ID do usuário
 * @param operation - Operação que falhou
 * @param reason - Motivo do reembolso
 * @returns Resultado do reembolso
 */
export async function refundCredits(
  userId: string,
  operation: CreditOperation,
  reason: string
): Promise<CreditDeductionResult> {
  try {
    const cost = getCreditCost(operation);
    const operationName = getOperationName(operation);

    // Operações gratuitas não reembolsam
    if (isFreeOperation(operation)) {
      return {
        success: true,
        newBalance: 0,
      };
    }

    console.log(`🔄 Refunding ${cost} credits for failed ${operationName} (user: ${userId})`);
    console.log(`   Reason: ${reason}`);

    // ✅ TRANSAÇÃO ATÔMICA COM AUDITORIA INTEGRADA
    const { data, error: refundError } = await supabase.rpc(
      'add_servicos_credits',
      {
        p_user_id: userId,
        p_amount: cost,
        p_transaction_type: 'refund',
        p_description: `Reembolso: ${operationName}`,
        p_admin_email: null,
        p_metadata: JSON.stringify({
          operation,
          cost,
          reason,
          refund: true,
          timestamp: new Date().toISOString(),
        }),
      }
    );

    if (refundError) {
      console.error('❌ Error refunding credits:', refundError);
      return {
        success: false,
        newBalance: 0,
        error: `Erro ao reembolsar créditos: ${refundError.message}`,
      };
    }

    // RPC retorna JSONB com todas as informações
    const result = data as {
      success: boolean;
      balance_before: number;
      balance_after: number;
      amount_added: number;
      transaction_id: string;
    };

    console.log(`✅ Credits refunded successfully!`);
    console.log(`   Before: ${result.balance_before} credits`);
    console.log(`   After: ${result.balance_after} credits`);
    console.log(`   Transaction ID: ${result.transaction_id}`);

    return {
      success: true,
      newBalance: result.balance_after,
      transactionId: result.transaction_id,
    };
  } catch (error) {
    console.error('❌ Fatal error refunding credits:', error);
    return {
      success: false,
      newBalance: 0,
      error: 'Erro fatal ao reembolsar créditos',
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📊 CONSULTAS
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Obter saldo atual do usuário
 */
export async function getBalance(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('duaia_user_balances')
      .select('servicos_creditos')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Error getting balance:', error);
      return 0;
    }

    return data?.servicos_creditos ?? 0;
  } catch (error) {
    console.error('❌ Fatal error getting balance:', error);
    return 0;
  }
}

/**
 * Obter histórico de transações do usuário
 */
export async function getTransactionHistory(
  userId: string,
  limit = 50
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('duaia_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('currency', 'credits')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Error getting transaction history:', error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error('❌ Fatal error getting transaction history:', error);
    return [];
  }
}

/**
 * Obter estatísticas de uso de créditos
 */
export async function getCreditStats(userId: string): Promise<{
  totalSpent: number;
  totalRefunded: number;
  transactionCount: number;
  lastTransaction?: any;
}> {
  try {
    const transactions = await getTransactionHistory(userId, 1000);

    const totalSpent = transactions
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalRefunded = transactions
      .filter((t) => t.type === 'credit' && t.metadata?.refund)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalSpent,
      totalRefunded,
      transactionCount: transactions.length,
      lastTransaction: transactions[0],
    };
  } catch (error) {
    console.error('❌ Error getting credit stats:', error);
    return {
      totalSpent: 0,
      totalRefunded: 0,
      transactionCount: 0,
    };
  }
}
