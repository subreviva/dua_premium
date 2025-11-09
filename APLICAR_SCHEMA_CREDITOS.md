# 🎯 GUIA: APLICAR SCHEMA DE CRÉDITOS NO SUPABASE

## ⚠️ IMPORTANTE: Execute este passo PRIMEIRO

Antes de qualquer código frontend/backend, você DEVE aplicar o SQL no Supabase Dashboard.

---

## 📋 PASSO A PASSO

### 1. Abrir Supabase Dashboard

Acesse: https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm

### 2. Ir para SQL Editor

- No menu lateral esquerdo, clique em **SQL Editor** (ícone `</>`)

### 3. Nova Query

- Clique em **"New Query"** ou no botão **"+"**

### 4. Copiar o SQL

- Abra o arquivo: `schema-creditos-dua.sql`
- **COPIE TODO O CONTEÚDO** (152 linhas)

### 5. Colar e Executar

- Cole o SQL no editor do Supabase
- Clique em **"Run"** (ou pressione `Ctrl + Enter`)

### 6. Aguardar Conclusão

Você verá mensagens de sucesso para cada operação:
- ✅ Colunas adicionadas à tabela `users`
- ✅ Tabela `transactions` criada
- ✅ Índices criados
- ✅ RLS policies configuradas
- ✅ Constraints aplicadas
- ✅ View criada

---

## ✅ VERIFICAÇÃO

Após executar o SQL, verifique no **Table Editor**:

### Tabela `users`:
- Deve ter novas colunas:
  - `saldo_dua` (decimal)
  - `creditos_servicos` (integer)

### Tabela `transactions`:
- Deve existir com colunas:
  - `id`, `user_id`, `source_type`, `amount_dua`, `amount_creditos`
  - `description`, `metadata`, `status`
  - `created_at`, `updated_at`

### View `user_balance_summary`:
- Deve estar visível na seção Views

---

## 🚀 PRÓXIMOS PASSOS

Após confirmar que o SQL foi aplicado com sucesso:

1. ✅ Execute: `node verificar-creditos-schema.mjs` (vou criar)
2. ✅ Implemente a API: `POST /api/comprar-creditos`
3. ✅ Crie a página: `/loja-creditos`
4. ✅ Atualize o Dashboard: `/dashboard-ia`

---

## 📝 NOTAS IMPORTANTES

- ✅ **Saldo DUA**: Representa a moeda nativa DUA que o usuário possui
- ✅ **Créditos de Serviços**: Moeda interna para usar os serviços de IA
- ✅ **Transações**: Auditoria completa de todas as operações
- ✅ **RLS**: Usuários só veem suas próprias transações
- ✅ **Constraints**: Impossível ter saldo negativo

---

**Data:** 08/11/2025  
**Arquivo SQL:** `schema-creditos-dua.sql`  
**Status:** ⏳ Aguardando execução no Supabase Dashboard
