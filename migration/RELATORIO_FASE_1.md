# 📊 RELATÓRIO FASE 1 - DESCOBERTA COMPLETA

**Data:** 7 Novembro 2025  
**Status:** ✅ FASE 1 CONCLUÍDA

---

## 🎯 OBJETIVO

Unificar autenticação entre **DUA IA** e **DUA COIN**:
- ✅ Mesmo login funciona em ambos os sites
- ✅ Mesmo saldo DUA COIN visível em ambos
- ✅ Admin DUA COIN = Admin DUA IA
- ✅ Zero perda de dados

---

## 📊 ESTRUTURA DAS BASES DE DADOS

### **DUA IA (Origem)**
URL: `https://gocjbfcztorfswlkkjqi.supabase.co`

#### Tabelas Relevantes Encontradas:
| Tabela | Registros | Descrição |
|--------|-----------|-----------|
| `users` | **2** | ✅ Tabela principal de utilizadores |
| `invite_codes` | null | Códigos de convite |
| `conversations` | null | Conversas do chat |
| `token_usage_log` | null | Log de uso de tokens |
| `user_purchases` | null | Compras de utilizadores |
| `sessions_history` | null | Histórico de sessões |
| `login_attempts` | null | Tentativas de login |
| `audit_logs` | null | Logs de auditoria |

**IMPORTANTE:** DUA IA tem apenas **2 utilizadores** na tabela `users`.

---

### **DUA COIN (Destino - Base Principal)**
URL: `https://nranmngyocaqjwcokcxm.supabase.co`

#### Tabelas Existentes:
| Tabela | Registros | Descrição |
|--------|-----------|-----------|
| `profiles` | **8** | ✅ Perfis de utilizadores |
| `users` | **0** | Tabela vazia (criada recentemente) |
| `audit_logs` | **0** | Logs de auditoria |
| `codigos_acesso` | null | Códigos de acesso |
| `convites` | null | Convites |

**IMPORTANTE:** DUA COIN tem **8 utilizadores** em `profiles`.

---

## 🔍 ANÁLISE CRÍTICA

### ✅ **BOA NOTÍCIA:**
DUA IA tem **apenas 2 utilizadores** - a migração é **simples e rápida**.

### ⚠️ **SITUAÇÃO ATUAL:**

**DUA COIN:**
- ✅ 8 utilizadores em `profiles`
- ✅ Estrutura completa e funcional
- ✅ Base de dados principal

**DUA IA:**
- ✅ 2 utilizadores em `users`
- ✅ Várias tabelas auxiliares (convites, compras, etc.)
- ⚠️ Precisa migrar para DUA COIN

---

## 📋 PRÓXIMOS PASSOS

### **FASE 2: EXPORTAÇÃO E ANÁLISE** (Próximo)

#### Script 1: Exportar utilizadores da DUA IA
```bash
node migration/02_export_dua_ia_users.mjs
```
**O que faz:**
- Exporta os 2 utilizadores da DUA IA
- Salva emails, créditos, dados completos
- Gera: `migration/data/dua_ia_users.json`

#### Script 2: Exportar utilizadores da DUA COIN
```bash
node migration/03_export_dua_coin_users.mjs
```
**O que faz:**
- Exporta os 8 utilizadores da DUA COIN
- Salva UUIDs (devem ser preservados!)
- Gera: `migration/data/dua_coin_users.json`

#### Script 3: Comparar emails e gerar estratégia
```bash
node migration/04_compare_and_plan.mjs
```
**O que faz:**
- Compara emails entre as duas bases
- Identifica conflitos (email existe em ambas)
- Identifica novos (email só na DUA IA)
- Gera: `migration/data/MERGE_PLAN.json`

---

### **FASE 3: GERAÇÃO DE SQL**

Após analisar os dados, gerar SQL para:

1. **Criar utilizadores novos** (emails só na DUA IA)
2. **Merge de dados** (emails em ambas as bases)
3. **Importar tabelas auxiliares** (convites, compras, etc.)
4. **Sincronizar roles** (admin/user)

---

### **FASE 4: EXECUÇÃO**

Após revisão e aprovação, executar SQL na ordem correta.

---

## ⚠️ REGRAS ABSOLUTAS (REFORÇADAS)

### 🚫 NUNCA FAZER:
1. ❌ Apagar `auth.users` da DUA COIN
2. ❌ Apagar `auth.identities` da DUA COIN
3. ❌ Substituir UUIDs da DUA COIN
4. ❌ Executar SQL sem aprovação

### ✅ SEMPRE FAZER:
1. ✅ Preservar UUIDs da DUA COIN (prioridade máxima)
2. ✅ Merge inteligente por email
3. ✅ Criar novos UUIDs apenas para emails novos
4. ✅ Manter backup de tudo

---

## 🎯 SITUAÇÃO ESPERADA

### Cenário 1: Email existe em AMBAS as bases
```
DUA IA:     user@example.com → UUID: aaa-111
DUA COIN:   user@example.com → UUID: bbb-222

✅ AÇÃO: Manter UUID bbb-222 (DUA COIN tem prioridade)
✅ Atualizar dados da DUA IA para apontar para bbb-222
✅ Merge de créditos/saldos
```

### Cenário 2: Email só existe na DUA IA
```
DUA IA:     newuser@example.com → UUID: ccc-333
DUA COIN:   (não existe)

✅ AÇÃO: Criar novo utilizador na DUA COIN
✅ Usar Admin API para criar em auth.users
✅ Importar dados com novo UUID gerado
```

### Cenário 3: Email só existe na DUA COIN
```
DUA IA:     (não existe)
DUA COIN:   coinuser@example.com → UUID: ddd-444

✅ AÇÃO: Nada fazer
✅ Utilizador já existe e funciona
```

---

## 📌 PRÓXIMA AÇÃO

**USER DEVE:**
1. ✅ Revisar este relatório
2. ✅ Dar OK para continuar FASE 2
3. ✅ Executar: `node migration/02_export_dua_ia_users.mjs`

❗ **NADA SERÁ ALTERADO** - apenas exportação para análise.

---

## 📁 FICHEIROS GERADOS

✅ `migration/PLANO_MIGRACAO_UNIFICADA.md` - Plano completo  
✅ `migration/01_connect_both_supabase.mjs` - Teste de conexão  
✅ `migration/01b_discover_dua_ia_schema.mjs` - Descoberta de estrutura  
✅ `migration/data/dua_ia_schema.json` - Schema completo da DUA IA  
✅ `migration/RELATORIO_FASE_1.md` - Este relatório  

---

## ✅ CONCLUSÃO FASE 1

- ✅ Conexão às duas Supabase: **OK**
- ✅ Descoberta de estrutura: **OK**
- ✅ Análise de tabelas: **OK**
- ✅ Contagem de utilizadores: **OK**
- ✅ Plano documentado: **OK**

**Status:** Pronto para FASE 2 (Exportação de dados).
