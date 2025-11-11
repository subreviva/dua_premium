#!/bin/bash
# Script para configurar Stripe em LIVE MODE
# IMPORTANTE: Executar DEPOIS de ativar live mode no Stripe Dashboard

set -e

echo "🚀 CONFIGURANDO STRIPE EM LIVE MODE"
echo ""
echo "⚠️  CERTIFIQUE-SE QUE:"
echo "   1. Live mode está ATIVADO no Stripe Dashboard"
echo "   2. Você tem acesso às chaves live (sk_live_...)"
echo ""
read -p "Continuar? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelado"
    exit 1
fi

echo ""
echo "📦 Criando 6 pacotes de créditos em LIVE MODE..."
echo ""

# Pacote 1: Starter - €5 / 170 créditos
echo "1/6 Criando Starter (€5 / 170 créditos)..."
PRODUCT_STARTER=$(stripe products create --name="Starter" --description="170 créditos DUA" --format=json | jq -r '.id')
PRICE_STARTER=$(stripe prices create --product=$PRODUCT_STARTER --unit-amount=500 --currency=eur --format=json | jq -r '.id')
echo "   Product: $PRODUCT_STARTER"
echo "   Price: $PRICE_STARTER"
echo ""

# Pacote 2: Basic - €15 / 570 créditos
echo "2/6 Criando Basic (€15 / 570 créditos)..."
PRODUCT_BASIC=$(stripe products create --name="Basic" --description="570 créditos DUA" --format=json | jq -r '.id')
PRICE_BASIC=$(stripe prices create --product=$PRODUCT_BASIC --unit-amount=1500 --currency=eur --format=json | jq -r '.id')
echo "   Product: $PRODUCT_BASIC"
echo "   Price: $PRICE_BASIC"
echo ""

# Pacote 3: Standard - €30 / 1250 créditos
echo "3/6 Criando Standard (€30 / 1250 créditos)..."
PRODUCT_STANDARD=$(stripe products create --name="Standard" --description="1250 créditos DUA" --format=json | jq -r '.id')
PRICE_STANDARD=$(stripe prices create --product=$PRODUCT_STANDARD --unit-amount=3000 --currency=eur --format=json | jq -r '.id')
echo "   Product: $PRODUCT_STANDARD"
echo "   Price: $PRICE_STANDARD"
echo ""

# Pacote 4: Plus - €60 / 2650 créditos
echo "4/6 Criando Plus (€60 / 2650 créditos)..."
PRODUCT_PLUS=$(stripe products create --name="Plus" --description="2650 créditos DUA" --format=json | jq -r '.id')
PRICE_PLUS=$(stripe prices create --product=$PRODUCT_PLUS --unit-amount=6000 --currency=eur --format=json | jq -r '.id')
echo "   Product: $PRODUCT_PLUS"
echo "   Price: $PRICE_PLUS"
echo ""

# Pacote 5: Pro - €100 / 4700 créditos
echo "5/6 Criando Pro (€100 / 4700 créditos)..."
PRODUCT_PRO=$(stripe products create --name="Pro" --description="4700 créditos DUA" --format=json | jq -r '.id')
PRICE_PRO=$(stripe prices create --product=$PRODUCT_PRO --unit-amount=10000 --currency=eur --format=json | jq -r '.id')
echo "   Product: $PRODUCT_PRO"
echo "   Price: $PRICE_PRO"
echo ""

# Pacote 6: Premium - €150 / 6250 créditos
echo "6/6 Criando Premium (€150 / 6250 créditos)..."
PRODUCT_PREMIUM=$(stripe products create --name="Premium" --description="6250 créditos DUA" --format=json | jq -r '.id')
PRICE_PREMIUM=$(stripe prices create --product=$PRODUCT_PREMIUM --unit-amount=15000 --currency=eur --format=json | jq -r '.id')
echo "   Product: $PRODUCT_PREMIUM"
echo "   Price: $PRICE_PREMIUM"
echo ""

# Criar arquivo com as variáveis
echo "💾 Salvando Price IDs..."
cat > stripe-live-products.env <<EOF
# Stripe Live Mode Price IDs
# Gerado em: $(date)

NEXT_PUBLIC_STRIPE_PRICE_STARTER=$PRICE_STARTER
NEXT_PUBLIC_STRIPE_PRICE_BASIC=$PRICE_BASIC
NEXT_PUBLIC_STRIPE_PRICE_STANDARD=$PRICE_STANDARD
NEXT_PUBLIC_STRIPE_PRICE_PLUS=$PRICE_PLUS
NEXT_PUBLIC_STRIPE_PRICE_PRO=$PRICE_PRO
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM=$PRICE_PREMIUM

# Produtos (para referência)
STRIPE_PRODUCT_STARTER=$PRODUCT_STARTER
STRIPE_PRODUCT_BASIC=$PRODUCT_BASIC
STRIPE_PRODUCT_STANDARD=$PRODUCT_STANDARD
STRIPE_PRODUCT_PLUS=$PRODUCT_PLUS
STRIPE_PRODUCT_PRO=$PRODUCT_PRO
STRIPE_PRODUCT_PREMIUM=$PRODUCT_PREMIUM
EOF

echo ""
echo "✅ PRODUTOS CRIADOS EM LIVE MODE!"
echo ""
echo "📋 Price IDs salvos em: stripe-live-products.env"
echo ""
echo "🔄 PRÓXIMO PASSO: Atualizar variáveis na Vercel"
echo ""
echo "Execute:"
echo "   source stripe-live-products.env"
echo "   ./update-vercel-live-prices.sh"
echo ""
