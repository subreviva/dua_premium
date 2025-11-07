# 🔄 PLANO DE MIGRAÇÃO UNIFICADA DUA IA → DUA COIN

**Data:** 7 Novembro 2025  
**Objetivo:** Unificar autenticação e dados entre DUA IA e DUA COIN

---

## 🎯 OBJETIVO FINAL

### Sistema Unificado:
- ✅ **Login único:** Mesmo email/password funciona em ambos os sites
- ✅ **Saldo único:** DUA COIN mostra mesmo valor em DUA IA e DUA COIN
- ✅ **Roles sincronizadas:** Admin DUA COIN = Admin DUA IA
- ✅ **Zero perda:** Todos os dados preservados
- ✅ **Base principal:** DUA COIN (nranmngyocaqjwcokcxm)

---

## 📊 BASES DE DADOS

### DUA IA (Origem - Leitura apenas)
- **URL:** https://gocjbfcztorfswlkkjqi.supabase.co
- **Service Role:** `eyJhbGci...OPk`
- **Status:** Será lida mas NÃO alterada

### DUA COIN (Destino - Base Principal)
- **URL:** https://nranmngyocaqjwcokcxm.supabase.co
- **Service Role:** `eyJhbGci...4lQ`
- **Status:** Receberá dados unificados

---

## ⚠️ REGRAS ABSOLUTAS

### 🚫 NUNCA FAZER:
1. ❌ Apagar `auth.users` da DUA COIN
2. ❌ Apagar `auth.identities` da DUA COIN
3. ❌ Substituir UUIDs existentes na DUA COIN
4. ❌ Executar comandos sem aprovação manual

### ✅ SEMPRE FAZER:
1. ✅ Preservar UUIDs da DUA COIN (prioridade)
2. ✅ Merge inteligente por email
3. ✅ Criar novos UUIDs apenas para emails novos
4. ✅ Manter histórico e logs
5. ✅ Gerar SQL para revisão manual

---

## 📋 FASES DA MIGRAÇÃO

### **FASE 1: ANÁLISE E EXPORTAÇÃO** (Atual)
**Status:** 🟡 EM PREPARAÇÃO

#### 1.1. Conectar às duas Supabase ✅
- Script: `01_connect_both_supabase.mjs`
- Testa conexão e lista tabelas

#### 1.2. Exportar dados da DUA IA 📤
- Script: `02_export_dua_ia.mjs`
- Exporta:
  - `auth.users` (apenas leitura)
  - `codigos_acesso`
  - `perfis_usuarios` (se existir)
  - `convites` (se existir)
  - `users_extra_data` (se existir)
  - Outras tabelas críticas

#### 1.3. Analisar DUA COIN atual 📥
- Script: `03_analyze_dua_coin.mjs`
- Lista:
  - Utilizadores existentes
  - Tabelas atuais
  - UUIDs a preservar

#### 1.4. Comparar emails (Merge Plan) 🔍
- Script: `04_compare_emails.mjs`
- Identifica:
  - Emails que existem em AMBAS as bases
  - Emails que só existem na DUA IA
  - Conflitos de UUID

**Resultado FASE 1:**
- ✅ 4 ficheiros JSON com dados exportados
- ✅ 1 ficheiro `MERGE_PLAN.json` com estratégia
- ✅ 0 alterações executadas

---

### **FASE 2: GERAÇÃO DE SQL** (Próxima)
**Status:** ⏳ AGUARDANDO FASE 1

#### 2.1. SQL para criar utilizadores novos
- Script: `05_generate_new_users_sql.mjs`
- Output: `SQL_01_create_new_users.sql`
- Cria utilizadores que só existem na DUA IA

#### 2.2. SQL para merge de dados
- Script: `06_generate_merge_sql.mjs`
- Output: `SQL_02_merge_user_data.sql`
- Une dados de utilizadores existentes

#### 2.3. SQL para importar tabelas
- Script: `07_generate_import_tables_sql.mjs`
- Output: `SQL_03_import_tables.sql`
- Importa `codigos_acesso`, `convites`, etc.

#### 2.4. SQL para sync de roles
- Script: `08_generate_roles_sync_sql.mjs`
- Output: `SQL_04_sync_roles.sql`
- Sincroniza admin/user entre bases

**Resultado FASE 2:**
- ✅ 4 ficheiros SQL prontos para revisão
- ✅ 0 alterações executadas

---

### **FASE 3: REVISÃO MANUAL** (Depois)
**Status:** ⏳ AGUARDANDO FASE 2

#### 3.1. Revisar todos os SQL gerados
- Abrir cada ficheiro SQL
- Verificar comandos
- Identificar riscos

#### 3.2. Aprovar execução
- User dá OK manual
- Confirma ordem de execução

**Resultado FASE 3:**
- ✅ SQL revisado e aprovado
- ✅ Ordem de execução definida

---

### **FASE 4: EXECUÇÃO** (Final)
**Status:** ⏳ AGUARDANDO APROVAÇÃO

#### 4.1. Backup da DUA COIN
- Script: `09_backup_dua_coin.mjs`
- Exporta estado atual

#### 4.2. Executar SQL em ordem
1. `SQL_01_create_new_users.sql`
2. `SQL_02_merge_user_data.sql`
3. `SQL_03_import_tables.sql`
4. `SQL_04_sync_roles.sql`

#### 4.3. Validar resultado
- Script: `10_validate_migration.mjs`
- Testa:
  - Login com emails de ambas as bases
  - Saldos DUA COIN sincronizados
  - Roles corretas

**Resultado FASE 4:**
- ✅ Migração completa
- ✅ Sistema unificado funcionando

---

## 📁 ESTRUTURA DE FICHEIROS

```
migration/
├── PLANO_MIGRACAO_UNIFICADA.md         (este ficheiro)
│
├── 01_connect_both_supabase.mjs        (teste conexão)
├── 02_export_dua_ia.mjs                (exportação DUA IA)
├── 03_analyze_dua_coin.mjs             (análise DUA COIN)
├── 04_compare_emails.mjs               (comparação)
│
├── 05_generate_new_users_sql.mjs       (gera SQL novos users)
├── 06_generate_merge_sql.mjs           (gera SQL merge)
├── 07_generate_import_tables_sql.mjs   (gera SQL import)
├── 08_generate_roles_sync_sql.mjs      (gera SQL roles)
│
├── 09_backup_dua_coin.mjs              (backup antes exec)
├── 10_validate_migration.mjs           (validação final)
│
├── data/
│   ├── dua_ia_users.json               (exportado)
│   ├── dua_ia_codigos.json             (exportado)
│   ├── dua_ia_convites.json            (exportado)
│   ├── dua_coin_users.json             (exportado)
│   └── MERGE_PLAN.json                 (estratégia)
│
└── sql/
    ├── SQL_01_create_new_users.sql     (criar novos)
    ├── SQL_02_merge_user_data.sql      (merge dados)
    ├── SQL_03_import_tables.sql        (importar tabelas)
    └── SQL_04_sync_roles.sql           (sync roles)
```

---

## 🔐 ESTRATÉGIA DE MERGE

### Cenário 1: Email existe em AMBAS as bases
```
DUA IA:     user@example.com → UUID: aaa-111
DUA COIN:   user@example.com → UUID: bbb-222

✅ AÇÃO: Manter UUID bbb-222 (DUA COIN)
✅ Atualizar dados da DUA IA para apontar para bbb-222
✅ Preservar role mais alta (se admin em qualquer, fica admin)
```

### Cenário 2: Email só existe na DUA IA
```
DUA IA:     newuser@example.com → UUID: ccc-333
DUA COIN:   (não existe)

✅ AÇÃO: Criar novo utilizador na DUA COIN
✅ Gerar novo UUID na DUA COIN
✅ Importar dados com novo UUID
```

### Cenário 3: Email só existe na DUA COIN
```
DUA IA:     (não existe)
DUA COIN:   coinuser@example.com → UUID: ddd-444

✅ AÇÃO: Nada fazer
✅ Utilizador já existe e funciona
```

---

## 🧪 TESTES DE VALIDAÇÃO

### Após migração, validar:
1. ✅ Login com email da DUA IA funciona
2. ✅ Login com email da DUA COIN funciona
3. ✅ Saldo DUA COIN visível em ambos os sites
4. ✅ Admin na DUA COIN é admin na DUA IA
5. ✅ Códigos de acesso preservados
6. ✅ Convites preservados
7. ✅ Zero utilizadores perdidos

---

## 📞 PRÓXIMO PASSO

**AGORA:** Criar script `01_connect_both_supabase.mjs`

**USER DEVE:**
1. Revisar este plano
2. Dar OK para iniciar FASE 1
3. Aguardar resultados da exportação

❗ **NADA SERÁ EXECUTADO SEM APROVAÇÃO**
