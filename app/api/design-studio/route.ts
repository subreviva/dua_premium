import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

/**
 * 🔒 API ROUTE SEGURA - Design Studio
 * 
 * Esta rota mantém a API key NO SERVIDOR (nunca exposta no browser)
 * Todas as chamadas para Google Gemini devem passar por aqui
 * 
 * ✅ CORRIGIDO: Usa gemini-2.5-flash-image para gerar E editar imagens
 * ✅ Sistema de créditos integrado
 */

const API_KEY = process.env.GOOGLE_API_KEY;
const CUSTO_GERACAO_IMAGEM = 30; // Créditos por geração

if (!API_KEY) {
  console.error('❌ GOOGLE_API_KEY não configurada no servidor!');
}

export async function POST(req: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API Key não configurada no servidor' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { action, prompt, model, config, user_id } = body;

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    switch (action) {
      case 'generateImage': {
        // ✅ CORRIGIDO: Usar gemini-2.5-flash-image (modelo que GERA imagens)
        console.log('🎨 Design Studio - Gerando imagem com Gemini 2.5 Flash Image');
        
        // Verificar e consumir créditos
        if (user_id) {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );

          const { data: user } = await supabase
            .from('users')
            .select('creditos_servicos')
            .eq('id', user_id)
            .single();

          const creditosAtuais = user?.creditos_servicos || 0;

          if (creditosAtuais < CUSTO_GERACAO_IMAGEM) {
            return NextResponse.json({
              error: 'Créditos insuficientes',
              details: {
                creditos_necessarios: CUSTO_GERACAO_IMAGEM,
                creditos_atuais: creditosAtuais,
                faltam: CUSTO_GERACAO_IMAGEM - creditosAtuais,
              },
              redirect: '/loja-creditos',
            }, { status: 402 });
          }

          // Consumir créditos
          await supabase
            .from('users')
            .update({
              creditos_servicos: creditosAtuais - CUSTO_GERACAO_IMAGEM,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user_id);

          // Registrar transação
          await supabase
            .from('transactions')
            .insert({
              user_id,
              source_type: 'service_usage',
              amount_dua: 0,
              amount_creditos: -CUSTO_GERACAO_IMAGEM,
              description: 'Geração de imagem (Design Studio)',
              metadata: {
                prompt: prompt.substring(0, 100),
                tool: 'design-studio',
                timestamp: new Date().toISOString(),
              },
              status: 'completed',
            });
        }

        // Gerar imagem com gemini-2.5-flash-image
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: [prompt]
        });

        // Extrair imagem do response
        const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        
        if (!imagePart?.inlineData) {
          return NextResponse.json(
            { error: 'Nenhuma imagem gerada pela API' },
            { status: 500 }
          );
        }

        const { data: imageBytes, mimeType } = imagePart.inlineData;
        const base64Image = `data:${mimeType};base64,${imageBytes}`;

        return NextResponse.json({
          success: true,
          image: {
            src: base64Image,
            mimeType: mimeType || 'image/png'
          }
        });
      }

      case 'analyzeImage': {
        // Analisar imagem com Gemini Vision
        const response = await ai.models.generateContent({
          model: model || 'gemini-2.5-flash',
          contents: [{
            parts: [
              { text: prompt },
              ...(config?.image ? [{ inlineData: config.image }] : [])
            ]
          }]
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

        return NextResponse.json({
          success: true,
          result: text || 'Nenhum resultado'
        });
      }

      case 'chat': {
        // Chat com Gemini
        const response = await ai.models.generateContent({
          model: model || 'gemini-2.5-flash',
          contents: [{
            parts: [{ text: prompt }]
          }]
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

        return NextResponse.json({
          success: true,
          result: text || 'Nenhum resultado'
        });
      }

      case 'editImage': {
        // ✅ CORRIGIDO: Editar imagem com gemini-2.5-flash-image
        console.log('✏️ Design Studio - Editando imagem com Gemini 2.5 Flash Image');
        
        const { image } = config;
        
        // Verificar e consumir créditos
        if (user_id) {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          );

          const { data: user } = await supabase
            .from('users')
            .select('creditos_servicos')
            .eq('id', user_id)
            .single();

          const creditosAtuais = user?.creditos_servicos || 0;

          if (creditosAtuais < CUSTO_GERACAO_IMAGEM) {
            return NextResponse.json({
              error: 'Créditos insuficientes',
              details: {
                creditos_necessarios: CUSTO_GERACAO_IMAGEM,
                creditos_atuais: creditosAtuais,
                faltam: CUSTO_GERACAO_IMAGEM - creditosAtuais,
              },
              redirect: '/loja-creditos',
            }, { status: 402 });
          }

          await supabase
            .from('users')
            .update({
              creditos_servicos: creditosAtuais - CUSTO_GERACAO_IMAGEM,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user_id);

          await supabase
            .from('transactions')
            .insert({
              user_id,
              source_type: 'service_usage',
              amount_dua: 0,
              amount_creditos: -CUSTO_GERACAO_IMAGEM,
              description: 'Edição de imagem (Design Studio)',
              metadata: {
                prompt: prompt.substring(0, 100),
                tool: 'edit-image',
                timestamp: new Date().toISOString(),
              },
              status: 'completed',
            });
        }

        // Editar imagem com gemini-2.5-flash-image
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: image }
            ]
          }]
        });

        // Extrair imagem editada
        const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        
        if (!imagePart?.inlineData) {
          return NextResponse.json(
            { error: 'Nenhuma imagem editada gerada' },
            { status: 500 }
          );
        }

        const { data: imageBytes, mimeType } = imagePart.inlineData;
        const base64Image = `data:${mimeType};base64,${imageBytes}`;

        return NextResponse.json({
          success: true,
          image: {
            src: base64Image,
            mimeType: mimeType || 'image/png'
          }
        });
      }

      case 'extractColorPalette': {
        // Extrair paleta de cores
        const { image } = config;
        const response = await ai.models.generateContent({
          model: model || 'gemini-2.5-flash',
          contents: [{
            parts: [
              { inlineData: image },
              { text: "Analise esta imagem e extraia as 5 cores mais proeminentes. Forneça um nome comum para cada cor." }
            ]
          }],
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object',
              properties: {
                palette: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      hex: { type: 'string', description: "O código hexadecimal da cor, ex: '#RRGGBB'" },
                      name: { type: 'string', description: "Um nome comum para a cor, ex: 'Azul Meia-Noite'" }
                    }
                  }
                }
              }
            }
          }
        });

        const result = JSON.parse((response.text || '{}').trim());
        return NextResponse.json({
          success: true,
          palette: result.palette || []
        });
      }

      case 'generateVariations': {
        // ✅ Gerar variações de imagem com gemini-2.5-flash-image
        console.log('🎨 Design Studio - Gerando variações');
        
        const { image } = config;
        
        // Para variações, gerar múltiplas imagens com prompts diferentes
        const styles = ['watercolor artistic style', 'cyberpunk neon style', 'photorealistic enhanced'];
        const variations = [];
        
        for (const style of styles) {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{
              parts: [
                { text: `Create a variation of this image in ${style}. Maintain the core subject and composition but apply the ${style}.` },
                { inlineData: image }
              ]
            }]
          });

          const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
          
          if (imagePart?.inlineData) {
            const { data: imageBytes, mimeType } = imagePart.inlineData;
            variations.push({
              src: `data:${mimeType};base64,${imageBytes}`,
              mimeType: mimeType || 'image/png'
            });
          }
        }

        return NextResponse.json({
          success: true,
          variations
        });
      }

      default:
        return NextResponse.json(
          { error: `Ação desconhecida: ${action}` },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('❌ Erro na API Design Studio:', error);

    if (error.message?.includes('API key expired')) {
      return NextResponse.json(
        { error: 'API key expirada. Por favor, atualize a chave.' },
        { status: 401 }
      );
    }

    if (error.message?.includes('400')) {
      return NextResponse.json(
        { error: 'Requisição inválida. Verifique os parâmetros.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao processar requisição' },
      { status: 500 }
    );
  }
}
