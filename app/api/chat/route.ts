import { GoogleGenerativeAI } from '@google/generative-ai';
import { DUA_SYSTEM_INSTRUCTION } from '@/lib/dua-prompt';
import { buildCommentary } from '@/lib/linkCommentary';

// Configuração do modelo Gemini
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_API_KEY || ''
);

export const maxDuration = 30;

export async function POST(req: Request) {
  // Wrapper de segurança para NUNCA retornar HTML
  const sendFriendlyError = () => {
    const encoder = new TextEncoder();
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('0:""\n'));
        controller.enqueue(encoder.encode('0:"Hmm, parece que tive um pequeno soluço. Que tal tentar de novo?"\n'));
        controller.close();
      }
    });
    
    return new Response(errorStream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
      },
    });
  };

  try {
    console.log('[CHAT API] Requisição recebida');
    
    // Validação básica
    if (!process.env.GOOGLE_API_KEY) {
      console.error('[CHAT API] ❌ GOOGLE_API_KEY não configurada');
      return sendFriendlyError();
    }

    const body = await req.json();
    console.log('[CHAT API] Body parseado:', { messagesCount: body?.messages?.length });
    
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('[CHAT API] ❌ Mensagens inválidas recebidas');
      return sendFriendlyError();
    }

    // Converter messages para o formato do Gemini
    const geminiMessages = messages
      .filter((m: any) => m.role !== 'system')
      .map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));
    
    console.log('[CHAT API] ✅ Mensagens convertidas:', geminiMessages.length);

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

    console.log('[CHAT API] ✅ Modelo criado');

    // Iniciar chat com histórico
    const chat = model.startChat({
      history: geminiMessages.slice(0, -1),
    });

    console.log('[CHAT API] ✅ Chat iniciado com histórico');

    // Enviar última mensagem e fazer stream
    const lastMessage = geminiMessages[geminiMessages.length - 1];
    console.log('[CHAT API] 📤 Enviando mensagem:', lastMessage.parts[0].text.substring(0, 50));
    
    const result = await chat.sendMessageStream(lastMessage.parts[0].text);
    
    console.log('[CHAT API] ✅ Stream iniciado');

    // Criar ReadableStream compatível com useChat (Data Stream Protocol)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('[CHAT API] 🌊 Iniciando stream...');
          
          // Enviar prefixo do data stream
          controller.enqueue(encoder.encode('0:""\n'));
          
          let fullText = '';
          let chunkCount = 0;
          
          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullText += text;
            chunkCount++;
            
            // Formato do Data Stream Protocol: 0:"text content"
            const payload = `0:${JSON.stringify(text)}\n`;
            controller.enqueue(encoder.encode(payload));
          }
          
          console.log(`[CHAT API] ✅ Stream completo: ${chunkCount} chunks, ${fullText.length} caracteres`);
          controller.close();
        } catch (streamError) {
          console.error('[CHAT API] ❌ Stream error:', streamError);
          // Enviar mensagem de erro amigável no formato correto
          const errorMsg = '0:"Ops! Tive um pequeno problema. Tenta novamente, por favor?"\n';
          controller.enqueue(encoder.encode(errorMsg));
          controller.close();
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
    console.error('[CHAT API] ❌ Error in chat API (catch global):', error);
    return sendFriendlyError();
  }
}
