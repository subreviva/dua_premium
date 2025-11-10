/**
 * Helper para gerenciar créditos de serviço
 * Use este arquivo para integrar o consumo de créditos em todos os serviços de IA
 */

/**
 * Adapter legacy -> Centralized credits service
 *
 * Este arquivo mantém a API antiga (`consumirCreditos`, `verificarCreditos`,
 * etc.) para não quebrar os muitos pontos do código que ainda importam
 * `@/lib/creditos-helper`. Internamente, quando executado no servidor,
 * ele delega para o `lib/credits/credits-service.ts` (que usa SERVICE_ROLE_KEY
 * e RPCs atômicos). No cliente, mantém a chamada ao endpoint `/api/consumir-creditos`
 * para compatibilidade.
 */

import { createClient } from '@supabase/supabase-js';
import {
  getCreditCost,
  isFreeOperation,
  getOperationName,
} from '@/lib/credits/credits-config';

// Import server-only service but keep dynamic to avoid bundling in client
let serverCreditsService: any = null;
if (typeof window === 'undefined') {
  serverCreditsService = require('./credits/credits-service');
}

type ConsumoCreditos = {
  success: boolean;
  creditos_restantes?: number;
  transactionId?: string;
  error?: string;
  details?: any;
};

/**
 * Consumir créditos (compatível com chamadas antigas)
 * - Se importado no servidor: usa RPC `deduct_servicos_credits` via credits-service
 * - Se no cliente: faz POST para /api/consumir-creditos (mantém compatibilidade)
 *
 * Suporta duas formas de chamada:
 * 1) serviceType é uma operação conhecida em credits-config (ex: 'image_standard')
 *    então o custo é obtido automaticamente.
 * 2) metadata.creditos contém um número -> usa esse valor como custo (legacy)
 */
export async function consumirCreditos(
  userId: string,
  serviceType: string,
  metadata: Record<string, any> = {}
): Promise<ConsumoCreditos> {
  // SERVER-SIDE: usar credits-service diretamente (mais seguro e atômico)
  if (typeof window === 'undefined' && serverCreditsService) {
    try {
      // Se metadata.creditos foi passado (legacy), use esse valor diretamente
      if (typeof metadata.creditos === 'number') {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Chamar RPC direto com valor customizado
        const { data, error } = await supabase.rpc('deduct_servicos_credits', {
          p_user_id: userId,
          p_amount: metadata.creditos,
          p_operation: serviceType,
          p_description: getOperationName(serviceType as any) || serviceType,
          p_metadata: JSON.stringify({ ...metadata, legacy: true }),
        });

        if (error) {
          return { success: false, error: error.message, details: error };
        }

        return {
          success: true,
          creditos_restantes: data?.balance_after ?? 0,
          transactionId: data?.transaction_id,
        };
      }

      // Se serviceType existe nas operações conhecidas, usar deductCredits
      const knownOps = Object.keys(require('./credits/credits-config').ALL_CREDITS || {});
      if (knownOps.includes(serviceType)) {
        // Primeiro checar se há saldo suficiente
        const check = await serverCreditsService.checkCredits(userId, serviceType);
        if (!check.hasCredits) {
          return {
            success: false,
            error: 'Créditos insuficientes',
            details: { required: check.required, current: check.currentBalance },
          };
        }

        // Deduzir créditos (RPC atômico)
        const deduct = await serverCreditsService.deductCredits(userId, serviceType, metadata);
        if (!deduct.success) {
          return { success: false, error: deduct.error || 'Erro ao deduzir créditos' };
        }

        return {
          success: true,
          creditos_restantes: deduct.newBalance,
          transactionId: deduct.transactionId,
        };
      }

      // Caso não seja operação conhecida e não tenha metadata.creditos,
      // tentaremos usar credits-service as operação by-name (it may accept it)
      const fallback = await serverCreditsService.deductCredits(userId, serviceType, metadata);
      if (!fallback.success) {
        return { success: false, error: fallback.error || 'Créditos insuficientes' };
      }

      return {
        success: true,
        creditos_restantes: fallback.newBalance,
        transactionId: fallback.transactionId,
      };
    } catch (err: any) {
      console.error('Erro consumirCreditos (server):', err);
      return { success: false, error: err?.message || String(err) };
    }
  }

  // CLIENT-SIDE: manter POST para /api/consumir-creditos
  try {
    const creditos = metadata.creditos;
    const res = await fetch('/api/consumir-creditos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        creditos: creditos,
        service_type: serviceType,
        metadata: { ...metadata, timestamp: new Date().toISOString() },
      }),
    });

    const json = await res.json();
    if (!json.success) {
      return { success: false, error: json.error || 'Erro ao consumir créditos', details: json.details };
    }

    return {
      success: true,
      creditos_restantes: json.data?.creditos_restantes,
      transactionId: json.data?.transaction_id,
    };
  } catch (err: any) {
    console.error('Erro consumirCreditos (client):', err);
    return { success: false, error: err?.message || 'Erro ao consumir créditos' };
  }
}

/**
 * Verificar créditos (compatível com uso antigo)
 */
export async function verificarCreditos(
  userId: string,
  requiredCredits: number | string
): Promise<{ suficiente: boolean; creditos_atuais: number; creditos_necessarios: number }> {
  // Server: use duaia_user_balances
  if (typeof window === 'undefined') {
    try {
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
      const { data, error } = await supabase.from('duaia_user_balances').select('servicos_creditos').eq('user_id', userId).single();
      const atual = data?.servicos_creditos ?? 0;
      const necessario = typeof requiredCredits === 'number' ? requiredCredits : (getCreditCost(requiredCredits as any) || 0);
      return { suficiente: atual >= necessario, creditos_atuais: atual, creditos_necessarios: necessario };
    } catch (err) {
      return { suficiente: false, creditos_atuais: 0, creditos_necessarios: typeof requiredCredits === 'number' ? requiredCredits : (getCreditCost(requiredCredits as any) || 0) };
    }
  }

  // Client: call balance endpoint
  try {
    const res = await fetch(`/api/users/${userId}/balance`);
    const json = await res.json();
    const atual = json.data?.creditos_servicos ?? 0;
    const necessario = typeof requiredCredits === 'number' ? requiredCredits : (getCreditCost(requiredCredits as any) || 0);
    return { suficiente: atual >= necessario, creditos_atuais: atual, creditos_necessarios: necessario };
  } catch (err) {
    return { suficiente: false, creditos_atuais: 0, creditos_necessarios: typeof requiredCredits === 'number' ? requiredCredits : (getCreditCost(requiredCredits as any) || 0) };
  }
}

export { getCreditCost };
