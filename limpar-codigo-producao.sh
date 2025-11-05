#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     LIMPEZA DE CÓDIGO PARA PRODUÇÃO                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Backup antes de fazer mudanças
echo "📦 Criando backup..."
mkdir -p .backup
cp -r app components lib hooks .backup/ 2>/dev/null
echo "✓ Backup criado em .backup/"
echo ""

# Contador
REMOVED_CONSOLE=0
REMOVED_EMOJIS=0

echo "🧹 Removendo console.log, console.error, console.warn..."

# Encontrar e comentar console.log
find app components lib hooks -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) 2>/dev/null | while read file; do
    if grep -q "console\.\(log\|error\|warn\)" "$file" 2>/dev/null; then
        # Comentar em vez de remover (mais seguro)
        sed -i 's/^\(\s*\)console\.\(log\|error\|warn\)/\1\/\/ console.\2/g' "$file"
        count=$(grep -c "// console\." "$file" 2>/dev/null || echo 0)
        REMOVED_CONSOLE=$((REMOVED_CONSOLE + count))
        echo "  ✓ $file ($count console.* comentados)"
    fi
done

echo ""
echo "✅ Total: $REMOVED_CONSOLE console.* comentados"
echo ""

echo "🎨 Removendo emojis decorativos do código..."
echo "(Mantendo emojis em strings literais para UI)"
echo ""

# Lista de arquivos para limpar emojis de comentários
find app components lib hooks -type f \( -name "*.tsx" -o -name "*.ts" \) 2>/dev/null | while read file; do
    # Remover emojis de comentários e logs apenas
    if grep -q "\/\/.*[🎉🔑✅❌🚀💰👥🔧📊🎯]" "$file" 2>/dev/null; then
        sed -i 's/\/\/\s*[🎉🔑✅❌🚀💰👥🔧📊🎯]\+\s*//g' "$file"
        echo "  ✓ $file (emojis removidos de comentários)"
        REMOVED_EMOJIS=$((REMOVED_EMOJIS + 1))
    fi
done

echo ""
echo "✅ $REMOVED_EMOJIS arquivos limpos de emojis em comentários"
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    LIMPEZA CONCLUÍDA                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Resumo:"
echo "  • $REMOVED_CONSOLE console.* comentados"
echo "  • $REMOVED_EMOJIS arquivos limpos"
echo "  • Backup em .backup/"
echo ""
echo "⚠️  IMPORTANTE:"
echo "  • Revise as mudanças antes do commit"
echo "  • Teste a aplicação completamente"
echo "  • Console.error importantes podem precisar de logging adequado"
echo ""