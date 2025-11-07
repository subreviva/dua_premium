#!/bin/bash
set -e

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║       DEPLOY FORÇADO - VERCEL PRODUCTION                     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# 1. Verificar se está logado
echo "📋 1. Verificando autenticação Vercel..."
vercel whoami || {
  echo "❌ Não está logado no Vercel"
  echo "   Execute: vercel login"
  exit 1
}
echo "✓ Autenticado no Vercel"
echo ""

# 2. Build local
echo "📦 2. Build local..."
npm run build || {
  echo "❌ Build falhou"
  exit 1
}
echo "✓ Build local bem-sucedido"
echo ""

# 3. Verificar env vars
echo "🔐 3. Verificando variáveis de ambiente..."
if [ ! -f ".env.local" ]; then
  echo "❌ .env.local não encontrado"
  exit 1
fi

# Count SUPABASE vars
SUPABASE_VARS=$(grep -c "SUPABASE" .env.local || echo "0")
echo "✓ Encontradas $SUPABASE_VARS variáveis SUPABASE em .env.local"
echo ""

# 4. Deploy para production
echo "🚀 4. Deploy para Vercel Production..."
echo ""
echo "   Este comando vai:"
echo "   - Fazer build do projeto"
echo "   - Fazer deploy para produção"
echo "   - Limpar cache antigo"
echo "   - Aplicar todas as env vars configuradas"
echo ""
read -p "   Pressione ENTER para continuar (ou Ctrl+C para cancelar)..."
echo ""

vercel --prod --force || {
  echo "❌ Deploy falhou"
  exit 1
}

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "✅ DEPLOY COMPLETO"
echo ""
echo "🎯 Próximos passos:"
echo "   1. Aguarde 30-60 segundos para propagação"
echo "   2. Abra o browser em modo anônimo (Ctrl+Shift+N)"
echo "   3. Acesse seu site Vercel"
echo "   4. Teste login com:"
echo "      Email: estraca@2lados.pt | Password: lumiarbcv"
echo "      Email: dev@dua.com       | Password: lumiarbcv"
echo ""
echo "💡 Se ainda houver erro:"
echo "   - Limpe cache do browser (Ctrl+Shift+Delete)"
echo "   - Tente em outro browser"
echo "   - Verifique Vercel dashboard → Settings → Environment Variables"
echo ""
