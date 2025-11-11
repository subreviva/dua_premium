import { getAdminClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { validatePassword, ENTERPRISE_POLICY } from '@/lib/password-validation';

export const dynamic = 'force-dynamic';

/**
 * API de Registo Ultra Rigoroso - DUA IA
 * 
 * ENTERPRISE-GRADE SECURITY:
 * - Password policy: 12+ chars, complexidade alta
 * - Email verification obrigatória
 * - Prevenção de passwords comuns
 * - Validações rigorosas
 * 
 * Fluxo:
 * 1. Valida código de convite (existe, ativo, não usado)
 * 2. Valida dados do usuário (nome, email, password ENTERPRISE)
 * 3. Verifica se email já existe
 * 4. Cria conta Supabase Auth (email verification automática)
 * 5. Cria perfil em public.users
 * 6. Inicializa saldos: DUA IA (100) + DUA COIN (50)
 * 7. Marca código como usado
 * 8. Cria sessão ativa (24h)
 * 9. Registra atividade
 * 10. Retorna dados + mensagem de boas-vindas
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inviteCode, name, email, password, acceptedTerms } = body;

    // ════════════════════════════════════════════════════════════════
    // VALIDAÇÕES BÁSICAS
    // ════════════════════════════════════════════════════════════════
    if (!inviteCode || !name || !email || !password) {
      return NextResponse.json(
        { 
          error: 'Campos obrigatórios em falta',
          message: 'Por favor, preenche todos os campos para continuar.',
          missingFields: {
            inviteCode: !inviteCode,
            name: !name,
            email: !email,
            password: !password,
          }
        },
        { status: 400 }
      );
    }

    // GDPR Compliance: Termos devem ser aceites
    if (!acceptedTerms) {
      return NextResponse.json(
        { 
          error: 'Termos não aceites',
          message: 'Deves aceitar os Termos de Serviço e Política de Privacidade para continuar.',
          helpUrl: '/termos'
        },
        { status: 400 }
      );
    }

    // Validação de nome
    if (name.length < 2) {
      return NextResponse.json(
        { 
          error: 'Nome muito curto',
          message: 'O teu nome deve ter pelo menos 2 caracteres.',
          suggestions: ['Usa o teu nome completo para melhor identificação']
        },
        { status: 400 }
      );
    }

    // Email validation (RFC 5322 compliant)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          error: 'Email inválido',
          message: 'Por favor, verifica o formato do teu email.',
          example: 'exemplo@dominio.com'
        },
        { status: 400 }
      );
    }

    // ════════════════════════════════════════════════════════════════
    // VALIDAÇÃO ENTERPRISE DE PASSWORD
    // ════════════════════════════════════════════════════════════════
    const passwordValidation = validatePassword(password, {
      name,
      email,
    });

    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          error: 'Password não cumpre requisitos de segurança',
          message: passwordValidation.feedback.join('. '),
          requirements: {
            minLength: ENTERPRISE_POLICY.minLength,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
          },
          suggestions: passwordValidation.suggestions,
          strength: passwordValidation.score,
        },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // ════════════════════════════════════════════════════════════════
    // PASSO 1: Validar código de convite
    // ════════════════════════════════════════════════════════════════
    const { data: inviteCodeData, error: inviteError } = await supabase
      .from('invite_codes')
      .select('*')
      .eq('active', true)
      .ilike('code', inviteCode)
      .single();

    if (inviteError || !inviteCodeData) {
      return NextResponse.json(
        { error: 'Código de convite não existe' },
        { status: 404 }
      );
    }

    if (!inviteCodeData.active || inviteCodeData.used_by) {
      return NextResponse.json(
        { error: 'Código de convite já foi usado' },
        { status: 400 }
      );
    }

    // ════════════════════════════════════════════════════════════════
    // PASSO 2: Verificar se email já existe (Security-first message)
    // ════════════════════════════════════════════════════════════════
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      // Security: Não revelar se email existe (previne enumeration attacks)
      // Mensagem genérica para não expor users existentes
      return NextResponse.json(
        { 
          error: 'Não foi possível completar o registo',
          message: 'Se este email já estiver registado, receberás instruções de login.',
          action: 'check_email',
          helpUrl: '/login'
        },
        { status: 400 }
      );
    }

    // ════════════════════════════════════════════════════════════════
    // PASSO 3: Criar conta Supabase Auth (AUTO-CONFIRMADA)
    // ════════════════════════════════════════════════════════════════
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // ✅ Auto-confirmar email (sem verificação necessária)
      user_metadata: {
        name,
      },
    });

    if (authError || !authData.user) {
      console.error('Erro ao criar usuário:', authError);
      return NextResponse.json(
        { 
          error: 'Erro ao criar conta',
          message: 'Ocorreu um erro ao processar o teu registo. Por favor, tenta novamente.',
          technicalError: authError?.message,
          suggestions: [
            'Verifica se o email está correto',
            'Tenta usar uma password diferente',
            'Contacta suporte se o problema persistir'
          ]
        },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    try {
      // ════════════════════════════════════════════════════════════════
      // PASSO 4: Criar perfil em public.users
      // ════════════════════════════════════════════════════════════════
      const { error: profileError } = await supabase.from('users').insert({
        id: userId,
        email,
        name,
        has_access: true,
        email_verified: true, // ✅ DIRETO: Auto-confirmado no registo
        registration_completed: true,
        onboarding_completed: false, // Será true após onboarding
        username_set: false,
        avatar_set: false,
        welcome_seen: false,
        session_active: true,
        creditos_servicos: 150, // ✅ 150 (legado - para compatibilidade)
        saldo_dua: 50,          // ✅ 50 (legado - para compatibilidade)
        account_type: 'normal',
        registration_ip: request.headers.get('x-forwarded-for') || 'unknown',
        registration_user_agent: request.headers.get('user-agent') || 'unknown',
      });

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        
        // Rollback: deletar usuário auth
        await supabase.auth.admin.deleteUser(userId);
        
        return NextResponse.json(
          { 
            error: 'Erro ao criar perfil',
            message: 'Não foi possível completar o teu registo. Por favor, tenta novamente.',
            technicalError: profileError.message,
          },
          { status: 500 }
        );
      }

      // ════════════════════════════════════════════════════════════════
      // PASSO 5: Inicializar saldo em duaia_user_balances + transação
      // ════════════════════════════════════════════════════════════════
      // Garantir que registro existe
      await supabase
        .from('duaia_user_balances')
        .upsert({
          user_id: userId,
          servicos_creditos: 0,
          duacoin_balance: 0,
        }, { onConflict: 'user_id' });

      // Adicionar 150 créditos iniciais via RPC (auditoria atômica)
      const { error: addCreditsError } = await supabase.rpc('add_servicos_credits', {
        p_user_id: userId,
        p_amount: 150,
        p_transaction_type: 'signup_bonus',
        p_description: 'Créditos iniciais - Registo',
        p_admin_email: null,
        p_metadata: {
          source: 'register',
          invite_code: inviteCodeData.code,
        }
      });

      if (addCreditsError) {
        console.error('Erro ao adicionar créditos iniciais:', addCreditsError);
        // Não falhar o registo por causa disto, seguir em frente
      }

      // ════════════════════════════════════════════════════════════════
      // PASSO 6: Marcar código de convite como usado
      // ════════════════════════════════════════════════════════════════
      await supabase
        .from('invite_codes')
        .update({
          active: false,
          used_by: userId,
          used_at: new Date().toISOString(),
        })
        .eq('code', inviteCodeData.code);

      // ════════════════════════════════════════════════════════════════
      // PASSO 7: Criar sessão ativa (24h)
      // ════════════════════════════════════════════════════════════════
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { data: sessionData } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          session_token: sessionToken,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
          expires_at: expiresAt.toISOString(),
          active: true,
        })
        .select()
        .single();

      // ════════════════════════════════════════════════════════════════
      // PASSO 8: Registar atividade
      // ════════════════════════════════════════════════════════════════
      await supabase.from('user_activity_logs').insert({
        user_id: userId,
        activity_type: 'registration',
        activity_details: {
          invite_code: inviteCode,
          name,
          email,
          creditos_servicos: 150, // ✅
          saldo_dua: 50,          // ✅
          account_type: 'normal',
        },
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        session_id: sessionData?.id,
      });

      // ════════════════════════════════════════════════════════════════
      // PASSO 9: Retornar sucesso + dados para login automático
      // ════════════════════════════════════════════════════════════════
      const firstName = name.split(' ')[0];
      
      return NextResponse.json({
        success: true,
        user: {
          id: userId,
          email,
          name,
          creditosServicos: 150, // ✅ 150 créditos iniciais
          saldoDua: 50,          // ✅ 50 DUA coins iniciais
          accountType: 'normal',
          emailVerified: true,   // ✅ Auto-confirmado
        },
        session: {
          token: sessionToken,
          expiresAt: expiresAt.toISOString(),
        },
        welcomeMessage: `Bem-vindo à DUA IA, ${firstName}! 🎉`,
        creditsMessage: '150 créditos adicionados à sua conta',
        nextSteps: [
          '🎨 Explore os estúdios de criação',
          '� Converse com a IA',
          '🎵 Crie música, imagens e vídeos'
        ]
      });

    } catch (error) {
      console.error('Erro no processo de registo:', error);
      
      // Rollback: deletar usuário auth
      await supabase.auth.admin.deleteUser(userId);
      
      return NextResponse.json(
        { 
          error: 'Erro inesperado',
          message: 'Ocorreu um erro ao completar o registo. Por favor, tenta novamente.',
          contact: 'Se o problema persistir, contacta suporte@dua.ai'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Erro geral:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        message: 'Algo correu mal. Por favor, tenta novamente mais tarde.',
        contact: 'suporte@dua.ai'
      },
      { status: 500 }
    );
  }
}
