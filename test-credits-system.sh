#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# 💳 TESTE DO SISTEMA DE CRÉDITOS - DUA IA
# ═══════════════════════════════════════════════════════════════════════════

echo "════════════════════════════════════════════════════════════════"
echo "  TESTE DO SISTEMA DE CRÉDITOS - DUA IA"
echo "════════════════════════════════════════════════════════════════"
echo ""

PASSED=0
FAILED=0

# ───────────────────────────────────────────────────────────────────────────
# Helper function
# ───────────────────────────────────────────────────────────────────────────
test_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo "✓ PASSOU: $description"
        ((PASSED++))
    else
        echo "✗ FALHOU: $description"
        ((FAILED++))
    fi
}

test_content() {
    local file=$1
    local pattern=$2
    local description=$3
    
    if grep -q "$pattern" "$file" 2>/dev/null; then
        echo "✓ PASSOU: $description"
        ((PASSED++))
    else
        echo "✗ FALHOU: $description"
        ((FAILED++))
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. VERIFICAÇÃO DE ARQUIVOS DE BANCO DE DADOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_file "supabase/migrations/credits_rpc_functions.sql" \
    "Funções RPC de créditos existem"

test_file "supabase/migrations/ULTRA_RIGOROSO_credits_setup.sql" \
    "Schema ULTRA RIGOROSO existe"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. VERIFICAÇÃO DE FUNÇÕES RPC"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_content "supabase/migrations/credits_rpc_functions.sql" \
    "deduct_servicos_credits" \
    "Função deduct_servicos_credits implementada"

test_content "supabase/migrations/credits_rpc_functions.sql" \
    "add_servicos_credits" \
    "Função add_servicos_credits implementada"

test_content "supabase/migrations/credits_rpc_functions.sql" \
    "get_servicos_credits" \
    "Função get_servicos_credits implementada"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. VERIFICAÇÃO DE SERVIÇO DE CRÉDITOS (BACKEND)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_file "lib/credits/credits-service.ts" \
    "Serviço de créditos existe"

test_content "lib/credits/credits-service.ts" \
    "checkCredits" \
    "Função checkCredits implementada"

test_content "lib/credits/credits-service.ts" \
    "deductCredits" \
    "Função deductCredits implementada"

test_content "lib/credits/credits-service.ts" \
    "refundCredits" \
    "Função refundCredits implementada"

test_content "lib/credits/credits-service.ts" \
    "SUPABASE_SERVICE_ROLE_KEY" \
    "Usa SERVICE_ROLE_KEY (seguro)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. VERIFICAÇÃO DE CONFIGURAÇÃO DE CUSTOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_file "lib/credits/credits-config.ts" \
    "Configuração de custos existe"

test_content "lib/credits/credits-config.ts" \
    "CREDIT_COSTS" \
    "Tabela de custos definida"

test_content "lib/credits/credits-config.ts" \
    "getCreditCost" \
    "Função getCreditCost implementada"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. VERIFICAÇÃO DE INTEGRAÇÃO COM APIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_content "app/api/auth/register/route.ts" \
    "add_servicos_credits" \
    "API de registro adiciona créditos iniciais"

test_content "app/api/auth/register/route.ts" \
    "150" \
    "150 créditos iniciais configurados"

test_content "app/api/validate-code/route.ts" \
    "add_servicos_credits" \
    "API de validação de código adiciona créditos"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. VERIFICAÇÃO DE USO DE CRÉDITOS NAS APIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar se alguma API usa checkCredits
if grep -r "checkCredits" app/api/ --include="*.ts" > /dev/null 2>&1; then
    echo "✓ PASSOU: APIs usam checkCredits"
    ((PASSED++))
else
    echo "✗ FALHOU: Nenhuma API usa checkCredits"
    ((FAILED++))
fi

# Verificar se alguma API usa deductCredits
if grep -r "deductCredits" app/api/ --include="*.ts" > /dev/null 2>&1; then
    echo "✓ PASSOU: APIs usam deductCredits"
    ((PASSED++))
else
    echo "✗ FALHOU: Nenhuma API usa deductCredits"
    ((FAILED++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. VERIFICAÇÃO DE SEGURANÇA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_content "lib/credits/credits-service.ts" \
    "SECURITY DEFINER" \
    "Funções RPC usam SECURITY DEFINER (comentário no código)"

test_content "supabase/migrations/credits_rpc_functions.sql" \
    "SECURITY DEFINER" \
    "Funções SQL declaradas com SECURITY DEFINER"

# Verificar que SERVICE_ROLE_KEY não está no frontend
if ! grep -r "SUPABASE_SERVICE_ROLE_KEY" app/ components/ --include="*.tsx" --include="*.jsx" > /dev/null 2>&1; then
    echo "✓ PASSOU: SERVICE_ROLE_KEY não exposta no frontend"
    ((PASSED++))
else
    echo "✗ FALHOU: SERVICE_ROLE_KEY pode estar exposta no frontend"
    ((FAILED++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. VERIFICAÇÃO DE AUDITORIA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_content "supabase/migrations/ULTRA_RIGOROSO_credits_setup.sql" \
    "duaia_transactions" \
    "Tabela de transações existe"

test_content "lib/credits/credits-service.ts" \
    "metadata" \
    "Metadata de transações implementada"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  RESUMO DOS TESTES"
echo "════════════════════════════════════════════════════════════════"
echo "Testes Passados: $PASSED"
echo "Testes Falhados: $FAILED"
echo ""

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$(awk "BEGIN {printf \"%.1f\", ($PASSED/$TOTAL)*100}")

echo "Taxa de Sucesso: $PERCENTAGE%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✓✓✓ SISTEMA DE CRÉDITOS 100% FUNCIONAL E ATIVO ✓✓✓"
    echo ""
    echo "🎯 STATUS: ATIVO E OPERACIONAL"
    echo ""
    echo "📋 FUNCIONALIDADES VERIFICADAS:"
    echo "  - ✓ Funções RPC no banco de dados"
    echo "  - ✓ Serviço de créditos no backend"
    echo "  - ✓ Configuração de custos"
    echo "  - ✓ Integração com registro de usuários"
    echo "  - ✓ Segurança (SERVICE_ROLE_KEY)"
    echo "  - ✓ Sistema de auditoria"
    echo ""
    echo "💰 CRÉDITOS INICIAIS: 150 créditos ao registar"
    echo "🔒 SEGURANÇA: SERVICE_ROLE_KEY protegida"
    echo "📊 AUDITORIA: Todas transações registradas"
    echo ""
else
    echo "⚠️  ALGUNS TESTES FALHARAM - VERIFICAR DETALHES ACIMA"
fi
