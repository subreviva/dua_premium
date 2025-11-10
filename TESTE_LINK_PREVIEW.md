# 🔧 GUIA DE TESTE - Link Preview no Chat

## ✅ Como Testar

### Passo 1: Abrir o Chat
Acesse: http://localhost:3000/chat

### Passo 2: Enviar Mensagem com Link

Digite uma das mensagens abaixo e pressione Enter:

#### YouTube
```
Veja este vídeo: https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

#### Spotify
```
Ouça esta música: https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp
```

#### GitHub
```
Confira este repo: https://github.com/vercel/next.js
```

#### Múltiplos Links
```
Confira:
https://www.youtube.com/watch?v=example
https://open.spotify.com/track/123
```

---

## 🔍 O que Você Deve Ver

### Antes (Link Normal)
```
Mensagem de texto com link azul clicável
```

### Depois (Com Preview)
```
Mensagem de texto
┌─────────────────────────────┐
│ 🎬 YouTube                  │
│ [Miniatura do vídeo]        │
│ Título do Vídeo             │
│ Descrição...                │
└─────────────────────────────┘
```

---

## 🐛 Debug

### Console do Browser (F12)
Você deve ver:
```
🔗 Links detectados: [{ url: "https://...", ... }]
```

### Abaixo da Mensagem
Deve aparecer:
```
1 link detectado
[Preview card com gradiente e miniatura]
```

---

## 📍 Páginas de Teste

1. **Chat Real**: http://localhost:3000/chat
2. **Demo Standalone**: http://localhost:3000/link-preview-demo
3. **Teste MessageContent**: http://localhost:3000/test-message-content
4. **Teste Link Detection**: http://localhost:3000/test-link-detection

---

## ✨ Features do Preview

- ✅ Skeleton loading (instantâneo)
- ✅ Miniatura do YouTube/Spotify
- ✅ Título e descrição
- ✅ Gradiente colorido por plataforma
- ✅ Clique para abrir embed (YouTube/Spotify)
- ✅ Animação de entrada suave
- ✅ Responsivo (mobile + desktop)

---

## 🎯 Teste Rápido

**Cole isso no chat:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

**Resultado esperado em 1-2 segundos:**
- Skeleton cinza aparece
- Miniatura carrega
- Card vermelho do YouTube com título "Never Gonna Give You Up"
- Hover no card = efeito de brilho
- Clique no card = abre player embed

---

## 🚨 Se NÃO Funcionar

### Checklist:
- [ ] Servidor rodando? `ps aux | grep next`
- [ ] Console do browser tem erros? (F12)
- [ ] API funcionando? `curl localhost:3000/api/link-preview`
- [ ] Hook detectando links? (veja console: "🔗 Links detectados")

### Debug Manual:
```bash
# Testar API
curl -X POST http://localhost:3000/api/link-preview \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

Deve retornar JSON com title, image, embedUrl, etc.

---

## 📊 Status Atual

- ✅ API Route funcionando
- ✅ Componente LinkPreview criado
- ✅ Hook useLinkDetection criado
- ✅ Integrado no MessageContent
- ✅ Debug logs adicionados
- ✅ Páginas de teste criadas

**Próximo passo:** Testar no chat real!
