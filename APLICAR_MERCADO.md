# 🛒 DUA CREATIVE MARKET - Aplicar Setup

## ⚡ MÉTODO RÁPIDO (2 minutos)

### 1️⃣ Aplicar Migração SQL

1. **Aceda ao SQL Editor do Supabase:**
   - https://app.supabase.com
   - Selecione o seu projeto
   - Menu lateral → SQL Editor

2. **Copie TODO o conteúdo de:**
   ```
   sql/migrations/20251107_mercado_criativo.sql
   ```

3. **Cole no SQL Editor e clique em "Run"**

✅ Deve ver: Query executada com sucesso

---

### 2️⃣ Criar Bucket Storage

1. **Aceda ao Storage:**
   - https://app.supabase.com
   - Selecione o seu projeto
   - Menu lateral → Storage

2. **Clique em "New bucket"**

3. **Configurar:**
   - **Name:** `mercado`
   - **Public bucket:** ✅ **YES** (importante!)
   - **File size limit:** `52428800` (50MB)
   - **Allowed MIME types:** (deixar vazio ou adicionar)
     ```
     audio/*
     video/*
     image/*
     application/zip
     application/pdf
     ```

4. **Clique em "Create bucket"**

✅ Bucket "mercado" criado!

---

### 3️⃣ Configurar Políticas do Bucket

1. **No bucket "mercado", clique em "Policies"**

2. **Clique em "New Policy" e crie 3 políticas:**

#### 📖 POLÍTICA 1 - Public Read

```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'mercado');
```

#### 📝 POLÍTICA 2 - Authenticated Upload

```sql
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'mercado' 
  AND auth.role() = 'authenticated'
);
```

#### 🗑️ POLÍTICA 3 - User Delete Own

```sql
CREATE POLICY "User Delete Own"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'mercado' 
  AND auth.uid() = owner
);
```

---

## ✅ VERIFICAR INSTALAÇÃO

### Testar Tabelas

No SQL Editor, execute:

```sql
-- Ver tabelas criadas
SELECT * FROM mercado_itens LIMIT 5;
SELECT * FROM mercado_compras LIMIT 5;

-- Testar função de listagem
SELECT * FROM listar_itens_mercado(NULL, 10, 0);
```

### Testar Bucket

No Storage → mercado:
- Deve estar **público** (ícone de globo)
- Deve permitir upload de ficheiros

---

## 🚀 TESTAR NO BROWSER

1. **Iniciar servidor:**
   ```bash
   npm run dev
   # ou
   pnpm dev
   ```

2. **Aceder:**
   ```
   http://localhost:3000/mercado
   ```

3. **Fazer login** (criar conta se necessário)

4. **Clicar em "Publicar Conteúdo"**

5. **Upload de ficheiro teste:**
   - Título: "Beat Teste"
   - Categoria: "beat"
   - Preço: 10 DUA Coins
   - Ficheiro: Qualquer MP3 ou imagem
   - Preview: Imagem (opcional)

6. **Clicar "Publicar Conteúdo"**

✅ **Deve ver:**
- Toast de sucesso
- Item aparece na grid
- Preview da imagem
- Preço em DUA Coins

---

## 🎯 RESULTADO ESPERADO

### Página /mercado deve mostrar:

- ✅ Header "DUA Creative Market"
- ✅ Botão "Publicar Conteúdo"
- ✅ 4 Cards de estatísticas
- ✅ Barra de pesquisa
- ✅ 8 Botões de categorias
- ✅ Grid de itens (vazio inicialmente)

### Após publicar:

- ✅ Item aparece na grid
- ✅ Preview da imagem
- ✅ Título e descrição
- ✅ Badge da categoria
- ✅ Preço em DUA Coins
- ✅ Nome do vendedor
- ✅ Botão "Comprar"

### Após comprar (com outro utilizador):

- ✅ Toast de sucesso
- ✅ Download automático
- ✅ Créditos debitados
- ✅ Vendedor recebe créditos

---

## 🆘 TROUBLESHOOTING

### ❌ Erro ao publicar item

**Problema:** "Erro ao fazer upload"

**Solução:**
- Verificar que bucket "mercado" está **público**
- Verificar políticas de Storage (3 políticas criadas)
- Verificar tamanho do ficheiro (máx 50MB)

---

### ❌ Erro ao comprar item

**Problema:** "Créditos insuficientes"

**Solução:**
- Adicionar DUA Coins ao utilizador via SQL:

```sql
UPDATE users 
SET dua_coins = dua_coins + 1000 
WHERE id = 'seu_user_id';
```

Para ver seu user_id:
```sql
SELECT id, email, dua_coins FROM users;
```

---

### ❌ Tabelas não existem

**Problema:** "relation mercado_itens does not exist"

**Solução:**
- Reexecutar migração SQL completa
- Verificar que não houve erros no SQL Editor

---

### ❌ Bucket não encontrado

**Problema:** "Bucket mercado not found"

**Solução:**
- Criar bucket manualmente (passo 2️⃣ acima)
- Verificar que está **público**

---

## 📊 MONITORIZAÇÃO

### Ver todos os itens publicados:

```sql
SELECT 
  mi.*,
  u.full_name as vendedor
FROM mercado_itens mi
JOIN users u ON mi.user_id = u.id
ORDER BY mi.criado_em DESC;
```

### Ver todas as compras:

```sql
SELECT 
  mc.*,
  mi.titulo,
  uc.full_name as comprador,
  uv.full_name as vendedor
FROM mercado_compras mc
JOIN mercado_itens mi ON mc.item_id = mi.id
JOIN users uc ON mc.comprador_id = uc.id
JOIN users uv ON mc.vendedor_id = uv.id
ORDER BY mc.comprado_em DESC;
```

### Ver créditos de utilizadores:

```sql
SELECT 
  id,
  email,
  full_name,
  dua_coins
FROM users
ORDER BY dua_coins DESC;
```

---

## ✅ SETUP COMPLETO!

🎉 **DUA Creative Market está pronto para usar!**

📖 **Documentação completa:** `MERCADO_SETUP_GUIDE.md`

🚀 **Próximos passos:**
- Testar upload de diferentes tipos de ficheiros
- Testar compra com múltiplos utilizadores
- Adicionar mais itens ao mercado
- Personalizar categorias se necessário
