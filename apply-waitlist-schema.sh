#!/bin/bash

# ============================================================
# APLICAR SCHEMA DE WAITLIST NO SUPABASE
# ============================================================

echo "🚀 Aplicando schema de Early Access Waitlist no Supabase..."
echo ""

# Verificar variáveis de ambiente
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ ERRO: Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são necessárias"
  echo ""
  echo "Configure no .env.local:"
  echo "NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui"
  echo "SUPABASE_SERVICE_ROLE_KEY=sua_key_aqui"
  exit 1
fi

# Carregar variáveis do .env.local
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# URL base do Supabase
SUPABASE_API_URL="${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc"

echo "📡 Conectando ao Supabase..."
echo "URL: $NEXT_PUBLIC_SUPABASE_URL"
echo ""

# Ler o ficheiro SQL
SQL_FILE="sql/create-early-access-waitlist.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "❌ ERRO: Ficheiro $SQL_FILE não encontrado"
  exit 1
fi

echo "📄 Lendo ficheiro SQL: $SQL_FILE"
echo ""

# Aplicar SQL usando psql se disponível, caso contrário usar API
if command -v psql &> /dev/null; then
  echo "✅ Usando psql para aplicar schema..."
  
  # Extrair credenciais do Supabase URL
  # Formato: https://xxxxx.supabase.co
  PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -E 's|https://([^.]+)\.supabase\.co|\1|')
  
  echo "🔧 Project Ref: $PROJECT_REF"
  echo ""
  echo "📋 Para aplicar manualmente, use:"
  echo "  1. Acesse: https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
  echo "  2. Cole o conteúdo de: $SQL_FILE"
  echo "  3. Execute o SQL"
  echo ""
  echo "Ou execute diretamente via psql se tiver as credenciais de conexão."
  
else
  echo "⚠️  psql não disponível"
  echo ""
  echo "📋 INSTRUÇÕES MANUAIS:"
  echo "  1. Acesse o Supabase Dashboard"
  echo "  2. Vá para SQL Editor"
  echo "  3. Cole e execute o conteúdo de: $SQL_FILE"
fi

echo ""
echo "📊 Após aplicar o SQL, verifique:"
echo "  • Tabela 'early_access_subscribers' criada"
echo "  • Políticas RLS configuradas"
echo "  • Funções de contagem e migração criadas"
echo ""

# Criar ficheiro de instruções
cat > WAITLIST_SETUP_INSTRUCTIONS.md << 'EOF'
# 🎯 Instruções de Setup - Sistema de Waitlist

## 1. Aplicar Schema no Supabase

### Opção A: Via Dashboard (Recomendado)
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para **SQL Editor** (menu lateral)
4. Clique em **New Query**
5. Cole todo o conteúdo do ficheiro: `sql/create-early-access-waitlist.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)

### Opção B: Via CLI
```bash
# Se tiver Supabase CLI instalado
supabase db push

# Ou aplicar ficheiro específico
cat sql/create-early-access-waitlist.sql | supabase db execute
```

## 2. Verificar Instalação

Após aplicar o SQL, execute estas queries no SQL Editor para verificar:

```sql
-- Verificar se tabela foi criada
SELECT * FROM public.early_access_subscribers LIMIT 1;

-- Verificar funções
SELECT * FROM public.count_early_access_subscribers();

-- Verificar políticas RLS
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'early_access_subscribers';
```

## 3. Testar API

Teste o endpoint de subscrição:

```bash
# Registar novo subscriber
curl -X POST http://localhost:3001/api/early-access/subscribe \
  -H "Content-Type: application/json" \
  -d '{"name":"João Silva","email":"joao@example.com"}'

# Verificar se email já existe
curl "http://localhost:3001/api/early-access/subscribe?email=joao@example.com"
```

## 4. Estrutura da Tabela

A tabela `early_access_subscribers` contém:

- **Dados básicos**: email, name
- **Status**: waiting, invited, registered
- **Tracking**: IP, user agent, UTM parameters
- **Datas**: subscribed_at, invited_at, registered_at
- **Metadados**: source, referral_code, priority_level

## 5. Fluxo de Uso

1. **User se regista** → Status: `waiting`
2. **Admin envia convite** → Status: `invited` (via função `mark_subscriber_as_invited`)
3. **User cria conta** → Status: `registered` (via função `migrate_subscriber_to_user`)

## 6. Funções Disponíveis

```sql
-- Contar subscribers por status
SELECT * FROM count_early_access_subscribers();

-- Marcar subscriber como convidado
SELECT mark_subscriber_as_invited('email@example.com');

-- Migrar subscriber para user
SELECT migrate_subscriber_to_user('email@example.com', 'user_uuid_here');
```

## 7. Verificação de Segurança

✅ RLS está ativado
✅ Qualquer pessoa pode inserir (subscrever)
✅ Qualquer pessoa pode verificar se email existe
✅ Apenas admins podem ver todos os dados
✅ Service role tem acesso total

## 8. Próximos Passos

- [ ] Aplicar SQL no Supabase
- [ ] Testar página `/registo`
- [ ] Configurar email de confirmação (opcional)
- [ ] Criar painel admin para gerir waitlist
- [ ] Configurar processo de envio de convites

## 9. Troubleshooting

**Erro: "relation does not exist"**
- Verifique se o SQL foi aplicado corretamente
- Confirme que está usando o schema `public`

**Erro: "permission denied"**
- Verifique se RLS está configurado
- Confirme que as políticas foram criadas

**Erro 500 na API**
- Verifique logs do servidor
- Confirme que SUPABASE_SERVICE_ROLE_KEY está configurada
- Teste conexão com Supabase

EOF

echo "✅ Ficheiro de instruções criado: WAITLIST_SETUP_INSTRUCTIONS.md"
echo ""
echo "🎉 Próximos passos:"
echo "  1. Leia: WAITLIST_SETUP_INSTRUCTIONS.md"
echo "  2. Aplique o SQL no Supabase Dashboard"
echo "  3. Teste a página /registo"
echo ""
