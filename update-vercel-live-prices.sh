#!/bin/bash
# Script para atualizar Price IDs LIVE na Vercel

set -e

echo "🔄 ATUALIZANDO PRICE IDs LIVE NA VERCEL..."
echo ""

# Carregar variáveis
source stripe-live-products.env

# Remover Price IDs antigos (test mode)
echo "🗑️  Removendo Price IDs de test mode..."
vercel env rm NEXT_PUBLIC_STRIPE_PRICE_STARTER production --yes || true
vercel env rm NEXT_PUBLIC_STRIPE_PRICE_BASIC production --yes || true
vercel env rm NEXT_PUBLIC_STRIPE_PRICE_STANDARD production --yes || true
vercel env rm NEXT_PUBLIC_STRIPE_PRICE_PLUS production --yes || true
vercel env rm NEXT_PUBLIC_STRIPE_PRICE_PRO production --yes || true
vercel env rm NEXT_PUBLIC_STRIPE_PRICE_PREMIUM production --yes || true

echo ""
echo "✅ Price IDs antigos removidos"
echo ""
echo "📦 Adicionando Price IDs LIVE..."
echo ""

# Adicionar novos Price IDs (live mode)
vercel env add NEXT_PUBLIC_STRIPE_PRICE_STARTER production <<< "$NEXT_PUBLIC_STRIPE_PRICE_STARTER"
vercel env add NEXT_PUBLIC_STRIPE_PRICE_BASIC production <<< "$NEXT_PUBLIC_STRIPE_PRICE_BASIC"
vercel env add NEXT_PUBLIC_STRIPE_PRICE_STANDARD production <<< "$NEXT_PUBLIC_STRIPE_PRICE_STANDARD"
vercel env add NEXT_PUBLIC_STRIPE_PRICE_PLUS production <<< "$NEXT_PUBLIC_STRIPE_PRICE_PLUS"
vercel env add NEXT_PUBLIC_STRIPE_PRICE_PRO production <<< "$NEXT_PUBLIC_STRIPE_PRICE_PRO"
vercel env add NEXT_PUBLIC_STRIPE_PRICE_PREMIUM production <<< "$NEXT_PUBLIC_STRIPE_PRICE_PREMIUM"

echo ""
echo "✅ TODOS OS PRICE IDs LIVE FORAM ATUALIZADOS!"
echo ""
echo "🔄 PRÓXIMO PASSO: Fazer redeploy"
echo "   vercel --prod"
echo ""
