# 🔧 GUIA DE CONFIGURAÇÃO STRIPE - SISTEMA DE COMPRA DE CRÉDITOS

**Status:** ✅ Código implementado, aguardando configuração Stripe  
**Pacotes:** ✅ `stripe@19.3.0` e `@supabase/ssr@0.7.0` instalados

---

## 📋 CHECKLIST DE CONFIGURAÇÃO

- [ ] 1. Criar conta Stripe (ou usar existente)
- [ ] 2. Criar 6 produtos no Stripe Dashboard
- [ ] 3. Copiar Price IDs para `.env.local`
- [ ] 4. Configurar Stripe Secret Key
- [ ] 5. Configurar Webhook no Stripe
- [ ] 6. Testar fluxo completo
- [ ] 7. Deploy no Vercel

---

## 1️⃣ CRIAR PRODUTOS NO STRIPE DASHBOARD

### Acesse: https://dashboard.stripe.com/test/products

Crie os seguintes produtos:

| Produto | Preço | Créditos | Price ID (exemplo) |
|---------|-------|----------|-------------------|
| **Starter** | €5.00 | 170 | `price_1ABC...` |
| **Basic** | €10.00 | 340 | `price_1DEF...` |
| **Standard** | €15.00 | 550 | `price_1GHI...` |
| **Plus** | €30.00 | 1150 | `price_1JKL...` |
| **Pro** | €60.00 | 2400 | `price_1MNO...` |
| **Premium** | €150.00 | 6250 | `price_1PQR...` |

### Passos para cada produto:

1. **Clique em "Add product"**
2. **Name:** `DUA IA - [Nome do Tier]` (ex: "DUA IA - Starter")
3. **Description:** `Pacote de [X] créditos para serviços DUA IA`
4. **Pricing model:** Standard pricing
5. **Price:** [Valor em EUR]
6. **Billing period:** One time
7. **Save product**
8. **Copiar o Price ID** (começa com `price_...`)

---

## 2️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE

### Arquivo: `.env.local`

Adicione as seguintes variáveis:

```bash
# ============================================
# STRIPE CONFIGURATION
# ============================================

# Stripe Secret Key (Dashboard > Developers > API keys)
STRIPE_SECRET_KEY=sk_test_51Abc...XYZ

# Stripe Webhook Secret (Dashboard > Webhooks > Endpoint > Signing secret)
STRIPE_WEBHOOK_SECRET=whsec_abc...xyz

# Application URL (Production: https://dua.2lados.pt | Dev: http://localhost:3000)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================
# STRIPE PRICE IDS
# ============================================

# Copie os Price IDs criados no passo 1
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_1ABC...
NEXT_PUBLIC_STRIPE_PRICE_BASIC=price_1DEF...
NEXT_PUBLIC_STRIPE_PRICE_STANDARD=price_1GHI...
NEXT_PUBLIC_STRIPE_PRICE_PLUS=price_1JKL...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_1MNO...
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM=price_1PQR...
```

---

## 3️⃣ CONFIGURAR WEBHOOK NO STRIPE

### Desenvolvimento Local (usando Stripe CLI):

```bash
# 1. Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# 2. Login no Stripe
stripe login

# 3. Forward webhooks para localhost
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Copiar o webhook signing secret** que aparece no terminal e adicionar em `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

### Produção (Vercel):

1. **Acesse:** https://dashboard.stripe.com/test/webhooks
2. **Clique em:** "Add endpoint"
3. **Endpoint URL:** `https://dua.2lados.pt/api/stripe/webhook`
4. **Events to send:**
   - ✅ `checkout.session.completed`
5. **Add endpoint**
6. **Copiar Signing secret** e adicionar no Vercel:
   ```bash
   vercel env add STRIPE_WEBHOOK_SECRET
   # Cole o valor: whsec_...
   ```

---

## 4️⃣ TESTAR FLUXO COMPLETO

### Teste em Desenvolvimento:

```bash
# 1. Iniciar servidor
npm run dev

# 2. Em outro terminal, iniciar Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# 3. Acessar
open http://localhost:3000/pricing
```

### Fluxo de Teste:

1. ✅ **Acessar `/pricing`** - Ver os 6 pacotes
2. ✅ **Clicar em "Selecionar Plano"** - Redirecionar para login (se não autenticado)
3. ✅ **Fazer login**
4. ✅ **Clicar novamente em "Selecionar Plano"** - Redirecionar para Stripe Checkout
5. ✅ **Usar cartão de teste:**
   - Número: `4242 4242 4242 4242`
   - Data: Qualquer data futura
   - CVC: Qualquer 3 dígitos
   - CEP: Qualquer valor
6. ✅ **Completar pagamento** - Redirecionar para `/success`
7. ✅ **Verificar créditos** - Acessar `/profile` e ver créditos atualizados
8. ✅ **Verificar logs:**
   ```bash
   # No terminal onde está rodando `stripe listen`
   # Deve aparecer:
   # ✅ checkout.session.completed → 200 OK
   ```

---

## 5️⃣ VERIFICAR CRÉDITOS ADICIONADOS

### Via Supabase Dashboard:

```sql
-- Ver saldo do usuário
SELECT * FROM duaia_user_balances 
WHERE user_id = 'USER_ID_AQUI';

-- Ver transações
SELECT * FROM duaia_transactions 
WHERE user_id = 'USER_ID_AQUI'
ORDER BY created_at DESC
LIMIT 10;
```

### Via Application:

1. Acesse `/profile`
2. Componente `UserCreditsCard` deve mostrar:
   - **Créditos Serviços:** [Valor atualizado]
   - **DUAcoin:** [Valor]

---

## 6️⃣ CRIAR PÁGINA DE SUCESSO

### Arquivo: `app/success/page.tsx`

```tsx
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        
        <h1 className="text-3xl font-bold text-white mb-2">
          Pagamento Confirmado!
        </h1>
        
        <p className="text-gray-400 mb-6">
          Seus créditos foram adicionados com sucesso à sua conta.
        </p>
        
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/profile">
              Ver Meus Créditos
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/chat">
              Começar a Usar
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

## 7️⃣ DEPLOY NO VERCEL

### Configurar Environment Variables:

```bash
# 1. Acesse Vercel Dashboard
# 2. Projeto > Settings > Environment Variables
# 3. Adicione TODAS as variáveis do .env.local:

STRIPE_SECRET_KEY=sk_live_... (PRODUÇÃO: use sk_live, não sk_test)
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://dua.2lados.pt
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_BASIC=price_...
NEXT_PUBLIC_STRIPE_PRICE_STANDARD=price_...
NEXT_PUBLIC_STRIPE_PRICE_PLUS=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM=price_...
```

### Deploy:

```bash
git add .
git commit -m "feat: Add Stripe checkout integration"
git push
```

---

## 🔒 SEGURANÇA

### ✅ Implementações de Segurança:

1. **Webhook Signature Verification:**
   ```typescript
   const event = stripe.webhooks.constructEvent(
     body,
     signature,
     webhookSecret
   );
   ```

2. **User Authentication:**
   ```typescript
   const { data: { user }, error: authError } = await supabase.auth.getUser();
   if (authError || !user) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```

3. **Metadata Validation:**
   ```typescript
   const { userId, credits, tierName } = session.metadata;
   if (!userId || !credits) {
     throw new Error('Missing required metadata');
   }
   ```

4. **Service Role Key (Backend Only):**
   - ⚠️ **NUNCA expor** `STRIPE_SECRET_KEY` no frontend
   - ⚠️ **NUNCA expor** `STRIPE_WEBHOOK_SECRET` no frontend
   - ✅ **Apenas** `NEXT_PUBLIC_STRIPE_PRICE_*` podem ser públicas

---

## 🧪 TESTES COM CARTÕES STRIPE

| Cenário | Número do Cartão | Resultado |
|---------|------------------|-----------|
| **Sucesso** | `4242 4242 4242 4242` | ✅ Pagamento aprovado |
| **Recusado** | `4000 0000 0000 0002` | ❌ Cartão recusado |
| **3D Secure** | `4000 0027 6000 3184` | ⚠️ Requer autenticação |
| **Fundos insuficientes** | `4000 0000 0000 9995` | ❌ Fundos insuficientes |

**Data:** Qualquer data futura  
**CVC:** Qualquer 3 dígitos  
**CEP:** Qualquer valor

---

## 📊 MONITORAMENTO

### Stripe Dashboard:

- **Payments:** Ver todos os pagamentos
- **Customers:** Ver clientes
- **Logs:** Ver webhooks recebidos

### Supabase:

```sql
-- Ver últimas compras
SELECT 
  t.user_id,
  t.amount,
  t.transaction_type,
  t.metadata->>'stripe_session_id' as session_id,
  t.metadata->>'tier' as tier,
  t.balance_after,
  t.created_at
FROM duaia_transactions t
WHERE t.transaction_type = 'purchase'
ORDER BY t.created_at DESC
LIMIT 20;
```

---

## 🚨 TROUBLESHOOTING

### Erro: "No webhook signature found"

**Causa:** Stripe CLI não está rodando ou webhook não configurado

**Solução:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

### Erro: "Invalid API key"

**Causa:** `STRIPE_SECRET_KEY` incorreta ou não configurada

**Solução:**
```bash
# Verificar .env.local
echo $STRIPE_SECRET_KEY

# Copiar do Stripe Dashboard > Developers > API keys
```

---

### Erro: "User not authenticated"

**Causa:** Usuário não fez login

**Solução:**
- Botão "Selecionar Plano" agora redireciona para `/login?redirect=/pricing`
- Após login, usuário volta para `/pricing`

---

### Créditos não aparecem após pagamento

**Causa:** Webhook não foi disparado ou falhou

**Verificar:**
```bash
# 1. Logs do Stripe CLI
stripe logs tail

# 2. Logs do Next.js
# Deve aparecer: "✅ Créditos adicionados: 0 → 170"

# 3. Verificar duaia_transactions
SELECT * FROM duaia_transactions 
WHERE metadata->>'stripe_session_id' = 'SESSION_ID_AQUI';
```

---

## ✅ VALIDAÇÃO FINAL

Antes de considerar completo, verificar:

- [ ] ✅ Pacotes instalados: `stripe@19.3.0` e `@supabase/ssr@0.7.0`
- [ ] ✅ 6 produtos criados no Stripe Dashboard
- [ ] ✅ Price IDs copiados para `.env.local`
- [ ] ✅ `STRIPE_SECRET_KEY` configurada
- [ ] ✅ `STRIPE_WEBHOOK_SECRET` configurada
- [ ] ✅ Webhook configurado no Stripe
- [ ] ✅ Página `/success` criada
- [ ] ✅ Teste completo realizado com cartão `4242...`
- [ ] ✅ Créditos aparecem em `/profile`
- [ ] ✅ Transação registrada em `duaia_transactions`
- [ ] ✅ Deploy no Vercel com env vars configuradas

---

## 📚 REFERÊNCIAS

- **Stripe Docs:** https://stripe.com/docs
- **Stripe Checkout:** https://stripe.com/docs/payments/checkout
- **Stripe Webhooks:** https://stripe.com/docs/webhooks
- **Stripe CLI:** https://stripe.com/docs/stripe-cli
- **Test Cards:** https://stripe.com/docs/testing

---

**Última atualização:** 2025-11-10  
**Status:** Pronto para configuração  
**Next Steps:** Seguir checklist acima ☝️
