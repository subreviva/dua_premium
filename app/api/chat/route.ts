import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { DUA_SYSTEM_INSTRUCTION } from '@/lib/dua-prompt';

// Configuração do modelo Gemini
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, image } = await req.json();

    // Se houver image, adicionar ao último user message
    let processedMessages = messages;
    if (image) {
      const lastUserIndex = messages.map((m: any) => m.role).lastIndexOf('user');
      if (lastUserIndex !== -1) {
        processedMessages = [...messages];
        processedMessages[lastUserIndex] = {
          ...messages[lastUserIndex],
          content: [
            {
              type: 'text',
              text: messages[lastUserIndex].content,
            },
            {
              type: 'image',
              image: image,
            },
          ],
        };
      }
    }

    // Stream de resposta da Gemini com system instruction da DUA
    const result = streamText({
      model: google('gemini-2.0-flash-exp'),
      system: DUA_SYSTEM_INSTRUCTION,
      messages: processedMessages,
      temperature: 0.8, // Criatividade moderada para a DUA
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
