#!/bin/bash
# Script para adicionar variáveis de ambiente STRIPE na Vercel
# Todas as variáveis serão adicionadas em Production, Preview e Development

set -e

echo "🚀 Adicionando variáveis STRIPE na Vercel..."
echo ""

# Carregar variáveis do .env.local
source .env.local

# Adicionar STRIPE_API_KEY
echo "📦 Adicionando STRIPE_API_KEY..."
vercel env add STRIPE_API_KEY production <<< "$STRIPE_API_KEY"
vercel env add STRIPE_API_KEY preview <<< "$STRIPE_API_KEY"
vercel env add STRIPE_API_KEY development <<< "$STRIPE_API_KEY"

# Adicionar NEXT_PUBLIC_STRIPE_PRICE_STARTER
echo "📦 Adicionando NEXT_PUBLIC_STRIPE_PRICE_STARTER..."
vercel env add NEXT_PUBLIC_STRIPE_PRICE_STARTER production <<< "$NEXT_PUBLIC_STRIPE_PRICE_STARTER"
vercel env add NEXT_PUBLIC_STRIPE_PRICE_STARTER preview <<< "$NEXT_PUBLIC_STRIPE_PRICE_STARTER"
vercel env add NEXT_PUBLIC_STRIPE_PRICE_STARTER development <<< "$NEXT_PUBLIC_STRIPE_PRICE_STARTER"

# Adicionar NEXT_PUBLIC_STRIPE_PRICE_BASIC
echo "📦 Adicionando NEXT_PUBLIC_STRIPE_PRICE_BASIC..."
vercel env add NEXT_PUBLIC_STRIPE_PRICE_BASIC production <<< "$NEXT_PUBLIC_STRIPE_PRICE_BASIC"
vercel env add NEXT_PUBLIC_STRIPE_PRICE_BASIC preview <<< "$NEXT_PUBLIC_STRIPE_PRICE_BASIC"
vercel env add NEXT_PUBLIC_STRIPE_PRICE_BASIC development <<< "$NEXT_PUBLIC_STRIPE_PRICE_BASIC"

# Adicionar NEXT_PUBLIC_STRIPE_PRICE_STANDARD
echo "📦 Adicionando NEXT_PUBLIC_STRIPE_PRICE_STANDARD..."
vercel env add NEXT_PUBLIC_STRIPE_PRICE_STANDARD production <<< "$NEXT_PUBLIC_STRIPE_PRICE_STANDARD"
vercel env add NEXT_PUBLIC_STRIPE_PRICE_STANDARD preview <<< "$NEXT_PUBLIC_STRIPE_PRICE_STANDARD"
vercel env add NEXT_PUBLIC_STRIPE_PRICE_STANDARD development <<< "$NEXT_PUBLIC_STRIPE_PRICE_STANDARD"

# Adicionar NEXT_PUBLIC_STRIPE_PRICE_PLUS
echo "📦 Adicionando NEXT_PUBLIC_STRIPE_PRICE_PLUS..."
vercel env add NEXT_PUBLIC_STRIPE_PRICE_PLUS production <<< "$NEXT_PUBLIC_STRIPE_PRICE_PLUS"
vercel env add NEXT_PUBLIC_STRIPE_PRICE_PLUS preview <<< "$NEXT_PUBLIC_STRIPE_PRICE_PLUS"
vercel env add NEXT_PUBLIC_STRIPE_PRICE_PLUS development <<< "$NEXT_PUBLIC_STRIPE_PRICE_PLUS"

# Adicionar NEXT_PUBLIC_STRIPE_PRICE_PRO
echo "📦 Adicionando NEXT_PUBLIC_STRIPE_PRICE_PRO..."
vercel env add NEXT_PUBLIC_STRIPE_PRICE_PRO production <<< "$NEXT_PUBLIC_STRIPE_PRICE_PRO"
vercel env add NEXT_PUBLIC_STRIPE_PRICE_PRO preview <<< "$NEXT_PUBLIC_STRIPE_PRICE_PRO"
vercel env add NEXT_PUBLIC_STRIPE_PRICE_PRO development <<< "$NEXT_PUBLIC_STRIPE_PRICE_PRO"

# Adicionar NEXT_PUBLIC_STRIPE_PRICE_PREMIUM
echo "📦 Adicionando NEXT_PUBLIC_STRIPE_PRICE_PREMIUM..."
vercel env add NEXT_PUBLIC_STRIPE_PRICE_PREMIUM production <<< "$NEXT_PUBLIC_STRIPE_PRICE_PREMIUM"
vercel env add NEXT_PUBLIC_STRIPE_PRICE_PREMIUM preview <<< "$NEXT_PUBLIC_STRIPE_PRICE_PREMIUM"
vercel env add NEXT_PUBLIC_STRIPE_PRICE_PREMIUM development <<< "$NEXT_PUBLIC_STRIPE_PRICE_PREMIUM"

# Adicionar STRIPE_WEBHOOK_SECRET (se existir)
if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
  echo "📦 Adicionando STRIPE_WEBHOOK_SECRET..."
  vercel env add STRIPE_WEBHOOK_SECRET production <<< "$STRIPE_WEBHOOK_SECRET"
  vercel env add STRIPE_WEBHOOK_SECRET preview <<< "$STRIPE_WEBHOOK_SECRET"
  vercel env add STRIPE_WEBHOOK_SECRET development <<< "$STRIPE_WEBHOOK_SECRET"
fi

echo ""
echo "✅ TODAS AS VARIÁVEIS STRIPE FORAM ADICIONADAS NA VERCEL!"
echo ""
echo "🔄 Próximo passo: Fazer deploy"
echo "   vercel --prod"
