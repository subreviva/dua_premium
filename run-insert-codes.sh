#!/bin/bash

echo "🎫 Instalando dependências e executando inserção de códigos..."
echo ""

# Instalar dependências se necessário
if ! npm list dotenv >/dev/null 2>&1; then
  echo "📦 Instalando dotenv..."
  npm install dotenv
fi

# Executar script de inserção
echo "🚀 Executando inserção dos 170 códigos..."
echo ""

node insert-codes-auto.mjs

echo ""
echo "✅ Processo concluído!"
