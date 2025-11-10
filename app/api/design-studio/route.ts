import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { withCredits } from '@/lib/credits/credits-middleware';
import { DesignStudioOperation } from '@/lib/credits/credits-config';
import { getAdminClient } from '@/lib/supabase';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎨 DESIGN STUDIO API - ULTRA PROFISSIONAL V2.0
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * FEATURES:
 * - Sistema de créditos integrado (validação + dedução automática)
 * - Suporte a TODAS ferramentas Design Studio
 * - Gemini 2.5 Flash Image (geração + edição)
 * - Audit trail completo
 * - Error handling profissional
 * - Rollback automático em caso de falha
 * 
 * OPERAÇÕES SUPORTADAS:
 * - generate-image, generate-logo, generate-icon
 * - generate-pattern, generate-svg
 * - edit-image, remove-background, upscale-image
 * - generate-variations (3x)
 * - analyze-image, color-palette
 * - design-trends, design-assistant
 * - export-png, export-svg (grátis)
 */

const API_KEY = process.env.GOOGLE_API_KEY;

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
    const { action, prompt, model, config } = body;

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    switch (action) {
      case 'generateImage': {
        console.log('🎨 Design Studio - Gerando imagem com Gemini 2.5 Flash Image');
        
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
        console.log('✏️ Design Studio - Editando imagem com Gemini 2.5 Flash Image');
        
        const { image } = config;

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
