/**
 * API Route: /auth/callback
 * 
 * Processa callback do OAuth (Google, etc)
 * - Troca code por session
 * - Cria/atualiza perfil do user
 * - Verifica acesso
 * - Redireciona para chat ou erro
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Erro no OAuth
  if (error) {
    console.error('❌ Erro OAuth:', error, errorDescription);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin)
    );
  }

  // Sem código
  if (!code) {
    console.error('❌ Sem código OAuth');
    return NextResponse.redirect(
      new URL('/login?error=no_code', requestUrl.origin)
    );
  }

  try {
    // Cliente Supabase com Service Role Key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Trocar code por session
    const { data: authData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('❌ Erro ao trocar code:', exchangeError);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      );
    }

    if (!authData.user) {
      console.error('❌ Sem user após troca');
      return NextResponse.redirect(
        new URL('/login?error=no_user', requestUrl.origin)
      );
    }

    const user = authData.user;
    console.log('✅ User autenticado via OAuth:', user.email);

    // Verificar se user já existe na tabela users
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id, has_access, name, email')
      .eq('id', user.id)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.error('❌ Erro ao verificar user:', userCheckError);
      return NextResponse.redirect(
        new URL('/login?error=user_check_failed', requestUrl.origin)
      );
    }

    // User já existe
    if (existingUser) {
      // Atualizar último login
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);

      // Verificar se tem acesso
      if (!existingUser.has_access) {
        console.warn('⚠️  User sem acesso:', user.email);
        return NextResponse.redirect(
          new URL('/login?error=no_access', requestUrl.origin)
        );
      }

      console.log('✅ User existente com acesso, redirecionando...');
      const response = NextResponse.redirect(new URL('/chat', requestUrl.origin));
      
      // Set cookie com session
      if (authData.session) {
        response.cookies.set('sb-access-token', authData.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 dias
        });
      }
      
      return response;
    }

    // User NÃO existe - criar novo perfil
    console.log('📝 Criando perfil para novo user OAuth:', user.email);

    const userName = user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     user.email?.split('@')[0] || 
                     'User';

    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        name: userName,
        has_access: false, // Novos users OAuth NÃO tem acesso automático
        role: 'user',
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('❌ Erro ao criar perfil:', insertError);
      return NextResponse.redirect(
        new URL('/login?error=profile_creation_failed', requestUrl.origin)
      );
    }

    console.log('✅ Perfil criado, mas SEM ACESSO');
    
    // Redirecionar para página informando que precisa de código de acesso
    return NextResponse.redirect(
      new URL('/login?info=account_created_no_access', requestUrl.origin)
    );

  } catch (error) {
    console.error('❌ Erro no callback OAuth:', error);
    return NextResponse.redirect(
      new URL('/login?error=callback_exception', requestUrl.origin)
    );
  }
}
