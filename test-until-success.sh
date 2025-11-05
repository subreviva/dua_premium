#!/bin/bash

# Script de teste contínuo até 100% sucesso

echo "🔄 TESTE CONTÍNUO ATÉ 100% DE SUCESSO"
echo "Pressione Ctrl+C para cancelar"
echo ""

attempt=1
max_attempts=10

while [ $attempt -le $max_attempts ]; do
    echo "═══════════════════════════════════════════════════════"
    echo "🧪 TENTATIVA #$attempt de $max_attempts"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    
    # Executar testes
    node /workspaces/v0-remix-of-untitled-chat/test-database-security.js
    
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo ""
        echo "🎉🎉🎉 SUCESSO COMPLETO! 🎉🎉🎉"
        echo "Todos os testes passaram na tentativa #$attempt"
        exit 0
    else
        echo ""
        echo "⏳ Aguardando 5 segundos antes da próxima tentativa..."
        echo "   (Execute o SQL de correção no Supabase SQL Editor se ainda não o fez)"
        sleep 5
        ((attempt++))
    fi
done

echo ""
echo "❌ Máximo de tentativas atingido ($max_attempts)"
echo "Por favor, verifique:"
echo "1. Se executou o SQL em: supabase/fix-rls-policies.sql"
echo "2. Se o servidor está rodando: http://localhost:3000"
echo "3. Se as credenciais do Supabase estão corretas"
exit 1
