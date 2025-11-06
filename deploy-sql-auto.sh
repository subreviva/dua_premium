#!/bin/bash

# 🚀 Deploy SQL Automático - Supabase
# Executa qualquer SQL no Supabase via API Management

set -e

# ═══════════════════════════════════════════════════════════════
# CONFIGURAÇÃO
# ═══════════════════════════════════════════════════════════════

ACCESS_TOKEN="sbp_08e5120ef2f464a99974cd54540b08a912cf19a4"
PROJECT_REF="gdlvsbmxqkxscuutdwhm"
SUPABASE_API="https://api.supabase.com"

# ═══════════════════════════════════════════════════════════════
# FUNÇÕES
# ═══════════════════════════════════════════════════════════════

print_header() {
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║                                                              ║"
  echo "║          🚀 DEPLOY SQL AUTOMÁTICO - SUPABASE CLI            ║"
  echo "║                                                              ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
}

print_success() {
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║                    ✅ DEPLOY COMPLETO!                       ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
}

print_error() {
  echo ""
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║                    ❌ ERRO NO DEPLOY!                        ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo ""
  echo "💥 $1"
  echo ""
}

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════

print_header

# Determinar arquivo SQL
if [ -z "$1" ]; then
  # Buscar último migration
  SQL_FILE=$(ls -t sql/migrations/*.sql 2>/dev/null | head -1)
  if [ -z "$SQL_FILE" ]; then
    SQL_FILE="sql/create-conversations-table.sql"
  fi
  echo "📌 Usando arquivo padrão"
else
  SQL_FILE="$1"
fi

# Verificar se arquivo existe
if [ ! -f "$SQL_FILE" ]; then
  print_error "Arquivo não encontrado: $SQL_FILE"
  exit 1
fi

echo "📄 Arquivo: $SQL_FILE"
echo "📦 Tamanho: $(du -h "$SQL_FILE" | cut -f1)"
echo ""

# Ler conteúdo SQL
echo "📖 Lendo SQL..."
SQL_CONTENT=$(cat "$SQL_FILE")

# Escapar para JSON
SQL_ESCAPED=$(echo "$SQL_CONTENT" | jq -Rs .)

# Criar payload JSON
PAYLOAD=$(cat <<EOF
{
  "query": $SQL_ESCAPED
}
EOF
)

# Executar via API
echo "🔄 Executando via API do Supabase..."
echo ""

RESPONSE=$(curl -s -X POST \
  "${SUPABASE_API}/v1/projects/${PROJECT_REF}/database/query" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

# Verificar resposta
if echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
  ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error.message // .error')
  print_error "$ERROR_MSG"
  echo "📋 Resposta completa:"
  echo "$RESPONSE" | jq .
  exit 1
fi

# Sucesso
echo "✅ SQL EXECUTADO COM SUCESSO!"
echo ""

# Mostrar resultado se houver
if echo "$RESPONSE" | jq -e '.result' > /dev/null 2>&1; then
  RESULT=$(echo "$RESPONSE" | jq -r '.result')
  if [ "$RESULT" != "null" ] && [ -n "$RESULT" ]; then
    echo "📊 Resultado:"
    echo "$RESPONSE" | jq '.result'
    echo ""
  fi
fi

print_success

exit 0
