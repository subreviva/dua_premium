import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API Route para verificar se o usuário está autenticado
 * Retorna { authenticated: true/false }
 */
export async function GET(req: NextRequest) {
  try {
    // Buscar token de autenticação dos headers ou cookies
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    // Criar cliente Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verificar se o token é válido
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      }
    });
    
  } catch (error) {
    console.error('[AUTH CHECK] Erro:', error);
    return NextResponse.json({ authenticated: false });
  }
}
