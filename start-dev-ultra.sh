#!/bin/bash

# 🔥 Script ULTRA ROBUSTO - Next.js NUNCA para
# Com watch automático de arquivos usando entr

echo "🔥 Servidor Next.js ULTRA ROBUSTO (porta 3000)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Reinicia automaticamente se crashar"
echo "✅ Recarrega quando arquivos mudarem (entr)"
echo "✅ NUNCA fecha até você mandar (Ctrl+C)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar se entr está instalado
if ! command -v entr &> /dev/null; then
    echo "⚠️  entr não instalado. Instalando..."
    sudo apt-get update && sudo apt-get install -y entr
fi

# Função para iniciar o servidor
start_server() {
    echo "🚀 Iniciando Next.js na porta 3000..."
    npm run dev
}

# Loop infinito com entr
while true; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
    echo "🔄 Servidor ativo (com auto-reload)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Monitorar arquivos e reiniciar automaticamente
    find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
    entr -r -s 'npm run dev' || start_server
    
    EXIT_CODE=$?
    
    echo ""
    echo "⚠️  Servidor parou (código: $EXIT_CODE)"
    echo "⏳ Reiniciando em 2 segundos..."
    sleep 2
done
