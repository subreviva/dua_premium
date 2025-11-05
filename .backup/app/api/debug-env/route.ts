// Debug endpoint para verificar se API key está carregada
export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  
  return Response.json({
    hasKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    keyPreview: apiKey ? `${apiKey.substring(0, 15)}...${apiKey.substring(apiKey.length - 5)}` : 'VAZIO',
    env: process.env.NODE_ENV,
    // Nunca retornar a key completa!
  });
}
