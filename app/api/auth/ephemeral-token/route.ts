import { NextResponse } from "next/server";

// Rate limiting simples em memória
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: Request) {
  try {
    // Obter IP do cliente para rate limiting
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";
    
    // Verificar rate limit (máximo 10 tokens por hora)
    const now = Date.now();
    const userLimit = rateLimitStore.get(ip);
    
    if (userLimit) {
      if (now < userLimit.resetTime) {
        if (userLimit.count >= 10) {
          return NextResponse.json(
            { error: "Limite de taxa excedido. Tente novamente mais tarde." },
            { status: 429 }
          );
        }
        userLimit.count++;
      } else {
        // Reset do contador após 1 hora
        rateLimitStore.set(ip, { count: 1, resetTime: now + 3600000 });
      }
    } else {
      rateLimitStore.set(ip, { count: 1, resetTime: now + 3600000 });
    }
    
    // Usar a API key real do Gemini
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || 
                   process.env.GOOGLE_API_KEY || 
                   process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error("GOOGLE_GEMINI_API_KEY não configurada");
      return NextResponse.json(
        { error: "Configuração de API incompleta" },
        { status: 500 }
      );
    }
    
    // Retornar a API key
    return NextResponse.json({
      token: apiKey,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });
    
  } catch (error) {
    console.error("Erro ao gerar token:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}