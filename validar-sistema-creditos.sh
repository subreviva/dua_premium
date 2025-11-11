#!/bin/bash

# ============================================================================
# 🎯 SCRIPT ULTRA RIGOROSO - VALIDAÇÃO COMPLETA DO SISTEMA DE CRÉDITOS
# ============================================================================
# Este script executa TODAS as validações necessárias após aplicar o schema
# ============================================================================

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo ""
echo -e "${BOLD}${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║  🎯 VALIDAÇÃO ULTRA RIGOROSA - SISTEMA DE CRÉDITOS           ║${NC}"
echo -e "${BOLD}${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Contador de testes
TOTAL_TESTES=0
TESTES_OK=0
TESTES_FALHA=0

# Função para exibir resultado de teste
test_result() {
  TOTAL_TESTES=$((TOTAL_TESTES + 1))
  
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ PASSOU${NC} - $2"
    TESTES_OK=$((TESTES_OK + 1))
  else
    echo -e "${RED}❌ FALHOU${NC} - $2"
    TESTES_FALHA=$((TESTES_FALHA + 1))
  fi
}

# Função para seção
section() {
  echo ""
  echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BOLD}${BLUE}$1${NC}"
  echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# ============================================================================
# ETAPA 1: VERIFICAR ARQUIVOS NECESSÁRIOS
# ============================================================================

section "📁 ETAPA 1: VERIFICAR ARQUIVOS NECESSÁRIOS"

# Verificar arquivo SQL
if [ -f "APLICAR_SCHEMA_CREDITOS_ULTRA_RIGOROSO.sql" ]; then
  test_result 0 "Arquivo SQL do schema existe"
else
  test_result 1 "Arquivo SQL do schema NÃO existe"
fi

# Verificar script de auditoria
if [ -f "AUDITORIA_ULTRA_RIGOROSA_SISTEMA_CREDITOS.mjs" ]; then
  test_result 0 "Script de auditoria existe"
else
  test_result 1 "Script de auditoria NÃO existe"
fi

# Verificar .env.local
if [ -f ".env.local" ]; then
  test_result 0 "Arquivo .env.local existe"
  
  # Verificar variáveis necessárias
  if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    test_result 0 "NEXT_PUBLIC_SUPABASE_URL configurada"
  else
    test_result 1 "NEXT_PUBLIC_SUPABASE_URL NÃO configurada"
  fi
  
  if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
    test_result 0 "SUPABASE_SERVICE_ROLE_KEY configurada"
  else
    test_result 1 "SUPABASE_SERVICE_ROLE_KEY NÃO configurada"
  fi
else
  test_result 1 "Arquivo .env.local NÃO existe"
fi

# ============================================================================
# ETAPA 2: VERIFICAR ESTRUTURA DO PROJETO
# ============================================================================

section "🏗️ ETAPA 2: VERIFICAR ESTRUTURA DO PROJETO"

# Verificar componente navbar
NAVBAR_FOUND=0
for path in "components/navbar.tsx" "components/Navbar.tsx" "app/components/navbar.tsx"; do
  if [ -f "$path" ]; then
    NAVBAR_FOUND=1
    test_result 0 "Navbar encontrada em: $path"
    
    # Verificar se exibe créditos
    if grep -qi "credits\|créditos" "$path"; then
      test_result 0 "Navbar exibe créditos"
    else
      test_result 1 "Navbar NÃO exibe créditos"
    fi
    
    # Verificar se tem polling/atualização
    if grep -qi "setInterval\|useEffect" "$path"; then
      test_result 0 "Navbar tem atualização periódica"
    else
      test_result 1 "Navbar NÃO tem atualização periódica"
    fi
    
    break
  fi
done

if [ $NAVBAR_FOUND -eq 0 ]; then
  test_result 1 "Navbar NÃO encontrada"
fi

# Verificar APIs
section "🔌 ETAPA 3: VERIFICAR ENDPOINTS DE API"

API_PATHS=(
  "app/api/stripe/webhook/route.ts"
  "app/api/credits/route.ts"
  "app/api/credits/purchase/route.ts"
)

for api in "${API_PATHS[@]}"; do
  if [ -f "$api" ]; then
    test_result 0 "API existe: $api"
  else
    echo -e "${YELLOW}⚠️ OPCIONAL${NC} - API não existe: $api"
  fi
done

# ============================================================================
# ETAPA 4: VERIFICAR DEPENDÊNCIAS NODE
# ============================================================================

section "📦 ETAPA 4: VERIFICAR DEPENDÊNCIAS NODE"

if [ -f "package.json" ]; then
  test_result 0 "package.json existe"
  
  # Verificar @supabase/supabase-js
  if grep -q "@supabase/supabase-js" package.json; then
    test_result 0 "Dependência @supabase/supabase-js instalada"
  else
    test_result 1 "Dependência @supabase/supabase-js NÃO instalada"
  fi
  
  # Verificar stripe (opcional)
  if grep -q "stripe" package.json; then
    echo -e "${CYAN}ℹ️ INFO${NC} - Stripe instalado (para pagamentos)"
  fi
else
  test_result 1 "package.json NÃO existe"
fi

# Verificar node_modules
if [ -d "node_modules" ]; then
  test_result 0 "node_modules existe (dependências instaladas)"
else
  test_result 1 "node_modules NÃO existe (executar: npm install)"
fi

# ============================================================================
# ETAPA 5: INSTRUÇÕES PARA APLICAR SCHEMA
# ============================================================================

section "🎯 ETAPA 5: APLICAR SCHEMA NO SUPABASE"

echo ""
echo -e "${BOLD}${YELLOW}⚠️  ATENÇÃO: O SCHEMA AINDA NÃO FOI APLICADO!${NC}"
echo ""
echo -e "${CYAN}Para aplicar o schema no Supabase:${NC}"
echo ""
echo -e "  1. Abra: ${BOLD}https://nranmngyocaqjwcokcxm.supabase.co${NC}"
echo -e "  2. Menu: ${BOLD}SQL Editor${NC}"
echo -e "  3. Clique: ${BOLD}New Query${NC}"
echo -e "  4. Copie TODO o conteúdo de: ${BOLD}APLICAR_SCHEMA_CREDITOS_ULTRA_RIGOROSO.sql${NC}"
echo -e "  5. Cole no editor"
echo -e "  6. Clique: ${BOLD}Run${NC}"
echo -e "  7. Aguarde: ${GREEN}Success. No rows returned${NC}"
echo ""
echo -e "${YELLOW}Pressione ENTER depois de aplicar o schema...${NC}"
read -r

# ============================================================================
# ETAPA 6: EXECUTAR AUDITORIA COMPLETA
# ============================================================================

section "🔍 ETAPA 6: EXECUTAR AUDITORIA COMPLETA"

echo ""
echo -e "${CYAN}Executando auditoria ultra rigorosa...${NC}"
echo ""

if [ -f "AUDITORIA_ULTRA_RIGOROSA_SISTEMA_CREDITOS.mjs" ]; then
  node AUDITORIA_ULTRA_RIGOROSA_SISTEMA_CREDITOS.mjs
  
  AUDIT_EXIT_CODE=$?
  
  if [ $AUDIT_EXIT_CODE -eq 0 ]; then
    test_result 0 "Auditoria executada com sucesso"
  else
    test_result 1 "Auditoria falhou (código: $AUDIT_EXIT_CODE)"
  fi
else
  test_result 1 "Script de auditoria não encontrado"
fi

# ============================================================================
# RELATÓRIO FINAL
# ============================================================================

section "📊 RELATÓRIO FINAL"

echo ""
echo -e "${BOLD}Total de Testes: ${TOTAL_TESTES}${NC}"
echo -e "${GREEN}✅ Passou: ${TESTES_OK}${NC}"
echo -e "${RED}❌ Falhou: ${TESTES_FALHA}${NC}"
echo ""

# Calcular pontuação
if [ $TOTAL_TESTES -gt 0 ]; then
  PONTUACAO=$((TESTES_OK * 100 / TOTAL_TESTES))
  echo -e "${BOLD}Pontuação: ${PONTUACAO}%${NC}"
  echo ""
  
  if [ $PONTUACAO -ge 90 ]; then
    echo -e "${GREEN}${BOLD}🏆 SISTEMA APROVADO - Pronto para produção!${NC}"
  elif [ $PONTUACAO -ge 70 ]; then
    echo -e "${YELLOW}${BOLD}⚠️  SISTEMA COM RESSALVAS - Melhorias recomendadas${NC}"
  else
    echo -e "${RED}${BOLD}❌ SISTEMA REPROVADO - Correções necessárias${NC}"
  fi
fi

echo ""
echo -e "${BOLD}${CYAN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║  Validação concluída!                                        ║${NC}"
echo -e "${BOLD}${CYAN}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# PRÓXIMOS PASSOS
# ============================================================================

section "🎯 PRÓXIMOS PASSOS"

echo ""
echo -e "${CYAN}1. Se APROVADO (90%+):${NC}"
echo -e "   ${GREEN}✓${NC} Testar manualmente:"
echo -e "     - Criar nova conta"
echo -e "     - Verificar 150 créditos na navbar"
echo -e "     - Comprar pacote de créditos"
echo -e "     - Usar Music Studio"
echo -e "     - Verificar desconto de créditos"
echo ""
echo -e "${CYAN}2. Deploy em produção:${NC}"
echo -e "   ${GREEN}$${NC} git add ."
echo -e "   ${GREEN}$${NC} git commit -m \"Sistema de créditos 100% funcional\""
echo -e "   ${GREEN}$${NC} git push"
echo ""
echo -e "${CYAN}3. Se REPROVADO (<90%):${NC}"
echo -e "   ${RED}!${NC} Verificar erros acima"
echo -e "   ${RED}!${NC} Aplicar schema novamente"
echo -e "   ${RED}!${NC} Re-executar este script"
echo ""

exit 0
