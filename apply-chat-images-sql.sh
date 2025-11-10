#!/bin/bash
# Aplicar SQL: Adicionar coluna chat_images_generated

export $(grep -v '^#' .env.local | xargs)

SQL_QUERY="ALTER TABLE public.users ADD COLUMN IF NOT EXISTS chat_images_generated INTEGER DEFAULT 0;"

echo "📊 Aplicando SQL..."
echo "$SQL_QUERY"

# Usar psql se disponível, senão instruções
if command -v psql &> /dev/null; then
    psql "$DATABASE_URL" -c "$SQL_QUERY"
else
    echo ""
    echo "✅ SQL pronto para executar no Supabase Dashboard:"
    echo "──────────────────────────────────────────────────"
    echo "$SQL_QUERY"
    echo "──────────────────────────────────────────────────"
fi
