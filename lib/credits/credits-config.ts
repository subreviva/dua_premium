/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 💳 SISTEMA DE CRÉDITOS DUA - CONFIGURAÇÃO CENTRALIZADA
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Ultra profissional, seguro e integrado com duaia_user_balances
 * 
 * REGRAS:
 * 1. Todas operações DEVEM validar créditos ANTES da execução
 * 2. Todas operações DEVEM deduzir créditos APÓS sucesso
 * 3. Operações falhadas NÃO deduzem créditos
 * 4. Todas transações são registradas em duaia_transactions
 * 5. Sistema usa servicos_creditos (não creditos_servicos - legacy)
 * 
 * @author DUA Team
 * @version 2.0.0
 * @date 2025-11-10
 */

// ═══════════════════════════════════════════════════════════════════════════
// 🎵 MÚSICA - Geração e processamento de áudio
// ═══════════════════════════════════════════════════════════════════════════
export const MUSIC_CREDITS = {
  music_generate_v5: 6,           // Gerar música com Suno V5
  music_add_instrumental: 6,       // Adicionar instrumental
  music_add_vocals: 6,             // Adicionar vocais
  music_separate_vocals: 5,        // Separar vocais (stem separation)
  music_convert_wav: 1,            // Converter para WAV (barato)
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 IMAGEM - Geração e edição via Gemini
// ═══════════════════════════════════════════════════════════════════════════
export const IMAGE_CREDITS = {
  image_fast: 2,                   // Gemini Flash - rápido e barato
  image_standard: 4,               // Gemini Standard - qualidade média
  image_ultra: 6,                  // Gemini Ultra - máxima qualidade
  image_gemini: 4,                 // Gemini genérico (compatibilidade)
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 🎬 VÍDEO - Geração e processamento
// ═══════════════════════════════════════════════════════════════════════════
export const VIDEO_CREDITS = {
  video_gen4_5s: 20,               // Gen-4 Turbo 5 segundos
  video_gen4_10s: 40,              // Gen-4 Turbo 10 segundos
  video_upscale_5s: 10,            // Upscale 5 segundos
  video_gen4_aleph_5s: 60,         // Gen-4 Aleph 5s (premium)
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 💬 CHAT - Conversação com IA
// ═══════════════════════════════════════════════════════════════════════════
export const CHAT_CREDITS = {
  chat_basic: 0,                   // GRÁTIS - 50 mensagens/dia
  chat_advanced: 1,                // GPT-4 / Claude / Gemini Pro
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 🎙️ LIVE AUDIO - Áudio em tempo real
// ═══════════════════════════════════════════════════════════════════════════
export const LIVE_AUDIO_CREDITS = {
  live_audio_1min: 3,              // 1 minuto de áudio ao vivo
  live_audio_5min: 13,             // 5 minutos de áudio ao vivo
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 DESIGN STUDIO - Ferramentas criativas
// ═══════════════════════════════════════════════════════════════════════════
export const DESIGN_STUDIO_CREDITS = {
  // Geração
  design_generate_image: 4,        // Gerar imagem genérica
  design_generate_logo: 6,         // Gerar logo (alta qualidade)
  design_generate_icon: 4,         // Gerar ícone
  design_generate_pattern: 4,      // Gerar padrão
  design_generate_svg: 6,          // Gerar SVG (vetorial)
  
  // Edição
  design_edit_image: 5,            // Editar imagem com IA
  design_remove_background: 5,     // Remover fundo
  design_upscale_image: 6,         // Upscale HD/4K
  design_generate_variations: 8,   // 3 variações (3x custo)
  
  // Análise
  design_analyze_image: 2,         // Analisar imagem
  design_extract_colors: 2,        // Extrair paleta de cores
  design_trends: 3,                // Pesquisar tendências
  
  // Assistente
  design_assistant: 1,             // Chat assistente design
  
  // Export (GRÁTIS)
  design_export_png: 0,            // Exportar PNG
  design_export_svg: 0,            // Exportar SVG
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 🔄 UNIÃO DE TODOS OS CRÉDITOS
// ═══════════════════════════════════════════════════════════════════════════
export const ALL_CREDITS = {
  ...MUSIC_CREDITS,
  ...IMAGE_CREDITS,
  ...VIDEO_CREDITS,
  ...CHAT_CREDITS,
  ...LIVE_AUDIO_CREDITS,
  ...DESIGN_STUDIO_CREDITS,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 📊 TIPOS TYPESCRIPT
// ═══════════════════════════════════════════════════════════════════════════
export type MusicOperation = keyof typeof MUSIC_CREDITS;
export type ImageOperation = keyof typeof IMAGE_CREDITS;
export type VideoOperation = keyof typeof VIDEO_CREDITS;
export type ChatOperation = keyof typeof CHAT_CREDITS;
export type LiveAudioOperation = keyof typeof LIVE_AUDIO_CREDITS;
export type DesignStudioOperation = keyof typeof DESIGN_STUDIO_CREDITS;
export type CreditOperation = keyof typeof ALL_CREDITS;

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obter custo de créditos para qualquer operação
 */
export function getCreditCost(operation: CreditOperation): number {
  return ALL_CREDITS[operation];
}

/**
 * Verificar se usuário pode pagar pela operação
 */
export function canAffordOperation(
  userCredits: number,
  operation: CreditOperation
): boolean {
  return userCredits >= ALL_CREDITS[operation];
}

/**
 * Calcular custo total de múltiplas operações
 */
export function calculateBatchCost(operations: CreditOperation[]): number {
  return operations.reduce((total, op) => total + ALL_CREDITS[op], 0);
}

/**
 * Nomes display-friendly para operações
 */
export const OPERATION_NAMES: Record<CreditOperation, string> = {
  // Música
  music_generate_v5: 'Gerar Música (Suno V5)',
  music_add_instrumental: 'Adicionar Instrumental',
  music_add_vocals: 'Adicionar Vocais',
  music_separate_vocals: 'Separar Vocais',
  music_convert_wav: 'Converter para WAV',
  
  // Imagem
  image_fast: 'Imagem Rápida (Gemini Flash)',
  image_standard: 'Imagem Standard (Gemini)',
  image_ultra: 'Imagem Ultra (Gemini Pro)',
  image_gemini: 'Imagem Gemini',
  
  // Vídeo
  video_gen4_5s: 'Vídeo Gen-4 (5s)',
  video_gen4_10s: 'Vídeo Gen-4 (10s)',
  video_upscale_5s: 'Upscale Vídeo (5s)',
  video_gen4_aleph_5s: 'Vídeo Gen-4 Aleph (5s)',
  
  // Chat
  chat_basic: 'Chat Básico (Grátis)',
  chat_advanced: 'Chat Avançado (GPT-4)',
  
  // Live Audio
  live_audio_1min: 'Áudio ao Vivo (1 min)',
  live_audio_5min: 'Áudio ao Vivo (5 min)',
  
  // Design Studio
  design_generate_image: 'Design: Gerar Imagem',
  design_generate_logo: 'Design: Gerar Logo',
  design_generate_icon: 'Design: Gerar Ícone',
  design_generate_pattern: 'Design: Gerar Padrão',
  design_generate_svg: 'Design: Gerar SVG',
  design_edit_image: 'Design: Editar Imagem',
  design_remove_background: 'Design: Remover Fundo',
  design_upscale_image: 'Design: Upscale HD',
  design_generate_variations: 'Design: 3 Variações',
  design_analyze_image: 'Design: Analisar Imagem',
  design_extract_colors: 'Design: Paleta de Cores',
  design_trends: 'Design: Tendências',
  design_assistant: 'Design: Assistente',
  design_export_png: 'Design: Exportar PNG',
  design_export_svg: 'Design: Exportar SVG',
};

/**
 * Obter nome amigável da operação
 */
export function getOperationName(operation: CreditOperation): string {
  return OPERATION_NAMES[operation];
}

/**
 * Categorias de operações
 */
export const OPERATION_CATEGORIES = {
  music: Object.keys(MUSIC_CREDITS) as MusicOperation[],
  image: Object.keys(IMAGE_CREDITS) as ImageOperation[],
  video: Object.keys(VIDEO_CREDITS) as VideoOperation[],
  chat: Object.keys(CHAT_CREDITS) as ChatOperation[],
  liveAudio: Object.keys(LIVE_AUDIO_CREDITS) as LiveAudioOperation[],
  designStudio: Object.keys(DESIGN_STUDIO_CREDITS) as DesignStudioOperation[],
};

/**
 * Detectar categoria da operação
 */
export function getOperationCategory(
  operation: CreditOperation
): 'music' | 'image' | 'video' | 'chat' | 'liveAudio' | 'designStudio' | 'unknown' {
  if (operation in MUSIC_CREDITS) return 'music';
  if (operation in IMAGE_CREDITS) return 'image';
  if (operation in VIDEO_CREDITS) return 'video';
  if (operation in CHAT_CREDITS) return 'chat';
  if (operation in LIVE_AUDIO_CREDITS) return 'liveAudio';
  if (operation in DESIGN_STUDIO_CREDITS) return 'designStudio';
  return 'unknown';
}

/**
 * Verificar se operação é gratuita
 */
export function isFreeOperation(operation: CreditOperation): boolean {
  return ALL_CREDITS[operation] === 0;
}

/**
 * Obter operações gratuitas
 */
export function getFreeOperations(): CreditOperation[] {
  return Object.entries(ALL_CREDITS)
    .filter(([_, cost]) => cost === 0)
    .map(([op]) => op as CreditOperation);
}

/**
 * Obter operações por custo (ordenadas)
 */
export function getOperationsByCost(ascending = true): Array<{
  operation: CreditOperation;
  cost: number;
  name: string;
}> {
  const operations = Object.entries(ALL_CREDITS).map(([op, cost]) => ({
    operation: op as CreditOperation,
    cost,
    name: OPERATION_NAMES[op as CreditOperation],
  }));

  return operations.sort((a, b) => 
    ascending ? a.cost - b.cost : b.cost - a.cost
  );
}
