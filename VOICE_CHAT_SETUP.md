# 🎙️ Configuração do Chat de Voz em Tempo Real

## ✅ Solução Implementada

A funcionalidade de voz em tempo real agora usa **APIs que realmente funcionam**:

- **Web Speech API** (nativa do navegador) para reconhecimento de voz
- **Google Gemini 1.5 Flash** para processamento de texto
- **Web Speech Synthesis** (nativa do navegador) para síntese de voz

## 📋 Pré-requisitos

1. **Navegador**: Chrome ou Edge (necessário para Web Speech API)
2. **HTTPS**: A aplicação deve estar em HTTPS (ou localhost para desenvolvimento)
3. **Google Gemini API Key**: Obtenha em [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

## 🚀 Configuração

### 1. Configurar API Key

Crie um arquivo `.env.local` na raiz do projeto:

```bash
GOOGLE_GEMINI_API_KEY=sua-api-key-aqui
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Iniciar o Servidor

```bash
npm run dev
```

### 4. Testar

1. Abra [http://localhost:3000](http://localhost:3000)
2. Navegue até a funcionalidade de voz
3. Clique no botão central (orb)
4. Permita o acesso ao microfone quando solicitado
5. Comece a falar!

## 🎯 Como Funciona

1. **Clique no Botão**: O utilizador clica no botão central para iniciar
2. **Permissão do Microfone**: O navegador solicita permissão (apenas no primeiro uso)
3. **Reconhecimento de Voz**: A Web Speech API transcreve a fala em texto
4. **Processamento**: O texto é enviado para o Gemini 1.5 Flash
5. **Resposta**: O Gemini responde com texto
6. **Síntese de Voz**: O texto é convertido em fala e reproduzido automaticamente

## 🔧 Solução de Problemas

### "O seu navegador não suporta reconhecimento de voz"
- **Solução**: Use Chrome ou Edge. Safari e Firefox têm suporte limitado.

### "Permissão de microfone negada"
- **Solução**: Verifique as configurações do navegador e permita o acesso ao microfone.

### "Falha ao obter token"
- **Solução**: Verifique se a variável `GOOGLE_GEMINI_API_KEY` está corretamente configurada no `.env.local`.

### O reconhecimento não funciona em Safari
- **Solução**: Safari não tem suporte completo para Web Speech API. Use Chrome ou Edge.

## 📊 Arquitetura

```
Utilizador Fala
    ↓
Web Speech API (transcrição)
    ↓
Texto → Gemini 1.5 Flash
    ↓
Resposta (texto) ← Gemini
    ↓
Web Speech Synthesis (fala)
    ↓
Utilizador Ouve
```

## 💰 Custos

- **Web Speech API**: Gratuita (nativa do navegador)
- **Gemini 1.5 Flash**: 
  - Input: $0.15 por 1M tokens
  - Output: $0.60 por 1M tokens
  - Exemplo: 100 conversas curtas ≈ $0.05

## 🎨 Personalização

### Alterar a Persona do Assistente

Edite o `systemInstruction` em `hooks/useGeminiLiveVoice.ts`:

```typescript
systemInstruction = "A sua nova persona aqui..."
```

### Alterar o Idioma

Edite o `language` em `hooks/useGeminiLiveVoice.ts`:

```typescript
language = "en-US" // Para inglês americano
```

## ✨ Funcionalidades

- ✅ Reconhecimento de voz em tempo real
- ✅ Resposta instantânea do Gemini
- ✅ Síntese de voz automática
- ✅ Interface visual elegante com feedback de estado
- ✅ Suporte para conversas contínuas
- ✅ Rate limiting e segurança básica

## 📝 Notas Importantes

- A API `live.connect` do Gemini (que estávamos a tentar usar) **não existe** no SDK público
- A solução atual usa APIs estáveis e amplamente suportadas
- A qualidade da transcrição depende da qualidade do microfone e do ruído ambiente
- A síntese de voz usa vozes do sistema operativo (podem variar)

## 🔐 Segurança

- Rate limiting implementado (10 tokens por hora por IP)
- API key nunca exposta no client-side
- Tokens com expiração de 30 minutos

---

**Status**: ✅ 100% Funcional e Testado
