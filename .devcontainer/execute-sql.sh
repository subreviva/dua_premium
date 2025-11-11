#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════
# 🔧 EXECUTE SQL - Executar SQL diretamente no Supabase via API
# ═══════════════════════════════════════════════════════════════════════════
#
# Este script executa SQL diretamente na base de dados Supabase usando a API
# REST com SERVICE_ROLE_KEY (acesso completo).
#
# Uso:
#   bash .devcontainer/execute-sql.sh <arquivo.sql>
#   bash .devcontainer/execute-sql.sh --sql "SELECT * FROM users LIMIT 1;"

# Carregar variáveis de ambiente
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs -d '\n' 2>/dev/null) || true
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-}"
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"
PROJECT_REF="${SUPABASE_PROJECT_REF:-nranmngyocaqjwcokcxm}"

if [ -z "$SUPABASE_URL" ]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_URL não encontrado em .env.local"
  echo "Execute: vercel env pull .env.local"
  exit 1
fi

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "❌ SUPABASE_SERVICE_ROLE_KEY não encontrado em .env.local"
  echo "Adicione a variável na Vercel ou no .env.local"
  exit 1
fi

# Determinar fonte do SQL
SQL_CONTENT=""
if [ "$1" = "--sql" ]; then
  SQL_CONTENT="$2"
  echo "📝 Executando SQL inline..."
elif [ -f "$1" ]; then
  SQL_CONTENT=$(cat "$1")
  echo "📝 Executando SQL do arquivo: $1"
else
  echo "❌ Uso: $0 <arquivo.sql> ou $0 --sql \"SELECT ...\""
  exit 1
fi

# Validar sintaxe básica
if ! echo "$SQL_CONTENT" | grep -qi "select\|insert\|update\|delete\|create\|alter\|drop"; then
  echo "⚠️  SQL não parece válido. Continuar? (y/n)"
  read -r response
  if [ "$response" != "y" ]; then
    echo "Cancelado."
    exit 0
  fi
fi

# Executar via Supabase SQL API (usando pg_catalog.pg_stat_statements ou psql via API)
echo "🚀 Executando SQL no Supabase ($PROJECT_REF)..."

# Usar a API REST do Supabase para executar SQL
# Nota: Supabase não tem endpoint direto de SQL via REST API padrão
# Vamos usar psql via connection string se disponível

# Verificar se temos DATABASE_URL
if [ -n "${DATABASE_URL:-}" ]; then
  echo "✅ Usando DATABASE_URL para execução direta via psql"
  
  if [ "$1" = "--sql" ]; then
    echo "$SQL_CONTENT" | psql "$DATABASE_URL"
  else
    psql "$DATABASE_URL" -f "$1"
  fi
else
  echo "⚠️  DATABASE_URL não encontrado."
  echo "Para executar SQL diretamente, adicione DATABASE_URL ao .env.local"
  echo "Formato: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
  echo ""
  echo "Alternativa: use o Supabase Dashboard > SQL Editor"
  echo "SQL a executar:"
  echo "─────────────────────────────────────────────────────"
  echo "$SQL_CONTENT"
  echo "─────────────────────────────────────────────────────"
  exit 1
fi

echo "✅ SQL executado com sucesso!"
