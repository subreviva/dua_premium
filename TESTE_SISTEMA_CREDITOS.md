# 🧪 Guia de Teste: Sistema de Créditos Premium

## ✅ Verificação Completa do Sistema

### 1️⃣ **Verificar se Créditos Aparecem no Perfil**

**Passo a passo:**

1. **Acesse a página de perfil:**
   ```
   https://dua.pt/profile
   ```

2. **O que você deve ver:**
   - ✅ Card "Tokens Disponíveis" (sistema antigo)
   - ✅ **Card "Créditos Premium"** (NOVO!)
     - Mostra saldo de `servicos_creditos`
     - Contador grande com número de créditos
     - Breakdown: Músicas, Designs, Logos, Vídeos possíveis
     - Botões "Comprar Créditos" e "Ver Planos"
   
3. **Possíveis estados:**
   - **Se você tem 0 créditos:** Card mostra "0 créditos" + convite para comprar
   - **Se você tem créditos:** Card mostra saldo atual + quantas gerações pode fazer

---

### 2️⃣ **Testar Compra de Créditos (Simular)**

**Como admin, você pode adicionar créditos para testar:**

1. **Acesse o painel admin:**
   ```
   https://dua.pt/admin
   ```

2. **Clique em "Credits Management"** (botão na toolbar)

3. **No painel de créditos:**
   - Tab "Users" → Busque seu email
   - Clique em "Add Credits"
   - Digite quantidade (ex: 170)
   - Confirme

4. **Volte para /profile e recarregue**
   - Os créditos devem aparecer imediatamente!

---

### 3️⃣ **Verificar se Créditos São Utilizados**

**Testar dedução automática:**

1. **Acesse uma ferramenta que usa créditos:**
   - Design Studio: `/designstudio` (4 créditos)
   - Music Generator: `/music` (6 créditos)
   - Logo Generator: (6 créditos)
   - Video Generator: (20 créditos)

2. **Gere algum conteúdo**

3. **Volte para /profile**
   - Créditos devem ter diminuído!
   - Ex: Tinha 170 → Gerou 1 design (4 créditos) → Agora tem 166

---

### 4️⃣ **Verificar Transações (Admin)**

**Ver histórico de uso:**

1. **Acesse /admin**

2. **Clique em "Credits Management"**

3. **Tab "Activity"**
   - Veja todas as transações
   - Tipo: add, deduct, set, refund
   - Operação: music_generate, design_studio, etc.
   - Quantidade de créditos
   - Data/hora

---

## 🔍 Verificação Manual no Supabase

### Verificar Saldo Diretamente no Banco

**Query SQL para ver seus créditos:**

```sql
-- Ver todos os saldos
SELECT 
  user_id,
  servicos_creditos,
  duacoin_balance,
  created_at,
  updated_at
FROM duaia_user_balances
ORDER BY servicos_creditos DESC
LIMIT 10;
```

**Query para ver transações:**

```sql
-- Ver últimas transações de créditos
SELECT 
  user_id,
  transaction_type,
  amount,
  description,
  metadata,
  created_at
FROM duaia_transactions
WHERE transaction_type = 'credit'
ORDER BY created_at DESC
LIMIT 20;
```

---

## 📊 Checklist de Funcionalidades

### ✅ Exibição de Créditos
- [ ] Card de créditos aparece em /profile
- [ ] Mostra saldo correto de `servicos_creditos`
- [ ] Mostra breakdown (músicas, designs, logos, vídeos)
- [ ] Botões de CTA funcionam (Comprar Créditos, Ver Planos)
- [ ] Loading state funciona
- [ ] Cria registro automaticamente se não existir

### ✅ Uso de Créditos
- [ ] Design Studio deduz 4 créditos por geração
- [ ] Music Generator deduz 6 créditos
- [ ] Logo Generator deduz 6 créditos
- [ ] Video Generator deduz 20 créditos
- [ ] Saldo atualiza após uso
- [ ] Bloqueia uso se créditos insuficientes

### ✅ Admin - Gestão
- [ ] Admin pode ver todos os saldos
- [ ] Admin pode adicionar créditos
- [ ] Admin pode deduzir créditos
- [ ] Admin pode setar saldo específico
- [ ] Admin pode fazer distribuição em massa
- [ ] Todas as ações criam registro de auditoria

### ✅ Compra de Pacotes
- [ ] Página /pricing mostra todos os planos
- [ ] Cada plano mostra créditos corretamente
- [ ] Cálculo de músicas/designs/logos/vídeos está correto
- [ ] Savings (economia) está calculado
- [ ] Toggle mensal/anual funciona

---

## 🐛 Troubleshooting

### Problema: "Créditos não aparecem no perfil"

**Soluções:**
1. Verifique se está logado
2. Recarregue a página (Ctrl + F5)
3. Verifique se tabela `duaia_user_balances` existe
4. Verifique se seu user_id tem registro na tabela

**Query de teste:**
```sql
SELECT * FROM duaia_user_balances WHERE user_id = 'SEU_USER_ID';
```

### Problema: "Créditos não diminuem após uso"

**Verificar:**
1. API está usando `credits-service.ts`?
2. RPC function `deduct_servicos_credits` existe?
3. Logs do servidor mostram dedução?

**Query de verificação:**
```sql
-- Ver se RPC existe
SELECT * FROM pg_proc WHERE proname = 'deduct_servicos_credits';
```

### Problema: "Admin não consegue distribuir créditos"

**Verificar:**
1. Email está em `ADMIN_EMAILS`?
2. `SUPABASE_SERVICE_ROLE_KEY` está configurada?
3. RPC function `add_servicos_credits` existe?

---

## 🚀 Teste Completo End-to-End

### Cenário: Novo Usuário Compra e Usa Créditos

1. **Criar conta** → `/login`
2. **Verificar perfil** → `/profile` (deve mostrar 0 créditos)
3. **Ver planos** → `/pricing`
4. **Comprar plano Starter** (170 créditos)
5. **Voltar ao perfil** → Créditos aparecem (170)
6. **Gerar design** → `/designstudio` (deduz 4)
7. **Voltar ao perfil** → Créditos agora são 166
8. **Ver atividade** → `/admin` (se admin) → Ver transação

---

## 📈 Métricas de Sucesso

**Sistema está funcionando 100% se:**

✅ Créditos aparecem no perfil após login  
✅ Créditos diminuem após gerar conteúdo  
✅ Admin pode adicionar/remover créditos  
✅ Transações ficam registradas  
✅ Página de pricing mostra pacotes corretos  
✅ Card de créditos é responsivo (mobile/desktop)  
✅ Loading states funcionam  
✅ Erros são tratados gracefully  

---

## 🔗 Arquivos Relacionados

### Frontend
- `/components/profile/UserCreditsCard.tsx` - Card de créditos no perfil
- `/components/pricing/PricingPackages.tsx` - Página de pacotes
- `/components/admin/AdminCreditsPanel.tsx` - Painel admin

### Backend
- `/lib/credits/credits-config.ts` - Configuração (35 operações)
- `/lib/credits/credits-service.ts` - Lógica de negócio
- `/lib/credits/credits-middleware.ts` - Middleware para APIs
- `/app/api/admin/credits/route.ts` - API admin

### Database
- `/supabase/migrations/credits_rpc_functions.sql` - RPC functions
- Tabela: `duaia_user_balances` (coluna: `servicos_creditos`)
- Tabela: `duaia_transactions` (histórico)

---

**Status Atual:** ✅ Sistema implementado e pronto para testes  
**Última Atualização:** 10 Nov 2025  
**Commits:** e6291c0 (Admin), 59c85fe (Pricing), PENDING (UserCreditsCard)
