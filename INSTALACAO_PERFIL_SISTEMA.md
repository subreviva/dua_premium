# 🚀 SISTEMA DE PERFIL COM TOKENS - INSTRUÇÕES DE INSTALAÇÃO

## 📋 PASSOS PARA EXECUTAR NO SUPABASE

### 1. Acesse o Supabase Dashboard
```
1. Vá para https://supabase.com/dashboard
2. Selecione seu projeto
3. Navegue para "SQL Editor" no menu lateral
```

### 2. Execute os Scripts na Ordem
Execute cada arquivo SQL na seguinte ordem:

```sql
-- 1. PRIMEIRO: Adicionar colunas à tabela users
-- Execute: sql/01_users_columns.sql

-- 2. SEGUNDO: Criar tabela de pacotes
-- Execute: sql/02_token_packages.sql  

-- 3. TERCEIRO: Criar tabela de compras
-- Execute: sql/03_user_purchases.sql

-- 4. QUARTO: Criar log de uso
-- Execute: sql/04_token_usage_log.sql

-- 5. QUINTO: Configurar segurança
-- Execute: sql/05_rls_policies.sql

-- 6. SEXTO: Funções automáticas
-- Execute: sql/06_functions_triggers.sql

-- 7. SÉTIMO: Atualizar usuários existentes
-- Execute: sql/07_update_users.sql
```

### 3. Verificar Instalação

Após executar todos os scripts, verifique se funcionou:

```sql
-- Verificar usuários atualizados
SELECT COUNT(*) as total_users, 
       COUNT(*) FILTER (WHERE total_tokens > 0) as users_with_tokens
FROM users;

-- Verificar pacotes criados  
SELECT name, tokens_amount, price FROM token_packages ORDER BY sort_order;
```

## ✅ RESULTADO ESPERADO

Após a execução, você terá:

- **Perfis de Usuário Expandidos**: Biografia, avatar, configurações
- **Sistema de Tokens**: 100 tokens iniciais para cada usuário
- **5 Pacotes de Compra**: De €4.99 a €149.99
- **Tracking Automático**: Compras e uso de tokens
- **Segurança RLS**: Políticas de acesso configuradas
- **Processamento Automático**: Triggers para compras e uso

## 🎯 PRÓXIMOS PASSOS

1. **Execute os SQLs**: Complete a instalação do banco
2. **Acesse o Perfil**: Navegue para `/profile` na aplicação
3. **Teste Compras**: Simule compra de tokens (pagamento mock)
4. **Configure Pagamentos**: Integre Stripe/PayPal para produção

---

**Status**: Banco preparado para sistema premium completo!