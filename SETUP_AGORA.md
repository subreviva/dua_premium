# 🚀 SETUP FINAL - 3 PASSOS RÁPIDOS

## ✅ PASSO 1: Aplicar Migration (Criar Tabelas)

### Abra este link:
```
https://app.supabase.com/project/gocjbfcztorfswlkkjqi/sql/new
```

### Cole o arquivo completo:
```
supabase/MIGRATION_COMPLETA.sql
```

### Ou copie direto daqui:
1. Vá no SQL Editor
2. Clique em "New query"
3. Cole todo o conteúdo do arquivo `MIGRATION_COMPLETA.sql`
4. Clique em **"Run"** (ou Ctrl+Enter)
5. Aguarde ✅ "Success. No rows returned"

---

## ✅ PASSO 2: Ativar Email Auth

### Abra este link:
```
https://app.supabase.com/project/gocjbfcztorfswlkkjqi/auth/providers
```

### Configure:
1. Encontre **"Email"** na lista
2. Clique em **"Enable Email provider"** → ON (verde)
3. **DESATIVE** "Confirm email" (para testes rápidos)
4. Clique em **"Save"**

---

## ✅ PASSO 3: Gerar Códigos de Convite

### No terminal, execute:
```bash
node scripts/generate-code.js 5
```

### Output esperado:
```
🎫 Gerando códigos de convite...

✅ DUA2-X7K9 → 30 créditos
✅ PLAT-5M3N → 30 créditos
✅ WAVE-9TR2 → 30 créditos
✅ NOVA-4P8L → 30 créditos
✅ STAR-6QM1 → 30 créditos

📊 Resumo:
   Total gerado: 5/5
   Créditos por código: 30
```

**Guarde esses códigos!** Você vai precisar deles para testar.

---

## 🧪 TESTAR O SISTEMA

### 1. Inicie o servidor:
```bash
pnpm dev
```

### 2. Abra no navegador:
```
http://localhost:3000/acesso
```

### 3. Valide um código:
- Digite um código gerado (ex: `DUA2-X7K9`)
- Digite seu email (ex: `seu@email.com`)
- Clique **"Entrar"**
- ✅ Deve aparecer: "Acesso concedido! Verifique seu email..."

### 4. Verifique o email:
- Abra sua caixa de entrada
- Procure por email do Supabase
- Clique no link **"Magic Link"**
- ✅ Será redirecionado para `/chat` automaticamente

### 5. Teste o middleware:
- Faça logout ou abra aba anônima
- Tente acessar: `http://localhost:3000/chat`
- ✅ Deve redirecionar para `/acesso` (bloqueado!)

---

## 🎯 CHECKLIST FINAL

- [ ] Migration executada no SQL Editor
- [ ] Email Auth ativado (verde)
- [ ] "Confirm email" desativado
- [ ] Códigos gerados com o script
- [ ] Servidor rodando (`pnpm dev`)
- [ ] Página `/acesso` abrindo
- [ ] Código validado com sucesso
- [ ] Magic link recebido no email
- [ ] Login funcionando
- [ ] Middleware bloqueando `/chat` sem login

---

## 🚨 PROBLEMAS COMUNS

### "Error: relation 'public.invite_codes' does not exist"
→ Execute a migration no SQL Editor

### "Module '@supabase/supabase-js' not found"
→ `pnpm install` (já deve estar instalado)

### "Variáveis de ambiente não configuradas"
→ Verifique `.env.local` (já configurado ✅)

### "Magic link não chega"
→ Verifique spam/lixo eletrônico
→ Aguarde até 5 minutos
→ Teste com outro email

### "Código inválido ou já utilizado"
→ Gere novos códigos: `node scripts/generate-code.js`

---

## 🎉 SISTEMA PRONTO!

Após completar os 3 passos, você terá:
- ✅ Sistema de acesso por código funcional
- ✅ Autenticação via magic link
- ✅ Proteção de rotas automática
- ✅ Sistema de créditos por user
- ✅ UI profissional tipo Sora/Suno

**Comece pelo PASSO 1!** 👆
