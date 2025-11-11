#!/bin/bash

# 🚀 Script para manter o servidor Next.js SEMPRE rodando na porta 3000
# Reinicia automaticamente em caso de crash ou encerramento

echo "🚀 Iniciando servidor Next.js na porta 3000 (modo infinito)..."
echo "📌 O servidor NUNCA vai fechar automaticamente"
echo "⚡ Reinicia automaticamente em caso de erro"
echo ""

# Loop infinito
while true; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⏰ $(date '+%Y-%m-%d %H:%M:%S')"
    echo "🔄 Iniciando Next.js Dev Server..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Executa o servidor
    npm run dev
    
    # Se chegou aqui, é porque o servidor parou
    EXIT_CODE=$?
    
    echo ""
    echo "⚠️  Servidor parou (código: $EXIT_CODE)"
    echo "⏳ Aguardando 2 segundos antes de reiniciar..."
    sleep 2
    
    echo "🔄 Reiniciando automaticamente..."
    echo ""
done
