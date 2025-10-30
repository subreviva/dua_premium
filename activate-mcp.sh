#!/bin/bash

echo "═══════════════════════════════════════════════════════"
echo "🎵 MCP AI Music API - ATIVAÇÃO AUTOMÁTICA"
echo "═══════════════════════════════════════════════════════"
echo ""

# 1. Verificar npx
echo "✓ Verificando npx..."
which npx > /dev/null 2>&1 && echo "  ✅ npx encontrado: $(which npx)" || { echo "  ❌ npx não encontrado!"; exit 1; }

# 2. Verificar arquivos de config
echo ""
echo "✓ Verificando arquivos de configuração..."
[ -f .mcp.json ] && echo "  ✅ .mcp.json existe" || { echo "  ❌ .mcp.json não encontrado!"; exit 1; }
[ -f .vscode/settings.json ] && echo "  ✅ .vscode/settings.json existe" || { echo "  ❌ .vscode/settings.json não encontrado!"; exit 1; }

# 3. Download do package (se necessário)
echo ""
echo "✓ Baixando apidog-mcp-server (se necessário)..."
npx -y apidog-mcp-server@latest --version > /dev/null 2>&1
echo "  ✅ Package baixado/atualizado"

# 4. Criar user settings global (se não existir)
echo ""
echo "✓ Configurando VS Code global settings..."
VSCODE_SETTINGS="$HOME/.config/Code/User/settings.json"
if [ ! -f "$VSCODE_SETTINGS" ]; then
    mkdir -p "$(dirname "$VSCODE_SETTINGS")"
    echo '{}' > "$VSCODE_SETTINGS"
fi

# Adicionar MCP config ao settings global usando jq
if command -v jq > /dev/null 2>&1; then
    echo "  ✅ Usando jq para merge..."
    jq '. + {"github.copilot.chat.mcp.servers": {"AI Music API": {"command": "npx", "args": ["-y", "apidog-mcp-server@latest", "--site-id=754564"]}}}' "$VSCODE_SETTINGS" > "$VSCODE_SETTINGS.tmp" && mv "$VSCODE_SETTINGS.tmp" "$VSCODE_SETTINGS"
else
    echo "  ⚠️  jq não disponível, usando workspace settings apenas"
fi

# 5. Status final
echo ""
echo "═══════════════════════════════════════════════════════"
echo "✅ MCP CONFIGURADO COM SUCESSO!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Recarregar VS Code:"
echo "   • Cmd/Ctrl + Shift + P"
echo "   • Digite: 'Developer: Reload Window'"
echo "   • Pressione Enter"
echo ""
echo "2. Testar no Copilot Chat:"
echo "   • Abra Copilot Chat (ícone lateral)"
echo "   • Digite: @AI Music API help"
echo "   • Deve ver lista de endpoints"
echo ""
echo "3. Exemplos de queries:"
echo "   • @AI Music API list all endpoints"
echo "   • @AI Music API show /generate parameters"
echo "   • @AI Music API curl example for v5"
echo ""
echo "═══════════════════════════════════════════════════════"
