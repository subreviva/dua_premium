/**
 * Helper para gerenciar créditos de serviço
 * Use este arquivo para integrar o consumo de créditos em todos os serviços de IA
 */

interface ConsumoCreditos {
  success: boolean;
  creditos_restantes?: number;
  error?: string;
  details?: any;
}

interface CustoServico {
  music_generation: number;
  image_generation: number;
  chat_message: number;
  video_generation: number;
  voice_generation: number;
}

// Custos de cada serviço em créditos
export const CUSTOS_SERVICOS: CustoServico = {
  music_generation: 50,      // Gerar 1 música = 50 créditos
  image_generation: 30,      // Gerar 1 imagem = 30 créditos
  chat_message: 1,           // 1 mensagem de chat = 1 crédito
  video_generation: 100,     // Gerar 1 vídeo = 100 créditos
  voice_generation: 20,      // Gerar voz = 20 créditos
};

/**
 * Consome créditos antes de executar um serviço
 * @param userId - ID do usuário
 * @param serviceType - Tipo de serviço (music_generation, image_generation, etc)
 * @param metadata - Metadados opcionais (prompt, model, etc)
 * @returns Resultado do consumo
 */
export async function consumirCreditos(
  userId: string,
  serviceType: keyof CustoServico,
  metadata: Record<string, any> = {}
): Promise<ConsumoCreditos> {
  try {
    const creditos = CUSTOS_SERVICOS[serviceType];

    if (!creditos) {
      return {
        success: false,
        error: `Tipo de serviço desconhecido: ${serviceType}`,
      };
    }

    const response = await fetch('/api/consumir-creditos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        creditos,
        service_type: serviceType,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Erro ao consumir créditos',
        details: result.details,
      };
    }

    return {
      success: true,
      creditos_restantes: result.data?.creditos_restantes,
    };

  } catch (error: any) {
    console.error('Erro ao consumir créditos:', error);
    return {
      success: false,
      error: 'Erro ao processar consumo de créditos',
    };
  }
}

/**
 * Verifica se o usuário tem créditos suficientes
 * @param userId - ID do usuário
 * @param serviceType - Tipo de serviço
 * @returns Se tem créditos suficientes e quantos créditos tem
 */
export async function verificarCreditos(
  userId: string,
  serviceType: keyof CustoServico
): Promise<{ suficiente: boolean; creditos_atuais: number; creditos_necessarios: number }> {
  try {
    const response = await fetch(`/api/users/${userId}/balance`);
    const result = await response.json();

    const creditosAtuais = result.data?.creditos_servicos || 0;
    const creditosNecessarios = CUSTOS_SERVICOS[serviceType];

    return {
      suficiente: creditosAtuais >= creditosNecessarios,
      creditos_atuais: creditosAtuais,
      creditos_necessarios: creditosNecessarios,
    };

  } catch (error) {
    return {
      suficiente: false,
      creditos_atuais: 0,
      creditos_necessarios: CUSTOS_SERVICOS[serviceType],
    };
  }
}

/**
 * Calcula o custo total de múltiplas operações
 * @param operacoes - Array de operações a serem executadas
 * @returns Custo total em créditos
 */
export function calcularCustoTotal(
  operacoes: Array<keyof CustoServico>
): number {
  return operacoes.reduce((total, op) => total + CUSTOS_SERVICOS[op], 0);
}

/**
 * Formata mensagem de erro de créditos insuficientes
 * @param creditosAtuais - Créditos atuais do usuário
 * @param creditosNecessarios - Créditos necessários
 * @returns Mensagem formatada
 */
export function formatarErroCreditos(
  creditosAtuais: number,
  creditosNecessarios: number
): string {
  const faltam = creditosNecessarios - creditosAtuais;
  
  return `Créditos insuficientes! Você tem ${creditosAtuais} créditos, mas precisa de ${creditosNecessarios}. Faltam ${faltam} créditos. Compre mais créditos em /loja-creditos`;
}
