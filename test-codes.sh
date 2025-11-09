#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# VERIFICAÇÃO RÁPIDA DOS CÓDIGOS DE ACESSO DUA
# ═══════════════════════════════════════════════════════════════

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  VERIFICAÇÃO DOS CÓDIGOS DE ACESSO DUA"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Testar um código de exemplo
TEST_CODE="DUA-03BN-9QT"

echo "🧪 Testando código: $TEST_CODE"
echo ""

# Criar arquivo temporário com o código de teste
cat > /tmp/test-code.json << EOF
{
  "code": "$TEST_CODE"
}
EOF

# Fazer requisição à API local (se estiver rodando)
echo "📡 Enviando para API de validação..."
echo ""

# Opção 1: Testar via curl (se servidor estiver rodando)
# curl -X POST http://localhost:3000/api/validate-code \
#   -H "Content-Type: application/json" \
#   -d @/tmp/test-code.json

echo "💡 INSTRUÇÕES PARA RESOLVER:"
echo ""
echo "1️⃣  Vá ao Supabase Dashboard:"
echo "   https://supabase.com/dashboard/project/_/editor"
echo ""
echo "2️⃣  SQL Editor > New Query"
echo ""
echo "3️⃣  Cole e execute o arquivo:"
echo "   insert-170-codes.sql"
echo ""
echo "4️⃣  Verifique a inserção:"
echo "   SELECT COUNT(*) FROM invite_codes WHERE active = true;"
echo ""
echo "5️⃣  Deve retornar: 170"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Mostrar os primeiros 10 códigos que devem existir
echo "📋 Primeiros 10 códigos que devem estar na DB:"
echo ""
echo "   1. DUA-03BN-9QT"
echo "   2. DUA-044P-OYM"
echo "   3. DUA-09P2-GDD"
echo "   4. DUA-11SF-3GX"
echo "   5. DUA-11UF-1ZR"
echo "   6. DUA-17OL-JNL"
echo "   7. DUA-17Q2-DCZ"
echo "   8. DUA-1AG9-T4T"
echo "   9. DUA-1F71-A68"
echo "   10. DUA-1KVM-WND"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
