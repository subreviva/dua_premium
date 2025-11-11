import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Admin client com Service Role Key (pode confirmar emails)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, userId, inviteCode } = await request.json();

    console.log('[CONFIRM-EMAIL] Confirming email for:', email, userId);

    // 1. Confirmar email do utilizador usando Admin API
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { 
        email_confirm: true,
        user_metadata: { name }
      }
    );

    if (updateError) {
      console.error('[CONFIRM-EMAIL] Erro ao confirmar email:', updateError);
      return NextResponse.json(
        { error: 'Erro ao confirmar email', details: updateError.message },
        { status: 500 }
      );
    }

    console.log('[CONFIRM-EMAIL] Email confirmado!', updateData);

    // 2. Criar profile do user
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: email.toLowerCase(),
        name,
        creditos_servicos: 150,
        created_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('[CONFIRM-EMAIL] Erro ao criar profile:', profileError);
      // Não falhar aqui, pode já existir
    }

    // 3. Criar balance
    const { error: balanceError } = await supabaseAdmin
      .from('duaia_user_balances')
      .insert({
        user_id: userId,
        servicos_creditos: 150,
        duacoin_balance: 0,
      });

    if (balanceError) {
      console.error('[CONFIRM-EMAIL] Erro ao criar balance:', balanceError);
      // Não falhar aqui, pode já existir
    }

    // 4. Marcar código como usado
    if (inviteCode) {
      await supabaseAdmin
        .from('invite_codes')
        .update({
          active: false,
          used_by: userId,
          used_at: new Date().toISOString(),
        })
        .ilike('code', inviteCode);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Email confirmado e registo completo!',
      userId 
    });

  } catch (error) {
    console.error('[CONFIRM-EMAIL] Erro geral:', error);
    return NextResponse.json(
      { error: 'Erro interno', details: String(error) },
      { status: 500 }
    );
  }
}
