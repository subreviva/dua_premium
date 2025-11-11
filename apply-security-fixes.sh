#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# HABILITAR PROTEÇÃO DE SENHAS COMPROMETIDAS
# Data: 11 Novembro 2025
# Ação: Configurar Auth para bloquear senhas comprometidas
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "🔐 Habilitando proteção de senhas comprometidas no Supabase Auth..."
echo ""

# NOTA: Esta configuração deve ser feita via Dashboard do Supabase
# https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/settings/auth

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  AÇÃO MANUAL NECESSÁRIA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Acesse o Supabase Dashboard:"
echo "   https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/settings/auth"
echo ""
echo "2. Role até a seção 'Password Protection'"
echo ""
echo "3. Habilite as seguintes opções:"
echo "   ✅ Enable leaked password protection"
echo "   ✅ Minimum password length: 8"
echo "   ✅ Require uppercase letters"
echo "   ✅ Require lowercase letters"
echo "   ✅ Require numbers"
echo "   ✅ Require special characters"
echo ""
echo "4. Clique em 'Save' para aplicar"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Executar migration SQL
echo "🚀 Aplicando correções de segurança SQL..."
echo ""

if command -v supabase &> /dev/null; then
  echo "✅ Supabase CLI encontrado"
  
  # Verificar se estamos logados
  if supabase projects list &> /dev/null; then
    echo "✅ Autenticado no Supabase CLI"
    
    # Aplicar migration
    echo "📝 Aplicando migration..."
    supabase db push --db-url "postgresql://postgres.nranmngyocaqjwcokcxm:Lumiarbcv1997.@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
    
    echo ""
    echo "✅ Migration aplicada com sucesso!"
  else
    echo "⚠️  Não autenticado no Supabase CLI"
    echo "Execute: supabase login"
  fi
else
  echo "⚠️  Supabase CLI não encontrado"
  echo ""
  echo "Para instalar:"
  echo "npm install -g supabase"
  echo ""
  echo "OU execute o SQL manualmente:"
  echo "1. Abra: https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm/sql/new"
  echo "2. Cole o conteúdo de: supabase/migrations/20250111_security_fixes.sql"
  echo "3. Execute o SQL"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ PRÓXIMOS PASSOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. ✅ Executar SQL de correções (supabase/migrations/20250111_security_fixes.sql)"
echo "2. ✅ Habilitar proteção de senhas no Dashboard Auth"
echo "3. ✅ Verificar logs de segurança"
echo "4. ✅ Testar RLS em creative_scholarships"
echo "5. ✅ Validar que views de admin não são acessíveis publicamente"
echo ""
