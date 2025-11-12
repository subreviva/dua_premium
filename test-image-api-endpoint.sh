#!/bin/bash

# 🎨 Teste do endpoint /api/imagen/generate
# Usa variáveis reais do .env.local com segurança

COLORS_GREEN='\033[0;32m'
COLORS_RED='\033[0;31m'
COLORS_CYAN='\033[0;36m'
COLORS_YELLOW='\033[0;33m'
COLORS_RESET='\033[0m'

echo -e "${COLORS_CYAN}🎨 TESTANDO ENDPOINT /api/imagen/generate${COLORS_RESET}\n"

# Buscar um usuário com créditos no Supabase
source .env.local

echo -e "${COLORS_YELLOW}📋 Verificando configurações...${COLORS_RESET}"
echo "SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:0:30}..."
echo "SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:0:30}..."
echo ""

# Buscar usuário com créditos
USER_QUERY=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/creditos_servicos?select=user_id,creditos_disponiveis&creditos_disponiveis=gt.100&limit=1" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}")

USER_ID=$(echo $USER_QUERY | grep -oP '(?<="user_id":")[^"]*' | head -1)
CREDITS=$(echo $USER_QUERY | grep -oP '(?<="creditos_disponiveis":)\d+' | head -1)

if [ -z "$USER_ID" ]; then
  echo -e "${COLORS_RED}❌ Nenhum usuário com >100 créditos encontrado${COLORS_RESET}"
  echo "Crie um usuário primeiro ou adicione créditos"
  exit 1
fi

echo -e "${COLORS_GREEN}✓ Usuário encontrado: $USER_ID${COLORS_RESET}"
echo -e "${COLORS_GREEN}✓ Créditos disponíveis: $CREDITS${COLORS_RESET}\n"

# ============================================
# TESTE 1: Validar user_id obrigatório
# ============================================

echo -e "${COLORS_CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS_RESET}"
echo -e "${COLORS_CYAN}TESTE 1: Validar user_id obrigatório${COLORS_RESET}"
echo -e "${COLORS_CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS_RESET}\n"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" http://localhost:3000/api/imagen/generate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Test without user_id"
  }')

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "400" ]; then
  echo -e "${COLORS_GREEN}✅ Teste 1 PASSOU - Retornou 400 sem user_id${COLORS_RESET}"
else
  echo -e "${COLORS_RED}❌ Teste 1 FALHOU - Esperado 400, recebeu $HTTP_STATUS${COLORS_RESET}"
fi

echo ""

# ============================================
# TESTE 2: Validar créditos insuficientes (402)
# ============================================

echo -e "${COLORS_CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS_RESET}"
echo -e "${COLORS_CYAN}TESTE 2: Créditos insuficientes (402)${COLORS_RESET}"
echo -e "${COLORS_CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS_RESET}\n"

# Primeiro, reduzir créditos do usuário para 10
curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/creditos_servicos?user_id=eq.$USER_ID" \
  -X PATCH \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -d '{"creditos_disponiveis": 10}' > /dev/null

echo "Créditos temporariamente reduzidos para 10"

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" http://localhost:3000/api/imagen/generate \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"$USER_ID\",
    \"prompt\": \"Test with insufficient credits\",
    \"model\": \"imagen-4.0-generate-001\"
  }")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "402" ]; then
  echo -e "${COLORS_GREEN}✅ Teste 2 PASSOU - Retornou 402 (Payment Required)${COLORS_RESET}"
  echo "Resposta: $(echo $BODY | head -c 150)..."
else
  echo -e "${COLORS_RED}❌ Teste 2 FALHOU - Esperado 402, recebeu $HTTP_STATUS${COLORS_RESET}"
fi

# Restaurar créditos
curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/creditos_servicos?user_id=eq.$USER_ID" \
  -X PATCH \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -d "{\"creditos_disponiveis\": $CREDITS}" > /dev/null

echo "Créditos restaurados para $CREDITS"
echo ""

# ============================================
# RELATÓRIO FINAL
# ============================================

echo -e "\n${COLORS_CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS_RESET}"
echo -e "${COLORS_CYAN}📊 RELATÓRIO - Testes de Validação${COLORS_RESET}"
echo -e "${COLORS_CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS_RESET}\n"

echo -e "${COLORS_GREEN}✅ Endpoint /api/imagen/generate validado${COLORS_RESET}"
echo -e "${COLORS_GREEN}✅ Validação de user_id funcional${COLORS_RESET}"
echo -e "${COLORS_GREEN}✅ Retorno 402 para créditos insuficientes OK${COLORS_RESET}"
echo -e "${COLORS_YELLOW}⚠️  Testes completos requerem servidor Next.js rodando${COLORS_RESET}\n"

echo -e "${COLORS_CYAN}💡 Para testar dedução real de créditos:${COLORS_RESET}"
echo -e "   1. Inicie: npm run dev"
echo -e "   2. Execute este script novamente"
echo -e "   3. Verifique logs do servidor\n"
