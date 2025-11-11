#!/bin/bash

echo "🔍 Verificando Supabase CLI Setup..."
echo ""

# 1. CLI instalado?
if command -v supabase &> /dev/null; then
    echo "✅ Supabase CLI: $(supabase --version)"
else
    echo "❌ Supabase CLI não instalado"
    exit 1
fi

# 2. Projeto linkado?
if supabase projects list 2>/dev/null | grep -q "nranmngyocaqjwcokcxm"; then
    echo "✅ Projeto linkado: nranmngyocaqjwcokcxm"
else
    echo "❌ Projeto não linkado"
    exit 1
fi

# 3. Config.toml correto?
if grep -q "major_version = 17" supabase/config.toml 2>/dev/null; then
    echo "✅ PostgreSQL version: 17"
else
    echo "⚠️  PostgreSQL version não é 17"
fi

# 4. Variáveis de ambiente?
if [ -f .env.local ]; then
    if grep -q "SUPABASE_PROJECT_REF" .env.local; then
        echo "✅ .env.local configurado"
    else
        echo "⚠️  SUPABASE_PROJECT_REF não encontrado em .env.local"
    fi
else
    echo "❌ .env.local não existe"
fi

# 5. Tipos TypeScript gerados?
if [ -f src/lib/supabase.types.ts ]; then
    LINES=$(wc -l < src/lib/supabase.types.ts)
    echo "✅ Types gerados: $LINES linhas"
else
    echo "⚠️  src/lib/supabase.types.ts não existe"
fi

# 6. Testes configurados?
if [ -f vitest.config.ts ]; then
    echo "✅ Vitest configurado"
else
    echo "⚠️  vitest.config.ts não existe"
fi

# 7. Scripts NPM?
if grep -q '"db:test"' package.json; then
    echo "✅ Scripts NPM configurados"
else
    echo "⚠️  Scripts NPM não configurados"
fi

# 8. Execução de SQL?
if [ -f .devcontainer/execute-sql.mjs ]; then
    echo "✅ Sistema de execução SQL ativo"
else
    echo "⚠️  execute-sql.mjs não encontrado"
fi

echo ""
echo "🎉 Verificação completa!"
echo ""
echo "📋 Comandos disponíveis:"
echo "  npm run db:start   - Iniciar banco local"
echo "  npm run db:test    - Executar testes"
echo "  npm run db:types   - Gerar tipos TypeScript"
echo "  sql-exec \"...\"     - Executar SQL no Supabase"
echo ""
