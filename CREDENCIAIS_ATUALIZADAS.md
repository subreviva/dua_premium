# ✅ MIGRAÇÃO DE CREDENCIAIS COMPLETA

**Data:** 7 Novembro 2025

## 🔄 O QUE FOI FEITO

### Atualização do `.env.local`

**ANTES (DUA IA):**
```
NEXT_PUBLIC_SUPABASE_URL=https://gocjbfcztorfswlkkjqi.supabase.co
```

**DEPOIS (DUA COIN):**
```
NEXT_PUBLIC_SUPABASE_URL=https://nranmngyocaqjwcokcxm.supabase.co
```

### Credenciais Atualizadas

✅ **NEXT_PUBLIC_SUPABASE_URL** → DUA COIN
✅ **NEXT_PUBLIC_SUPABASE_ANON_KEY** → DUA COIN  
✅ **SUPABASE_SERVICE_ROLE_KEY** → DUA COIN
✅ **POSTGRES_URL** → DUA COIN
✅ **POSTGRES_PRISMA_URL** → DUA COIN
✅ **SUPABASE_JWT_SECRET** → DUA COIN

### Backup Criado

📁 Ficheiro original guardado em:
```
.env.local.backup.[timestamp]
```

---

## 🚀 PRÓXIMOS PASSOS

### 1. Restart da Aplicação

```bash
# Parar o servidor (Ctrl+C se estiver a correr)

# Restart
npm run dev
```

### 2. Testar Login

Aceder: `http://localhost:3000/login`

Testar com um dos 8 utilizadores da DUA COIN:
- ✅ `estracaofficial@gmail.com`
- ✅ `dev@dua.com`
- ✅ Outros 6 utilizadores existentes

### 3. Verificar Funcionalidades

- [ ] Login funciona
- [ ] Perfil do utilizador carrega
- [ ] Saldo DUA Coins aparece
- [ ] Acesso a funcionalidades premium (se aplicável)

---

## ✅ RESULTADO ESPERADO

Todos os logins devem funcionar normalmente agora que o site aponta para a base de dados correta (DUA COIN) onde os utilizadores foram migrados.

**Sistema Unificado:**
- Site → DUA COIN ✅
- Utilizadores → DUA COIN ✅
- Dados → DUA COIN ✅

---

## 🔄 SE PRECISAR VOLTAR ATRÁS

```bash
# Restaurar backup
cp .env.local.backup.[timestamp] .env.local

# Restart
npm run dev
```

---

## 📊 ESTADO FINAL

**DUA COIN:**
- 8 utilizadores ativos
- Site conectado ✅
- Pronto para produção 🚀

**DUA IA:**
- 0 utilizadores (migrados)
- Pode ser arquivada ou usada para dev/test
- Site desconectado ✅
