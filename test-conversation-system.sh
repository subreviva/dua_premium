#!/bin/bash

# 🎉 Sistema de Histórico de Conversas - Teste de Build

echo "🔍 Verificando Sistema de Conversas..."

# Verificar se os arquivos existem
echo "📁 Verificando arquivos criados..."

if [ -f "hooks/useConversations.ts" ]; then
  echo "  ✅ hooks/useConversations.ts"
else
  echo "  ❌ hooks/useConversations.ts NÃO ENCONTRADO"
fi

if [ -f "components/ConversationHistory.tsx" ]; then
  echo "  ✅ components/ConversationHistory.tsx"
else
  echo "  ❌ components/ConversationHistory.tsx NÃO ENCONTRADO"
fi

echo ""
echo "🔨 Executando build do Next.js..."
pnpm build

echo ""
echo "✨ Build concluído!"
