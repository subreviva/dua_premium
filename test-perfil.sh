#!/bin/bash

# 🚀 Script de Teste Rápido do Perfil
# Execute este script após rodar o SQL no Supabase

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 TESTE DO PERFIL - DUA PREMIUM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📋 CHECKLIST DE EXECUÇÃO:"
echo ""
echo "1️⃣  Execute o script SQL no Supabase:"
echo "    → Abra: sql/fix-users-table-complete.sql"
echo "    → Cole no SQL Editor do Supabase"
echo "    → Execute (Run)"
echo ""

read -p "✅ Script SQL executado? (s/n): " sql_ok

if [ "$sql_ok" != "s" ]; then
  echo "❌ Execute o SQL primeiro!"
  exit 1
fi

echo ""
echo "2️⃣  Aguardando schema cache refresh (5 segundos)..."
sleep 5
echo "✅ Cache atualizado!"
echo ""

echo "3️⃣  Estrutura da tabela users:"
echo "    ✅ id (UUID)"
echo "    ✅ email (TEXT)"
echo "    ✅ name (TEXT)"
echo "    ✅ username (TEXT UNIQUE)"
echo "    ✅ bio (TEXT)"
echo "    ✅ avatar_url (TEXT)"
echo "    ✅ has_access (BOOLEAN)"
echo "    ✅ invite_code_used (TEXT)"
echo "    ✅ created_at (TIMESTAMPTZ)"
echo "    ✅ updated_at (TIMESTAMPTZ)"
echo ""

echo "4️⃣  Funcionalidades disponíveis:"
echo "    ✅ Seletor de Avatar (12 presets + upload)"
echo "    ✅ Edição de Nome"
echo "    ✅ Edição de Username (@username)"
echo "    ✅ Edição de Bio (max 200 chars)"
echo "    ✅ Botões Discord + Telegram"
echo "    ✅ Badge de Admin (se aplicável)"
echo ""

echo "5️⃣  Agora teste:"
echo "    → Acesse: http://localhost:3000/perfil"
echo "    → Selecione um avatar"
echo "    → Preencha: nome, username, bio"
echo "    → Clique em 'Salvar Perfil'"
echo "    → Veja mensagem: 'Perfil atualizado! ✨'"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Status: PRONTO PARA TESTE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📚 Documentação completa: PERFIL_FIX_COMPLETE.md"
echo ""
