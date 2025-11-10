import { GoogleGenerativeAI } from '@google/generative-ai';
import { DUA_SYSTEM_INSTRUCTION } from '@/lib/dua-prompt';
import { buildCommentary } from '@/lib/linkCommentary';

// Configuração do modelo Gemini
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY || ''
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

    // Se a última mensagem tiver links, buscar metadados e inserir um contexto auxiliar
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
    const linkRegex = /(https?:\/\/[^\s<>()]+(?:\([^\s()]*\)[^\s<>()]*)*)/gi;
    let extraContext = '';
    if (lastUserMsg && typeof lastUserMsg.content === 'string') {
      const urls = Array.from(new Set((lastUserMsg.content.match(linkRegex) || [])));
      if (urls.length) {
        try {
          const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          const res = await fetch(`${base}/api/link-intel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls }),
            next: { revalidate: 60 }
          });
          if (res.ok) {
            const data = await res.json();
            const simple = (data.links || []).map((l: any) => ({
              url: l.url,
              provider: l.provider,
              siteName: l.siteName,
              title: l.title,
              description: l.description,
              author: l.author,
              channelTitle: l.channelTitle,
              tags: l.tags,
              type: l.type,
            }));
            if (simple.length > 0) {
              extraContext = buildCommentary(simple);
            }
          }
        } catch (err) {
          console.error('Failed to fetch link intelligence:', err);
        }
      }
    }

    // Criar model com system instruction
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: extraContext
        ? `${DUA_SYSTEM_INSTRUCTION}\n\nContexto sobre os links detectados pelo usuário:\n${extraContext}\n\nResponda levando isso em conta.`
        : DUA_SYSTEM_INSTRUCTION,
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
