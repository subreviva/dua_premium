/**
 * API Route: /api/validate-code
 * 
 * Endpoint para validar código de convite e conceder acesso exclusivo.
 * 
 * Fluxo:
 * 1. Recebe { code, email }
 * 2. Verifica se código existe e está ativo
 * 3. Cria/autentica user via Supabase Auth (magic link)
 * 4. Cria registro em users (DUA IA) com has_access = true
 * 5. Cria registro em duacoin_profiles (DUA COIN) automaticamente
 * 6. Marca invite_codes como usado
 * 7. Retorna sucesso ou erro
 * 
 * IMPORTANTE: Sistema funciona em conjunto - DUA IA + DUA COIN sempre juntos
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import type { InviteCode, User } from '@/lib/supabase';

export const maxDuration = 30;

interface ValidateCodeRequest {
  code: string;
  email: string;
  name?: string;
  password?: string;
  createAccount?: boolean;
}

interface ValidateCodeResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    total_tokens?: number;
    has_access: boolean;
    subscription_tier?: string;
    dua_coins?: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient();
    
    // 1. Parse e validação do body
    const body: ValidateCodeRequest = await req.json();
    const { code, email, name, password, createAccount } = body;

    // Validar inputs
    if (!code || !email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Código e email são obrigatórios',
        } as ValidateCodeResponse,
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email inválido',
        } as ValidateCodeResponse,
        { status: 400 }
      );
    }

    // Validar comprimento do código
    if (code.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'Código deve ter no mínimo 6 caracteres',
        } as ValidateCodeResponse,
        { status: 400 }
      );
    }

    // 2. Verificar se código existe e está ativo
    const { data: inviteCode, error: codeError } = await supabaseAdmin
      .from('invite_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .single();

    if (codeError || !inviteCode) {
      // console.error('Código não encontrado:', codeError);
      return NextResponse.json(
        {
          success: false,
          message: 'Código inválido ou já utilizado',
        } as ValidateCodeResponse,
        { status: 404 }
      );
    }

    // 3. Criar user com password ou magic link
    let userId: string;
    
    if (createAccount && password && name) {
      // NOVO: Criar conta com password (auto-confirmada)
      console.log('[VALIDATE-CODE] Criando conta com password...');
      
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        password,
        email_confirm: true, // Auto-confirmar
        user_metadata: { name },
      });

      if (authError || !authData.user) {
        console.error('[VALIDATE-CODE] Erro ao criar user:', authError);
        return NextResponse.json(
          {
            success: false,
            message: authError?.message || 'Erro ao criar conta',
          } as ValidateCodeResponse,
          { status: 500 }
        );
      }

      userId = authData.user.id;
      console.log('[VALIDATE-CODE] User criado:', userId);
      
    } else {
      // LEGACY: Magic link
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: email.toLowerCase(),
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/chat`,
        },
      });

      if (authError) {
        // console.error('Erro ao gerar magic link:', authError);
        return NextResponse.json(
          {
            success: false,
            message: 'Erro ao criar conta. Tente novamente.',
          } as ValidateCodeResponse,
          { status: 500 }
        );
      }

      userId = authData.user.id;
    }    // 4. Atualizar ou criar registro em public.users (DUA IA)
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingUser) {
      // User já existe, apenas atualizar
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          has_access: true,
          total_tokens: (existingUser.total_tokens || 0) + 5000, // 5000 tokens iniciais
          invite_code_used: code.toUpperCase(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Erro ao atualizar user:', updateError);
        return NextResponse.json(
          {
            success: false,
            message: 'Erro ao conceder acesso. Tente novamente.',
          } as ValidateCodeResponse,
          { status: 500 }
        );
      }
    } else {
      // User novo, criar registro em users (DUA IA)
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email: email.toLowerCase(),
          name: name || email.split('@')[0],
          has_access: true,
          email_verified: true, // Auto-confirmado
          registration_completed: true,
          subscription_tier: 'premium', // Acesso exclusivo = premium
          creditos_servicos: 150, // 150 créditos iniciais
          saldo_dua: 50, // 50 DUA coins iniciais
          account_type: 'normal',
          total_tokens: 5000, // 5000 tokens iniciais
          tokens_used: 0,
          invite_code_used: code.toUpperCase(),
          created_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error('❌ Erro ao criar user:', insertError);
        return NextResponse.json(
          {
            success: false,
            message: 'Erro ao criar conta DUA IA. Tente novamente.',
          } as ValidateCodeResponse,
          { status: 500 }
        );
      }
      
      // Inicializar duaia_user_balances
      await supabaseAdmin
        .from('duaia_user_balances')
        .upsert({
          user_id: userId,
          servicos_creditos: 0,
          duacoin_balance: 0,
        }, { onConflict: 'user_id' });

      // Adicionar 150 créditos via RPC
      await supabaseAdmin.rpc('add_servicos_credits', {
        p_user_id: userId,
        p_amount: 150,
        p_transaction_type: 'signup_bonus',
        p_description: 'Créditos iniciais - Registo via código',
        p_admin_email: null,
        p_metadata: { source: 'validate_code', invite_code: code.toUpperCase() }
      });
    }

    // 5. Criar perfil DUA COIN (sempre, mesmo se user já existe)
    // Verificar se já tem perfil DUA COIN
    const { data: existingCoinProfile } = await supabaseAdmin
      .from('duacoin_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

  if (!existingCoinProfile) {
      // Criar perfil DUA COIN
      const { error: coinProfileError } = await supabaseAdmin
        .from('duacoin_profiles')
        .insert({
          user_id: userId,
          balance: 1000, // 1000 DUA coins iniciais
          total_earned: 1000,
          total_spent: 0,
          level: 1,
          experience: 0,
          created_at: new Date().toISOString(),
        });

      if (coinProfileError) {
        console.error('❌ Erro ao criar perfil DUA COIN:', coinProfileError);
        // Não bloquear o fluxo, mas registrar erro
      } else {
        console.log('✅ Perfil DUA COIN criado para user:', userId);
        
        // Registrar transação inicial
        await supabaseAdmin
          .from('duacoin_transactions')
          .insert({
            user_id: userId,
            type: 'reward',
            amount: 1000,
            description: 'Bônus de boas-vindas - Acesso exclusivo',
            balance_after: 1000,
            created_at: new Date().toISOString(),
          });
      }
    } else {
      console.log('ℹ️  Perfil DUA COIN já existe para user:', userId);
    }

    // 5.1 Inicializar créditos de serviços (150) em duaia_user_balances
    // Garantir registro
    await supabaseAdmin
      .from('duaia_user_balances')
      .upsert({ user_id: userId, servicos_creditos: 0, duacoin_balance: 0 }, { onConflict: 'user_id' });

    // Adicionar créditos via RPC com auditoria
    const { error: addCreditsError } = await supabaseAdmin.rpc('add_servicos_credits', {
      p_user_id: userId,
      p_amount: 150,
      p_transaction_type: 'signup_bonus',
      p_description: 'Créditos iniciais - Acesso exclusivo',
      p_admin_email: null,
      p_metadata: { source: 'validate-code', code: code.toUpperCase() }
    });

    if (addCreditsError) {
      console.error('⚠️  Erro ao adicionar créditos iniciais:', addCreditsError);
    }

    // 6. Marcar código como usado COM PROTEÇÃO RACE CONDITION
    console.log('[VALIDATE-CODE] Verificando código antes de marcar como usado...');
    
    // ⚡ PROTEÇÃO: Re-verificar se código ainda está ativo
    const { data: codeRecheck, error: recheckError } = await supabaseAdmin
      .from('invite_codes')
      .select('id, code, active, used_by')
      .eq('id', inviteCode.id)
      .single();
    
    if (recheckError || !codeRecheck) {
      console.error('[VALIDATE-CODE] ❌ Código não encontrado na verificação final:', recheckError);
      return NextResponse.json(
        {
          success: false,
          message: 'Código de acesso inválido. Por favor, tenta novamente.',
        } as ValidateCodeResponse,
        { status: 400 }
      );
    }
    
    if (!codeRecheck.active || codeRecheck.used_by) {
      console.error('[VALIDATE-CODE] ❌ Código já usado por:', codeRecheck.used_by);
      return NextResponse.json(
        {
          success: false,
          message: 'Este código já foi utilizado por outro utilizador.',
        } as ValidateCodeResponse,
        { status: 409 }
      );
    }
    
    // ✅ Código ainda ativo - marcar como usado COM CONDIÇÃO
    const { error: updateCodeError } = await supabaseAdmin
      .from('invite_codes')
      .update({
        active: false,
        used_by: userId,
        used_at: new Date().toISOString(),
      })
      .eq('id', inviteCode.id)
      .eq('active', true); // ⚡ CRÍTICO: Só atualizar se AINDA estiver ativo

    if (updateCodeError) {
      console.error('[VALIDATE-CODE] ⚠️  Erro ao marcar código como usado:', updateCodeError);
      // Retornar erro crítico - pode indicar race condition
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao processar código. Outro utilizador pode ter usado este código.',
        } as ValidateCodeResponse,
        { status: 409 }
      );
    }
    
    console.log('[VALIDATE-CODE] ✅ Código marcado como usado com sucesso');

    // 7. Obter dados atualizados do user
    const { data: updatedUser } = await supabaseAdmin
      .from('users')
      .select('id, email, total_tokens, has_access, subscription_tier')
      .eq('id', userId)
      .single();
      
    const { data: coinProfile } = await supabaseAdmin
      .from('duacoin_profiles')
      .select('balance')
      .eq('user_id', userId)
      .single();

    // 8. Retornar sucesso
    return NextResponse.json(
      {
        success: true,
        message: `🎉 Acesso concedido! 150 créditos + 5000 tokens + 1000 DUA coins adicionados. Verifique seu email para o link de acesso.`,
        user: updatedUser ? {
          ...updatedUser,
          dua_coins: coinProfile?.balance || 0,
        } : undefined,
      } as ValidateCodeResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Erro inesperado em /api/validate-code:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor. Tente novamente mais tarde.',
      } as ValidateCodeResponse,
      { status: 500 }
    );
  }
}
