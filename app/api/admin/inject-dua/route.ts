import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se é admin
    const { data: userData } = await supabase
      .from('users')
      .select('role, full_access')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'super_admin' && userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado - apenas administradores' },
        { status: 403 }
      );
    }

    const { targetUserId, amount, description } = await request.json();

    if (!targetUserId || !amount) {
      return NextResponse.json(
        { error: 'targetUserId e amount são obrigatórios' },
        { status: 400 }
      );
    }

    // 1. Garantir que profile existe
    const { data: profileExists } = await supabase
      .from('duacoin_profiles')
      .select('id')
      .eq('user_id', targetUserId)
      .single();

    if (!profileExists) {
      // Criar profile
      const { error: createError } = await supabase
        .from('duacoin_profiles')
        .insert({
          user_id: targetUserId,
          balance: 0,
          total_earned: 0,
          total_spent: 0
        });

      if (createError) {
        return NextResponse.json(
          { error: 'Erro ao criar profile: ' + createError.message },
          { status: 500 }
        );
      }
    }

    // 2. Criar transação de injeção
    const { data: transaction, error: txError } = await supabase
      .from('duacoin_transactions')
      .insert({
        user_id: targetUserId,
        type: 'reward',
        amount: amount,
        status: 'completed',
        description: description || `Injeção manual admin - ${user.email}`
      })
      .select()
      .single();

    if (txError) {
      return NextResponse.json(
        { error: 'Erro ao criar transação: ' + txError.message },
        { status: 500 }
      );
    }

    // 3. Buscar profile atualizado
    const { data: updatedProfile } = await supabase
      .from('duacoin_profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    return NextResponse.json({
      success: true,
      transaction,
      profile: updatedProfile,
      message: `${amount} DUA injetados com sucesso`
    });

  } catch (error: any) {
    console.error('❌ Erro na API inject-dua:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + error.message },
      { status: 500 }
    );
  }
}
