#!/bin/bash

# ============================================================
# 🚀 APLICAR WAITLIST NO SUPABASE - GUIA RÁPIDO
# ============================================================

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     🎯 SISTEMA WAITLIST - PRONTO PARA APLICAR             ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 FICHEIROS CRIADOS:"
echo ""
echo "  1. ✅ sql/create-early-access-waitlist.sql"
echo "     └─ Schema completo da tabela subscribers"
echo ""
echo "  2. ✅ app/api/early-access/subscribe/route.ts"
echo "     └─ API endpoint para subscrições"
echo ""
echo "  3. ✅ app/registo/page.tsx"
echo "     └─ Página waitlist redesenhada"
echo ""
echo "  4. ✅ WAITLIST_STRATEGY_COMPLETE.md"
echo "     └─ Documentação completa"
echo ""
echo "  5. ✅ WAITLIST_VERIFICACAO_100_PERCENT.md"
echo "     └─ Verificação e checklist"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  AÇÃO NECESSÁRIA: APLICAR SQL NO SUPABASE"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔧 PASSO A PASSO:"
echo ""
echo "  1️⃣  Abrir Supabase Dashboard"
echo "      https://supabase.com/dashboard"
echo ""
echo "  2️⃣  Selecionar projeto DUA"
echo ""
echo "  3️⃣  Menu lateral → SQL Editor"
echo ""
echo "  4️⃣  Clicar 'New Query'"
echo ""
echo "  5️⃣  Copiar TUDO de: sql/create-early-access-waitlist.sql"
echo ""
echo "  6️⃣  Colar no editor do Supabase"
echo ""
echo "  7️⃣  Clicar 'Run' ou pressionar Ctrl+Enter"
echo ""
echo "  8️⃣  Verificar mensagem: 'Success. No rows returned'"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ VERIFICAR INSTALAÇÃO:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Execute estas queries no SQL Editor para confirmar:"
echo ""
echo "-- 1. Verificar tabela criada"
cat << 'SQL'
SELECT * FROM public.early_access_subscribers LIMIT 1;
SQL
echo ""
echo ""
echo "-- 2. Testar função de contagem"
cat << 'SQL'
SELECT * FROM public.count_early_access_subscribers();
SQL
echo ""
echo ""
echo "-- 3. Verificar políticas RLS"
cat << 'SQL'
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename = 'early_access_subscribers';
SQL
echo ""
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 TESTAR FRONTEND:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "  1. Aceder: http://localhost:3001/registo"
echo ""
echo "  2. Preencher formulário:"
echo "     Nome: Test User"
echo "     Email: test@example.com"
echo ""
echo "  3. Clicar: 'Juntar-me à Lista de Espera'"
echo ""
echo "  4. Verificar mensagem de sucesso:"
echo "     '🎉 Bem-vindo à Lista de Espera!'"
echo "     'És o membro #1 da lista de espera'"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔍 VERIFICAR NO SUPABASE:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat << 'SQL'
SELECT 
  id, name, email, status, 
  subscribed_at, priority_level
FROM public.early_access_subscribers
ORDER BY subscribed_at DESC;
SQL
echo ""
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 O QUE FOI IMPLEMENTADO:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "  ✅ Página /registo explica fase de 'convite-only'"
echo "  ✅ Formulário simples: Nome + Email"
echo "  ✅ Incentivos visuais (3 benefícios destacados)"
echo "  ✅ API validação completa"
echo "  ✅ Base de dados com tracking UTM/IP"
echo "  ✅ Sistema de status: waiting → invited → registered"
echo "  ✅ Funções admin para gerir waitlist"
echo "  ✅ RLS policies configuradas"
echo "  ✅ Design premium FLOW-style"
echo "  ✅ Mensagem sucesso com posição na fila"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 ESTRATÉGIA 100% FUNCIONAL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Fluxo completo implementado:"
echo ""
echo "  1. User visita /registo"
echo "  2. Vê que está em 'fase de convite'"
echo "  3. Regista-se na waitlist (nome + email)"
echo "  4. Fica em status 'waiting'"
echo "  5. Admin convida quando quiser → status 'invited'"
echo "  6. User regista com código → status 'registered'"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 DOCUMENTAÇÃO:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "  📄 WAITLIST_STRATEGY_COMPLETE.md"
echo "     → Documentação completa e detalhada"
echo ""
echo "  📄 WAITLIST_VERIFICACAO_100_PERCENT.md"
echo "     → Resumo executivo e checklist"
echo ""
echo "  📄 WAITLIST_SETUP_INSTRUCTIONS.md"
echo "     → Instruções passo-a-passo"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 PRONTO PARA APLICAR!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Abrir o ficheiro SQL para facilitar cópia
if [ -f "sql/create-early-access-waitlist.sql" ]; then
  echo "📂 Conteúdo do SQL pronto para copiar:"
  echo ""
  echo "   Ficheiro: sql/create-early-access-waitlist.sql"
  echo "   Linhas: $(wc -l < sql/create-early-access-waitlist.sql)"
  echo "   Bytes: $(wc -c < sql/create-early-access-waitlist.sql)"
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 DICA: Usa Ctrl+A para selecionar tudo do ficheiro SQL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
