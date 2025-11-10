import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

// Webhook secret para validar requests
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Supabase com service role (bypass RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Signature header missing' },
        { status: 400 }
      );
    }

    // Verificar assinatura do webhook
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('⚠️  Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Processar evento
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extrair metadata
      const userId = session.metadata?.userId;
      const credits = parseInt(session.metadata?.credits || '0');
      const tierName = session.metadata?.tierName;

      if (!userId || !credits) {
        console.error('❌ Metadata inválida:', session.metadata);
        return NextResponse.json(
          { error: 'Invalid metadata' },
          { status: 400 }
        );
      }

      console.log(`💰 Pagamento recebido: ${credits} créditos para user ${userId}`);

      // Adicionar créditos usando RPC function
      const { data, error } = await supabase.rpc('add_servicos_credits', {
        p_user_id: userId,
        p_amount: credits,
        p_transaction_type: 'purchase',
        p_description: `Compra de pacote ${tierName}`,
        p_metadata: JSON.stringify({
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent,
          amount_total: session.amount_total,
          currency: session.currency,
          tier: tierName,
          timestamp: new Date().toISOString(),
        }),
      });

      if (error) {
        console.error('❌ Erro ao adicionar créditos:', error);
        return NextResponse.json(
          { error: 'Failed to add credits' },
          { status: 500 }
        );
      }

      const result = typeof data === 'string' ? JSON.parse(data) : data;

      console.log(`✅ Créditos adicionados: ${result.balance_before} → ${result.balance_after}`);
      console.log(`📝 Transaction ID: ${result.transaction_id}`);

      return NextResponse.json({ 
        received: true,
        credits_added: credits,
        transaction_id: result.transaction_id,
      });
    }

    // Outros tipos de eventos (opcional)
    console.log(`⚙️  Evento ignorado: ${event.type}`);

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('❌ Erro no webhook:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Configuração para aceitar raw body (necessário para verificar assinatura)
export const runtime = 'nodejs';
