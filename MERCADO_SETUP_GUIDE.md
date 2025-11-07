# 🎨 DUA CREATIVE MARKET - Guia de Instalação Completo

## ✅ 1. MIGRAÇÃO SUPABASE

### Passo 1: Aplicar migração SQL

```bash
# Opção A: Via Supabase CLI
supabase db push

# Opção B: Via Dashboard Supabase
# 1. Aceder ao dashboard: https://app.supabase.com
# 2. Ir para SQL Editor
# 3. Copiar conteúdo de: sql/migrations/20251107_mercado_criativo.sql
# 4. Executar
```

### Passo 2: Criar Storage Bucket "mercado"

```bash
# Via Supabase CLI
supabase storage create mercado --public

# Ou via Dashboard:
# 1. Storage → Create new bucket
# 2. Nome: "mercado"
# 3. Public: ✅ YES
# 4. File size limit: 50MB
# 5. Allowed MIME types: audio/*, video/*, image/*, application/zip, application/pdf
```

### Passo 3: Configurar políticas do bucket

No Dashboard Supabase → Storage → mercado → Policies:

```sql
-- Política 1: Qualquer pessoa pode LER
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'mercado');

-- Política 2: Utilizadores autenticados podem UPLOAD
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'mercado' 
  AND auth.role() = 'authenticated'
);

-- Política 3: Utilizadores podem DELETAR os seus ficheiros
CREATE POLICY "User Delete Own"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'mercado' 
  AND auth.uid() = owner
);
```

---

## ✅ 2. VERIFICAR INSTALAÇÃO

### Teste 1: Verificar tabelas

```sql
-- No SQL Editor do Supabase
SELECT * FROM mercado_itens LIMIT 5;
SELECT * FROM mercado_compras LIMIT 5;
```

### Teste 2: Verificar funções

```sql
-- Testar função de listagem
SELECT * FROM listar_itens_mercado(NULL, 10, 0);

-- Testar função de compra (substitua UUIDs)
SELECT * FROM processar_compra_mercado(
  'item_id_aqui'::UUID,
  'user_id_aqui'::UUID
);
```

### Teste 3: Verificar bucket

```bash
# Via CLI
supabase storage list mercado

# Via Dashboard
# Storage → mercado → deve estar criado e público
```

---

## ✅ 3. CONFIGURAR VARIÁVEIS DE AMBIENTE

Verificar que `.env.local` tem:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## ✅ 4. INSTALAR DEPENDÊNCIAS

```bash
# Se ainda não tem
npm install @supabase/supabase-js sonner framer-motion

# ou
pnpm install @supabase/supabase-js sonner framer-motion
```

---

## ✅ 5. ESTRUTURA DE FICHEIROS CRIADOS

```
app/
├── mercado/
│   └── page.tsx                          ✅ Página principal do mercado
├── api/
│   └── comprar-item/
│       └── route.ts                      ✅ Endpoint de compra

components/
└── mercado/
    ├── item-card.tsx                     ✅ Card de item
    └── publicar-item-modal.tsx           ✅ Modal de publicação

sql/
└── migrations/
    └── 20251107_mercado_criativo.sql     ✅ Migração completa
```

---

## ✅ 6. TESTAR FUNCIONALIDADES

### Teste 1: Aceder à página

```
http://localhost:3000/mercado
```

**Deve ver:**
- Header "DUA Creative Market"
- Stats (Total de Itens, Downloads, Vendas, Créditos)
- Categorias (Todos, Beats, Imagens, etc)
- Grid de itens (vazio inicialmente)

### Teste 2: Publicar item

1. Fazer login
2. Clicar em "Publicar Conteúdo"
3. Preencher formulário:
   - Título: "Beat Trap Teste"
   - Categoria: "beat"
   - Preço: 10
   - Upload ficheiro (MP3, por exemplo)
   - Upload preview (imagem opcional)
4. Clicar "Publicar Conteúdo"
5. **Deve ver toast de sucesso**
6. Item aparece na grid

### Teste 3: Comprar item

1. Fazer login com OUTRO utilizador
2. Verificar créditos no header
3. Clicar "Comprar" num item
4. **Deve ver:**
   - Toast de sucesso
   - Download automático
   - Créditos debitados
   - Item aparece nas compras

### Teste 4: Verificar transação

```sql
-- No Supabase SQL Editor
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

---

## ✅ 7. FUNCIONALIDADES IMPLEMENTADAS

### ✨ Para Todos os Utilizadores:

- ✅ Ver todos os itens publicados
- ✅ Filtrar por categoria
- ✅ Pesquisar por título/descrição
- ✅ Ver preview dos itens
- ✅ Ver preço em DUA Coins
- ✅ Ver estatísticas (downloads, vendas)

### ✨ Para Utilizadores Autenticados:

- ✅ Publicar conteúdos
- ✅ Upload de ficheiros (até 50MB)
- ✅ Upload de preview (até 5MB)
- ✅ Definir preço em DUA Coins
- ✅ Comprar conteúdos
- ✅ Download automático após compra
- ✅ Ver saldo de DUA Coins
- ✅ Transações automáticas (débito/crédito)

### ✨ Funcionalidades de Sistema:

- ✅ Prevenção de compras duplicadas
- ✅ Verificação de créditos
- ✅ Não pode comprar os próprios itens
- ✅ Atualização de estatísticas (downloads, vendas)
- ✅ Histórico de transações
- ✅ Row Level Security (RLS)
- ✅ Storage público para downloads

---

## ✅ 8. CATEGORIAS DISPONÍVEIS

- 🎵 Beat
- 🖼️ Imagem
- 🎨 Quadro
- 🎬 Vídeo
- 📄 Capa
- 🎭 Arte
- 📋 Template
- 📦 Outro

---

## ✅ 9. VALIDAÇÕES IMPLEMENTADAS

### Upload:
- ✅ Ficheiro principal: Máximo 50MB
- ✅ Preview: Máximo 5MB (apenas imagens)
- ✅ Tipos aceites: áudio, vídeo, imagem, ZIP, PDF

### Compra:
- ✅ Verificar autenticação
- ✅ Verificar créditos suficientes
- ✅ Prevenir compra própria
- ✅ Prevenir compra duplicada
- ✅ Transação atómica (débito + crédito)

---

## ✅ 10. UI/UX PREMIUM

### Design:
- 🎨 Interface escura elegante
- ✨ Animações suaves (Framer Motion)
- 💫 Hover effects nos cards
- 🌈 Gradientes cyan → purple
- 📱 100% Responsivo (mobile-first)

### Feedback:
- 🔔 Toast notifications (sonner)
- ⏳ Loading states
- 📊 Progress bar no upload
- ✅ Confirmações visuais

---

## ✅ 11. SEGURANÇA

- 🔐 Row Level Security (RLS) ativado
- 🔒 Autenticação obrigatória para publicar/comprar
- 🛡️ Validação server-side (SQL functions)
- 📝 Políticas de acesso granulares
- 🚫 Prevenção de SQL injection
- ✅ Transações atómicas

---

## ✅ 12. PRÓXIMOS PASSOS (OPCIONAL)

### Melhorias futuras:

1. **Sistema de Reviews**
   - Avaliações de 1-5 estrelas
   - Comentários de compradores

2. **Favoritos**
   - Utilizadores podem favoritar itens
   - Lista de desejos

3. **Analytics para Vendedores**
   - Dashboard de vendas
   - Gráficos de performance

4. **Sistema de Promoções**
   - Descontos temporários
   - Cupons de desconto

5. **Notificações**
   - Email quando vende
   - Email quando compra

---

## 🎯 RESULTADO FINAL

✅ **Página totalmente funcional**: `/mercado`

✅ **Marketplace completo** onde:
- Utilizadores publicam conteúdos digitais
- Definem preço em DUA Coins
- Outros utilizadores compram
- Download automático após compra
- Transações geridas automaticamente

✅ **100% em Português de Portugal**

✅ **UI Premium** com estética DUA

✅ **Seguro e escalável**

---

## 📞 SUPORTE

Se encontrar algum problema:

1. Verificar logs do Supabase
2. Verificar console do browser (F12)
3. Verificar que o bucket "mercado" existe e é público
4. Verificar que todas as políticas RLS estão ativas

---

## 🚀 DEPLOY

Para produção:

```bash
# 1. Build
npm run build

# 2. Deploy (Vercel)
vercel --prod

# 3. Verificar variáveis de ambiente no Vercel
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

✅ **DUA CREATIVE MARKET ESTÁ PRONTO!** 🎉
