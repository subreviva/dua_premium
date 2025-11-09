# 🎯 COMO APLICAR O SQL DA COMUNIDADE NO SUPABASE

## ⚠️ MÉTODO OFICIAL: Supabase Dashboard

O método via código Node.js **NÃO FUNCIONA** porque a função `exec_sql` não existe no Supabase.

**A única forma comprovada é via Dashboard:**

---

## 📋 PASSO A PASSO

### 1️⃣ Abrir Supabase Dashboard

Acesse: https://supabase.com/dashboard/project/nranmngyocaqjwcokcxm

### 2️⃣ Ir para SQL Editor

No menu lateral esquerdo, clique em:
- **SQL Editor** (ícone de código `</>`)

### 3️⃣ Criar Nova Query

- Clique em **"New Query"**
- Ou use o botão **"+"** no canto superior direito

### 4️⃣ Copiar o SQL

Abra o arquivo: `supabase-community-schema.sql`

**COPIE TODO O CONTEÚDO** (230 linhas)

### 5️⃣ Colar no Editor

Cole todo o SQL no editor do Supabase Dashboard

### 6️⃣ Executar

Clique no botão **"Run"** (ou pressione `Ctrl + Enter`)

### 7️⃣ Aguardar Conclusão

Você verá mensagens de sucesso indicando:
- ✅ Tabelas criadas
- ✅ Índices criados
- ✅ Funções criadas
- ✅ Triggers criados
- ✅ Políticas RLS criadas
- ✅ View criada

---

## ✅ VERIFICAÇÃO

Após executar o SQL, você pode verificar:

### No Dashboard - Tabelas:

1. Vá em **Table Editor** no menu lateral
2. Você deve ver 3 novas tabelas:
   - `community_posts`
   - `community_likes`
   - `community_comments`

### Via Terminal (opcional):

```bash
node test-community-post.mjs
```

Se as tabelas existirem, este comando vai criar posts de teste.

---

## 📊 O QUE SERÁ CRIADO

### Tabelas:
- **community_posts**: Posts de imagens e músicas
- **community_likes**: Likes dos usuários nos posts
- **community_comments**: Comentários nos posts

### Funções:
- `update_post_likes_count()`: Atualiza contador de likes
- `update_post_comments_count()`: Atualiza contador de comentários
- `update_updated_at_column()`: Atualiza timestamp de modificação

### Triggers:
- Auto-incremento de likes_count ao dar like/unlike
- Auto-incremento de comments_count ao comentar
- Auto-update de updated_at ao modificar posts/comentários

### Políticas RLS:
- ✅ Qualquer um pode ver posts, likes e comentários
- ✅ Apenas autenticados podem criar posts/likes/comentários
- ✅ Apenas donos podem editar/deletar seus posts/comentários

### View:
- `community_posts_with_user`: Posts com dados do usuário (nome, avatar)

---

## 🚀 APÓS APLICAR

Execute para criar posts de teste:

```bash
node test-community-post.mjs
```

Depois acesse:

```
http://localhost:3000/community
```

Você verá os posts criados com o sistema funcionando 100%!

---

## 📝 RESUMO

1. ✅ Abrir Supabase Dashboard
2. ✅ Ir para SQL Editor
3. ✅ Nova Query
4. ✅ Copiar conteúdo de `supabase-community-schema.sql`
5. ✅ Colar no editor
6. ✅ Clicar em Run
7. ✅ Aguardar conclusão
8. ✅ Executar `node test-community-post.mjs`
9. ✅ Acessar `/community`

---

**Data:** 08/11/2025  
**Status:** Pronto para aplicar  
**Arquivo SQL:** `supabase-community-schema.sql` (230 linhas)
