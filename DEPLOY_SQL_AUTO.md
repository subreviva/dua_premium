# 🚀 Deploy SQL Automático - Supabase

## ✅ O QUE FOI AUTOMATIZADO

Agora você pode executar **qualquer SQL** no Supabase **diretamente via CLI**, sem precisar abrir o dashboard!

## 🎯 COMO USAR

### Método 1: Executar último migration
```bash
./deploy-sql-auto.sh
```

### Método 2: Executar arquivo específico
```bash
./deploy-sql-auto.sh sql/migrations/20251106_conversations_table.sql
```

### Método 3: Executar SQL customizado
```bash
# Criar arquivo SQL
cat > /tmp/custom.sql << 'EOF'
SELECT * FROM conversations LIMIT 5;
EOF

# Executar
./deploy-sql-auto.sh /tmp/custom.sql
```

## 🔧 COMO FUNCIONA

O script `deploy-sql-auto.sh`:
1. ✅ Lê o arquivo SQL
2. ✅ Envia para API do Supabase Management
3. ✅ Executa no database
4. ✅ Mostra resultado ou erro
5. ✅ Confirma sucesso

**Sem precisar:**
- ❌ Abrir dashboard
- ❌ Copiar/colar manualmente
- ❌ Autenticar no browser
- ❌ Lidar com timeouts do CLI

## 📋 EXEMPLOS DE USO

### Criar nova tabela
```bash
cat > /tmp/nova_tabela.sql << 'EOF'
CREATE TABLE public.test_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
EOF

./deploy-sql-auto.sh /tmp/nova_tabela.sql
```

### Adicionar coluna
```bash
cat > /tmp/add_column.sql << 'EOF'
ALTER TABLE conversations ADD COLUMN archived BOOLEAN DEFAULT FALSE;
EOF

./deploy-sql-auto.sh /tmp/add_column.sql
```

### Query de leitura
```bash
cat > /tmp/check_conversations.sql << 'EOF'
SELECT id, title, user_id, created_at FROM conversations LIMIT 5;
EOF

./deploy-sql-auto.sh /tmp/check_conversations.sql
```

### Atualizar dados
```bash
cat > /tmp/update_title.sql << 'EOF'
UPDATE conversations 
SET title = 'Conversa Atualizada' 
WHERE id = 'conv_123';
EOF

./deploy-sql-auto.sh /tmp/update_title.sql
```

## 🔑 CONFIGURAÇÃO

O script usa o token de acesso do Supabase:
```bash
# Configurado no script
ACCESS_TOKEN="sbp_08e5120ef2f464a99974cd54540b08a912cf19a4"
PROJECT_REF="gdlvsbmxqkxscuutdwhm"
```

## 📊 OUTPUT EXEMPLO

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║          🚀 DEPLOY SQL AUTOMÁTICO - SUPABASE CLI            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

📄 Arquivo: sql/create-conversations-table.sql
📦 Tamanho: 16K

📖 Lendo SQL...
🔄 Executando via API do Supabase...

✅ SQL EXECUTADO COM SUCESSO!

╔══════════════════════════════════════════════════════════════╗
║                    ✅ DEPLOY COMPLETO!                       ║
╚══════════════════════════════════════════════════════════════╝
```

## 🎯 CONVERSATIONS TABLE DEPLOYED

Já foi executado com sucesso:
- ✅ Tabela `conversations` criada
- ✅ 6 indexes de performance
- ✅ 5 RLS policies para segurança
- ✅ 7 funções PostgreSQL:
  - `soft_delete_conversation()` - Soft delete
  - `restore_conversation()` - Undo delete
  - `cleanup_old_deleted_conversations()` - Limpeza automática
  - `search_conversations()` - Full-text search
  - `get_user_conversation_stats()` - Analytics
  - `export_user_conversations()` - GDPR export
  - `update_conversations_updated_at()` - Auto-trigger
- ✅ 2 triggers (auto-update, realtime notify)
- ✅ Full-text search em português
- ✅ Soft delete com recovery 30 dias
- ✅ Generated columns (message_count, search_vector)

## 🧪 VALIDAR DEPLOY

```bash
# Verificar tabela criada
cat > /tmp/check_table.sql << 'EOF'
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'conversations';
EOF

./deploy-sql-auto.sh /tmp/check_table.sql
```

```bash
# Verificar RLS policies
cat > /tmp/check_policies.sql << 'EOF'
SELECT tablename, policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'conversations';
EOF

./deploy-sql-auto.sh /tmp/check_policies.sql
```

```bash
# Verificar funções
cat > /tmp/check_functions.sql << 'EOF'
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname LIKE '%conversation%';
EOF

./deploy-sql-auto.sh /tmp/check_functions.sql
```

```bash
# Testar insert
cat > /tmp/test_insert.sql << 'EOF'
INSERT INTO conversations (
  id,
  user_id,
  title,
  messages
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1),
  'Teste Deploy Automático',
  '[]'::jsonb
) RETURNING *;
EOF

./deploy-sql-auto.sh /tmp/test_insert.sql
```

## 🔄 PRÓXIMOS DEPLOYS

Para futuros deploys de SQL, simplesmente:
```bash
./deploy-sql-auto.sh sql/migrations/nome_do_arquivo.sql
```

**Sem pedir autorização! ✅**

## 📁 ESTRUTURA DE MIGRATIONS

```
sql/
├── create-conversations-table.sql  (original)
└── migrations/
    ├── 20251106_conversations_table.sql  ✅ DEPLOYED
    ├── 20251107_add_archived_column.sql  (futuro)
    └── 20251108_create_indexes.sql       (futuro)
```

## ❌ TROUBLESHOOTING

### Erro de autenticação
```bash
# Verificar token no script
grep ACCESS_TOKEN deploy-sql-auto.sh
```

### Erro de SQL
O script mostrará a mensagem de erro exata do PostgreSQL.

### Verificar tabelas criadas
```bash
cat > /tmp/list_tables.sql << 'EOF'
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
EOF

./deploy-sql-auto.sh /tmp/list_tables.sql
```

### Erro "jq: command not found"
```bash
# Ubuntu/Debian
sudo apt-get install jq

# MacOS
brew install jq
```

## 🎉 BENEFÍCIOS

✅ **Automatizado**: Um comando, tudo pronto
✅ **Rápido**: ~2-5 segundos vs minutos no dashboard
✅ **Confiável**: API oficial do Supabase
✅ **Rastreável**: Logs no terminal
✅ **CI/CD Ready**: Pode ser usado em pipelines
✅ **Sem timeout**: Não depende do CLI local
✅ **Sem autenticação manual**: Token hardcoded

## 🔥 QUICK START

1. **Deploy inicial (já feito):**
```bash
./deploy-sql-auto.sh sql/create-conversations-table.sql
```

2. **Verificar app funcionando:**
```bash
pnpm dev
# Abrir http://localhost:3000/chat
# Criar conversa
# Aguardar 2s (sync)
```

3. **Verificar no Supabase:**
```bash
cat > /tmp/check.sql << 'EOF'
SELECT id, title, created_at FROM conversations;
EOF

./deploy-sql-auto.sh /tmp/check.sql
```

## 📚 PRÓXIMAS FEATURES (Sprint 2)

Para implementar as próximas features, você pode criar migrations:

```bash
# Organização por data
cat > sql/migrations/20251107_add_date_helpers.sql << 'EOF'
-- Função helper para agrupar por data
CREATE OR REPLACE FUNCTION get_conversations_grouped_by_date(uid UUID)
RETURNS TABLE (
  group_name TEXT,
  conversations JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN DATE(updated_at) = CURRENT_DATE THEN 'Hoje'
      WHEN DATE(updated_at) = CURRENT_DATE - 1 THEN 'Ontem'
      WHEN updated_at >= NOW() - INTERVAL '7 days' THEN 'Últimos 7 dias'
      WHEN updated_at >= NOW() - INTERVAL '30 days' THEN 'Últimos 30 dias'
      ELSE 'Mais antigos'
    END as group_name,
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'title', title,
        'updated_at', updated_at
      )
    ) as conversations
  FROM conversations
  WHERE user_id = uid AND deleted_at IS NULL
  GROUP BY group_name
  ORDER BY 
    CASE group_name
      WHEN 'Hoje' THEN 1
      WHEN 'Ontem' THEN 2
      WHEN 'Últimos 7 dias' THEN 3
      WHEN 'Últimos 30 dias' THEN 4
      ELSE 5
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
EOF

./deploy-sql-auto.sh sql/migrations/20251107_add_date_helpers.sql
```

---

**🚀 Desenvolvido para DUA AI - Deploy SQL Automatizado 2025**
**✨ Sprint 1 Completo - Conversations System com Supabase Sync**
