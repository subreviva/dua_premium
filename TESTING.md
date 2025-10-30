# 🧪 SCRIPTS DE TESTE - SUNO MUSIC STUDIO

Scripts completos para testar TODAS as funcionalidades, botões e endpoints da aplicação.

---

## 📋 Scripts Disponíveis

### 1. `test-all-features.js` - Teste Automatizado Completo

Testa automaticamente todos os endpoints, configurações e integrações.

**USO:**
```bash
node test-all-features.js
```

**O que testa:**
- ✅ Endpoints de API (generate, extend, credits, etc.)
- ✅ Client Suno API (todos os métodos)
- ✅ Componentes frontend
- ✅ Configurações de ambiente
- ✅ Segurança (API keys, dados sensíveis)
- ✅ Performance (tempos de resposta)
- ✅ Integração localStorage

**Output:**
- Relatório colorido no terminal
- Taxa de sucesso (%)
- Lista de testes que falharam
- Tempo total de execução

---

### 2. `test-interactive.js` - Teste Interativo Manual

Guia passo-a-passo para testar CADA botão e funcionalidade manualmente.

**USO:**
```bash
node test-interactive.js
```

**O que testa:**
1. **Criar Música - Modo Simple**
   - Botão Simple
   - Campo de descrição
   - Botão Create
   - Status de geração
   - Atualização de créditos

2. **Criar Música - Modo Custom**
   - Botão Custom
   - Campos: Description, Lyrics, Style Tags
   - Checkbox Instrumental
   - Salvamento no workspace

3. **Seleção de Versão**
   - Dropdown de versões
   - v5, v4.5, v4, v3.5

4. **Upload de Áudio**
   - Modal de upload
   - Seleção de arquivo
   - Processamento

5. **Gerador de Letras AI**
   - Modal do gerador
   - Campo de descrição
   - Botão Generate

6. **Configurações Avançadas**
   - Sliders (Style Influence, Weirdness)
   - Vocal Gender dropdown
   - Checkbox Exclude Styles

7. **Workspace Panel**
   - Lista de músicas
   - Exibição de detalhes
   - Ordenação

8. **Song Card**
   - Botão Play
   - Menu de contexto (⋮)
   - Botão Like
   - Botão Share

9. **Player de Áudio**
   - Play/Pause
   - Volume
   - Barra de progresso

10. **Menu de Contexto**
    - Extend
    - Cover
    - Convert to WAV
    - Download
    - Delete

11. **Filtros e Busca**
    - Campo de busca
    - Filtros (Liked, Public, Uploads)
    - Reset filters

12. **Ordenação**
    - Newest
    - Oldest
    - Title

13. **Créditos**
    - Display de créditos
    - Atualização automática

14. **Workspaces**
    - Lista de workspaces
    - Criar novo
    - Selecionar

15. **Responsividade Mobile**
    - Menu hamburger
    - Sidebar mobile
    - Layout adaptativo

16. **Tratamento de Erros**
    - Mensagens de erro
    - Validação de campos

17. **Loading States**
    - Spinners
    - Progresso
    - Botões disabled

18. **Persistência de Dados**
    - LocalStorage
    - Reload da página

**Output:**
- Guia interativo passo-a-passo
- Marca cada teste como ✅ Passou / ❌ Falhou / ⏭️ Pulado
- Relatório final com taxa de sucesso
- Arquivo `test-report.json` com resultados

---

## 🚀 Quick Start

### Pré-requisitos

1. Aplicação rodando (dev ou produção):
```bash
npm run dev
# ou acesse a URL de produção
```

2. SUNO_API_KEY configurado (para testes de API):
```bash
export SUNO_API_KEY="sua-chave-aqui"
```

### Executar Teste Automatizado

```bash
# Teste rápido
node test-all-features.js

# Personalizando URL
node test-all-features.js
# Digite a URL quando solicitado
```

### Executar Teste Interativo

```bash
node test-interactive.js

# Siga as instruções na tela
# Teste cada funcionalidade manualmente
```

---

## 📊 Interpretando Resultados

### Teste Automatizado

```
Total de Testes: 45
✅ Passou: 42
❌ Falhou: 2
⚠️  Avisos: 1

Taxa de Sucesso: 93.3% 🎉 EXCELENTE!
```

**Significado:**
- **≥ 90%** = 🎉 EXCELENTE - Produção ready
- **70-89%** = ✓ BOM - Alguns ajustes necessários
- **< 70%** = ⚠️ PRECISA MELHORAR - Problemas críticos

### Teste Interativo

Cada funcionalidade recebe:
- ✅ **PASSOU** - Funciona perfeitamente
- ❌ **FALHOU** - Não funciona ou tem bugs
- ⏭️ **PULADO** - Não testado

---

## 🔍 Troubleshooting

### "Cannot find module"
```bash
npm install
```

### "ECONNREFUSED"
Certifique-se que a aplicação está rodando:
```bash
npm run dev
```

### "SUNO_API_KEY não encontrado"
Configure a variável:
```bash
export SUNO_API_KEY="sk-..."
```

### Testes falhando em produção
Verifique:
1. URL está correta
2. API key está configurada no Vercel
3. CORS está habilitado

---

## 📝 Relatórios

### Relatório Automático
Gerado no terminal com cores e formatação

### Relatório Interativo
Salvo em `test-report.json`:
```json
{
  "timestamp": "2025-10-30T...",
  "baseUrl": "http://localhost:3000",
  "results": [...],
  "summary": {
    "total": 45,
    "passed": 42,
    "failed": 2,
    "skipped": 1,
    "passRate": 93.3
  }
}
```

---

## 🎯 Checklist de Funcionalidades

Use esta lista para verificar manualmente:

### Criação de Música
- [ ] Modo Simple funciona
- [ ] Modo Custom funciona
- [ ] Seleção de versão funciona
- [ ] Upload de áudio funciona
- [ ] Gerador de letras funciona
- [ ] Configurações avançadas funcionam
- [ ] Status de geração é exibido
- [ ] Música é salva no workspace

### Workspace
- [ ] Lista de músicas carrega
- [ ] Busca funciona
- [ ] Filtros funcionam
- [ ] Ordenação funciona
- [ ] Músicas persistem após reload

### Player
- [ ] Play/Pause funciona
- [ ] Volume funciona
- [ ] Barra de progresso funciona
- [ ] Música toca corretamente

### Ações de Música
- [ ] Menu de contexto abre
- [ ] Extend funciona
- [ ] Cover funciona
- [ ] Convert to WAV funciona
- [ ] Download funciona
- [ ] Delete funciona
- [ ] Like funciona
- [ ] Share funciona

### UI/UX
- [ ] Responsivo em mobile
- [ ] Sidebar mobile funciona
- [ ] Erros são exibidos
- [ ] Loading states aparecem
- [ ] Créditos atualizam

---

## 🛠️ Desenvolvimento

### Adicionar Novo Teste

**Teste Automatizado:**
```javascript
// Em test-all-features.js
async function testNewFeature() {
  const result = await testEndpoint('Nome', url, options);
  if (result.success) {
    addResult('Teste', 'pass', 'Mensagem');
  } else {
    addResult('Teste', 'fail', result.error);
  }
}
```

**Teste Interativo:**
```javascript
// Em test-interactive.js
await testFeature(
  'NOME DA FUNCIONALIDADE',
  'Instruções de como testar',
  [
    { action: 'Passo 1 a verificar' },
    { action: 'Passo 2 a verificar' },
  ]
);
```

---

## 📚 Referências

- [Suno API Docs](https://docs.sunoapi.org/)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [Node.js Assert](https://nodejs.org/api/assert.html)

---

## ✨ Dicas

1. **Execute os testes regularmente** durante desenvolvimento
2. **Use o teste interativo** antes de cada deploy
3. **Mantenha taxa > 90%** para produção
4. **Documente falhas** no test-report.json
5. **Teste em diferentes browsers** (Chrome, Firefox, Safari)
6. **Teste em mobile** real, não só emulador

---

## 🤝 Contribuindo

Para adicionar novos testes:

1. Identifique a funcionalidade
2. Adicione ao script apropriado
3. Teste o teste 😄
4. Documente neste README
5. Commit com mensagem descritiva

---

## 📞 Suporte

Problemas com os testes?
1. Verifique se a aplicação está rodando
2. Verifique variáveis de ambiente
3. Veja logs no console
4. Check test-report.json para detalhes

---

**Happy Testing! 🎉**
