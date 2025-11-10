/**
 * Helper para obter custos de serviços da tabela service_costs
 * Usa cache para melhorar performance
 */

import { supabaseClient } from '@/lib/supabase';

// Cache simples em memória (validade: 5 minutos)
interface CacheEntry {
  cost: number;
  timestamp: number;
}

const costCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Obtém o custo em créditos de um serviço
 * @param serviceName - Nome do serviço (ex: 'imagen_generate')
 * @param defaultCost - Custo padrão caso não encontre (default: 10)
 * @returns Custo em créditos
 */
export async function getServiceCost(
  serviceName: string,
  defaultCost: number = 10
): Promise<number> {
  try {
    // Verificar cache
    const cached = costCache.get(serviceName);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.cost;
    }

    // Buscar do banco via RPC (mais rápido e seguro)
    const { data, error } = await supabaseClient.rpc('get_service_cost', {
      p_service_name: serviceName
    });

    if (error) {
      console.error(`Erro ao buscar custo de ${serviceName}:`, error);
      return defaultCost;
    }

    const cost = data || defaultCost;

    // Atualizar cache
    costCache.set(serviceName, {
      cost,
      timestamp: Date.now()
    });

    return cost;
  } catch (error) {
    console.error(`Erro ao obter custo de ${serviceName}:`, error);
    return defaultCost;
  }
}

/**
 * Obtém custos de múltiplos serviços de uma vez
 * @param serviceNames - Array de nomes de serviços
 * @returns Map com serviceName -> custo
 */
export async function getMultipleServiceCosts(
  serviceNames: string[]
): Promise<Map<string, number>> {
  const costs = new Map<string, number>();

  try {
    const { data, error } = await supabaseClient
      .from('service_costs')
      .select('service_name, credits_cost')
      .in('service_name', serviceNames)
      .eq('is_active', true);

    if (error) throw error;

    if (data) {
      data.forEach(item => {
        costs.set(item.service_name, item.credits_cost);
        // Atualizar cache
        costCache.set(item.service_name, {
          cost: item.credits_cost,
          timestamp: Date.now()
        });
      });
    }

    // Para serviços não encontrados, usar padrão
    serviceNames.forEach(name => {
      if (!costs.has(name)) {
        costs.set(name, 10);
      }
    });

  } catch (error) {
    console.error('Erro ao buscar múltiplos custos:', error);
    // Fallback: todos com custo padrão
    serviceNames.forEach(name => costs.set(name, 10));
  }

  return costs;
}

/**
 * Limpa o cache de custos (útil após atualizações via admin)
 */
export function clearServiceCostCache(serviceName?: string) {
  if (serviceName) {
    costCache.delete(serviceName);
  } else {
    costCache.clear();
  }
}

/**
 * Pré-carrega custos de serviços mais usados
 */
export async function preloadCommonServiceCosts() {
  const commonServices = [
    'imagen_generate',
    'design_studio',
    'design_studio_v2',
    'music_generation',
    'video_generation',
    'chat_completion',
  ];

  await getMultipleServiceCosts(commonServices);
}

// Constantes de fallback (caso tabela não exista ainda)
export const DEFAULT_SERVICE_COSTS = {
  imagen_generate: 10,
  design_studio: 15,
  design_studio_v2: 20,
  music_generation: 25,
  video_generation: 50,
  text_to_speech: 5,
  speech_to_text: 5,
  chat_completion: 1,
  code_generation: 8,
  translation: 3,
} as const;
