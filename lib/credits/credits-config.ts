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
  // Geração de música (todos os modelos - mesmo custo)
  music_generate_v3: 6,            // Gerar música com Suno V3 (Chirp-v3)
  music_generate_v3_5: 6,          // Gerar música com Suno V3.5 (Chirp-v3-5)
  music_generate_v4: 6,            // Gerar música com Suno V4
  music_generate_v4_5: 6,          // Gerar música com Suno V4.5
  music_generate_v4_5plus: 6,      // Gerar música com Suno V4.5+
  music_generate_v5: 6,            // Gerar música com Suno V5 (latest)
  
  // Operações de áudio
  music_add_instrumental: 6,       // Adicionar instrumental (Upload Cover)
  music_add_vocals: 6,             // Adicionar vocais
  music_extend: 6,                 // Estender música existente
  music_cover: 6,                  // Criar cover de música
  
  // Separação de stems
  music_separate_vocals: 5,        // Separar vocais (2-stem: vocal + instrumental)
  music_split_stem_full: 50,       // Separação completa (12-stem: todos os instrumentos) 🔥 PREMIUM
  
  // Conversões e processamento
  music_convert_wav: 1,            // Converter para WAV (barato)
  music_generate_midi: 1,          // Gerar arquivo MIDI
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 🎨 IMAGEM - Geração com Imagen (Google)
// ═══════════════════════════════════════════════════════════════════════════
export const IMAGE_CREDITS = {
  image_fast: 15,                  // Imagen-4 Fast - 1K Fast (~2-3s)
  image_standard: 25,              // Imagen-4 Standard - 2K (~5-8s) ⭐ RECOMENDADO
  image_ultra: 35,                 // Imagen-4 Ultra - 4K Ultra HD (~10-15s)
  image_3: 10,                     // Imagen-3 - Econômico (~5s)
  image_gemini: 4,                 // Gemini genérico (compatibilidade legacy)
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 🎬 VÍDEO - Geração e processamento
// ═══════════════════════════════════════════════════════════════════════════
export const VIDEO_CREDITS = {
  // Gen-4 (Runway)
  video_gen4_5s: 20,               // Gen-4 Turbo 5 segundos
  video_gen4_10s: 40,              // Gen-4 Turbo 10 segundos
  video_gen4_aleph_5s: 60,         // Gen-4 Aleph 5s (premium)
  
  // Image to Video
  image_to_video_5s: 18,           // Transformar imagem em vídeo 5s
  image_to_video_10s: 35,          // Transformar imagem em vídeo 10s
  
  // Video Editing
  video_to_video: 50,              // Editar vídeos com IA (Gen-4 Aleph)
  
  // Character Animation
  act_two: 35,                     // Animar personagens com áudio
  
  // Gen-3 Alpha (opção econômica)
  gen3_alpha_5s: 18,               // Geração econômica 5s
  gen3_alpha_10s: 35,              // Geração econômica 10s
  
  // Video Enhancement
  video_upscale_5s: 10,            // Upscale 5 segundos
  video_upscale_10s: 20,           // Upscale para HD/4K (10s)
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
  music_generate_v3: 'Gerar Música (Suno V3)',
  music_generate_v3_5: 'Gerar Música (Suno V3.5)',
  music_generate_v4: 'Gerar Música (Suno V4)',
  music_generate_v4_5: 'Gerar Música (Suno V4.5)',
  music_generate_v4_5plus: 'Gerar Música (Suno V4.5 Plus)',
  music_generate_v5: 'Gerar Música (Suno V5)',
  music_add_instrumental: 'Adicionar Instrumental',
  music_add_vocals: 'Adicionar Vocais',
  music_extend: 'Estender Música',
  music_cover: 'Criar Cover',
  music_separate_vocals: 'Separar Vocais (2-stem)',
  music_split_stem_full: 'Separação Completa (12-stem)',
  music_convert_wav: 'Converter para WAV',
  music_generate_midi: 'Gerar MIDI',
  
  // Imagem
  image_fast: 'Imagen-4 Fast (1K, ~2-3s)',
  image_standard: 'Imagen-4 Standard (2K, ~5-8s)',
  image_ultra: 'Imagen-4 Ultra (4K, ~10-15s)',
  image_3: 'Imagen-3 (Econômico)',
  image_gemini: 'Imagem Gemini (Legacy)',
  
  // Vídeo
  video_gen4_5s: 'Vídeo Gen-4 (5s)',
  video_gen4_10s: 'Vídeo Gen-4 (10s)',
  video_gen4_aleph_5s: 'Vídeo Gen-4 Aleph (5s)',
  image_to_video_5s: 'Imagem para Vídeo (5s)',
  image_to_video_10s: 'Imagem para Vídeo (10s)',
  video_to_video: 'Editar Vídeo com IA',
  act_two: 'Animar Personagem com Áudio',
  gen3_alpha_5s: 'Gen-3 Alpha Econômico (5s)',
  gen3_alpha_10s: 'Gen-3 Alpha Econômico (10s)',
  video_upscale_5s: 'Upscale Vídeo (5s)',
  video_upscale_10s: 'Upscale Vídeo HD/4K (10s)',
  
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
