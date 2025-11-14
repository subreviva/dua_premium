# 🎵 TESTE MANUAL - Music Studio Flow

## ✅ INSTRUÇÕES PARA TESTE REAL HUMANO

Siga os passos abaixo para testar o fluxo completo de geração de música:

### 📋 PRÉ-REQUISITOS

1. Servidor Next.js rodando em `http://localhost:3000`
2. Conta de usuário criada (ou use credenciais existentes)

---

## 🎯 PASSO A PASSO

### **1️⃣ LOGIN** 

1. Abra o navegador em: `http://localhost:3000`
2. Clique em "Login" ou "Entrar"
3. Use as credenciais:
   - **Email**: seu-email@exemplo.com
   - **Senha**: sua-senha

**✅ Verificar:**
- Login bem-sucedido
- Redirecionado para dashboard/home

---

### **2️⃣ VERIFICAR CRÉDITOS**

1. Vá para `/admin` ou painel de usuário
2. Verifique saldo de créditos

**✅ Verificar:**
- Saldo de créditos visível
- Pelo menos 12 créditos disponíveis (para 2 gerações)

---

### **3️⃣ CRIAR MÚSICA - MODO SIMPLES**

1. Navegue para: `http://localhost:3000/musicstudio/create`
2. Na aba **"Simples"**:
   - **Prompt**: "Uma música calma e relaxante com piano suave e melodias tranquilas"
   - **Instrumental**: ✅ Ativado
   - **Modelo**: V3_5
3. Clique em **"Generate"**

**✅ Verificar:**
- Redirecionado para `/musicstudio/library`
- **GenerationSidebar** aparece na direita
- Task aparece com status "PENDING"
- Barra de progresso visível

---

### **4️⃣ ACOMPANHAR PROGRESSO - MÚSICA 1**

Aguarde e observe a **GenerationSidebar** (direita da tela):

**Estados esperados (20-60 segundos):**

```
[00:00] [▓░░░░░░░░░] 20%  PENDING
        Preparando geração...

[00:15] [▓▓▓▓░░░░░░] 40%  TEXT_SUCCESS
        Texto processado, criando áudio...

[00:35] [▓▓▓▓▓▓▓░░░] 70%  FIRST_SUCCESS
        Primeira track completa, gerando variações...
        🎉 Primeira música pronta!

[00:55] [▓▓▓▓▓▓▓▓▓▓] 100% SUCCESS
        ✨ Concluído! Salvando na biblioteca...
```

**✅ Verificar:**
- Progresso atualiza a cada 5 segundos
- Estados mudam: PENDING → TEXT_SUCCESS → FIRST_SUCCESS → SUCCESS
- Barra de progresso avança
- Tempo decorrido é exibido

---

### **5️⃣ VERIFICAR BIBLIOTECA - MÚSICA 1**

Quando atingir **SUCCESS**:

1. Task desaparece da **GenerationSidebar**
2. Clique no botão **"Biblioteca"** (direita) para abrir **MusicLibrarySidebar**

**✅ Verificar:**
- 2 tracks aparecem na biblioteca
- Cada track mostra:
  - ✅ Thumbnail/imagem
  - ✅ Título
  - ✅ Tags
  - ✅ Duração (ex: 2:00)
  - ✅ Modelo (V3_5)
  - ✅ Botão de Play

---

### **6️⃣ TESTAR PLAYBACK**

1. Clique no botão **Play** em uma música
2. Aguarde o áudio começar

**✅ Verificar:**
- Áudio começa a tocar
- Botão muda para **Pause**
- Player de áudio funcional

---

### **7️⃣ VERIFICAR DEDUÇÃO DE CRÉDITOS**

1. Vá para `/admin` ou painel de créditos
2. Verifique transações recentes

**✅ Verificar:**
- **-6 créditos** deduzidos
- Transação registrada com:
  - Descrição: "Geração de música V3_5"
  - Metadata: prompt, modelo, taskId

---

### **8️⃣ CRIAR MÚSICA - MODO CUSTOMIZADO**

1. Volte para: `http://localhost:3000/musicstudio/create`
2. Na aba **"Personalizado"**:
   - **Prompt**: "Uma composição orquestral épica e inspiradora com cordas poderosas"
   - **Estilo**: "orquestral, cinemático, épico, dramático"
   - **Título**: "Épico Orquestral - Teste"
   - **Instrumental**: ✅ Ativado
   - **Modelo**: V4
   - **Style Weight**: 0.7
   - **Weirdness**: 0.5
   - **Audio Weight**: 0.65
3. Clique em **"Generate"**

**✅ Verificar:**
- Mesmofluxo do passo 3-7
- Progresso visível na **GenerationSidebar**
- 2 novas tracks adicionadas à biblioteca
- Mais **-6 créditos** deduzidos

---

### **9️⃣ SALDO FINAL**

1. Verifique saldo final de créditos

**✅ Esperado:**
- Se começou com 50 créditos:
  - Música 1: -6 créditos = 44
  - Música 2: -6 créditos = 38
  - **Saldo final: 38 créditos**

---

## 📊 CHECKLIST FINAL

Marque ✅ conforme testa:

### Autenticação
- [ ] Login bem-sucedido
- [ ] Token de sessão válido

### Créditos
- [ ] Saldo inicial visível
- [ ] Créditos verificados ANTES da geração
- [ ] Créditos deduzidos DEPOIS da geração
- [ ] Transações registradas corretamente

### Geração de Música
- [ ] Formulário modo SIMPLES funciona
- [ ] Formulário modo CUSTOMIZADO funciona
- [ ] Validações de input funcionam
- [ ] Redirecionamento para biblioteca

### Estados de Loading
- [ ] **GenerationSidebar** aparece
- [ ] Status PENDING exibido
- [ ] Status TEXT_SUCCESS exibido
- [ ] Status FIRST_SUCCESS exibido
- [ ] Status SUCCESS exibido
- [ ] Barra de progresso atualiza
- [ ] Tempo decorrido exibido
- [ ] Polling automático (5s)

### Biblioteca
- [ ] Tracks aparecem na **MusicLibrarySidebar**
- [ ] Thumbnail exibido
- [ ] Título correto
- [ ] Tags exibidas
- [ ] Duração exibida
- [ ] Modelo exibido
- [ ] Botão Play funciona
- [ ] Áudio toca corretamente

### Persistência
- [ ] Tasks salvas em localStorage
- [ ] Tracks salvas em localStorage
- [ ] Reload da página mantém estado

---

## 🎯 RESUMO

**Tempo total esperado**: 2-4 minutos por música

**Fluxo completo:**
```
Login → Verificar Créditos → Criar Música → 
Aguardar (20-60s) → Ver na Biblioteca → Tocar → 
Verificar Créditos Deduzidos ✅
```

---

## 📝 NOTAS

- Cada geração cria **2 tracks** (original + variação)
- Tempo de geração: **20-60 segundos** (depende da API Suno)
- Custo: **6 créditos** por geração (independente do modelo)
- Polling automático a cada **5 segundos**

---

## ✅ RESULTADO ESPERADO

Ao final, você deve ter:
- ✅ 4 músicas na biblioteca (2 do modo simples + 2 do modo customizado)
- ✅ 12 créditos deduzidos
- ✅ 2 transações registradas
- ✅ Todas as músicas reproduzíveis

**🎉 Se todos os itens funcionarem, o sistema está 100% operacional!**
