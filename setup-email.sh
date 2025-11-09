#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║     📧 CONFIGURAÇÃO DE EMAIL - WAITLIST                   ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se RESEND_API_KEY já existe
if grep -q "RESEND_API_KEY" .env.local 2>/dev/null; then
  echo "✅ RESEND_API_KEY já configurada em .env.local"
  echo ""
  
  # Mostrar valor (mascarado)
  KEY=$(grep "RESEND_API_KEY" .env.local | cut -d'=' -f2)
  MASKED_KEY="${KEY:0:8}***${KEY: -4}"
  echo "   Valor atual: $MASKED_KEY"
  echo ""
  
  read -p "❓ Deseja atualizar? (s/N): " UPDATE
  if [[ ! "$UPDATE" =~ ^[Ss]$ ]]; then
    echo ""
    echo "✅ Mantendo configuração existente"
    exit 0
  fi
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 PASSO 1: Obter API Key do Resend"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Aceder: https://resend.com/signup"
echo "2. Criar conta (grátis, sem cartão)"
echo "3. Dashboard → API Keys"
echo "4. Create API Key"
echo "5. Copiar a key (começa com 're_')"
echo ""
read -p "❓ Já tens a API Key? (s/N): " HAS_KEY

if [[ ! "$HAS_KEY" =~ ^[Ss]$ ]]; then
  echo ""
  echo "📖 INSTRUÇÕES:"
  echo ""
  echo "   1. Abre: https://resend.com/signup"
  echo "   2. Regista-te (1 minuto)"
  echo "   3. Copia a API Key"
  echo "   4. Volta aqui"
  echo ""
  exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔑 PASSO 2: Inserir API Key"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Cole a API Key aqui: " API_KEY

# Validar formato
if [[ ! "$API_KEY" =~ ^re_ ]]; then
  echo ""
  echo "❌ ERRO: API Key deve começar com 're_'"
  echo ""
  echo "Exemplo: re_123abc456def789ghi"
  echo ""
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📧 PASSO 3: Email Remetente"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Formato: Nome <email@dominio>"
echo "Exemplo: DUA <noreply@dua.pt>"
echo ""
read -p "Email remetente [DUA <noreply@dua.pt>]: " FROM_EMAIL
FROM_EMAIL=${FROM_EMAIL:-"DUA <noreply@dua.pt>"}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💾 PASSO 4: Salvar Configuração"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Remover configurações antigas se existirem
sed -i '/RESEND_API_KEY/d' .env.local 2>/dev/null
sed -i '/RESEND_FROM_EMAIL/d' .env.local 2>/dev/null

# Adicionar novas configurações
echo "" >> .env.local
echo "# ============================================" >> .env.local
echo "# EMAIL CONFIGURATION (Resend)" >> .env.local
echo "# ============================================" >> .env.local
echo "RESEND_API_KEY=$API_KEY" >> .env.local
echo "RESEND_FROM_EMAIL=$FROM_EMAIL" >> .env.local

echo "✅ Configuração salva em .env.local"
echo ""

# Mostrar próximos passos
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 PRÓXIMOS PASSOS"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Reiniciar servidor:"
echo "   npm run dev"
echo ""
echo "2. Testar subscrição:"
echo "   http://localhost:3001/registo"
echo ""
echo "3. Verificar email enviado:"
echo "   https://resend.com/emails"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ CONFIGURAÇÃO COMPLETA!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
