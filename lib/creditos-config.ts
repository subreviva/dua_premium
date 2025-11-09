/**
 * CONFIGURAÇÃO COMPLETA DO SISTEMA DE CRÉDITOS DUA IA
 * 
 * Conversão: 1 DUA COIN (€0,30) = 10 CRÉDITOS
 * Preço base: €0,030/crédito
 */

export const CREDITOS_CONFIG = {
  // Conversão DUA → Créditos
  DUA_TO_CREDITS: 10,
  DUA_PRICE_EUR: 0.30,
  CREDIT_BASE_PRICE: 0.030, // €0,030/crédito
  
  // Custos reais das APIs (EUR)
  API_COSTS: {
    IMAGEM_GEMINI: 0.035,        // Gemini 2.0 Flash Image
    CHAT_GEMINI: 0.00005,        // Gemini 2.5 Flash (100 tokens)
    MUSICA_SUNO_V5: 0.054,       // Suno V5 (12 créditos Suno)
    MUSICA_FULL: 0.162,          // V5 + Instrumental + Vocals
    VIDEO_RUNWAY_4S: 0.20,       // Runway Gen-4 Turbo (4s) ~$0.22
    VIDEO_RUNWAY_5S: 0.25,       // Runway Gen-3a Turbo (5s) ~$0.28
    VIDEO_RUNWAY_10S: 0.90,      // Runway Gen-4 Aleph (10s) ~$1.00
    WAV_CONVERT: 0.0018,         // Suno WAV
    SEPARATE_VOCALS: 0.045,      // Suno Vocals
    STEM_SPLIT: 0.225,           // Suno Stem Split
  },
  
  // Custos em CRÉDITOS por serviço
  SERVICE_COSTS: {
    // ESTÚDIO DE IMAGENS
    IMAGEM_GENERATE: 3,          // €0,090 (custo real: €0,035, markup: 157%)
    IMAGEM_EDIT: 2,              // €0,060 (edições menores)
    IMAGEM_UPSCALE: 1,           // €0,030 (upscale)
    IMAGEM_VARIATION: 2,         // €0,060 (variações)
    
    // ESTÚDIO DE MÚSICA
    MUSICA_GENERATE: 6,          // €0,180 (custo real: €0,054, markup: 233%)
    MUSICA_FULL: 18,             // €0,540 (V5+Inst+Vocals, markup: 233%)
    MUSICA_INSTRUMENTAL: 6,      // €0,180
    MUSICA_VOCALS: 6,            // €0,180
    WAV_CONVERT: 1,              // €0,030 (markup: 1567%)
    SEPARATE_VOCALS: 5,          // €0,150 (markup: 233%)
    STEM_SPLIT: 25,              // €0,750 (markup: 233%)
    MUSICA_EXTEND: 8,            // €0,240 (estender música)
    
    // ESTÚDIO DE VÍDEO (Runway ML)
    VIDEO_4S_TURBO: 30,          // €0,900 (custo real: €0,20, markup: 350%)
    VIDEO_5S_TURBO: 35,          // €1,050 (custo real: €0,25, markup: 320%)
    VIDEO_10S_ALEPH: 100,        // €3,000 (custo real: €0,90, markup: 233%)
    VIDEO_TO_VIDEO: 100,         // €3,000 (transformações de vídeo)
    VIDEO_IMAGE_TO_VIDEO: 30,    // €0,900 (imagem para vídeo)
    VIDEO_EXTEND: 15,            // Estender vídeo
    VIDEO_UPSCALE: 10,           // Upscale qualidade
    VIDEO_INTERPOLATION: 20,     // Interpolação de frames
    
    // CHAT
    CHAT_MESSAGE: 1,             // €0,030 (custo real: €0,00005, markup: 60000%!)
    CHAT_MESSAGE_LONG: 2,        // €0,060 (mensagens longas >500 tokens)
    CHAT_MESSAGE_GPT4: 3,        // €0,090 (se usar GPT-4)
    
    // DESIGN STUDIO
    DESIGN_GENERATE: 4,          // €0,120 (designs personalizados)
    DESIGN_TEMPLATE: 2,          // €0,060 (usar template)
    DESIGN_EXPORT: 1,            // €0,030 (exportar design)
  },
} as const;

export type ServiceType = keyof typeof CREDITOS_CONFIG.SERVICE_COSTS;

/**
 * Retorna o custo em créditos de um serviço
 */
export function getServiceCost(service: ServiceType): number {
  return CREDITOS_CONFIG.SERVICE_COSTS[service];
}

/**
 * Retorna o preço em EUR de um serviço
 */
export function getServicePrice(service: ServiceType): number {
  return CREDITOS_CONFIG.SERVICE_COSTS[service] * CREDITOS_CONFIG.CREDIT_BASE_PRICE;
}

/**
 * Calcula o markup percentual de um serviço
 */
export function getServiceMarkup(service: ServiceType): number {
  const creditCost = CREDITOS_CONFIG.SERVICE_COSTS[service];
  const priceEUR = creditCost * CREDITOS_CONFIG.CREDIT_BASE_PRICE;
  
  // Mapear para custo real da API
  const apiCostMap: Partial<Record<ServiceType, number>> = {
    IMAGEM_GENERATE: CREDITOS_CONFIG.API_COSTS.IMAGEM_GEMINI,
    IMAGEM_EDIT: CREDITOS_CONFIG.API_COSTS.IMAGEM_GEMINI,
    IMAGEM_UPSCALE: CREDITOS_CONFIG.API_COSTS.IMAGEM_GEMINI * 0.5,
    MUSICA_GENERATE: CREDITOS_CONFIG.API_COSTS.MUSICA_SUNO_V5,
    MUSICA_FULL: CREDITOS_CONFIG.API_COSTS.MUSICA_FULL,
    VIDEO_5S_FAST: CREDITOS_CONFIG.API_COSTS.VIDEO_5S_FAST,
    VIDEO_15S_FAST: CREDITOS_CONFIG.API_COSTS.VIDEO_15S_FAST,
    CHAT_MESSAGE: CREDITOS_CONFIG.API_COSTS.CHAT_GEMINI,
  };
  
  const apiCost = apiCostMap[service] || 0.001;
  return ((priceEUR - apiCost) / apiCost) * 100;
}

/**
 * Converte DUA para créditos
 */
export function duaToCredits(dua: number): number {
  return Math.floor(dua * CREDITOS_CONFIG.DUA_TO_CREDITS);
}

/**
 * Converte créditos para DUA
 */
export function creditsToDua(credits: number): number {
  return credits / CREDITOS_CONFIG.DUA_TO_CREDITS;
}

/**
 * Converte EUR para créditos
 */
export function eurToCredits(eur: number): number {
  return Math.floor(eur / CREDITOS_CONFIG.CREDIT_BASE_PRICE);
}

/**
 * Converte créditos para EUR
 */
export function creditsToEur(credits: number): number {
  return credits * CREDITOS_CONFIG.CREDIT_BASE_PRICE;
}
