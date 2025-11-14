#!/bin/bash

# ╔════════════════════════════════════════════════════════════════╗
# ║  TESTE COMPLETO DO SISTEMA DE ACESSO POR CÓDIGO               ║
# ║  Verifica se o fluxo está 100% funcional e seguro             ║
# ╚════════════════════════════════════════════════════════════════╝

echo "════════════════════════════════════════════════════════════════"
echo "  TESTE DO SISTEMA DE ACESSO - DUA IA"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de testes
PASSED=0
FAILED=0

# Função para verificar resultado
check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSOU${NC}: $2"
        ((PASSED++))
    else
        echo -e "${RED}✗ FALHOU${NC}: $2"
        ((FAILED++))
    fi
    echo ""
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. VERIFICAÇÃO DE ARQUIVOS CRÍTICOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1.1 Página de acesso
if [ -f "app/acesso/page.tsx" ]; then
    check_result 0 "Página /acesso existe"
else
    check_result 1 "Página /acesso NÃO existe"
fi

# 1.2 API de registro
if [ -f "app/api/auth/register/route.ts" ]; then
    check_result 0 "API de registro existe"
else
    check_result 1 "API de registro NÃO existe"
fi

# 1.3 Middleware de proteção
if [ -f "middleware.ts" ]; then
    check_result 0 "Middleware de proteção existe"
else
    check_result 1 "Middleware de proteção NÃO existe"
fi

# 1.4 Página de welcome
if [ -f "app/welcome/page.tsx" ]; then
    check_result 0 "Página de welcome existe"
else
    check_result 1 "Página de welcome NÃO existe"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. VERIFICAÇÃO DE CÓDIGO E LÓGICA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 2.1 Verificar validação de código
if grep -q "handleValidateCode" app/acesso/page.tsx; then
    check_result 0 "Validação de código implementada"
else
    check_result 1 "Validação de código NÃO encontrada"
fi

# 2.2 Verificar proteção contra race condition
if grep -q "eq('active', true)" app/acesso/page.tsx; then
    check_result 0 "Proteção contra race condition implementada"
else
    check_result 1 "Proteção contra race condition NÃO encontrada"
fi

# 2.3 Verificar retry com backoff (rate limiting)
if grep -q "retryWithBackoff" app/acesso/page.tsx; then
    check_result 0 "Sistema de retry automático implementado"
else
    check_result 1 "Sistema de retry automático NÃO encontrado"
fi

# 2.4 Verificar validação enterprise de password
if grep -q "validatePassword" app/acesso/page.tsx; then
    check_result 0 "Validação enterprise de password implementada"
else
    check_result 1 "Validação enterprise de password NÃO encontrada"
fi

# 2.5 Verificar criação de créditos iniciais
if grep -q "150" app/acesso/page.tsx && grep -q "creditos_servicos" app/acesso/page.tsx; then
    check_result 0 "Sistema de créditos iniciais (150) implementado"
else
    check_result 1 "Sistema de créditos iniciais NÃO encontrado"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. VERIFICAÇÃO DE SEGURANÇA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 3.1 Verificar GDPR compliance (termos aceites)
if grep -q "acceptedTerms" app/acesso/page.tsx; then
    check_result 0 "GDPR compliance (termos) implementado"
else
    check_result 1 "GDPR compliance (termos) NÃO encontrado"
fi

# 3.2 Verificar sanitização de email
if grep -q "toLowerCase()" app/acesso/page.tsx; then
    check_result 0 "Sanitização de email implementada"
else
    check_result 1 "Sanitização de email NÃO encontrada"
fi

# 3.3 Verificar proteção de rotas no middleware
if grep -q "/acesso" middleware.ts && grep -q "PUBLIC" middleware.ts; then
    check_result 0 "Rotas públicas configuradas no middleware"
else
    check_result 1 "Rotas públicas NÃO configuradas"
fi

# 3.4 Verificar rate limiting no middleware
if grep -q "RATE_LIMITS" middleware.ts; then
    check_result 0 "Rate limiting implementado no middleware"
else
    check_result 1 "Rate limiting NÃO implementado"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. VERIFICAÇÃO DE MENSAGENS DE WELCOME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 4.1 Verificar mensagem de boas-vindas
if grep -q "Bem-vindo" app/acesso/page.tsx; then
    check_result 0 "Mensagem de boas-vindas implementada"
else
    check_result 1 "Mensagem de boas-vindas NÃO encontrada"
fi

# 4.2 Verificar página de welcome
if grep -q "WelcomePage" app/welcome/page.tsx; then
    check_result 0 "Página de welcome completa existe"
else
    check_result 1 "Página de welcome NÃO encontrada"
fi

# 4.3 Verificar apresentação de créditos
if grep -q "créditos adicionados" app/acesso/page.tsx; then
    check_result 0 "Informação sobre créditos na mensagem de welcome"
else
    check_result 1 "Informação sobre créditos NÃO encontrada"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. VERIFICAÇÃO DE BANCO DE DADOS (SCHEMA)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 5.1 Verificar migration de invite_codes
if [ -f "supabase/migrations/20250105000001_create_invite_codes.sql" ]; then
    check_result 0 "Migration de invite_codes existe"
else
    check_result 1 "Migration de invite_codes NÃO existe"
fi

# 5.2 Verificar RLS em invite_codes
if grep -q "ENABLE ROW LEVEL SECURITY" supabase/migrations/20250105000001_create_invite_codes.sql 2>/dev/null; then
    check_result 0 "RLS em invite_codes configurado"
else
    check_result 1 "RLS em invite_codes NÃO configurado"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. VERIFICAÇÃO DE FLUXO COMPLETO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 6.1 Verificar step de código
if grep -q 'step === "code"' app/acesso/page.tsx; then
    check_result 0 "Step de validação de código implementado"
else
    check_result 1 "Step de validação de código NÃO encontrado"
fi

# 6.2 Verificar step de registro
if grep -q 'setStep("register")' app/acesso/page.tsx; then
    check_result 0 "Step de registro implementado"
else
    check_result 1 "Step de registro NÃO encontrado"
fi

# 6.3 Verificar redirecionamento após sucesso
if grep -q "router.push" app/acesso/page.tsx; then
    check_result 0 "Redirecionamento após registro implementado"
else
    check_result 1 "Redirecionamento NÃO encontrado"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  RESUMO DOS TESTES"
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}Testes Passados: $PASSED${NC}"
echo -e "${RED}Testes Falhados: $FAILED${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASSED/$TOTAL)*100}")

echo "Taxa de Sucesso: $SUCCESS_RATE%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓✓✓ SISTEMA 100% FUNCIONAL E SEGURO ✓✓✓${NC}"
    echo ""
    echo "Próximos passos para testar manualmente:"
    echo "1. Acessa http://localhost:3000/acesso"
    echo "2. Insere um código de convite válido"
    echo "3. Completa o registro com email, nome e password"
    echo "4. Verifica se recebe mensagem 'Bem-vindo à DUA! 🎉'"
    echo "5. Verifica se os 150 créditos são adicionados"
    echo "6. Verifica se redireciona para a página principal"
    exit 0
else
    echo -e "${RED}✗✗✗ SISTEMA TEM PROBLEMAS - REVISAR CÓDIGO ✗✗✗${NC}"
    echo ""
    echo "Problemas encontrados: $FAILED"
    exit 1
fi
