#!/bin/bash

echo "🔑 OPÇÕES DE ACESSO DE DESENVOLVEDOR"
echo "══════════════════════════════════════"
echo ""

echo "1️⃣ ACESSO VIA LOGIN NORMAL:"
echo "   URL: http://localhost:3000/login"
echo "   📧 Email: dev@dua.com"
echo "   🔑 Password: devpassword123"
echo ""

echo "2️⃣ ACESSO VIA CÓDIGO (alternativo):"
echo "   URL: http://localhost:3000/acesso"
echo "   🎫 Código: DEV-ADMIN"
echo "   (Depois complete com qualquer nome/email/senha)"
echo ""

echo "3️⃣ PAINEL ADMINISTRATIVO:"
echo "   URL: http://localhost:3000/admin"
echo "   (Acesse após fazer login com dev@dua.com)"
echo ""

echo "4️⃣ ACESSO DIRETO AO CHAT:"
echo "   URL: http://localhost:3000/chat"
echo "   (Funciona automaticamente se logado como dev)"
echo ""

echo "5️⃣ TODAS AS ROTAS LIBERADAS:"
echo "   /musicstudio"
echo "   /imagestudio" 
echo "   /videostudio"
echo "   /designstudio"
echo "   /community"
echo "   /settings"
echo ""

echo "⚡ RECURSOS DE DESENVOLVEDOR:"
echo "   ✅ Bypass completo no middleware"
echo "   ✅ Créditos ilimitados (999999)"
echo "   ✅ Acesso total sem verificações"
echo "   ✅ Painel admin para gerenciar códigos/usuários"
echo "   ✅ Logs de acesso no terminal"
echo ""

echo "🚀 PARA USAR:"
echo "   1. Abra http://localhost:3000/login"
echo "   2. Entre com dev@dua.com / devpassword123"
echo "   3. Pronto! Acesso total ao sistema 🎉"
echo ""

echo "📱 TESTE RÁPIDO:"
echo "   curl http://localhost:3000/api/auth/user -H 'Authorization: Bearer SEU_TOKEN'"
echo ""

read -p "Pressione Enter para abrir o login automaticamente..."
"$BROWSER" "http://localhost:3000/login" 2>/dev/null || echo "Abra manualmente: http://localhost:3000/login"