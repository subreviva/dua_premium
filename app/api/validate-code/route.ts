/**
 * API Route: /api/validate-code
 * 
 * Endpoint para validar código de convite e conceder acesso tipo Sora.
 * 
 * Fluxo:
 * 1. Recebe { code, email }
 * 2. Verifica se código existe e está ativo
 * 3. Cria/autentica user via Supabase Auth (magic link)
 * 4. Atualiza users.has_access = true e atribui créditos
 * 5. Marca invite_codes como usado
 * 6. Retorna sucesso ou erro
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { InviteCode, User } from '@/lib/supabase';

export const maxDuration = 30;

interface ValidateCodeRequest {
  code: string;
  email: string;
}

interface ValidateCodeResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    credits: number;
    has_access: boolean;
  };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Parse e validação do body
    const body: ValidateCodeRequest = await req.json();
    const { code, email } = body;

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
      console.error('Código não encontrado:', codeError);
      return NextResponse.json(
        {
          success: false,
          message: 'Código inválido ou já utilizado',
        } as ValidateCodeResponse,
        { status: 404 }
      );
    }

    // 3. Criar ou obter user via Supabase Auth
    // Tenta fazer sign in com magic link
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email.toLowerCase(),
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/chat`,
      },
    });

    if (authError) {
      console.error('Erro ao gerar magic link:', authError);
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao criar conta. Tente novamente.',
        } as ValidateCodeResponse,
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // 4. Atualizar ou criar registro em public.users
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
          credits: existingUser.credits + inviteCode.credits, // Adicionar créditos
          invite_code_used: code.toUpperCase(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Erro ao atualizar user:', updateError);
        return NextResponse.json(
          {
            success: false,
            message: 'Erro ao conceder acesso. Tente novamente.',
          } as ValidateCodeResponse,
          { status: 500 }
        );
      }
    } else {
      // User novo, criar registro
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email: email.toLowerCase(),
          has_access: true,
          credits: inviteCode.credits,
          invite_code_used: code.toUpperCase(),
        });

      if (insertError) {
        console.error('Erro ao criar user:', insertError);
        return NextResponse.json(
          {
            success: false,
            message: 'Erro ao criar conta. Tente novamente.',
          } as ValidateCodeResponse,
          { status: 500 }
        );
      }
    }

    // 5. Marcar código como usado
    const { error: updateCodeError } = await supabaseAdmin
      .from('invite_codes')
      .update({
        active: false,
        used_by: userId,
      })
      .eq('id', inviteCode.id);

    if (updateCodeError) {
      console.error('Erro ao marcar código como usado:', updateCodeError);
      // Não retornar erro aqui, pois o user já foi criado
    }

    // 6. Obter dados atualizados do user
    const { data: updatedUser } = await supabaseAdmin
      .from('users')
      .select('id, email, credits, has_access')
      .eq('id', userId)
      .single();

    // 7. Retornar sucesso
    return NextResponse.json(
      {
        success: true,
        message: `Acesso concedido! ${inviteCode.credits} créditos adicionados. Verifique seu email para o link de acesso.`,
        user: updatedUser || undefined,
      } as ValidateCodeResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro inesperado em /api/validate-code:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor. Tente novamente mais tarde.',
      } as ValidateCodeResponse,
      { status: 500 }
    );
  }
}
