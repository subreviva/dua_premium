import { GoogleGenerativeAI } from '@google/generative-ai';
import { DUA_SYSTEM_INSTRUCTION } from '@/lib/dua-prompt';

// Configuração do modelo Gemini
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''
);

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Converter messages para o formato do Gemini
    const geminiMessages = messages
      .filter((m: any) => m.role !== 'system')
      .map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

    // Criar model com system instruction
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: DUA_SYSTEM_INSTRUCTION,
    });

    // Iniciar chat com histórico
    const chat = model.startChat({
      history: geminiMessages.slice(0, -1),
    });

    // Enviar última mensagem e fazer stream
    const lastMessage = geminiMessages[geminiMessages.length - 1];
    const result = await chat.sendMessageStream(lastMessage.parts[0].text);

    // Criar ReadableStream compatível com useChat (Data Stream Protocol)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Enviar prefixo do data stream
          controller.enqueue(encoder.encode('0:""\n'));
          
          let fullText = '';
          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullText += text;
            
            // Formato do Data Stream Protocol: 0:"text content"
            const payload = `0:${JSON.stringify(text)}\n`;
            controller.enqueue(encoder.encode(payload));
          }
          
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
      },
    });
  } catch (error) {
    // console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
