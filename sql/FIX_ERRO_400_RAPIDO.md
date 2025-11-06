# 🚨 FIX RÁPIDO - ERRO 400 NO PERFIL

## O Problema Identificado

Você está tendo **2 erros**:

1. ❌ **Erro 400** ao salvar perfil:
   ```
   gocjbfcztorfswlkkjqi.supabase.co/rest/v1/users?on_conflict=id:1
   Failed to load resource: 400
   ```
   
2. ❌ **Erro 404** na tabela audit_logs:
   ```
   gocjbfcztorfswlkkjqi.supabase.co/rest/v1/audit_logs:1
   Failed to load resource: 404
   ```

---

## ✅ SOLUÇÃO RÁPIDA (2 minutos)

### **1. Abra o Supabase SQL Editor**
- Vá em: https://supabase.com/dashboard
- Selecione seu projeto
- Clique em **SQL Editor** (menu lateral)

### **2. Execute este script**
Cole e execute: `sql/fix-erro-400.sql`

O script vai:
- ✅ Criar tabela `users` com todas colunas necessárias
- ✅ Criar tabela `audit_logs` (para evitar erro 404)
- ✅ Configurar políticas RLS corretas
- ✅ Forçar reload do schema cache 3x
- ✅ Mostrar estrutura final das tabelas

### **3. Aguarde 10 segundos**
Deixe o cache do Supabase atualizar

### **4. Teste novamente**
- Acesse: http://localhost:3000/perfil
- Abra F12 → Console
- Tente salvar o perfil
- Veja os logs detalhados

---

## 🔍 O que Foi Corrigido no Código

### **app/perfil/page.tsx:**
```typescript
// ANTES (causava erro 400):
.upsert(profileData, {
  onConflict: 'id',
  ignoreDuplicates: false
})

// AGORA (sintaxe correta):
.upsert(profileData)  // onConflict='id' é automático na primary key
```

### **sql/fix-erro-400.sql:**
- Cria tabela `users` se não existir
- Cria tabela `audit_logs` se não existir (resolve 404)
- Remove TODAS as políticas antigas (evita conflito)
- Cria políticas novas e mais permissivas
- Força reload do schema 3x com sleep entre cada

---

## 📊 Logs Esperados (Console F12)

### ✅ **Sucesso:**
```
📤 Salvando perfil: {id: "...", email: "...", name: "..."}
📥 Resposta Supabase: {data: [{...}], error: null}
✅ Perfil atualizado! ✨
```

### ❌ **Se Ainda Houver Erro:**
```
📤 Salvando perfil: {id: "...", email: "...", name: "..."}
📥 Resposta Supabase: {data: null, error: {...}}
❌ Erro detalhado: {message: "...", code: "...", details: "..."}
```

**→ COPIE e me envie os logs se ainda houver erro!**

---

## 🆘 Troubleshooting

### Erro 400 persiste?

1. **Verifique se executou o script SQL**
   ```sql
   SELECT COUNT(*) FROM public.users;
   SELECT COUNT(*) FROM public.audit_logs;
   ```
   Ambos devem retornar números (mesmo que 0)

2. **Force reload manualmente**
   Execute no SQL Editor:
   ```sql
   NOTIFY pgrst, 'reload schema';
   SELECT pg_sleep(2);
   NOTIFY pgrst, 'reload schema';
   ```

3. **Verifique as variáveis de ambiente**
   ```bash
   grep SUPABASE .env.local
   ```
   Confirme que:
   - `NEXT_PUBLIC_SUPABASE_URL` está correto
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correto

4. **Teste a API diretamente**
   ```bash
   curl -X GET \
     "https://gocjbfcztorfswlkkjqi.supabase.co/rest/v1/users" \
     -H "apikey: SUA_ANON_KEY"
   ```

### Erro 404 do audit_logs persiste?

O script `fix-erro-400.sql` já cria a tabela. Se ainda aparecer erro 404:

1. Verifique se a tabela foi criada:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'audit_logs';
   ```

2. Force reload:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

---

## 📝 Checklist Final

- [ ] Executei `sql/fix-erro-400.sql` no Supabase
- [ ] Vi mensagens de ✅ sucesso no output
- [ ] Aguardei 10 segundos
- [ ] Recarreguei a página do perfil
- [ ] Abri F12 → Console
- [ ] Tentei salvar o perfil
- [ ] Copiei os logs se ainda houver erro

---

## 🎯 Se Ainda Não Funcionar

Me envie:

1. ✅ **Screenshot do output** do script SQL
2. ✅ **Logs completos do console** (F12)
3. ✅ **Resultado deste comando no SQL Editor:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'users' ORDER BY ordinal_position;
   ```

Isso vai me dar todas as informações necessárias para resolver!
