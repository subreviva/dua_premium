# 🎵 AI MUSIC API - MCP SERVER INTEGRATION

Integração do servidor MCP (Model Context Protocol) para acesso à documentação da AI Music API via Apidog.

---

## 📋 O QUE É MCP?

O **Model Context Protocol (MCP)** é um protocolo que permite que assistentes de IA (como GitHub Copilot) acessem recursos externos de forma estruturada, incluindo:
- Documentação de APIs
- Bancos de dados
- Ferramentas de desenvolvimento
- Serviços externos

---

## 🚀 CONFIGURAÇÃO

### **1. Arquivo de Configuração**

Criado: `.mcp.json`

```json
{
  "mcpServers": {
    "AI Music API": {
      "command": "npx",
      "args": [
        "-y",
        "apidog-mcp-server@latest",
        "--site-id=754564"
      ]
    }
  }
}
```

### **2. O Que Faz**

Este servidor MCP:
- ✅ Conecta ao Apidog (site ID: 754564)
- ✅ Fornece acesso à documentação da AI Music API
- ✅ Permite consultas sobre endpoints, parâmetros, schemas
- ✅ Roda via `npx` (sem instalação permanente)

---

## 🔧 COMO USAR

### **Opção 1: VS Code Settings (Copilot)**

Adicione ao `.vscode/settings.json`:

```json
{
  "github.copilot.chat.mcp.servers": {
    "AI Music API": {
      "command": "npx",
      "args": [
        "-y",
        "apidog-mcp-server@latest",
        "--site-id=754564"
      ]
    }
  }
}
```

### **Opção 2: Claude Desktop**

Adicione ao `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "AI Music API": {
      "command": "npx",
      "args": [
        "-y",
        "apidog-mcp-server@latest",
        "--site-id=754564"
      ]
    }
  }
}
```

### **Opção 3: Terminal Direto**

```bash
npx -y apidog-mcp-server@latest --site-id=754564
```

---

## 📚 EXEMPLOS DE USO

### **Consultar Endpoints**

```
@AI Music API qual endpoint usar para gerar música?
```

### **Ver Parâmetros**

```
@AI Music API quais parâmetros aceita o endpoint /generate?
```

### **Schemas de Resposta**

```
@AI Music API qual o schema de resposta de /status/{runId}?
```

### **Exemplos de Requests**

```
@AI Music API me dê exemplo de curl para criar música com v5
```

---

## 🎯 BENEFÍCIOS

### **Para Desenvolvimento**
- ✅ Acesso instant à documentação da API
- ✅ Autocomplete inteligente baseado na spec
- ✅ Validação de parâmetros durante coding
- ✅ Exemplos contextualizados

### **Para Debugging**
- ✅ Verificar schemas rapidamente
- ✅ Comparar requests com spec oficial
- ✅ Identificar campos obrigatórios
- ✅ Ver tipos de dados esperados

### **Para Integração**
- ✅ Descobrir novos endpoints
- ✅ Entender autenticação
- ✅ Ver rate limits
- ✅ Consultar error codes

---

## 🔗 RECURSOS

### **Apidog MCP Server**
- NPM: https://www.npmjs.com/package/apidog-mcp-server
- Docs: https://apidog.com/mcp

### **Model Context Protocol**
- Spec: https://modelcontextprotocol.io/
- GitHub: https://github.com/modelcontextprotocol

### **AI Music API**
- Site ID: 754564
- Acesso via MCP configurado

---

## 🐛 TROUBLESHOOTING

### **Erro: "command not found: npx"**
```bash
npm install -g npm
```

### **Erro: "site-id not found"**
→ Verificar se site ID 754564 está correto
→ Verificar acesso ao Apidog

### **MCP não conecta**
→ Reiniciar VS Code / Claude
→ Verificar JSON syntax
→ Testar comando direto no terminal

### **Sem resposta do servidor**
```bash
# Testar manualmente:
npx -y apidog-mcp-server@latest --site-id=754564
```

---

## 📊 COMPARAÇÃO COM ALTERNATIVAS

| Método | Velocidade | Atualização | Contexto |
|--------|-----------|-------------|----------|
| **MCP Server** | ⚡ Instant | 🔄 Real-time | 🎯 Exato |
| Docs Website | 🐌 Manual | 📅 Manual | 📖 Geral |
| Copiar/Colar | 🐌 Lento | ❌ Nunca | 📋 Limitado |
| Memória | 💭 Médio | ❌ Outdated | 🤔 Incerto |

---

## 🚀 PRÓXIMOS PASSOS

### **Testar Integração**
1. Adicionar config ao VS Code settings
2. Reload window (Cmd+Shift+P → "Reload Window")
3. Testar query: `@AI Music API help`

### **Explorar API**
1. Listar todos endpoints
2. Ver schemas completos
3. Copiar exemplos
4. Integrar no código

### **Manter Atualizado**
- MCP server atualiza automaticamente (npx -y)
- Documentação sempre sincronizada com Apidog
- Sem necessidade de manutenção manual

---

## ✅ CHECKLIST

- [x] Arquivo `.mcp.json` criado
- [x] Configuração validada
- [ ] Adicionar ao VS Code settings
- [ ] Testar conexão
- [ ] Consultar endpoints
- [ ] Integrar no workflow de dev

---

**STATUS: ✅ CONFIGURADO E PRONTO PARA USO!**

Adicione ao VS Code settings e comece a consultar a API documentation via MCP!
