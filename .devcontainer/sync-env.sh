#!/usr/bin/env bash
set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════
# 🔄 SYNC ENV - Sincronizar variáveis de ambiente da Vercel e Supabase
# ═══════════════════════════════════════════════════════════════════════════
#
# Este script é executado automaticamente ao abrir o Codespace (postCreate)
# - Puxa as variáveis mais recentes da Vercel para `.env.local`
# - Se existir `SUPABASE_PROJECT_REF` em `.env.local`, tenta sincronizar o schema
# - Gera os tipos TypeScript em `src/lib/supabase.types.ts`
#
# Uso manual:
#   bash .devcontainer/sync-env.sh

echo "🔄 Iniciando sincronização de ambiente (Vercel -> .env.local)"

# ---------------------------------------------------------------------------
# Ensure Vercel CLI
# ---------------------------------------------------------------------------
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI não encontrado. Instalando... (npm i -g vercel)"
    npm i -g vercel
fi

# If not linked, try to link (non-interactive if possible)
if [ ! -d ".vercel" ]; then
    echo "🔗 Tentando linkar o projeto à Vercel (se necessário)..."
    # This will prompt if not linked - proceed only if CI/interactive
    set +e
    vercel link --yes
    set -e
fi

echo "⬇️  Baixando variáveis de ambiente da Vercel para .env.local"
# Use --yes to avoid interactive prompt; if not available the command may prompt
vercel env pull .env.local --yes || vercel env pull .env.local || true

if [ ! -f .env.local ]; then
    echo "⚠️  .env.local não criado (vercel env pull pode ter falhado)."
    echo "   Verifica 'vercel link' e executa 'vercel env pull .env.local' manualmente."
else
    echo "✅ .env.local atualizado com variáveis da Vercel"
fi

# ---------------------------------------------------------------------------
# Source .env.local (if present) to expose SUPABASE_PROJECT_REF or token
# ---------------------------------------------------------------------------
if [ -f .env.local ]; then
    # shellcheck disable=SC1090
    set +o allexport
    # load env into the shell safely
    export $(grep -v '^#' .env.local | xargs -d '\n' 2>/dev/null) || true
fi

# ---------------------------------------------------------------------------
# Ensure Supabase CLI and sync DB schema & types if SUPABASE_PROJECT_REF exists
# ---------------------------------------------------------------------------
if ! command -v supabase &> /dev/null; then
    echo "📦 Supabase CLI não encontrado. Instalando... (npm i -g supabase)"
    npm i -g supabase
fi

# Use SUPABASE_PROJECT_REF from .env.local (user must have it set)
PROJECT_REF="${SUPABASE_PROJECT_REF:-${SUPABASE_PROJECT:-}}"

if [ -z "$PROJECT_REF" ]; then
    echo "⚠️  SUPABASE_PROJECT_REF não encontrado em .env.local. Pulando passos do Supabase."
    echo "   Para ativar: adicione SUPABASE_PROJECT_REF=<project-ref> em Vercel ou .env.local"
else
    echo "� Ligando CLI Supabase ao projeto: $PROJECT_REF"
    set +e
    supabase login --no-localhost --token "${SUPABASE_ACCESS_TOKEN:-}" 2>/dev/null || true
    supabase link --project-ref "$PROJECT_REF" || true
    set -e

    echo "🔁 Puxando schema do Supabase para supabase/schema.sql"
    mkdir -p supabase
    # Pull schema (non-destructive locally)
    supabase db pull --project-ref "$PROJECT_REF" --file supabase/schema.sql || true

    # Gerar tipos TypeScript
    echo "🔧 Gerando tipos TypeScript em src/lib/supabase.types.ts"
    mkdir -p src/lib
    supabase gen types typescript --project-id "$PROJECT_REF" > src/lib/supabase.types.ts || true

    echo "✅ Supabase sync concluído (schema + types)."
fi

echo ""
echo "🎉 Sincronização completa. Arquivo .env.local é a fonte local das credenciais."
echo "💡 Dica: nunca commite .env.local. Ele já está ignorado por padrão."

echo "Próximos passos (manuais, se necessário):"
echo "  - vercel link  # se o projeto não estiver linkado"
echo "  - vercel env pull .env.local"
echo "  - supabase login --token <TOKEN>"
echo "  - supabase link --project-ref <PROJECT_REF>"
