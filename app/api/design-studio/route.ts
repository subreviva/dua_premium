import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

/**
 * 🔒 API ROUTE SEGURA - Design Studio
 * 
 * Esta rota mantém a API key NO SERVIDOR (nunca exposta no browser)
 * Todas as chamadas para Google Gemini devem passar por aqui
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
        // Gerar imagem com Gemini
        const response = await ai.models.generateContent({
          model: model || 'gemini-2.5-flash-image-preview',
          contents: [{
            parts: [{ text: prompt }]
          }]
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        
        if (imagePart?.inlineData) {
          const { data, mimeType } = imagePart.inlineData;
          return NextResponse.json({
            success: true,
            image: {
              src: `data:${mimeType};base64,${data}`,
              mimeType
            }
          });
        }

        return NextResponse.json(
          { error: 'Nenhuma imagem gerada' },
          { status: 500 }
        );
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
        // Editar imagem com Gemini
        const { image } = config;
        const response = await ai.models.generateContent({
          model: model || 'gemini-2.5-flash-image-preview',
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: image }
            ]
          }]
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
        
        if (imagePart?.inlineData) {
          const { data, mimeType } = imagePart.inlineData;
          return NextResponse.json({
            success: true,
            image: {
              src: `data:${mimeType};base64,${data}`,
              mimeType
            }
          });
        }

        return NextResponse.json(
          { error: 'Nenhuma imagem editada retornada' },
          { status: 500 }
        );
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
        // Gerar variações de imagem
        const { image } = config;
        const response = await ai.models.generateContent({
          model: model || 'gemini-2.5-flash-image-preview',
          contents: [{
            parts: [
              { text: "Gere 3 variações artísticas e distintas desta imagem. Cada uma deve ter um estilo único (ex: aguarela, cyberpunk, fotorealista)." },
              { inlineData: image }
            ]
          }],
          config: { candidateCount: 3 }
        });

        const variations = response.candidates?.map((candidate: any) => {
          const imagePart = candidate.content?.parts?.find((p: any) => p.inlineData);
          if (imagePart?.inlineData) {
            const { data, mimeType } = imagePart.inlineData;
            return { src: `data:${mimeType};base64,${data}`, mimeType };
          }
          return null;
        }).filter(Boolean) || [];

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
