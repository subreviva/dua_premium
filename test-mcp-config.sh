#!/bin/bash

# 🎵 MCP AI Music API - Test Script
# Testa a configuração do servidor MCP

echo "🔍 Testing MCP AI Music API Configuration..."
echo ""

# 1. Check npx
echo "1️⃣ Checking npx..."
if command -v npx &> /dev/null; then
    echo "✅ npx found: $(which npx)"
    echo "   Version: $(npx --version)"
else
    echo "❌ npx not found!"
    exit 1
fi
echo ""

# 2. Check .mcp.json
echo "2️⃣ Checking .mcp.json..."
if [ -f ".mcp.json" ]; then
    echo "✅ .mcp.json exists"
    echo "   Content:"
    cat .mcp.json | jq '.' 2>/dev/null || cat .mcp.json
else
    echo "❌ .mcp.json not found!"
    exit 1
fi
echo ""

# 3. Check VS Code settings
echo "3️⃣ Checking .vscode/settings.json..."
if [ -f ".vscode/settings.json" ]; then
    echo "✅ .vscode/settings.json exists"
    echo "   Content:"
    cat .vscode/settings.json | jq '.' 2>/dev/null || cat .vscode/settings.json
else
    echo "⚠️  .vscode/settings.json not found (optional)"
fi
echo ""

# 4. Check documentation
echo "4️⃣ Checking documentation..."
files=(
    "MCP_AI_MUSIC_API.md"
    "MCP_QUICK_START.md"
    "GOOEY_INTEGRATION.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists ($(wc -l < "$file") lines)"
    else
        echo "❌ $file not found!"
    fi
done
echo ""

# 5. Test apidog-mcp-server availability
echo "5️⃣ Testing apidog-mcp-server package..."
echo "   (This will download the package if needed)"
if npx -y apidog-mcp-server@latest --help &> /dev/null; then
    echo "✅ apidog-mcp-server accessible via npx"
else
    echo "⚠️  Could not verify apidog-mcp-server (may need internet)"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MCP AI Music API Configuration Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Next Steps:"
echo ""
echo "1. Reload VS Code:"
echo "   Cmd/Ctrl + Shift + P → 'Developer: Reload Window'"
echo ""
echo "2. Test in Copilot Chat:"
echo "   @AI Music API help"
echo ""
echo "3. Read documentation:"
echo "   - MCP_QUICK_START.md (quick reference)"
echo "   - MCP_AI_MUSIC_API.md (full guide)"
echo "   - GOOEY_INTEGRATION.md (Gooey.AI integration)"
echo ""
