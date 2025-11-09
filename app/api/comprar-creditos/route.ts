import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Interface para os pacotes de créditos
export interface CreditPackage {
  id: string;
  creditos: number;
  price_eur: number;
  bonus_creditos?: number;
  popular?: boolean;
}

// Pacotes disponíveis
export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'starter', creditos: 1000, price_eur: 10.00 },
  { id: 'basic', creditos: 5000, price_eur: 45.00, bonus_creditos: 500 },
  { id: 'pro', creditos: 10000, price_eur: 85.00, bonus_creditos: 1500, popular: true },
  { id: 'premium', creditos: 25000, price_eur: 200.00, bonus_creditos: 5000 },
  { id: 'enterprise', creditos: 100000, price_eur: 750.00, bonus_creditos: 25000 },
];

export async function GET() {
  try {
    // Buscar taxa de câmbio atual
    const exchangeRateRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dua-exchange-rate`);
    const { data: exchangeRate } = await exchangeRateRes.json();

    // Calcular preço em DUA para cada pacote
    const packagesWithDua = CREDIT_PACKAGES.map(pkg => ({
      ...pkg,
      price_dua: (pkg.price_eur * exchangeRate.dua_per_eur).toFixed(4),
      total_creditos: pkg.creditos + (pkg.bonus_creditos || 0),
    }));

    return NextResponse.json({
      success: true,
      data: {
        packages: packagesWithDua,
        exchange_rate: exchangeRate,
      },
    });

  } catch (error: any) {
    console.error('Erro ao buscar pacotes:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao carregar pacotes de créditos',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Parse body
    const body = await request.json();
    const { user_id, package_id } = body;

    if (!user_id || !package_id) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
      }, { status: 400 });
    }

    // Encontrar pacote
    const pkg = CREDIT_PACKAGES.find(p => p.id === package_id);
    if (!pkg) {
      return NextResponse.json({
        success: false,
        error: 'Pacote não encontrado',
      }, { status: 404 });
    }

    // Buscar taxa de câmbio
    const exchangeRateRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dua-exchange-rate`);
    const { data: exchangeRate } = await exchangeRateRes.json();

    // Calcular valores
    const total_creditos = pkg.creditos + (pkg.bonus_creditos || 0);
    const dua_per_eur = parseFloat(exchangeRate.dua_per_eur);

    // Chamar função SQL comprar_creditos
    const { data, error } = await supabase.rpc('comprar_creditos', {
      p_user_id: user_id,
      p_amount_eur: pkg.price_eur,
      p_exchange_rate: dua_per_eur,
      p_creditos: total_creditos,
    });

    if (error) {
      // Se função não existe, fazer manualmente
      if (error.message?.includes('function') && error.message?.includes('does not exist')) {
        return await comprarCreditosManual(supabase, user_id, pkg, total_creditos, dua_per_eur);
      }

      console.error('Erro ao comprar créditos:', error);
      
      return NextResponse.json({
        success: false,
        error: error.message || 'Erro ao processar compra',
      }, { status: 500 });
    }

    // Verificar se a compra foi bem-sucedida
    if (data && typeof data === 'object' && 'success' in data) {
      if (!data.success) {
        return NextResponse.json({
          success: false,
          error: data.error || 'Saldo insuficiente',
          details: data,
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        transaction_id: data.transaction_id,
        package: pkg,
        creditos_adicionados: total_creditos,
        saldo_dua_restante: data.saldo_dua_restante,
        creditos_total: data.creditos_total,
      },
    });

  } catch (error: any) {
    console.error('Erro ao processar compra:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
    }, { status: 500 });
  }
}

// Fallback manual se função SQL não existir
async function comprarCreditosManual(
  supabase: any,
  user_id: string,
  pkg: CreditPackage,
  total_creditos: number,
  dua_per_eur: number
) {
  const custo_dua = pkg.price_eur * dua_per_eur;

  // Buscar saldo atual
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('saldo_dua, creditos_servicos')
    .eq('id', user_id)
    .single();

  if (userError || !user) {
    return NextResponse.json({
      success: false,
      error: 'Usuário não encontrado',
    }, { status: 404 });
  }

  const saldoAtual = parseFloat(user.saldo_dua) || 0;
  const creditosAtuais = user.creditos_servicos || 0;

  if (saldoAtual < custo_dua) {
    return NextResponse.json({
      success: false,
      error: 'Saldo insuficiente',
      details: {
        saldo_necessario: custo_dua,
        saldo_atual: saldoAtual,
      },
    }, { status: 400 });
  }

  // Atualizar saldos
  const { error: updateError } = await supabase
    .from('users')
    .update({
      saldo_dua: saldoAtual - custo_dua,
      creditos_servicos: creditosAtuais + total_creditos,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user_id);

  if (updateError) {
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar compra',
    }, { status: 500 });
  }

  // Registrar transação
  const { data: transaction } = await supabase
    .from('transactions')
    .insert({
      user_id,
      source_type: 'purchase',
      amount_dua: -custo_dua,
      amount_creditos: total_creditos,
      description: 'Compra de créditos de serviço',
      metadata: {
        amount_eur: pkg.price_eur,
        exchange_rate: dua_per_eur,
        package_id: pkg.id,
        timestamp: new Date().toISOString(),
      },
      status: 'completed',
    })
    .select()
    .single();

  return NextResponse.json({
    success: true,
    data: {
      transaction_id: transaction?.id,
      package: pkg,
      creditos_adicionados: total_creditos,
      saldo_dua_restante: saldoAtual - custo_dua,
      creditos_total: creditosAtuais + total_creditos,
    },
  });
}
