# 🚀 Guia Rápido - Configurar Supabase Storage

## ⚡ Passo a Passo (5 minutos)

### **1. Acessar Supabase Dashboard**
```
https://supabase.com/dashboard/project/gocjbfcztorfswlkkjqi
```

### **2. Executar SQL para configurar storage**

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**
3. Copie e cole o conteúdo do arquivo:
   ```
   sql/setup-avatar-storage.sql
   ```
4. Clique em **"Run"** (Ctrl+Enter)

✅ **Resultado esperado:**
```
Success. No rows returned
```

### **3. Verificar bucket criado**

1. No menu lateral, clique em **"Storage"**
2. Você deve ver o bucket **"profile-images"**
3. Clique nele para ver a pasta **"avatars/"**

### **4. Testar no aplicativo**

1. Fazer login: `https://seu-dominio.com/login`
2. Acessar perfil: `https://seu-dominio.com/perfil`
3. Fazer upload de uma foto
4. Ver avatar atualizado no canto superior direito

---

## 🔍 Verificação Manual

### **Verificar bucket via API:**
```bash
curl 'https://gocjbfcztorfswlkkjqi.supabase.co/storage/v1/bucket/profile-images' \
  -H "apikey: YOUR_ANON_KEY"
```

### **Verificar políticas RLS:**
```sql
SELECT * FROM storage.objects WHERE bucket_id = 'profile-images';
```

### **Verificar coluna avatar_url:**
```sql
SELECT id, name, email, avatar_url FROM users LIMIT 5;
```

---

## 🐛 Troubleshooting

### **Erro: Bucket já existe**
- Bucket já foi criado anteriormente
- Ignore o erro e continue com as políticas

### **Erro: Policy já existe**
- As políticas já foram criadas
- Você pode deletá-las primeiro:
```sql
DROP POLICY IF EXISTS "Usuários podem fazer upload de suas imagens" ON storage.objects;
DROP POLICY IF EXISTS "Qualquer um pode ver imagens públicas" ON storage.objects;
DROP POLICY IF EXISTS "Usuários podem deletar suas imagens" ON storage.objects;
```
- Depois execute o script novamente

### **Upload não funciona**
1. Verificar se o bucket está público:
   - Storage → profile-images → Settings → Public bucket ✅

2. Verificar variáveis de ambiente:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://gocjbfcztorfswlkkjqi.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Verificar políticas RLS:
   - Storage → profile-images → Policies
   - Deve ter 3 políticas ativas

---

## 📊 Estrutura Criada

```
Storage (Supabase)
└── profile-images/ (bucket público)
    └── avatars/ (pasta)
        ├── user-id-timestamp.jpg
        ├── user-id-timestamp.png
        └── ...

Database (Supabase)
└── users (tabela)
    ├── id (uuid)
    ├── name (text)
    ├── email (text)
    ├── avatar_url (text) ⬅️ NOVA COLUNA
    └── ...
```

---

## ✅ Checklist

- [ ] Executei o SQL no Supabase
- [ ] Bucket "profile-images" foi criado
- [ ] 3 políticas RLS foram criadas
- [ ] Coluna "avatar_url" foi adicionada à tabela users
- [ ] Testei fazer upload de uma foto
- [ ] Avatar aparece no canto superior direito
- [ ] Posso selecionar avatares predefinidos

---

## 🎯 Pronto!

Seu sistema de perfil está 100% funcional! 🚀

**Próximos passos:**
1. Personalizar links do Discord/Telegram
2. Adicionar mais avatares predefinidos (opcional)
3. Implementar crop de imagem (opcional)
4. Adicionar filtros/efeitos (opcional)

---

## 📞 Suporte

Se encontrar problemas:
1. Verificar console do navegador (F12)
2. Verificar logs do Supabase
3. Verificar políticas RLS
4. Testar com outro usuário

**Status:** Sistema pronto para produção ✨
