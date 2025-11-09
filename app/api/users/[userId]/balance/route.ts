import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const userId = params.userId;

    // Buscar saldos do usuário
    const { data: user, error } = await supabase
      .from('users')
      .select('saldo_dua, creditos_servicos, email')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({
        success: false,
        error: 'Usuário não encontrado',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        saldo_dua: parseFloat(user.saldo_dua) || 0,
        creditos_servicos: user.creditos_servicos || 0,
        email: user.email,
      },
    });

  } catch (error: any) {
    console.error('Erro ao buscar saldo:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar saldo do usuário',
    }, { status: 500 });
  }
}
