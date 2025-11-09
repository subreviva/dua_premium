import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    // TODO: Implementar integração com API real do DUA Coin
    // Por enquanto, usar taxa fixa (1 EUR = 21 DUA)
    
    const exchangeRate = {
      dua_per_eur: 21.0,
      eur_per_dua: 0.0476,
      last_updated: new Date().toISOString(),
      source: 'fixed', // Depois: 'duacoin_api'
    };

    return NextResponse.json({
      success: true,
      data: exchangeRate,
    });

  } catch (error: any) {
    console.error('Erro ao buscar exchange rate:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar taxa de câmbio',
    }, { status: 500 });
  }
}
