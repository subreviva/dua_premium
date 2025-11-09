#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# Script para executar SQL no Supabase via Dashboard
# ═══════════════════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════"
echo "🔐 EXECUTAR SQL ULTRA RIGOROSO NO SUPABASE"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Abrir Supabase SQL Editor
echo "🌐 Abrindo Supabase SQL Editor no navegador..."
echo ""

URL="https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/sql/new"

# Detectar sistema operacional e abrir navegador
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$URL" 2>/dev/null || sensible-browser "$URL" 2>/dev/null || x-www-browser "$URL" 2>/dev/null || gnome-open "$URL" 2>/dev/null
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    start "$URL"
fi

echo "✅ SQL Editor aberto!"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📋 INSTRUÇÕES:"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "1. No SQL Editor que acabou de abrir:"
echo "   - Cole o conteúdo de: sql/ultra-rigorous-registration.sql"
echo ""
echo "2. Clique em 'Run' (ou pressione Ctrl/Cmd + Enter)"
echo ""
echo "3. Aguarde a mensagem:"
echo "   ✅ SISTEMA ULTRA RIGOROSO INSTALADO COM SUCESSO!"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "💡 Dica: Você pode copiar o SQL com o comando:"
echo "   cat sql/ultra-rigorous-registration.sql | pbcopy    (Mac)"
echo "   cat sql/ultra-rigorous-registration.sql | xclip     (Linux)"
echo ""
echo "═══════════════════════════════════════════════════════════════"
