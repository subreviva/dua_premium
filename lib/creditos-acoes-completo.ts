/**
 * 🎯 MAPEAMENTO COMPLETO DE TODAS AS AÇÕES E CUSTOS
 * 
 * Este arquivo documenta TODAS as ações disponíveis em cada estúdio
 * com seus respectivos custos em DUA CRÉDITOS
 * 
 * Conversão Base: 1 DUA COIN (€0,30) = 10 CRÉDITOS
 * Preço Base: €0,030/crédito
 */

import { CREDITOS_CONFIG } from './creditos-config';

// ==========================================================================
// 🎵 ESTÚDIO DE MÚSICA (Music Studio)
// ==========================================================================

export const MUSIC_STUDIO_ACTIONS = {
  // API: /api/suno/generate
  GENERATE_MUSIC: {
    endpoint: '/api/suno/generate',
    nome: 'Gerar Música (Texto → Música)',
    descricao: 'Cria música completa a partir de prompt de texto',
    creditos: 6,
    precoEUR: 0.180,
    custoRealEUR: 0.054, // Suno V5: 12 créditos Suno = $0.06
    markup: '233%',
    parametros: ['prompt', 'style', 'title', 'instrumental'],
    duracaoMedia: '30-60s',
    exemplo: {
      prompt: 'upbeat electronic dance music with piano',
      creditos_debitados: 6
    }
  },

  // API: /api/suno/upload-cover
  UPLOAD_COVER: {
    endpoint: '/api/suno/upload-cover',
    nome: 'Melodia → Música (Upload Cover)',
    descricao: 'Transforma uma melodia/áudio em música completa',
    creditos: 18,
    precoEUR: 0.540,
    custoRealEUR: 0.162, // V5 + Instrumental + Vocals
    markup: '233%',
    parametros: ['uploadUrl', 'style', 'prompt', 'title', 'instrumental'],
    duracaoMedia: '30-60s',
    exemplo: {
      uploadUrl: 'https://...',
      prompt: 'Transform into rock song',
      creditos_debitados: 18
    }
  },

  // API: /api/suno/extend
  EXTEND_MUSIC: {
    endpoint: '/api/suno/extend',
    nome: 'Estender Música',
    descricao: 'Estende uma música existente para mais tempo',
    creditos: 8,
    precoEUR: 0.240,
    custoRealEUR: 0.072, // Estimado: ~12 créditos Suno
    markup: '233%',
    parametros: ['audioId', 'continueAt', 'prompt'],
    duracaoMedia: '+30s',
    exemplo: {
      audioId: 'abc123',
      continueAt: 30,
      creditos_debitados: 8
    }
  },

  // API: /api/suno/convert-wav
  CONVERT_WAV: {
    endpoint: '/api/suno/convert-wav',
    nome: 'Converter para WAV',
    descricao: 'Converte MP3 para WAV de alta qualidade',
    creditos: 1,
    precoEUR: 0.030,
    custoRealEUR: 0.0018, // Suno: 0.4 créditos = $0.002
    markup: '1567%',
    parametros: ['audioId'],
    duracaoMedia: 'instantâneo',
    exemplo: {
      audioId: 'abc123',
      creditos_debitados: 1
    }
  },

  // API: /api/suno/separate-stems
  SEPARATE_VOCALS: {
    endpoint: '/api/suno/separate-stems',
    nome: 'Separar Vocais',
    descricao: 'Separa vocais da música (voz vs instrumental)',
    creditos: 5,
    precoEUR: 0.150,
    custoRealEUR: 0.045, // Suno: 10 créditos = $0.05
    markup: '233%',
    parametros: ['audioId'],
    duracaoMedia: '~1 min',
    exemplo: {
      audioId: 'abc123',
      creditos_debitados: 5
    }
  },

  // API: /api/suno/separate-stems (modo completo)
  STEM_SPLIT: {
    endpoint: '/api/suno/separate-stems',
    nome: 'Stem Split Completo',
    descricao: 'Separa música em stems individuais (vocal, bateria, baixo, outros)',
    creditos: 25,
    precoEUR: 0.750,
    custoRealEUR: 0.225, // Suno: 50 créditos = $0.25
    markup: '233%',
    parametros: ['audioId', 'mode: full'],
    duracaoMedia: '~2 min',
    exemplo: {
      audioId: 'abc123',
      mode: 'full',
      creditos_debitados: 25
    }
  },

  // API: /api/suno/generate-midi
  GENERATE_MIDI: {
    endpoint: '/api/suno/generate-midi',
    nome: 'Gerar MIDI',
    descricao: 'Extrai MIDI de áudio existente',
    creditos: 0, // GRÁTIS segundo a API
    precoEUR: 0,
    custoRealEUR: 0,
    markup: 'N/A',
    parametros: ['audioId'],
    duracaoMedia: '~1 min',
    exemplo: {
      audioId: 'abc123',
      creditos_debitados: 0
    }
  },
} as const;

// ==========================================================================
// 🎨 ESTÚDIO DE IMAGEM (Image Studio)
// ==========================================================================

export const IMAGE_STUDIO_ACTIONS = {
  // API: /api/imagen/generate
  GENERATE_IMAGE: {
    endpoint: '/api/imagen/generate',
    nome: 'Gerar Imagem',
    descricao: 'Cria imagem a partir de prompt usando Gemini/Imagen',
    creditos: 3,
    precoEUR: 0.090,
    custoRealEUR: 0.035, // Gemini 2.0 Flash Image: $0.039/img
    markup: '157%',
    parametros: ['prompt', 'aspectRatio', 'negativePrompt'],
    resolucaoMax: '1024x1024px',
    exemplo: {
      prompt: 'beautiful sunset over mountains',
      aspectRatio: '16:9',
      creditos_debitados: 3
    }
  },

  // Futuro: Edição de imagem
  EDIT_IMAGE: {
    endpoint: '/api/imagen/edit',
    nome: 'Editar Imagem',
    descricao: 'Edita imagem existente com instruções',
    creditos: 2,
    precoEUR: 0.060,
    custoRealEUR: 0.035,
    markup: '71%',
    parametros: ['imageUrl', 'prompt', 'mask'],
    status: 'PLANEJADO',
    exemplo: {
      imageUrl: 'https://...',
      prompt: 'change sky to sunset',
      creditos_debitados: 2
    }
  },

  // Futuro: Upscale
  UPSCALE_IMAGE: {
    endpoint: '/api/imagen/upscale',
    nome: 'Upscale (Aumentar Resolução)',
    descricao: 'Aumenta resolução da imagem 2x-4x',
    creditos: 1,
    precoEUR: 0.030,
    custoRealEUR: 0.017, // ~50% do custo de geração
    markup: '76%',
    parametros: ['imageUrl', 'scale'],
    status: 'PLANEJADO',
    exemplo: {
      imageUrl: 'https://...',
      scale: 2,
      creditos_debitados: 1
    }
  },

  // Futuro: Variações
  GENERATE_VARIATIONS: {
    endpoint: '/api/imagen/variations',
    nome: 'Gerar Variações',
    descricao: 'Cria variações de uma imagem existente',
    creditos: 2,
    precoEUR: 0.060,
    custoRealEUR: 0.035,
    markup: '71%',
    parametros: ['imageUrl', 'count'],
    status: 'PLANEJADO',
    exemplo: {
      imageUrl: 'https://...',
      count: 3,
      creditos_debitados: 2
    }
  },
} as const;

// ==========================================================================
// 🎬 ESTÚDIO DE VÍDEO (Video Studio)
// ==========================================================================

export const VIDEO_STUDIO_ACTIONS = {
  // API: /api/veo/generate
  GENERATE_VIDEO_5S_FAST: {
    endpoint: '/api/veo/generate',
    nome: 'Gerar Vídeo 5s (Fast)',
    descricao: 'Cria vídeo de 5 segundos com qualidade rápida (Veo 3.1 Fast)',
    creditos: 30,
    precoEUR: 0.900,
    custoRealEUR: 0.675, // Veo 3.1 Fast: $0.15/s × 5s = $0.75
    markup: '33%',
    parametros: ['prompt', 'duration: 5', 'quality: fast'],
    resolucao: '1080p',
    exemplo: {
      prompt: 'sunset over ocean waves',
      duration: 5,
      quality: 'fast',
      creditos_debitados: 30
    }
  },

  GENERATE_VIDEO_15S_FAST: {
    endpoint: '/api/veo/generate',
    nome: 'Gerar Vídeo 15s (Fast)',
    descricao: 'Cria vídeo de 15 segundos com qualidade rápida',
    creditos: 90,
    precoEUR: 2.700,
    custoRealEUR: 2.025, // Veo 3.1 Fast: $0.15/s × 15s = $2.25
    markup: '33%',
    parametros: ['prompt', 'duration: 15', 'quality: fast'],
    resolucao: '1080p',
    exemplo: {
      prompt: 'person walking in city',
      duration: 15,
      quality: 'fast',
      creditos_debitados: 90
    }
  },

  GENERATE_VIDEO_5S_STANDARD: {
    endpoint: '/api/veo/generate',
    nome: 'Gerar Vídeo 5s (Standard)',
    descricao: 'Cria vídeo de 5 segundos com qualidade máxima (Veo 3.1 Standard)',
    creditos: 60,
    precoEUR: 1.800,
    custoRealEUR: 1.800, // Veo 3.1 Standard: $0.40/s × 5s = $2.00
    markup: '0%',
    parametros: ['prompt', 'duration: 5', 'quality: standard'],
    resolucao: '4K',
    exemplo: {
      prompt: 'cinematic drone shot',
      duration: 5,
      quality: 'standard',
      creditos_debitados: 60
    }
  },

  GENERATE_VIDEO_15S_STANDARD: {
    endpoint: '/api/veo/generate',
    nome: 'Gerar Vídeo 15s (Standard)',
    descricao: 'Cria vídeo de 15 segundos com qualidade máxima',
    creditos: 180,
    precoEUR: 5.400,
    custoRealEUR: 5.400, // Veo 3.1 Standard: $0.40/s × 15s = $6.00
    markup: '0%',
    parametros: ['prompt', 'duration: 15', 'quality: standard'],
    resolucao: '4K',
    exemplo: {
      prompt: 'time-lapse of city night',
      duration: 15,
      quality: 'standard',
      creditos_debitados: 180
    }
  },

  // Futuro: Estender vídeo
  EXTEND_VIDEO: {
    endpoint: '/api/veo/extend',
    nome: 'Estender Vídeo',
    descricao: 'Estende vídeo existente +5s',
    creditos: 15,
    precoEUR: 0.450,
    custoRealEUR: 0.337, // Estimado: $0.15/s × 5s × 0.5 (extends use less compute)
    markup: '33%',
    parametros: ['videoId', 'direction'],
    status: 'PLANEJADO',
    exemplo: {
      videoId: 'abc123',
      direction: 'forward',
      creditos_debitados: 15
    }
  },

  // Futuro: Interpolação
  VIDEO_INTERPOLATION: {
    endpoint: '/api/veo/interpolate',
    nome: 'Interpolação de Frames',
    descricao: 'Suaviza vídeo aumentando FPS (30fps → 60fps)',
    creditos: 20,
    precoEUR: 0.600,
    custoRealEUR: 0.450,
    markup: '33%',
    parametros: ['videoId', 'targetFps'],
    status: 'PLANEJADO',
    exemplo: {
      videoId: 'abc123',
      targetFps: 60,
      creditos_debitados: 20
    }
  },
} as const;

// ==========================================================================
// 🎨 ESTÚDIO DE DESIGN (Design Studio)
// ==========================================================================

export const DESIGN_STUDIO_ACTIONS = {
  // API: /api/design/generate-image
  GENERATE_DESIGN: {
    endpoint: '/api/design/generate-image',
    nome: 'Gerar Design',
    descricao: 'Cria design personalizado (logo, poster, banner, etc)',
    creditos: 4,
    precoEUR: 0.120,
    custoRealEUR: 0.035,
    markup: '243%',
    parametros: ['prompt', 'designType', 'dimensions'],
    exemplo: {
      prompt: 'modern tech startup logo',
      designType: 'logo',
      dimensions: '512x512',
      creditos_debitados: 4
    }
  },

  // API: /api/design/generate-svg
  GENERATE_SVG: {
    endpoint: '/api/design/generate-svg',
    nome: 'Gerar SVG Vetorial',
    descricao: 'Cria gráfico vetorial SVG escalável',
    creditos: 3,
    precoEUR: 0.090,
    custoRealEUR: 0.035,
    markup: '157%',
    parametros: ['prompt', 'style'],
    exemplo: {
      prompt: 'minimalist icon set',
      style: 'flat',
      creditos_debitados: 3
    }
  },

  // API: /api/design/variations
  GENERATE_DESIGN_VARIATIONS: {
    endpoint: '/api/design/variations',
    nome: 'Variações de Design',
    descricao: 'Gera múltiplas variações de um design',
    creditos: 2,
    precoEUR: 0.060,
    custoRealEUR: 0.035,
    markup: '71%',
    parametros: ['imageUrl', 'count', 'variationType'],
    exemplo: {
      imageUrl: 'https://...',
      count: 3,
      variationType: 'color',
      creditos_debitados: 2
    }
  },

  // API: /api/design/color-palette
  EXTRACT_COLOR_PALETTE: {
    endpoint: '/api/design/color-palette',
    nome: 'Extrair Paleta de Cores',
    descricao: 'Extrai paleta de cores de uma imagem',
    creditos: 0, // GRÁTIS (processamento local/simples)
    precoEUR: 0,
    custoRealEUR: 0,
    markup: 'N/A',
    parametros: ['imageUrl'],
    exemplo: {
      imageUrl: 'https://...',
      creditos_debitados: 0
    }
  },

  // API: /api/design/analyze-image
  ANALYZE_IMAGE: {
    endpoint: '/api/design/analyze-image',
    nome: 'Analisar Imagem',
    descricao: 'Analisa imagem e retorna insights de design',
    creditos: 1,
    precoEUR: 0.030,
    custoRealEUR: 0.00005, // Gemini 2.5 Flash text
    markup: '60000%',
    parametros: ['imageUrl'],
    exemplo: {
      imageUrl: 'https://...',
      creditos_debitados: 1
    }
  },

  // API: /api/design/enhance-prompt
  ENHANCE_PROMPT: {
    endpoint: '/api/design/enhance-prompt',
    nome: 'Melhorar Prompt',
    descricao: 'Transforma prompt simples em prompt detalhado',
    creditos: 1,
    precoEUR: 0.030,
    custoRealEUR: 0.00005,
    markup: '60000%',
    parametros: ['prompt'],
    exemplo: {
      prompt: 'cool logo',
      creditos_debitados: 1
    }
  },

  // API: /api/design/edit-image
  EDIT_DESIGN: {
    endpoint: '/api/design/edit-image',
    nome: 'Editar Design',
    descricao: 'Edita design existente com instruções',
    creditos: 2,
    precoEUR: 0.060,
    custoRealEUR: 0.035,
    markup: '71%',
    parametros: ['imageUrl', 'editPrompt'],
    exemplo: {
      imageUrl: 'https://...',
      editPrompt: 'change background to blue',
      creditos_debitados: 2
    }
  },

  // API: /api/design/research-trends
  RESEARCH_TRENDS: {
    endpoint: '/api/design/research-trends',
    nome: 'Pesquisar Tendências',
    descricao: 'Pesquisa tendências de design atuais',
    creditos: 0, // GRÁTIS
    precoEUR: 0,
    custoRealEUR: 0,
    markup: 'N/A',
    parametros: ['category', 'year'],
    exemplo: {
      category: 'logo',
      year: 2025,
      creditos_debitados: 0
    }
  },
} as const;

// ==========================================================================
// 💬 CHAT / ASSISTENTE IA
// ==========================================================================

export const CHAT_ACTIONS = {
  CHAT_MESSAGE: {
    endpoint: '/api/chat',
    nome: 'Mensagem de Chat',
    descricao: 'Conversa com assistente IA (Gemini 2.5 Flash)',
    creditos: 1,
    precoEUR: 0.030,
    custoRealEUR: 0.00005, // ~100 tokens @ $0.10/1M input + $0.40/1M output
    markup: '60000%',
    parametros: ['message', 'conversationId'],
    exemplo: {
      message: 'Como criar uma boa música?',
      creditos_debitados: 1
    }
  },

  CHAT_MESSAGE_LONG: {
    endpoint: '/api/chat',
    nome: 'Mensagem Longa (>500 tokens)',
    descricao: 'Conversa com contexto extenso ou resposta longa',
    creditos: 2,
    precoEUR: 0.060,
    custoRealEUR: 0.0001,
    markup: '60000%',
    parametros: ['message', 'conversationId'],
    exemplo: {
      message: 'Explique detalhadamente...',
      creditos_debitados: 2
    }
  },
} as const;

// ==========================================================================
// 📊 RESUMO CONSOLIDADO
// ==========================================================================

export const ALL_ACTIONS = {
  ...MUSIC_STUDIO_ACTIONS,
  ...IMAGE_STUDIO_ACTIONS,
  ...VIDEO_STUDIO_ACTIONS,
  ...DESIGN_STUDIO_ACTIONS,
  ...CHAT_ACTIONS,
} as const;

export type ActionKey = keyof typeof ALL_ACTIONS;

/**
 * Retorna informações de uma ação específica
 */
export function getActionInfo(action: ActionKey) {
  return ALL_ACTIONS[action];
}

/**
 * Calcula o lucro de uma ação
 */
export function calculateActionProfit(action: ActionKey) {
  const info = ALL_ACTIONS[action];
  const lucro = info.precoEUR - info.custoRealEUR;
  const margemPercent = (lucro / info.custoRealEUR) * 100;
  
  return {
    lucroEUR: lucro,
    margemPercent: margemPercent.toFixed(0) + '%',
    roi: (info.precoEUR / info.custoRealEUR).toFixed(2) + 'x',
  };
}

/**
 * Lista todas as ações disponíveis por estúdio
 */
export function getActionsByStudio() {
  return {
    music: Object.keys(MUSIC_STUDIO_ACTIONS),
    image: Object.keys(IMAGE_STUDIO_ACTIONS),
    video: Object.keys(VIDEO_STUDIO_ACTIONS),
    design: Object.keys(DESIGN_STUDIO_ACTIONS),
    chat: Object.keys(CHAT_ACTIONS),
  };
}

/**
 * Calcula custo total de múltiplas ações
 */
export function calculateTotalCost(actions: { action: ActionKey; quantity: number }[]) {
  let totalCreditos = 0;
  let totalEUR = 0;
  let totalCustoReal = 0;

  for (const { action, quantity } of actions) {
    const info = ALL_ACTIONS[action];
    totalCreditos += info.creditos * quantity;
    totalEUR += info.precoEUR * quantity;
    totalCustoReal += info.custoRealEUR * quantity;
  }

  return {
    totalCreditos,
    totalEUR: totalEUR.toFixed(2),
    totalCustoReal: totalCustoReal.toFixed(2),
    lucro: (totalEUR - totalCustoReal).toFixed(2),
    margemPercent: ((totalEUR - totalCustoReal) / totalCustoReal * 100).toFixed(0) + '%',
  };
}
