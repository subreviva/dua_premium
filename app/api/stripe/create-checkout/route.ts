import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_API_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Mapeamento dos packs para Price IDs
const PRICE_IDS: Record<string, string> = {
  starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || 'price_1SS4NxAz1k4yaMdfsYj53Kd6',
  basic: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC || 'price_1SS4QIAz1k4yaMdfO06oF1Du',
  standard: process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD || 'price_1SS4QJAz1k4yaMdfv16jJ59g',
  plus: process.env.NEXT_PUBLIC_STRIPE_PRICE_PLUS || 'price_1SS4QLAz1k4yaMdfuCEdzNip',
  pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 'price_1SS4QMAz1k4yaMdfnPW6KsCx',
  premium: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || 'price_1SS4QNAz1k4yaMdf2CqhVN6F',
};

const CREDITS_MAP: Record<string, number> = {
  starter: 170,
  basic: 570,
  standard: 1250,
  plus: 2650,
  pro: 4700,
  premium: 6250,
};

export async function POST(request: NextRequest) {
  try {
    const { packId, userId } = await request.json();

    if (!packId || !userId) {
      return NextResponse.json(
        { error: 'Pack ID e User ID são obrigatórios' },
        { status: 400 }
      );
    }

    if (!PRICE_IDS[packId]) {
      return NextResponse.json(
        { error: 'Pack ID inválido' },
        { status: 400 }
      );
    }

    // Buscar email do usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    console.log(`💳 Criando checkout para ${userData.email} - Pack ${packId}`);

    // Criar Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICE_IDS[packId],
          quantity: 1,
        },
      ],
      customer_email: userData.email,
      metadata: {
        userId: userId,
        credits: CREDITS_MAP[packId].toString(),
        tierName: packId,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/comprar/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/comprar/cancel`,
    });

    console.log(`✅ Checkout criado: ${session.id}`);
    console.log(`   URL: ${session.url}`);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error: any) {
    console.error('❌ Erro ao criar checkout:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar checkout' },
      { status: 500 }
    );
  }
}
