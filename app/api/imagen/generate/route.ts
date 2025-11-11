import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { consumirCreditos } from '@/lib/creditos-helper';

/**
 * API Route: /api/imagen/generate
 * 
 * Gera imagens usando os modelos Google Imagen (2025):
 * - imagen-4-ultra (Ultra qualidade, máximo realismo e detalhes)
 * - imagen-4 (Standard, balanço perfeito qualidade/velocidade)
 * - imagen-3 (Geração anterior, ainda suportada)
 * 
 * Documentação oficial: https://ai.google.dev/gemini-api/docs/imagen
 * 
 * 🔥 NOVO: Sistema de créditos integrado com custos dinâmicos!
 */

// Mapeamento de modelos para service_name
const SERVICE_NAME_MAP: Record<string, string> = {
  'imagen-4-ultra': 'image_ultra',
  'imagen-4': 'image_standard',
  'imagen-3': 'image_fast',
};

export async function POST(req: NextRequest) {
  try {
    const { prompt, model, config, user_id } = await req.json();

    // Validação
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt é obrigatório e deve ser uma string' },
        { status: 400 }
      );
    }

    if (prompt.length > 480) {
      return NextResponse.json(
        { error: 'Prompt não pode ter mais de 480 caracteres' },
        { status: 400 }
      );
    }

    // ========================================
    // 🔥 VERIFICAR E CONSUMIR CRÉDITOS
    // ========================================
    
    // Configuração padrão (precisa estar antes do consumo de créditos)
    const finalConfig = {
      numberOfImages: 4,
      aspectRatio: '1:1',
      personGeneration: 'allow_adult',
      ...config,
    };

    if (user_id) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Determinar service_name baseado no modelo
      const modelId = model || 'imagen-4';
      const serviceName = SERVICE_NAME_MAP[modelId] || 'image_standard';

      // Consultar custo do serviço via RPC (mantém custo dinâmico)
      const { data: costData, error: costError } = await supabase.rpc('get_service_cost', {
        p_service_name: serviceName
      });

      if (costError) {
        console.error('Erro ao obter custo do serviço:', costError);
        return NextResponse.json({
          error: 'Erro ao consultar custo do serviço',
        }, { status: 500 });
      }

      const CUSTO_GERACAO_IMAGEM = costData || 25; // fallback para standard

      console.log(`💰 Serviço: ${serviceName} → ${CUSTO_GERACAO_IMAGEM} créditos`);

      // Delegar consumo para o adapter unificado (server side)
      const resultado = await consumirCreditos(user_id, serviceName, {
        creditos: CUSTO_GERACAO_IMAGEM,
        prompt: prompt.substring(0, 100),
        model: modelId,
        service_name: serviceName,
        config: finalConfig,
      });

      if (!resultado.success) {
        return NextResponse.json({
          error: 'Créditos insuficientes ou erro ao consumir créditos',
          details: resultado.error || resultado.details,
          redirect: '/loja-creditos',
        }, { status: 402 });
      }
    }

    // API Key
    const API_KEY = process.env.GOOGLE_API_KEY;
    if (!API_KEY) {
      console.error('❌ GOOGLE_API_KEY não configurada');
      return NextResponse.json(
        { 
          error: 'Serviço de geração de imagens não configurado',
          message: 'A variável GOOGLE_API_KEY não está configurada no servidor. Configure-a na Vercel em: Settings > Environment Variables',
          docs: 'https://ai.google.dev/gemini-api/docs/api-key'
        },
        { status: 503 }
      );
    }

    console.log('🎨 Iniciando geração de imagem...');
    console.log('📝 Prompt:', prompt);
    console.log('🤖 Modelo:', model || 'imagen-4');
    console.log('⚙️ Config:', finalConfig);

    // Inicializar cliente
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    // Validar número de imagens
    if (finalConfig.numberOfImages < 1 || finalConfig.numberOfImages > 4) {
      return NextResponse.json(
        { error: 'numberOfImages deve estar entre 1 e 4' },
        { status: 400 }
      );
    }

    console.log('🚀 Chamando Google Imagen API...');

    // Gerar imagens
    const response = await ai.models.generateImages({
      model: model || 'imagen-4',
      prompt,
      config: finalConfig,
    });
    
    console.log('✅ Resposta recebida da API');

    if (!response.generatedImages || response.generatedImages.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma imagem foi gerada pela API' },
        { status: 500 }
      );
    }

    // Processar imagens geradas
    const images = response.generatedImages.map((generatedImage: any, index: number) => {
      const imageBytes = generatedImage.image.imageBytes;
      const base64Image = `data:image/png;base64,${imageBytes}`;
      
      // ✅ FIX: Não incluir 'prompt' no objeto retornado
      // Isso causava o texto sobreposto na imagem
      return {
        url: base64Image,
        mimeType: 'image/png',
        // prompt: prompt, ❌ REMOVIDO - causava texto na imagem
        index: index + 1,
      };
    });

    console.log(`✅ ${images.length} imagens geradas com sucesso`);

    return NextResponse.json({
      success: true,
      images,
      model: model || 'imagen-4',
      config: finalConfig,
    });

  } catch (error: any) {
    console.error('❌ Erro na API Imagen:', error);
    console.error('Stack:', error.stack);

    // Erros específicos da API
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'API Key inválida ou sem permissões para Imagen' },
        { status: 401 }
      );
    }

    if (error.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'Quota da API excedida. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }

    if (error.message?.includes('safety')) {
      return NextResponse.json(
        { error: 'Prompt bloqueado por políticas de segurança. Tente um prompt diferente.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao gerar imagens com Imagen' },
      { status: 500 }
    );
  }
}
