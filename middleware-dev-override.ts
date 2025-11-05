// 🔓 MODO DESENVOLVEDOR: Desabilita TODA autenticação
// Coloque este código no início do middleware.ts para bypass total

export async function middleware(req: NextRequest) {
  // 🚨 DESENVOLVIMENTO APENAS - Remove em produção!
  const DEV_MODE_BYPASS_ALL = process.env.NODE_ENV === 'development';
  
  if (DEV_MODE_BYPASS_ALL) {
    console.log('🔓 DEV MODE: Bypass total ativo - sem autenticação');
    return NextResponse.next();
  }
  
  // ... resto do código normal do middleware
}