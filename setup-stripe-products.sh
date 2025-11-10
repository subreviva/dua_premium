#!/bin/bash

# 🎯 SETUP AUTOMÁTICO DE PRODUTOS STRIPE PARA DUA PREMIUM
# Este script cria os 6 pacotes de créditos no Stripe

echo "💳 Configurando produtos Stripe para DUA Premium..."
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════════════════
# PACK 1: STARTER - €5 / 170 créditos
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}[1/6]${NC} Criando produto: Pack Starter..."
STARTER_PRODUCT=$(stripe products create \
  --name="Pack Starter - 170 Créditos" \
  --description="170 créditos para usar nos estúdios de IA (música, imagem, vídeo)" \
  --metadata[credits]=170 \
  --metadata[pack_id]="starter" \
  -o json)

STARTER_PRODUCT_ID=$(echo $STARTER_PRODUCT | jq -r '.id')
echo -e "${GREEN}✓${NC} Produto criado: $STARTER_PRODUCT_ID"

STARTER_PRICE=$(stripe prices create \
  --product="$STARTER_PRODUCT_ID" \
  --unit-amount=500 \
  --currency=eur \
  --metadata[credits]=170 \
  --metadata[pack_id]="starter" \
  -o json)

STARTER_PRICE_ID=$(echo $STARTER_PRICE | jq -r '.id')
echo -e "${GREEN}✓${NC} Preço criado: $STARTER_PRICE_ID (€5.00)"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# PACK 2: BASIC - €10 / 350 créditos
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}[2/6]${NC} Criando produto: Pack Basic..."
BASIC_PRODUCT=$(stripe products create \
  --name="Pack Basic - 350 Créditos" \
  --description="350 créditos para usar nos estúdios de IA (música, imagem, vídeo)" \
  --metadata[credits]=350 \
  --metadata[pack_id]="basic" \
  -o json)

BASIC_PRODUCT_ID=$(echo $BASIC_PRODUCT | jq -r '.id')
echo -e "${GREEN}✓${NC} Produto criado: $BASIC_PRODUCT_ID"

BASIC_PRICE=$(stripe prices create \
  --product="$BASIC_PRODUCT_ID" \
  --unit-amount=1000 \
  --currency=eur \
  --metadata[credits]=350 \
  --metadata[pack_id]="basic" \
  -o json)

BASIC_PRICE_ID=$(echo $BASIC_PRICE | jq -r '.id')
echo -e "${GREEN}✓${NC} Preço criado: $BASIC_PRICE_ID (€10.00)"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# PACK 3: STANDARD - €15 / 550 créditos (+10% bônus)
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}[3/6]${NC} Criando produto: Pack Standard..."
STANDARD_PRODUCT=$(stripe products create \
  --name="Pack Standard - 550 Créditos" \
  --description="550 créditos (+10% bônus) para usar nos estúdios de IA" \
  --metadata[credits]=550 \
  --metadata[pack_id]="standard" \
  --metadata[bonus]="10%" \
  -o json)

STANDARD_PRODUCT_ID=$(echo $STANDARD_PRODUCT | jq -r '.id')
echo -e "${GREEN}✓${NC} Produto criado: $STANDARD_PRODUCT_ID"

STANDARD_PRICE=$(stripe prices create \
  --product="$STANDARD_PRODUCT_ID" \
  --unit-amount=1500 \
  --currency=eur \
  --metadata[credits]=550 \
  --metadata[pack_id]="standard" \
  -o json)

STANDARD_PRICE_ID=$(echo $STANDARD_PRICE | jq -r '.id')
echo -e "${GREEN}✓${NC} Preço criado: $STANDARD_PRICE_ID (€15.00)"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# PACK 4: PLUS - €30 / 1150 créditos (+15% bônus)
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}[4/6]${NC} Criando produto: Pack Plus..."
PLUS_PRODUCT=$(stripe products create \
  --name="Pack Plus - 1150 Créditos" \
  --description="1150 créditos (+15% bônus) para usar nos estúdios de IA" \
  --metadata[credits]=1150 \
  --metadata[pack_id]="plus" \
  --metadata[bonus]="15%" \
  -o json)

PLUS_PRODUCT_ID=$(echo $PLUS_PRODUCT | jq -r '.id')
echo -e "${GREEN}✓${NC} Produto criado: $PLUS_PRODUCT_ID"

PLUS_PRICE=$(stripe prices create \
  --product="$PLUS_PRODUCT_ID" \
  --unit-amount=3000 \
  --currency=eur \
  --metadata[credits]=1150 \
  --metadata[pack_id]="plus" \
  -o json)

PLUS_PRICE_ID=$(echo $PLUS_PRICE | jq -r '.id')
echo -e "${GREEN}✓${NC} Preço criado: $PLUS_PRICE_ID (€30.00)"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# PACK 5: PRO - €60 / 2400 créditos (+20% bônus)
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}[5/6]${NC} Criando produto: Pack Pro..."
PRO_PRODUCT=$(stripe products create \
  --name="Pack Pro - 2400 Créditos" \
  --description="2400 créditos (+20% bônus) para usar nos estúdios de IA" \
  --metadata[credits]=2400 \
  --metadata[pack_id]="pro" \
  --metadata[bonus]="20%" \
  -o json)

PRO_PRODUCT_ID=$(echo $PRO_PRODUCT | jq -r '.id')
echo -e "${GREEN}✓${NC} Produto criado: $PRO_PRODUCT_ID"

PRO_PRICE=$(stripe prices create \
  --product="$PRO_PRODUCT_ID" \
  --unit-amount=6000 \
  --currency=eur \
  --metadata[credits]=2400 \
  --metadata[pack_id]="pro" \
  -o json)

PRO_PRICE_ID=$(echo $PRO_PRICE | jq -r '.id')
echo -e "${GREEN}✓${NC} Preço criado: $PRO_PRICE_ID (€60.00)"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# PACK 6: PREMIUM - €150 / 6250 créditos (+25% bônus)
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${BLUE}[6/6]${NC} Criando produto: Pack Premium..."
PREMIUM_PRODUCT=$(stripe products create \
  --name="Pack Premium - 6250 Créditos" \
  --description="6250 créditos (+25% bônus) para usar nos estúdios de IA" \
  --metadata[credits]=6250 \
  --metadata[pack_id]="premium" \
  --metadata[bonus]="25%" \
  -o json)

PREMIUM_PRODUCT_ID=$(echo $PREMIUM_PRODUCT | jq -r '.id')
echo -e "${GREEN}✓${NC} Produto criado: $PREMIUM_PRODUCT_ID"

PREMIUM_PRICE=$(stripe prices create \
  --product="$PREMIUM_PRODUCT_ID" \
  --unit-amount=15000 \
  --currency=eur \
  --metadata[credits]=6250 \
  --metadata[pack_id]="premium" \
  -o json)

PREMIUM_PRICE_ID=$(echo $PREMIUM_PRICE | jq -r '.id')
echo -e "${GREEN}✓${NC} Preço criado: $PREMIUM_PRICE_ID (€150.00)"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# CRIAR ARQUIVO .ENV COM OS IDs
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${YELLOW}📝 Criando arquivo de configuração...${NC}"

cat > stripe-products.env <<EOF
# ═══════════════════════════════════════════════════════════════════════════
# STRIPE PRODUCTS - DUA PREMIUM CREDIT PACKS
# ═══════════════════════════════════════════════════════════════════════════
# Gerado automaticamente em: $(date)

# PACK 1: Starter (€5 / 170 créditos)
STRIPE_PRICE_STARTER=$STARTER_PRICE_ID
STRIPE_PRODUCT_STARTER=$STARTER_PRODUCT_ID

# PACK 2: Basic (€10 / 350 créditos)
STRIPE_PRICE_BASIC=$BASIC_PRICE_ID
STRIPE_PRODUCT_BASIC=$BASIC_PRODUCT_ID

# PACK 3: Standard (€15 / 550 créditos)
STRIPE_PRICE_STANDARD=$STANDARD_PRICE_ID
STRIPE_PRODUCT_STANDARD=$STANDARD_PRODUCT_ID

# PACK 4: Plus (€30 / 1150 créditos)
STRIPE_PRICE_PLUS=$PLUS_PRICE_ID
STRIPE_PRODUCT_PLUS=$PLUS_PRODUCT_ID

# PACK 5: Pro (€60 / 2400 créditos)
STRIPE_PRICE_PRO=$PRO_PRICE_ID
STRIPE_PRODUCT_PRO=$PRO_PRODUCT_ID

# PACK 6: Premium (€150 / 6250 créditos)
STRIPE_PRICE_PREMIUM=$PREMIUM_PRICE_ID
STRIPE_PRODUCT_PREMIUM=$PREMIUM_PRODUCT_ID
EOF

echo -e "${GREEN}✓${NC} Arquivo criado: stripe-products.env"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# RESUMO FINAL
# ═══════════════════════════════════════════════════════════════════════════
echo -e "${GREEN}══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ TODOS OS PRODUTOS CRIADOS COM SUCESSO!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📋 RESUMO DOS PRODUTOS:${NC}"
echo ""
echo "1. Pack Starter    - €5.00   → 170 créditos   (Price ID: $STARTER_PRICE_ID)"
echo "2. Pack Basic      - €10.00  → 350 créditos   (Price ID: $BASIC_PRICE_ID)"
echo "3. Pack Standard   - €15.00  → 550 créditos   (Price ID: $STANDARD_PRICE_ID)"
echo "4. Pack Plus       - €30.00  → 1150 créditos  (Price ID: $PLUS_PRICE_ID)"
echo "5. Pack Pro        - €60.00  → 2400 créditos  (Price ID: $PRO_PRICE_ID)"
echo "6. Pack Premium    - €150.00 → 6250 créditos  (Price ID: $PREMIUM_PRICE_ID)"
echo ""
echo -e "${YELLOW}📝 PRÓXIMOS PASSOS:${NC}"
echo ""
echo "1. Adicionar os Price IDs no arquivo .env.local:"
echo "   cp stripe-products.env .env.local"
echo ""
echo "2. Adicionar as mesmas variáveis na Vercel:"
echo "   vercel env add < stripe-products.env"
echo ""
echo "3. Configurar webhook do Stripe:"
echo "   stripe listen --forward-to localhost:3000/api/stripe/webhook"
echo ""
echo "4. Atualizar app/comprar/page.tsx com os Price IDs corretos"
echo ""
echo -e "${GREEN}🎉 Setup completo!${NC}"
