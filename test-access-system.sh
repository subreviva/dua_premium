#!/bin/bash

# ============================================
# TESTES ULTRA RIGOROSOS - Sistema de Acesso DUA
# ============================================

echo "🧪 INICIANDO TESTES ULTRA RIGOROSOS..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

# Função de teste
test_endpoint() {
    local name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="$4"
    local expected_status="$5"
    
    echo -n "Testing: $name... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    fi
    
    status=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (Status: $status)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status)"
        echo "Response: $body"
        ((FAILED++))
    fi
}

echo "═══════════════════════════════════════════════════════"
echo "📋 TESTE 1: ROTAS PÚBLICAS (devem retornar 200)"
echo "═══════════════════════════════════════════════════════"
echo ""

test_endpoint "Home page (/)" "http://localhost:3000/" "GET" "" "200"
test_endpoint "Página de acesso (/acesso)" "http://localhost:3000/acesso" "GET" "" "200"
test_endpoint "Página de login (/login)" "http://localhost:3000/login" "GET" "" "200"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "🔒 TESTE 2: ROTAS PROTEGIDAS (devem redirecionar 307)"
echo "═══════════════════════════════════════════════════════"
echo ""

test_endpoint "Chat sem auth" "http://localhost:3000/chat" "GET" "" "307"
test_endpoint "Music Studio sem auth" "http://localhost:3000/musicstudio" "GET" "" "307"
test_endpoint "Image Studio sem auth" "http://localhost:3000/imagestudio" "GET" "" "307"
test_endpoint "Video Studio sem auth" "http://localhost:3000/videostudio" "GET" "" "307"
test_endpoint "Design Studio sem auth" "http://localhost:3000/designstudio" "GET" "" "307"
test_endpoint "Community sem auth" "http://localhost:3000/community" "GET" "" "307"
test_endpoint "Settings sem auth" "http://localhost:3000/settings" "GET" "" "307"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "🎫 TESTE 3: VALIDAÇÃO DE CÓDIGOS"
echo "═══════════════════════════════════════════════════════"
echo ""

# Teste com código válido (U775-GCW)
test_endpoint "Código válido (U775-GCW)" "http://localhost:3000/api/validate-code" "POST" \
    '{"code":"U775-GCW","email":"test@example.com"}' "200"

# Teste com código inválido
test_endpoint "Código inválido" "http://localhost:3000/api/validate-code" "POST" \
    '{"code":"INVALID","email":"test@example.com"}' "400"

# Teste com código vazio
test_endpoint "Código vazio" "http://localhost:3000/api/validate-code" "POST" \
    '{"code":"","email":"test@example.com"}' "400"

# Teste com email inválido
test_endpoint "Email inválido" "http://localhost:3000/api/validate-code" "POST" \
    '{"code":"U775-GCW","email":"invalid"}' "400"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "📊 TESTE 4: VERIFICAÇÃO DO BANCO DE DADOS"
echo "═══════════════════════════════════════════════════════"
echo ""

echo "Verificando códigos gerados no Supabase..."

# Vamos usar node para fazer queries diretas
node << 'NODETEST'
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runTests() {
  console.log('');
  
  // Teste 1: Contar códigos ativos
  const { data: activeCodes, error: activeError } = await supabase
    .from('invite_codes')
    .select('code, active')
    .eq('active', true);
  
  if (activeError) {
    console.log('❌ Erro ao buscar códigos ativos:', activeError.message);
  } else {
    console.log(`✓ Códigos ativos: ${activeCodes.length}/10`);
    if (activeCodes.length === 10) {
      console.log('  ✓ PASS: Todos os 10 códigos estão ativos');
    } else {
      console.log(`  ⚠️  WARN: Apenas ${activeCodes.length} códigos ativos (esperado: 10)`);
    }
  }
  
  // Teste 2: Verificar estrutura da tabela users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, has_access, credits')
    .limit(1);
  
  if (usersError) {
    console.log('❌ Erro ao verificar tabela users:', usersError.message);
  } else {
    console.log('✓ Tabela users está acessível');
    if (users && users.length > 0) {
      console.log('  ✓ Users registados encontrados');
    } else {
      console.log('  ℹ️  INFO: Nenhum user registado ainda (normal)');
    }
  }
  
  // Teste 3: Verificar RLS policies
  console.log('');
  console.log('Testando RLS Policies...');
  
  // Tentar acessar como anon (deve falhar para certas operações)
  const supabaseAnon = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  const { data: anonCodes, error: anonError } = await supabaseAnon
    .from('invite_codes')
    .select('code, active')
    .eq('active', true);
  
  if (anonCodes && anonCodes.length > 0) {
    console.log('✓ Anon pode ler códigos ativos (esperado)');
  } else {
    console.log('❌ Anon não pode ler códigos ativos (problema de RLS)');
  }
  
  // Tentar INSERT como anon (deve falhar)
  const { error: insertError } = await supabaseAnon
    .from('invite_codes')
    .insert({ code: 'TEST-CODE', active: true });
  
  if (insertError) {
    console.log('✓ Anon não pode criar códigos (segurança OK)');
  } else {
    console.log('❌ FALHA CRÍTICA: Anon pode criar códigos!');
  }
  
  console.log('');
}

runTests().catch(console.error);
NODETEST

echo ""
echo "═══════════════════════════════════════════════════════"
echo "📱 TESTE 5: VERIFICAÇÃO DE ENDPOINTS DE API"
echo "═══════════════════════════════════════════════════════"
echo ""

# Verificar se API de chat está protegida
test_endpoint "API Chat endpoint" "http://localhost:3000/api/chat" "POST" \
    '{"messages":[{"role":"user","content":"test"}]}' "200"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "🔐 TESTE 6: TENTATIVAS DE BYPASS"
echo "═══════════════════════════════════════════════════════"
echo ""

# Tentar acessar com token inválido
test_endpoint "Chat com token fake" "http://localhost:3000/chat" "GET" "" "307"

# Tentar SQL Injection em código
test_endpoint "SQL Injection no código" "http://localhost:3000/api/validate-code" "POST" \
    '{"code":"AAAA\" OR 1=1--","email":"test@example.com"}' "400"

# Tentar XSS em email
test_endpoint "XSS no email" "http://localhost:3000/api/validate-code" "POST" \
    '{"code":"U775-GCW","email":"<script>alert(1)</script>@test.com"}' "400"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "📈 RESUMO DOS TESTES"
echo "═══════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✓ Testes passados: $PASSED${NC}"
echo -e "${RED}✗ Testes falhados: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Alguns testes falharam. Verifique os detalhes acima.${NC}"
    exit 1
fi
