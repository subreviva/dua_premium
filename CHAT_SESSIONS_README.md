# 💬 Sistema de Chat com Histórico e Sessões

## 📋 Visão Geral

Sistema completo de chat com **histórico persistente**, **múltiplas sessões**, **busca full-text** e **auto-criação de conversas no login**.

## ✨ Funcionalidades Principais

### 🎯 Auto-Criação de Sessões
- ✅ Nova conversa criada automaticamente ao fazer login
- ✅ Sessão anterior desativada automaticamente
- ✅ Histórico completo preservado

### 💾 Persistência Completa
- ✅ Todas as mensagens salvas no Supabase
- ✅ Sincronização automática em tempo real
- ✅ Backup seguro na nuvem
- ✅ Recuperação de conversas antigas

### 📚 Múltiplas Sessões
- ✅ Ilimitadas conversas simultâneas
- ✅ Troca rápida entre conversas
- ✅ Organização por data (Hoje, Ontem, Semana, Antigas)
- ✅ Contador de mensagens por conversa

### 🔍 Busca Inteligente
- ✅ Busca full-text em todo o histórico
- ✅ Busca por título de conversa
- ✅ Busca dentro do conteúdo das mensagens
- ✅ Resultados ordenados por relevância

### 🎨 Gerenciamento de Conversas
- ✅ Renomear conversas
- ✅ Arquivar conversas antigas
- ✅ Deletar conversas (soft delete com undo)
- ✅ Limpar mensagens de uma conversa

### 📊 Estatísticas
- ✅ Total de conversas
- ✅ Conversas ativas
- ✅ Total de mensagens
- ✅ Mensagens de hoje
- ✅ Conversa mais ativa

## 🚀 Como Usar

### 1. Aplicar Schema SQL no Supabase

```bash
# Executar o SQL no Supabase SQL Editor
cat sql/create-chat-sessions.sql
```

Ou usar o script automático:
```bash
./deploy-sql-auto.sh sql/create-chat-sessions.sql
```

### 2. Integrar no Chat Page

```typescript
// app/chat/page.tsx
import { useChatSessions } from '@/hooks/useChatSessions';
import { ChatSessionsSidebar } from '@/components/chat/ChatSessionsSidebar';

export default function ChatPage() {
  const {
    sessions,
    currentSession,
    currentMessages,
    isLoading,
    saveMessage,
    createNewSession,
    switchSession,
    renameSession,
    archiveSession,
    deleteSession,
  } = useChatSessions();

  // Salvar mensagens automaticamente
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user' || lastMessage.role === 'assistant') {
        saveMessage(lastMessage.role, lastMessage.content);
      }
    }
  }, [messages]);

  return (
    <div className="flex h-screen">
      {/* Sidebar com histórico */}
      <ChatSessionsSidebar
        sessions={sessions}
        currentSession={currentSession}
        onSelectSession={switchSession}
        onNewSession={() => createNewSession()}
        onRenameSession={renameSession}
        onArchiveSession={archiveSession}
        onDeleteSession={deleteSession}
        className="w-64"
      />

      {/* Área de chat */}
      <div className="flex-1">
        {/* Seu componente de chat aqui */}
      </div>
    </div>
  );
}
```

### 3. Usar o Hook

```typescript
import { useChatSessions } from '@/hooks/useChatSessions';

function MeuComponente() {
  const {
    // Estado
    sessions,              // Lista de todas as sessões
    currentSession,        // Sessão ativa no momento
    currentMessages,       // Mensagens da sessão ativa
    isLoading,            // Carregando dados
    isSaving,             // Salvando mensagem
    userId,               // ID do usuário

    // Ações de sessão
    createNewSession,     // Criar nova conversa
    switchSession,        // Trocar de conversa
    renameSession,        // Renomear conversa
    archiveSession,       // Arquivar conversa
    deleteSession,        // Deletar conversa

    // Ações de mensagens
    saveMessage,          // Salvar uma mensagem
    saveMessages,         // Salvar múltiplas mensagens
    clearCurrentMessages, // Limpar mensagens da sessão
    loadSessionMessages,  // Carregar mensagens de uma sessão

    // Utilidades
    searchMessages,       // Buscar em todas as mensagens
    getStats,            // Obter estatísticas
  } = useChatSessions();

  return (
    // Seu componente
  );
}
```

## 📊 Estrutura do Banco de Dados

### Tabela: `chat_sessions`
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- title (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
- last_message_at (TIMESTAMPTZ)
- is_active (BOOLEAN)
- is_archived (BOOLEAN)
- message_count (INTEGER)
- model_used (TEXT)
- deleted_at (TIMESTAMPTZ) -- soft delete
```

### Tabela: `chat_messages`
```sql
- id (UUID, PK)
- session_id (UUID, FK)
- role (TEXT) -- 'user' | 'assistant' | 'system'
- content (TEXT)
- created_at (TIMESTAMPTZ)
- metadata (JSONB)
- has_image (BOOLEAN)
- image_url (TEXT)
```

## 🔐 Segurança (RLS)

- ✅ Row Level Security habilitado
- ✅ Usuários veem apenas suas próprias conversas
- ✅ Usuários só podem modificar suas próprias conversas
- ✅ Isolamento completo por usuário

## 🎯 Comportamento Automático

### No Login
1. ✅ Sistema carrega todas as sessões do usuário
2. ✅ Se existe sessão ativa → carrega mensagens
3. ✅ Se não existe sessão ativa → cria nova automaticamente

### Ao Criar Nova Conversa
1. ✅ Desativa sessão anterior
2. ✅ Cria nova sessão com título padrão
3. ✅ Define como ativa
4. ✅ Limpa área de mensagens

### Ao Trocar de Conversa
1. ✅ Desativa sessão atual
2. ✅ Ativa sessão selecionada
3. ✅ Carrega mensagens da nova sessão
4. ✅ Atualiza UI automaticamente

### Ao Enviar Mensagem
1. ✅ Mensagem salva no Supabase
2. ✅ Contador de mensagens atualizado
3. ✅ `last_message_at` atualizado
4. ✅ Sessão move para topo da lista

## 📱 Funções SQL Disponíveis

### create_new_chat_session()
Cria nova sessão e desativa anteriores automaticamente.

```sql
SELECT create_new_chat_session(
  p_user_id := 'user-uuid',
  p_title := 'Minha Nova Conversa'
);
```

### search_chat_messages()
Busca full-text em todas as mensagens do usuário.

```sql
SELECT * FROM search_chat_messages(
  p_user_id := 'user-uuid',
  p_search_term := 'palavra-chave'
);
```

### get_user_chat_stats()
Retorna estatísticas completas do chat.

```sql
SELECT * FROM get_user_chat_stats(
  p_user_id := 'user-uuid'
);
```

### auto_archive_old_sessions()
Arquiva sessões inativas há mais de 30 dias.

```sql
SELECT auto_archive_old_sessions();
-- Retorna número de sessões arquivadas
```

## 🎨 Componentes React

### ChatSessionsSidebar
Sidebar completa com lista de conversas, busca e ações.

**Props:**
- `sessions` - Lista de sessões
- `currentSession` - Sessão ativa
- `onSelectSession` - Callback ao selecionar sessão
- `onNewSession` - Callback para nova sessão
- `onRenameSession` - Callback para renomear
- `onArchiveSession` - Callback para arquivar
- `onDeleteSession` - Callback para deletar

**Features:**
- ✅ Agrupamento por data
- ✅ Busca em tempo real
- ✅ Edição inline de título
- ✅ Menu de contexto
- ✅ Contador de mensagens
- ✅ Timestamp relativo

## 🔧 Manutenção

### Arquivamento Automático
Configure um cron job para arquivar sessões antigas:

```sql
-- Executar diariamente
SELECT auto_archive_old_sessions();
```

### Limpeza de Dados Antigos
Configure para limpar sessões muito antigas (opcional):

```sql
-- Executar mensalmente
SELECT cleanup_very_old_sessions();
```

### Índices de Performance
Todos os índices necessários são criados automaticamente:
- ✅ Busca por usuário
- ✅ Ordenação por data
- ✅ Full-text search
- ✅ Soft delete

## 🐛 Troubleshooting

### Mensagens não salvam
1. Verificar se `currentSession` existe
2. Verificar permissões RLS no Supabase
3. Verificar console para erros

### Sessão não cria automaticamente
1. Verificar se função SQL `create_new_chat_session` existe
2. Verificar se usuário está autenticado
3. Verificar logs do Supabase

### Busca não funciona
1. Verificar se extensão `pg_trgm` está instalada
2. Verificar se índices foram criados
3. Verificar se função `search_chat_messages` existe

## 📈 Melhorias Futuras

- [ ] Exportar conversa para PDF/TXT
- [ ] Compartilhar conversa (link público)
- [ ] Tags/categorias para conversas
- [ ] Pinagem de conversas importantes
- [ ] Sincronização cross-device em tempo real
- [ ] Backup automático diário
- [ ] Integração com Notion/Obsidian

## 🎉 Conclusão

Sistema completo e pronto para produção com:
- ✅ Histórico persistente
- ✅ Múltiplas sessões
- ✅ Busca full-text
- ✅ Auto-criação no login
- ✅ Performance otimizada
- ✅ Segurança robusta (RLS)
- ✅ UI moderna e responsiva

**Próximo passo:** Aplicar o SQL e integrar no chat! 🚀
