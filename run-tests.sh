#!/bin/bash

# QUICK TEST - Suno Music Studio
# Executa testes rápidos para verificar funcionalidades

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║     🎵  SUNO MUSIC STUDIO - TESTE RÁPIDO  🎵            ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if app is running
echo "🔍 Verificando se a aplicação está rodando..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Aplicação está rodando em http://localhost:3000"
else
    echo "❌ Aplicação NÃO está rodando!"
    echo "   Execute: npm run dev"
    exit 1
fi

echo ""
echo "📋 Escolha o tipo de teste:"
echo ""
echo "1) Teste Automatizado Completo (45+ testes)"
echo "2) Teste Interativo Manual (guia passo-a-passo)"
echo "3) Teste Rápido (apenas essenciais)"
echo "4) Ver Documentação"
echo ""
read -p "Escolha (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Executando teste automatizado..."
        echo ""
        node test-all-features.js
        ;;
    2)
        echo ""
        echo "🎯 Iniciando teste interativo..."
        echo ""
        node test-interactive.js
        ;;
    3)
        echo ""
        echo "⚡ Teste rápido..."
        echo ""
        echo "✓ Verificando endpoints principais..."
        
        # Test homepage
        if curl -s http://localhost:3000 | grep -q "Music Studio"; then
            echo "  ✅ Homepage: OK"
        else
            echo "  ❌ Homepage: FALHOU"
        fi
        
        # Test music studio
        if curl -s http://localhost:3000/musicstudio > /dev/null 2>&1; then
            echo "  ✅ Music Studio: OK"
        else
            echo "  ❌ Music Studio: FALHOU"
        fi
        
        # Test API
        if [ ! -z "$SUNO_API_KEY" ]; then
            if curl -s http://localhost:3000/api/suno/credits | grep -q "credits"; then
                echo "  ✅ API Credits: OK"
            else
                echo "  ❌ API Credits: FALHOU"
            fi
        else
            echo "  ⚠️  API Credits: PULADO (sem API key)"
        fi
        
        echo ""
        echo "✓ Teste rápido concluído!"
        ;;
    4)
        echo ""
        cat TESTING.md | head -50
        echo ""
        echo "... (veja TESTING.md para documentação completa)"
        ;;
    *)
        echo ""
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "✨ Teste concluído!"
echo ""
