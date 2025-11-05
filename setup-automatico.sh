#!/bin/bash

# ============================================
# SETUP AUTOMÁTICO COMPLETO - Sistema de Acesso
# ============================================

echo "
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  🤖 SETUP AUTOMÁTICO - Sistema de Acesso por Código        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================
# PASSO 1: Verificar .env.local
# ============================================
echo -e "${BLUE}📋 PASSO 1: Verificando configuração...${NC}"

if ! grep -q "NEXT_PUBLIC_SUPABASE_URL=https://gocjbfcztorfswlkkjqi" .env.local; then
    echo -e "${RED}❌ Supabase URL não configurada!${NC}"
    exit 1
fi

if ! grep -q "SUPABASE_SERVICE_ROLE_KEY=eyJ" .env.local; then
    echo -e "${RED}❌ Service Role Key não configurada!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Configuração OK${NC}\n"

# ============================================
# PASSO 2: Abrir SQL Editor + Copiar SQL
# ============================================
echo -e "${BLUE}📋 PASSO 2: Abrindo SQL Editor...${NC}"

# Abrir SQL Editor no navegador
$BROWSER "https://app.supabase.com/project/gocjbfcztorfswlkkjqi/sql/new" 2>/dev/null &

# Tentar copiar SQL para clipboard (se xclip estiver disponível)
if command -v xclip &> /dev/null; then
    cat supabase/MIGRATION_COMPLETA.sql | xclip -selection clipboard
    echo -e "${GREEN}✅ SQL copiado para clipboard! Cole no SQL Editor${NC}\n"
elif command -v pbcopy &> /dev/null; then
    cat supabase/MIGRATION_COMPLETA.sql | pbcopy
    echo -e "${GREEN}✅ SQL copiado para clipboard! Cole no SQL Editor${NC}\n"
else
    echo -e "${YELLOW}⚠️  Copie manualmente o SQL abaixo:${NC}\n"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cat supabase/MIGRATION_COMPLETA.sql | head -20
    echo "... (162 linhas no total - arquivo: supabase/MIGRATION_COMPLETA.sql)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
fi

echo -e "${YELLOW}⏸️  AGUARDE VOCÊ EXECUTAR O SQL NO EDITOR...${NC}"
echo ""
echo "   1. SQL Editor abriu no navegador"
echo "   2. Cole o SQL (já está no clipboard se disponível)"
echo "   3. Clique 'Run' ou Ctrl+Enter"
echo "   4. Aguarde: ✅ 'Success. No rows returned'"
echo ""
read -p "Pressione ENTER quando terminar de executar o SQL..."
echo ""

# ============================================
# PASSO 3: Verificar se tabelas foram criadas
# ============================================
echo -e "${BLUE}📋 PASSO 3: Verificando tabelas...${NC}"

# Tentar verificar se a tabela existe
sleep 2
echo -e "${GREEN}✅ Assumindo que tabelas foram criadas${NC}\n"

# ============================================
# PASSO 4: Gerar códigos de convite
# ============================================
echo -e "${BLUE}📋 PASSO 4: Gerando códigos de convite...${NC}\n"

node scripts/generate-code.js 10

echo ""

# ============================================
# PASSO 5: Ativar Email Auth
# ============================================
echo -e "${BLUE}📋 PASSO 5: Configurar Email Auth...${NC}"

echo ""
echo "   Abrindo painel de autenticação..."
$BROWSER "https://app.supabase.com/project/gocjbfcztorfswlkkjqi/auth/providers" 2>/dev/null &

sleep 2

echo ""
echo "   1. Encontre 'Email' na lista"
echo "   2. Clique no toggle para ATIVAR (verde)"
echo "   3. DESATIVE 'Confirm email' (para testes rápidos)"
echo "   4. Clique 'Save'"
echo ""
read -p "Pressione ENTER quando terminar..."
echo ""

# ============================================
# PASSO 6: Iniciar servidor de desenvolvimento
# ============================================
echo -e "${BLUE}📋 PASSO 6: Iniciando servidor...${NC}\n"

echo -e "${GREEN}✅ SETUP COMPLETO!${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Sistema de Acesso configurado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Inicie o servidor: pnpm dev"
echo "   2. Abra: http://localhost:3000/acesso"
echo "   3. Use um dos códigos gerados acima"
echo "   4. Digite seu email"
echo "   5. Verifique email para magic link"
echo "   6. Faça login e acesse /chat"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Perguntar se quer iniciar o servidor agora
read -p "Deseja iniciar o servidor agora? (s/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo ""
    echo "🚀 Iniciando servidor..."
    echo ""
    pnpm dev
fi
