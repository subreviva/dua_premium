import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Parse body
    const body = await request.json();
    const { user_id, creditos, service_type, metadata = {} } = body;

    if (!user_id || !creditos || !service_type) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos (user_id, creditos, service_type são obrigatórios)',
      }, { status: 400 });
    }

    // Verificar se a função SQL existe, se não, usar lógica manual
    const { data, error } = await supabase.rpc('consumir_creditos', {
      p_user_id: user_id,
      p_creditos: creditos,
      p_service_type: service_type,
      p_metadata: metadata,
    });

    if (error) {
      // Se função não existe, fazer manualmente
      if (error.message?.includes('function') && error.message?.includes('does not exist')) {
        return await consumirCreditosManual(supabase, user_id, creditos, service_type, metadata);
      }

      console.error('Erro ao consumir créditos:', error);
      return NextResponse.json({
        success: false,
        error: error.message || 'Erro ao consumir créditos',
      }, { status: 500 });
    }

    // Verificar se o consumo foi bem-sucedido
    if (data && typeof data === 'object' && 'success' in data) {
      if (!data.success) {
        return NextResponse.json({
          success: false,
          error: data.error || 'Créditos insuficientes',
          details: data,
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        transaction_id: data.transaction_id,
        creditos_consumidos: creditos,
        creditos_restantes: data.creditos_restantes,
        service_type,
      },
    });

  } catch (error: any) {
    console.error('Erro ao processar consumo:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
    }, { status: 500 });
  }
}

// Fallback manual se função SQL não existir
async function consumirCreditosManual(
  supabase: any,
  user_id: string,
  creditos: number,
  service_type: string,
  metadata: any
) {
  // Buscar créditos atuais
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('creditos_servicos')
    .eq('id', user_id)
    .single();

  if (userError || !user) {
    return NextResponse.json({
      success: false,
      error: 'Usuário não encontrado',
    }, { status: 404 });
  }

  const creditosAtuais = user.creditos_servicos || 0;

  if (creditosAtuais < creditos) {
    return NextResponse.json({
      success: false,
      error: 'Créditos insuficientes',
      details: {
        creditos_necessarios: creditos,
        creditos_atuais: creditosAtuais,
      },
    }, { status: 400 });
  }

  // Debitar créditos
  const { error: updateError } = await supabase
    .from('users')
    .update({
      creditos_servicos: creditosAtuais - creditos,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user_id);

  if (updateError) {
    return NextResponse.json({
      success: false,
      error: 'Erro ao debitar créditos',
    }, { status: 500 });
  }

  // Registrar transação (se tabela existir)
  await supabase
    .from('transactions')
    .insert({
      user_id,
      source_type: 'service_usage',
      amount_dua: 0,
      amount_creditos: -creditos,
      description: `Consumo de serviço: ${service_type}`,
      metadata,
      status: 'completed',
    })
    .select()
    .single();

  return NextResponse.json({
    success: true,
    data: {
      creditos_consumidos: creditos,
      creditos_restantes: creditosAtuais - creditos,
      service_type,
    },
  });
}
