#!/bin/bash

# 🎯 Script para aplicar migração SQL no Supabase
# Execute este script para abrir o Supabase Dashboard

echo "
╔════════════════════════════════════════════════════════════╗
║   📊 APLICAR MIGRAÇÃO SQL - Chat Image Counter            ║
╚════════════════════════════════════════════════════════════╝
"

echo "📋 SQL a ser executado:"
echo ""
cat supabase/migrations/add_chat_images_counter.sql
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 INSTRUÇÕES:"
echo ""
echo "1. Abra o Supabase Dashboard:"
echo "   👉 https://supabase.com/dashboard"
echo ""
echo "2. Selecione seu projeto"
echo ""
echo "3. Menu lateral: SQL Editor"
echo ""
echo "4. Cole o SQL acima"
echo ""
echo "5. Clique em 'Run'"
echo ""
echo "6. Verifique: 'Success. No rows returned'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Copiar SQL para clipboard (se xclip estiver disponível)
if command -v xclip &> /dev/null; then
  cat supabase/migrations/add_chat_images_counter.sql | xclip -selection clipboard
  echo "✅ SQL copiado para clipboard!"
  echo ""
elif command -v pbcopy &> /dev/null; then
  cat supabase/migrations/add_chat_images_counter.sql | pbcopy
  echo "✅ SQL copiado para clipboard!"
  echo ""
else
  echo "⚠️  Copie manualmente o SQL acima"
  echo ""
fi

# Abrir browser (se $BROWSER estiver definido)
if [ -n "$BROWSER" ]; then
  echo "🌐 Abrindo Supabase Dashboard..."
  "$BROWSER" "https://supabase.com/dashboard" &
else
  echo "💡 Acesse manualmente: https://supabase.com/dashboard"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📌 Após executar o SQL, rode novamente a verificação:"
echo "   node verify-chat-image-integration.mjs"
echo ""
echo "✅ Sistema estará 100% pronto para testes!"
echo ""
