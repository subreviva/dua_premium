import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase com service role para inserir dados
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email } = body;

    // Validação básica
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar tamanho do nome
    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: 'Nome deve ter entre 2 e 100 caracteres' },
        { status: 400 }
      );
    }

    // Coletar informações de tracking
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Extrair UTM parameters da URL se existirem
    const url = new URL(request.url);
    const utmSource = url.searchParams.get('utm_source');
    const utmMedium = url.searchParams.get('utm_medium');
    const utmCampaign = url.searchParams.get('utm_campaign');

    // Verificar se email já existe
    const { data: existing, error: checkError } = await supabase
      .from('early_access_subscribers')
      .select('id, status, subscribed_at')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json(
        {
          message: 'Este email já está na lista de espera!',
          already_subscribed: true,
          subscribed_at: existing.subscribed_at,
          status: existing.status
        },
        { status: 200 }
      );
    }

    // Inserir novo subscriber
    const { data, error } = await supabase
      .from('early_access_subscribers')
      .insert({
        email: email.toLowerCase(),
        name: name.trim(),
        status: 'waiting',
        source: 'website',
        ip_address: ipAddress,
        user_agent: userAgent,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        newsletter_consent: true,
        marketing_consent: true,
        priority_level: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar subscriber:', error);
      
      // Se for erro de duplicado, retornar mensagem amigável
      if (error.code === '23505') {
        return NextResponse.json(
          {
            message: 'Este email já está na lista de espera!',
            already_subscribed: true
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: 'Erro ao registar na lista de espera' },
        { status: 500 }
      );
    }

    // Obter total de subscribers
    const { data: stats } = await supabase
      .rpc('count_early_access_subscribers');

    const totalSubscribers = stats?.[0]?.total || 0;
    const position = totalSubscribers;

    // Enviar emails (cliente + admin) - não bloquear resposta se falhar
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/early-access/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          position: position,
          subscribedAt: data.subscribed_at,
          source: data.source,
          utmSource: utmSource || 'direct',
          utmMedium: utmMedium,
          utmCampaign: utmCampaign,
          ipAddress: ipAddress,
          userAgent: userAgent
        })
      });
      console.log('✅ Emails enviados (cliente + admin)');
    } catch (emailError) {
      console.warn('⚠️  Emails não enviados:', emailError);
      // Não falhar a subscrição se email falhar
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Registado com sucesso na lista de espera!',
        subscriber: {
          id: data.id,
          email: data.email,
          name: data.name,
          position: position,
          subscribed_at: data.subscribed_at
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro no endpoint de subscrição:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET: Verificar se email já está na lista
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('early_access_subscribers')
      .select('id, status, subscribed_at')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !data) {
      return NextResponse.json(
        { subscribed: false },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        subscribed: true,
        status: data.status,
        subscribed_at: data.subscribed_at
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao verificar subscriber:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
