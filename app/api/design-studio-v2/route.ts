import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { withCredits } from '@/lib/credits/credits-middleware';
import { DesignStudioOperation } from '@/lib/credits/credits-config';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎨 DESIGN STUDIO API V2 - ULTRA PROFISSIONAL
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de créditos integrado + Gemini 2.5 Flash Image
 * Todas ferramentas Design Studio com validação automática de créditos
 */

const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error('❌ GOOGLE_API_KEY não configurada!');
}

// Mapeamento de actions para operations
const ACTION_TO_OPERATION: Record<string, DesignStudioOperation> = {
  'generate-image': 'design_generate_image',
  'generate-logo': 'design_generate_logo',
  'generate-icon': 'design_generate_icon',
  'generate-pattern': 'design_generate_pattern',
  'generate-svg': 'design_generate_svg',
  'edit-image': 'design_edit_image',
  'remove-background': 'design_remove_background',
  'upscale-image': 'design_upscale_image',
  'generate-variations': 'design_generate_variations',
  'analyze-image': 'design_analyze_image',
  'extract-colors': 'design_extract_colors',
  'design-trends': 'design_trends',
  'design-assistant': 'design_assistant',
  'export-png': 'design_export_png',
  'export-svg': 'design_export_svg',
};

export async function POST(req: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API Key não configurada no servidor' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { tool, prompt, imageData, userId, config } = body;

    // Mapear tool para operation
    const operation = ACTION_TO_OPERATION[tool];
    
    if (!operation) {
      return NextResponse.json(
        { error: `Ferramenta desconhecida: ${tool}` },
        { status: 400 }
      );
    }

    // Usar middleware de créditos
    return withCredits(
      req,
      operation,
      async (userId) => {
        const ai = new GoogleGenAI({ apiKey: API_KEY! });

        // Executar operação baseado no tool
        switch (tool) {
          case 'generate-image':
          case 'generate-logo':
          case 'generate-icon':
          case 'generate-pattern':
          case 'generate-svg': {
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: [prompt],
            });

            const imagePart = response.candidates?.[0]?.content?.parts?.find(
              (p: any) => p.inlineData
            );

            if (!imagePart?.inlineData) {
              throw new Error('Nenhuma imagem gerada pela API');
            }

            const { data: imageBytes, mimeType } = imagePart.inlineData;

            return NextResponse.json({
              success: true,
              image: {
                src: `data:${mimeType};base64,${imageBytes}`,
                mimeType: mimeType || 'image/png',
              },
            });
          }

          case 'edit-image':
          case 'remove-background':
          case 'upscale-image': {
            if (!imageData) {
              throw new Error('imageData é obrigatório para edição');
            }

            // Extrair base64 e mimeType
            const base64Data = imageData.split(',')[1];
            const mimeType =
              imageData.match(/data:([^;]+);/)?.[1] || 'image/png';

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        data: base64Data,
                        mimeType,
                      },
                    },
                  ],
                },
              ],
            });

            const imagePart = response.candidates?.[0]?.content?.parts?.find(
              (p: any) => p.inlineData
            );

            if (!imagePart?.inlineData) {
              throw new Error('Nenhuma imagem gerada pela edição');
            }

            const { data: resultBytes, mimeType: resultMime } =
              imagePart.inlineData;

            return NextResponse.json({
              success: true,
              image: {
                src: `data:${resultMime};base64,${resultBytes}`,
                mimeType: resultMime || 'image/png',
              },
            });
          }

          case 'generate-variations': {
            if (!imageData) {
              throw new Error('imageData é obrigatório para variações');
            }

            const base64Data = imageData.split(',')[1];
            const mimeType =
              imageData.match(/data:([^;]+);/)?.[1] || 'image/png';

            const styles = [
              'watercolor artistic style',
              'cyberpunk neon style',
              'photorealistic enhanced',
            ];

            const variations = [];

            for (const style of styles) {
              const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: [
                  {
                    parts: [
                      {
                        text: `Create a variation in ${style}. Maintain core subject and composition.`,
                      },
                      {
                        inlineData: {
                          data: base64Data,
                          mimeType,
                        },
                      },
                    ],
                  },
                ],
              });

              const imagePart = response.candidates?.[0]?.content?.parts?.find(
                (p: any) => p.inlineData
              );

              if (imagePart?.inlineData) {
                const { data: varBytes, mimeType: varMime } =
                  imagePart.inlineData;
                variations.push({
                  src: `data:${varMime};base64,${varBytes}`,
                  mimeType: varMime || 'image/png',
                });
              }
            }

            return NextResponse.json({
              success: true,
              variations,
            });
          }

          case 'analyze-image': {
            if (!imageData) {
              throw new Error('imageData é obrigatório para análise');
            }

            const base64Data = imageData.split(',')[1];
            const mimeType =
              imageData.match(/data:([^;]+);/)?.[1] || 'image/png';

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [
                {
                  parts: [
                    { text: prompt },
                    {
                      inlineData: {
                        data: base64Data,
                        mimeType,
                      },
                    },
                  ],
                },
              ],
            });

            const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

            return NextResponse.json({
              success: true,
              result: text || 'Nenhum resultado',
            });
          }

          case 'extract-colors': {
            if (!imageData) {
              throw new Error('imageData é obrigatório');
            }

            const base64Data = imageData.split(',')[1];
            const mimeType =
              imageData.match(/data:([^;]+);/)?.[1] || 'image/png';

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [
                {
                  parts: [
                    {
                      inlineData: {
                        data: base64Data,
                        mimeType,
                      },
                    },
                    {
                      text: 'Extraia as 5 cores mais proeminentes. Retorne JSON: { "palette": [{ "hex": "#RRGGBB", "name": "Nome da Cor" }] }',
                    },
                  ],
                },
              ],
              config: {
                responseMimeType: 'application/json',
              },
            });

            const result = JSON.parse(
              response.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
            );

            return NextResponse.json({
              success: true,
              palette: result.palette || [],
            });
          }

          case 'design-trends':
          case 'design-assistant': {
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [prompt],
            });

            const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

            return NextResponse.json({
              success: true,
              result: text || 'Nenhum resultado',
            });
          }

          case 'export-png':
          case 'export-svg': {
            // Export é grátis - apenas retornar sucesso
            return NextResponse.json({
              success: true,
              message: 'Export disponível (operação gratuita)',
            });
          }

          default:
            throw new Error(`Tool não implementado: ${tool}`);
        }
      },
      {
        prompt: prompt?.substring(0, 100),
        imageUrl: imageData?.substring(0, 100),
      }
    );
  } catch (error: any) {
    console.error('❌ Erro na API Design Studio:', error);

    return NextResponse.json(
      {
        error: 'internal_error',
        message: error.message || 'Erro interno do servidor',
      },
      { status: 500 }
    );
  }
}
