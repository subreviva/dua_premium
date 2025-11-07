import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
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

    // Buscar logs de auditoria (últimos 100)
    const { data: logs, error: logsError } = await supabase
      .from('admin_audit_logs')
      .select(`
        *,
        admin:admin_user_id(email),
        target:target_user_id(email)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (logsError) {
      return NextResponse.json(
        { error: 'Erro ao buscar logs: ' + logsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      logs: logs || []
    });

  } catch (error: any) {
    console.error('❌ Erro na API audit-logs:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + error.message },
      { status: 500 }
    );
  }
}
