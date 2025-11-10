import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 👑 ADMIN CREDITS MANAGEMENT API - CONTROLE TOTAL
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Permite administradores:
 * - Distribuir créditos para usuários
 * - Ver histórico de uso de créditos
 * - Ver estatísticas globais de créditos
 * - Gerenciar saldos de todos usuários
 * 
 * SEGURANÇA:
 * - Apenas emails de admin permitidos
 * - Service Role Key para operações
 * - Audit trail completo
 */

const ADMIN_EMAILS = [
  'admin@dua.pt',
  'subreviva@gmail.com',
  'dev@dua.pt',
  'dev@dua.com',
];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ═══════════════════════════════════════════════════════════════════════════
// 🔒 VERIFICAÇÃO DE ADMIN
// ═══════════════════════════════════════════════════════════════════════════
async function verifyAdmin(req: NextRequest): Promise<{ isAdmin: boolean; adminEmail?: string }> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return { isAdmin: false };
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user?.email) {
      return { isAdmin: false };
    }

    const isAdmin = ADMIN_EMAILS.includes(user.email);
    return { isAdmin, adminEmail: user.email };
  } catch {
    return { isAdmin: false };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📊 GET - ESTATÍSTICAS E DADOS
// ═══════════════════════════════════════════════════════════════════════════
export async function GET(req: NextRequest) {
  const { isAdmin, adminEmail } = await verifyAdmin(req);
  
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Acesso negado - apenas administradores' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const userId = searchParams.get('userId');

  try {
    switch (action) {
      case 'global-stats': {
        // Estatísticas globais de créditos
        const { data: balances } = await supabase
          .from('duaia_user_balances')
          .select('servicos_creditos, duacoin_balance');

        const totalCredits = balances?.reduce((sum, b) => sum + (b.servicos_creditos || 0), 0) || 0;
        const totalDuacoin = balances?.reduce((sum, b) => sum + (b.duacoin_balance || 0), 0) || 0;
        const usersWithCredits = balances?.filter(b => (b.servicos_creditos || 0) > 0).length || 0;

        // Transações dos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: recentTransactions } = await supabase
          .from('duaia_transactions')
          .select('*')
          .eq('currency', 'credits')
          .gte('created_at', thirtyDaysAgo.toISOString());

        const creditsSpent = recentTransactions
          ?.filter(t => t.type === 'debit')
          .reduce((sum, t) => sum + t.amount, 0) || 0;

        const creditsAdded = recentTransactions
          ?.filter(t => t.type === 'credit')
          .reduce((sum, t) => sum + t.amount, 0) || 0;

        // Top operações
        const operationCounts: Record<string, number> = {};
        recentTransactions?.forEach(t => {
          const op = t.metadata?.operation || 'unknown';
          operationCounts[op] = (operationCounts[op] || 0) + 1;
        });

        const topOperations = Object.entries(operationCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([operation, count]) => ({ operation, count }));

        return NextResponse.json({
          success: true,
          stats: {
            totalCredits,
            totalDuacoin,
            usersWithCredits,
            totalUsers: balances?.length || 0,
            last30Days: {
              creditsSpent,
              creditsAdded,
              netChange: creditsAdded - creditsSpent,
              transactionCount: recentTransactions?.length || 0,
            },
            topOperations,
          },
        });
      }

      case 'user-credits': {
        if (!userId) {
          return NextResponse.json(
            { error: 'userId é obrigatório' },
            { status: 400 }
          );
        }

        // Saldo do usuário
        const { data: balance } = await supabase
          .from('duaia_user_balances')
          .select('*')
          .eq('user_id', userId)
          .single();

        // Histórico de transações
        const { data: transactions } = await supabase
          .from('duaia_transactions')
          .select('*')
          .eq('user_id', userId)
          .eq('currency', 'credits')
          .order('created_at', { ascending: false })
          .limit(50);

        // Estatísticas do usuário
        const spent = transactions
          ?.filter(t => t.type === 'debit')
          .reduce((sum, t) => sum + t.amount, 0) || 0;

        const received = transactions
          ?.filter(t => t.type === 'credit')
          .reduce((sum, t) => sum + t.amount, 0) || 0;

        return NextResponse.json({
          success: true,
          balance: balance || { servicos_creditos: 0, duacoin_balance: 0 },
          transactions: transactions || [],
          stats: {
            totalSpent: spent,
            totalReceived: received,
            transactionCount: transactions?.length || 0,
          },
        });
      }

      case 'all-users-balances': {
        // Lista de todos usuários com seus saldos
        const { data: balances } = await supabase
          .from('duaia_user_balances')
          .select(`
            user_id,
            servicos_creditos,
            duacoin_balance,
            created_at,
            updated_at
          `)
          .order('servicos_creditos', { ascending: false });

        // Pegar informações básicas dos usuários
        if (balances && balances.length > 0) {
          const userIds = balances.map(b => b.user_id);
          const { data: users } = await supabase
            .from('users')
            .select('id, email, full_name, display_name')
            .in('id', userIds);

          const usersMap = new Map(users?.map(u => [u.id, u]) || []);

          const enrichedBalances = balances.map(b => ({
            ...b,
            user: usersMap.get(b.user_id),
          }));

          return NextResponse.json({
            success: true,
            balances: enrichedBalances,
          });
        }

        return NextResponse.json({
          success: true,
          balances: [],
        });
      }

      case 'recent-activity': {
        // Atividade recente de créditos (últimas 100 transações)
        const { data: transactions } = await supabase
          .from('duaia_transactions')
          .select('*')
          .eq('currency', 'credits')
          .order('created_at', { ascending: false })
          .limit(100);

        return NextResponse.json({
          success: true,
          transactions: transactions || [],
        });
      }

      default:
        return NextResponse.json(
          { error: 'Ação desconhecida' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Admin API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 💳 POST - DISTRIBUIR E GERENCIAR CRÉDITOS
// ═══════════════════════════════════════════════════════════════════════════
export async function POST(req: NextRequest) {
  const { isAdmin, adminEmail } = await verifyAdmin(req);
  
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Acesso negado - apenas administradores' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { action, userId, amount, reason, userIds, operation } = body;

    switch (action) {
      case 'add-credits': {
        if (!userId || !amount || amount <= 0) {
          return NextResponse.json(
            { error: 'userId e amount (positivo) são obrigatórios' },
            { status: 400 }
          );
        }

        // Adicionar créditos usando RPC
        const { data: newBalance, error } = await supabase.rpc(
          'add_servicos_credits',
          {
            p_user_id: userId,
            p_amount: amount,
          }
        );

        if (error) {
          throw error;
        }

        // Registrar no audit trail
        await supabase.from('duaia_transactions').insert({
          user_id: userId,
          type: 'credit',
          amount,
          currency: 'credits',
          description: `Admin: Créditos adicionados por ${adminEmail}`,
          metadata: {
            admin_email: adminEmail,
            reason: reason || 'Admin distribution',
            timestamp: new Date().toISOString(),
          },
          status: 'completed',
        });

        console.log(`✅ Admin ${adminEmail} added ${amount} credits to user ${userId}`);

        return NextResponse.json({
          success: true,
          newBalance,
          message: `${amount} créditos adicionados com sucesso`,
        });
      }

      case 'deduct-credits': {
        if (!userId || !amount || amount <= 0) {
          return NextResponse.json(
            { error: 'userId e amount (positivo) são obrigatórios' },
            { status: 400 }
          );
        }

        // Deduzir créditos usando RPC
        const { data: newBalance, error } = await supabase.rpc(
          'deduct_servicos_credits',
          {
            p_user_id: userId,
            p_amount: amount,
          }
        );

        if (error) {
          throw error;
        }

        // Registrar no audit trail
        await supabase.from('duaia_transactions').insert({
          user_id: userId,
          type: 'debit',
          amount,
          currency: 'credits',
          description: `Admin: Créditos deduzidos por ${adminEmail}`,
          metadata: {
            admin_email: adminEmail,
            reason: reason || 'Admin adjustment',
            timestamp: new Date().toISOString(),
          },
          status: 'completed',
        });

        console.log(`✅ Admin ${adminEmail} deducted ${amount} credits from user ${userId}`);

        return NextResponse.json({
          success: true,
          newBalance,
          message: `${amount} créditos deduzidos com sucesso`,
        });
      }

      case 'set-credits': {
        if (!userId || typeof amount !== 'number') {
          return NextResponse.json(
            { error: 'userId e amount são obrigatórios' },
            { status: 400 }
          );
        }

        // Obter saldo atual
        const { data: currentBalance } = await supabase
          .from('duaia_user_balances')
          .select('servicos_creditos')
          .eq('user_id', userId)
          .single();

        const current = currentBalance?.servicos_creditos || 0;
        const difference = amount - current;

        if (difference > 0) {
          // Adicionar
          await supabase.rpc('add_servicos_credits', {
            p_user_id: userId,
            p_amount: difference,
          });
        } else if (difference < 0) {
          // Deduzir
          await supabase.rpc('deduct_servicos_credits', {
            p_user_id: userId,
            p_amount: Math.abs(difference),
          });
        }

        // Registrar no audit trail
        await supabase.from('duaia_transactions').insert({
          user_id: userId,
          type: difference >= 0 ? 'credit' : 'debit',
          amount: Math.abs(difference),
          currency: 'credits',
          description: `Admin: Saldo ajustado para ${amount} por ${adminEmail}`,
          metadata: {
            admin_email: adminEmail,
            reason: reason || 'Admin balance adjustment',
            old_balance: current,
            new_balance: amount,
            timestamp: new Date().toISOString(),
          },
          status: 'completed',
        });

        console.log(`✅ Admin ${adminEmail} set balance to ${amount} for user ${userId}`);

        return NextResponse.json({
          success: true,
          newBalance: amount,
          message: `Saldo ajustado para ${amount} créditos`,
        });
      }

      case 'bulk-add-credits': {
        if (!userIds || !Array.isArray(userIds) || !amount || amount <= 0) {
          return NextResponse.json(
            { error: 'userIds (array) e amount (positivo) são obrigatórios' },
            { status: 400 }
          );
        }

        const results = [];

        for (const uid of userIds) {
          try {
            const { data: newBalance } = await supabase.rpc(
              'add_servicos_credits',
              {
                p_user_id: uid,
                p_amount: amount,
              }
            );

            await supabase.from('duaia_transactions').insert({
              user_id: uid,
              type: 'credit',
              amount,
              currency: 'credits',
              description: `Admin: Distribuição em massa por ${adminEmail}`,
              metadata: {
                admin_email: adminEmail,
                reason: reason || 'Bulk distribution',
                bulk_operation: true,
                timestamp: new Date().toISOString(),
              },
              status: 'completed',
            });

            results.push({ userId: uid, success: true, newBalance });
          } catch (error: any) {
            results.push({ userId: uid, success: false, error: error.message });
          }
        }

        console.log(`✅ Admin ${adminEmail} bulk added ${amount} credits to ${userIds.length} users`);

        return NextResponse.json({
          success: true,
          results,
          message: `Créditos distribuídos para ${results.filter(r => r.success).length}/${userIds.length} usuários`,
        });
      }

      default:
        return NextResponse.json(
          { error: 'Ação desconhecida' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Admin API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno' },
      { status: 500 }
    );
  }
}
