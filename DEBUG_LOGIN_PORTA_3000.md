# 🔍 DEBUG: Login não funciona na porta 3000

## ❌ Problema

Login não funciona no GitHub Codespaces porta 3000.

## 🎯 Soluções Rápidas

### 1️⃣ **Limpar Cache do Navegador** (MAIS COMUM)

O Service Worker antigo pode estar bloqueando o login.

**No navegador:**
1. Abra DevTools (F12)
2. Vá em `Application` tab
3. Clique em `Storage` → `Clear site data`
4. ✅ Marque TUDO
5. Clique em `Clear site data`
6. **Feche e abra o navegador novamente**

### 2️⃣ **Verificar Console do Navegador**

Abra DevTools (F12) e vá em `Console`. Procure por erros:

```
❌ ERRO COMUM 1: "Failed to fetch"
Solução: Limpar cache e recarregar

❌ ERRO COMUM 2: "Invalid Refresh Token"
Solução: Está resolvido, limpe localStorage

❌ ERRO COMUM 3: "CORS policy"
Solução: Já corrigido no next.config.mjs
```

### 3️⃣ **Limpar localStorage Manualmente**

No Console do navegador (F12), execute:

```javascript
// Limpar tudo do Supabase
localStorage.clear();

// Limpar apenas auth
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase')) {
    localStorage.removeItem(key);
  }
});

// Recarregar
location.reload();
```

### 4️⃣ **Testar URL Direta de Login**

Acesse diretamente:
```
https://nasty-spooky-phantom-4j656gxvrgprhj4jx-3000.app.github.dev/login
```

Se aparecer a página mas não funciona ao clicar "Login", é problema de cache.

### 5️⃣ **Verificar Network no DevTools**

1. Abra DevTools (F12) → `Network` tab
2. Tente fazer login
3. Procure requisição POST para `/api/auth/...` ou similar
4. Veja o erro exato

**Erros comuns:**
- `503 Service Unavailable` → Service Worker bloqueando (limpe cache)
- `401 Unauthorized` → Credenciais erradas (tente outro email/senha)
- `CORS error` → Já corrigido, recarregue com Ctrl+Shift+R

## 🔧 Verificações Técnicas

### Verificar se Service Worker foi removido

No Console (F12):
```javascript
navigator.serviceWorker.getRegistrations().then(r => {
  console.log('Service Workers:', r);
  // Deve retornar array vazio: []
});
```

Se retornar algum service worker, remova:
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
  location.reload();
});
```

### Verificar se Supabase está configurado

No Console (F12):
```javascript
// Deve retornar a URL do Supabase
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
```

Se retornar `undefined`, o problema é variável de ambiente.

## 🚀 Reiniciar Servidor (Se Necessário)

Se as soluções acima não funcionarem:

```bash
# Parar servidor
pkill -f "next dev"

# Limpar cache do Next.js
rm -rf .next

# Reinstalar dependências (se necessário)
npm install

# Reiniciar
npm run dev
```

## 📊 Status Atual do Sistema

✅ **CORS**: Configurado corretamente  
✅ **Service Worker**: Desabilitado em dev  
✅ **Headers**: Aplicados no next.config.mjs  
✅ **Supabase**: Configurado (.env.local OK)  
✅ **Auth**: PKCE flow ativado  

## 🎯 Teste de Login Funcionando

**Deve ver:**
1. Página de login carrega → ✅
2. Digita email/senha e clica "Login" → ✅
3. Loading spinner aparece → ✅
4. Redireciona para `/chat` ou outra página → ✅

**NÃO deve ver:**
- ❌ Erro "Failed to fetch"
- ❌ Erro "CORS policy"
- ❌ Erro "Invalid Refresh Token"
- ❌ Página fica congelada

## 💡 Dicas Importantes

### 1. **Use Hard Reload sempre**
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 2. **Teste em Anónimo/Incognito**

Abra navegador anónimo e teste:
- Chrome: Ctrl+Shift+N
- Firefox: Ctrl+Shift+P

Se funcionar em anónimo, é cache do navegador principal.

### 3. **Evite usar back/forward do navegador**

Sempre navegue digitando URL ou clicando em links.

### 4. **Logs do Servidor**

Ver o que acontece no servidor:
```bash
tail -f /tmp/dev-server.log
```

Procure por erros ou avisos durante login.

## 🔐 Credenciais de Teste

Se não tem conta, crie em `/register` primeiro.

Ou use Google OAuth (botão "Continue with Google").

## ✅ Checklist de Debug

- [ ] Limpei cache do navegador (Clear site data)
- [ ] Limpei localStorage
- [ ] Fiz hard reload (Ctrl+Shift+R)
- [ ] Verifiquei Console (F12) por erros
- [ ] Verifiquei Network tab por requisições falhando
- [ ] Testei em navegador anónimo
- [ ] Service Workers removidos
- [ ] Servidor reiniciado

---

**Se NADA disso funcionar:**

Diga exatamente qual erro aparece no Console (F12) ou Network tab, e vou resolver!
