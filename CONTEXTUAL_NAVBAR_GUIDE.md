# 📋 Navbar Contextual - Guia de Uso

A navbar contextual foi implementada e se adapta automaticamente ao contexto de cada página (studios e chat).

## 🎯 Como Funciona

### 1. **Detecção Automática**
A navbar detecta automaticamente a página atual e mostra informações relevantes:

- **Chat**: "Nova Conversa" + botão para nova conversa
- **Music Studio**: "Music Studio" + botão "Nova Música"
- **Image Studio**: "Image Studio" + botão "Nova Imagem"
- **Video Studio**: "Video Studio" + botão "Novo Vídeo"
- **Design Studio**: "Design Studio" + botão "Novo Design"

### 2. **Uso com Props Customizadas**

Você pode customizar a navbar em qualquer página importando o componente:

```tsx
import { ContextualNavbar } from "@/components/contextual-navbar"

// Exemplo básico (usa detecção automática)
<ContextualNavbar />

// Exemplo com título customizado
<ContextualNavbar 
  title="Meu Projeto de Música"
  subtitle="Editando faixa #123"
/>

// Exemplo com ações customizadas
<ContextualNavbar 
  title="Editando Vídeo"
  actions={
    <>
      <Button>Salvar</Button>
      <Button variant="outline">Exportar</Button>
    </>
  }
/>
```

### 3. **Estrutura Visual**

```
┌─────────────────────────────────────────────────────────────┐
│  [Ícone] DUA  │  💬 Nova Conversa        [150] [Comprar] [@] │
└─────────────────────────────────────────────────────────────┘
```

- **Esquerda**: Ícone do contexto + Logo + Título/Subtítulo
- **Direita**: Créditos + Botão Comprar + Botões de Ação + Avatar

### 4. **Padding Automático**

O componente `DynamicContentWrapper` ajusta automaticamente o espaçamento:
- Páginas sem navbar contextual: `pt-16` (64px)
- Páginas com navbar contextual: `pt-[7.5rem]` (120px)

## 🎨 Customização por Página

### Chat
```tsx
<ContextualNavbar 
  title="Conversa com DUA"
  subtitle="Assistente de IA"
/>
```

### Music Studio
```tsx
<ContextualNavbar 
  title="Criando Música"
  subtitle="V4.5 Plus - Qualidade Premium"
/>
```

### Video Studio
```tsx
<ContextualNavbar 
  title="Gerando Vídeo"
  subtitle="Gen4 Turbo - 1280x720"
/>
```

## ✅ Componentes Integrados

- ✅ **CreditsDisplay**: Mostra créditos do usuário em tempo real
- ✅ **UserAvatar**: Avatar com dropdown de opções
- ✅ **Botões de Ação**: Customizáveis via props
- ✅ **Responsivo**: Adapta-se automaticamente para mobile

## 🔧 Ajustes Feitos

1. **Sidebar do Cinema**: Ajustada para `pt-[7.5rem]`
2. **AppSidebar (Music)**: Ajustada para `pt-[7.5rem]`
3. **Layout Global**: Usa `DynamicContentWrapper` para padding dinâmico
4. **Navbar Contextual**: Detecção automática de contexto baseada em pathname
