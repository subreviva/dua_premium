# 📋 GUIA: Custos de Serviços Configuráveis

## ✅ Sistema Implementado

Você agora tem um **sistema completo de configuração de custos** onde pode:

1. ✅ **Alterar custos via interface administrativa**
2. ✅ **Consultar custos dinamicamente nas APIs**
3. ✅ **Registrar mudanças em auditoria**
4. ✅ **Cache para performance**

---

## 🎯 Como Funciona

### 1. Tabela de Configuração

**Tabela:** `service_costs`

```sql
service_name         | credits_cost | is_active
---------------------|--------------|----------
imagen_generate      | 10           | true
music_generation     | 25           | true
video_generation     | 50           | true
```

### 2. Interface Admin

**Localização:** Painel Admin → Aba "Custos de Serviços"

**Funcionalidades:**
- 📊 Visualizar todos os serviços e custos
- ✏️ Editar custos individualmente
- ➕➖ Ajustes rápidos (+1/-1)
- 📈 Estatísticas (média, mínimo, máximo)
- 🔍 Agrupamento por categoria
- 📝 Histórico de alterações

---

## 🔧 Como Usar nas APIs

### Opção 1: Helper Function (Recomendado)

```typescript
import { getServiceCost } from '@/lib/service-costs';

export async function POST(req: NextRequest) {
  // Obter custo dinâmico do serviço
  const CREDITS_COST = await getServiceCost('imagen_generate', 10);
  
  // Usar nas validações e RPC
  const { data, error } = await supabase.rpc('deduct_servicos_credits', {
    p_user_id: userId,
    p_amount: CREDITS_COST,
    p_operation: 'imagen_generate',
    p_description: 'Geração de imagem via Google Imagen',
  });
}
```

### Opção 2: RPC Function Direto

```typescript
// No banco já existe a função get_service_cost
const { data: cost } = await supabase.rpc('get_service_cost', {
  p_service_name: 'music_generation'
});

const CREDITS_COST = cost || 25; // fallback
```

### Opção 3: Query Direta (Menos Performático)

```typescript
const { data } = await supabase
  .from('service_costs')
  .select('credits_cost')
  .eq('service_name', 'video_generation')
  .eq('is_active', true)
  .single();

const CREDITS_COST = data?.credits_cost || 50;
```

---

## 📝 Exemplo Completo de Atualização

### ANTES (Custo Fixo):

```typescript
// app/api/imagen/generate/route.ts
const CUSTO_GERACAO_IMAGEM = 30; // ❌ Hardcoded

export async function POST(req: NextRequest) {
  // ... código
  
  if (creditosAtuais < CUSTO_GERACAO_IMAGEM) {
    return NextResponse.json({ error: 'Créditos insuficientes' });
  }
}
```

### DEPOIS (Custo Dinâmico):

```typescript
// app/api/imagen/generate/route.ts
import { getServiceCost } from '@/lib/service-costs';

export async function POST(req: NextRequest) {
  // ✅ Buscar custo dinâmico
  const CREDITS_COST = await getServiceCost('imagen_generate', 10);
  
  // ... resto do código usa CREDITS_COST
  
  if (creditosAtuais < CREDITS_COST) {
    return NextResponse.json({ 
      error: 'Créditos insuficientes',
      credits_needed: CREDITS_COST 
    });
  }
  
  // Deduzir usando RPC
  await supabase.rpc('deduct_servicos_credits', {
    p_user_id: userId,
    p_amount: CREDITS_COST, // ✅ Usa valor dinâmico
    p_operation: 'imagen_generate',
  });
}
```

---

## 🎨 Componente Admin - ServiceCostsConfig

**Arquivo:** `/components/admin/ServiceCostsConfig.tsx`

**Features:**
- 📊 **Cards por categoria** (Geração, Design, Áudio, etc)
- ✏️ **Editor inline** com validação
- ➕➖ **Botões de ajuste rápido**
- 💾 **Auto-save** com feedback
- 📈 **Estatísticas globais**
- 🔄 **Auto-refresh** após mudanças
- 📝 **Log em duaia_transactions**

---

## 🗄️ Banco de Dados

### Aplicar Migração

```bash
# Via executar-sql-supabase.mjs
node executar-sql-supabase.mjs supabase/migrations/create_service_costs_table.sql
```

Ou manualmente no SQL Editor do Supabase.

### Estrutura da Tabela

```sql
CREATE TABLE service_costs (
  id UUID PRIMARY KEY,
  service_name VARCHAR(100) UNIQUE NOT NULL,
  service_label VARCHAR(200) NOT NULL,
  service_description TEXT,
  credits_cost INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  icon VARCHAR(50),
  category VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);
```

### Funções RPC

**1. get_service_cost(p_service_name)**
```sql
SELECT get_service_cost('imagen_generate');
-- Retorna: 10
```

**2. update_service_cost(p_service_name, p_new_cost, p_admin_email)**
```sql
SELECT update_service_cost('music_generation', 30, 'admin@dua.pt');
-- Retorna: {success: true, old_cost: 25, new_cost: 30}
```

---

## 🔐 Segurança (RLS)

### Políticas Configuradas:

1. ✅ **Admins:** Leitura + Escrita completa
2. ✅ **Usuários autenticados:** Apenas leitura de serviços ativos
3. ✅ **Anônimos:** Sem acesso

### Emails Admin (configuráveis):
- admin@dua.pt
- subreviva@gmail.com
- dev@dua.pt
- dev@dua.com

---

## 📊 Serviços Pré-Configurados

| Serviço | Label | Custo Inicial | Categoria |
|---------|-------|---------------|-----------|
| `imagen_generate` | Geração de Imagens | 10 | generation |
| `design_studio` | Design Studio | 15 | design |
| `design_studio_v2` | Design Studio V2 | 20 | design |
| `music_generation` | Geração de Música | 25 | generation |
| `video_generation` | Geração de Vídeo | 50 | generation |
| `text_to_speech` | Texto para Fala | 5 | audio |
| `speech_to_text` | Fala para Texto | 5 | audio |
| `chat_completion` | Chat IA | 1 | chat |
| `code_generation` | Geração de Código | 8 | development |
| `translation` | Tradução | 3 | text |

---

## 🚀 Performance

### Cache Implementado

O helper `getServiceCost()` usa cache em memória:
- ⏱️ **TTL:** 5 minutos
- 🔄 **Auto-refresh:** Após expiração
- 🧹 **Limpeza manual:** `clearServiceCostCache()`

### Pré-carregamento

```typescript
import { preloadCommonServiceCosts } from '@/lib/service-costs';

// No início da aplicação
await preloadCommonServiceCosts();
```

---

## 📋 Checklist de Integração

Para integrar o sistema em uma nova API:

- [ ] Importar `getServiceCost` de `@/lib/service-costs`
- [ ] Substituir constante hardcoded por chamada async
- [ ] Adicionar service_name à tabela `service_costs`
- [ ] Testar alteração via admin panel
- [ ] Verificar log em `duaia_transactions`
- [ ] Confirmar cache funcionando

---

## 🎯 Exemplo de Fluxo Completo

### 1. Admin Altera Custo

```
Admin Panel → Custos de Serviços → Música → Editar → 30 créditos → Salvar
```

**Resultado:**
- ✅ Banco atualizado: `music_generation` = 30 créditos
- ✅ Log criado em `duaia_transactions`
- ✅ Toast de sucesso exibido

### 2. API Usa Novo Custo

```typescript
// app/api/music/generate/route.ts
const cost = await getServiceCost('music_generation');
// Retorna: 30 (novo valor)
```

### 3. Usuário Usa Serviço

```
Usuário → Gera Música → API verifica créditos → Deduz 30 créditos
```

---

## 🔄 Auditoria

Todas as alterações de custos são registradas em `duaia_transactions`:

```sql
SELECT * FROM duaia_transactions
WHERE metadata->>'action' = 'update_service_cost'
ORDER BY created_at DESC;
```

**Campos registrados:**
- `action`: 'update_service_cost'
- `service_name`: Nome do serviço
- `old_cost`: Custo anterior
- `new_cost`: Novo custo
- `admin_email`: Email do admin que alterou
- `timestamp`: Data/hora da mudança

---

## 🎨 Customização

### Adicionar Novo Serviço

```sql
INSERT INTO service_costs (
  service_name,
  service_label,
  service_description,
  credits_cost,
  icon,
  category
) VALUES (
  'seu_servico',
  'Seu Serviço',
  'Descrição do serviço',
  15,
  'Icon',
  'category'
);
```

### Categorias Disponíveis

- `generation` - Geração de conteúdo
- `design` - Design e criação visual
- `audio` - Processamento de áudio
- `chat` - Conversação com IA
- `development` - Ferramentas de desenvolvimento
- `text` - Processamento de texto

---

## 💡 Dicas

1. **Use cache:** O helper já implementa cache automático
2. **Fallback sempre:** Sempre forneça um valor padrão
3. **Nome consistente:** Use snake_case para service_name
4. **Categorize:** Ajuda na organização do admin panel
5. **Documente:** Adicione descrições claras aos serviços

---

## 🐛 Troubleshooting

### Custo não atualiza na API

```typescript
import { clearServiceCostCache } from '@/lib/service-costs';

// Limpar cache específico
clearServiceCostCache('imagen_generate');

// Ou limpar tudo
clearServiceCostCache();
```

### Erro "Serviço não encontrado"

Verifique se o serviço existe na tabela:
```sql
SELECT * FROM service_costs WHERE service_name = 'seu_servico';
```

### Admin não consegue alterar

Verifique se o email está na lista de admins nas RLS policies.

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique os logs do console
2. Confira `duaia_transactions` para auditoria
3. Teste as RPC functions diretamente no SQL Editor
4. Limpe o cache se comportamento inconsistente

---

**✅ Sistema Pronto para Uso!**

Agora você pode alterar os custos de qualquer serviço diretamente pelo painel admin, sem precisar modificar código! 🎉
