import { getAdminClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = getAdminClient();
    
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

    // Buscar estatísticas completas
    const [
      { count: totalUsers },
      { count: totalTransactions },
      { data: profiles },
      { data: transactions }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('duacoin_transactions').select('*', { count: 'exact', head: true }),
      supabase.from('duacoin_profiles').select('balance, total_earned, total_spent'),
      supabase.from('duacoin_transactions').select('amount, type, created_at').order('created_at', { ascending: false }).limit(1000)
    ]);

    const totalDUACirculating = profiles?.reduce((sum, p) => sum + (p.balance || 0), 0) || 0;
    const totalDUAEarned = profiles?.reduce((sum, p) => sum + (p.total_earned || 0), 0) || 0;
    const totalDUASpent = profiles?.reduce((sum, p) => sum + (p.total_spent || 0), 0) || 0;

    // Estatísticas de transações
    const last24hTransactions = transactions?.filter((t: any) => {
      const txDate = new Date(t.created_at);
      const now = new Date();
      return (now.getTime() - txDate.getTime()) < 24 * 60 * 60 * 1000;
    }).length || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        totalTransactions: totalTransactions || 0,
        totalDUACirculating,
        totalDUAEarned,
        totalDUASpent,
        last24hTransactions,
        averageBalance: totalUsers ? totalDUACirculating / totalUsers : 0
      }
    });

  } catch (error: any) {
    console.error('❌ Erro na API stats:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + error.message },
      { status: 500 }
    );
  }
}
