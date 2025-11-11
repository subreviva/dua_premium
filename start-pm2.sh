#!/bin/bash

# 🚀 MODO PRODUÇÃO INFINITO - PM2 Process Manager
# O servidor NUNCA para, reinicia automaticamente

echo "🚀 Iniciando servidor com PM2 (Process Manager)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Gerenciamento profissional de processos"
echo "✅ Auto-restart ilimitado"
echo "✅ Logs persistentes"
echo "✅ Monitoramento de memória"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
fi

# Criar diretório de logs
mkdir -p logs

# Parar qualquer instância anterior
echo "🛑 Parando instâncias anteriores..."
pm2 delete dua-dev 2>/dev/null || true

# Iniciar com PM2
echo "🚀 Iniciando servidor..."
pm2 start ecosystem.config.json

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Servidor rodando na porta 3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Comandos úteis:"
echo "   pm2 status          - Ver status"
echo "   pm2 logs dua-dev    - Ver logs em tempo real"
echo "   pm2 restart dua-dev - Reiniciar manualmente"
echo "   pm2 stop dua-dev    - Parar servidor"
echo "   pm2 monit           - Monitor visual"
echo ""

# Mostrar status
pm2 status

# Seguir logs
echo ""
echo "📋 Logs ao vivo (Ctrl+C para sair):"
echo ""
pm2 logs dua-dev
