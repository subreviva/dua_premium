# 🚀 SERVIDOR INFINITO - NUNCA FECHA

## 3 Métodos Disponíveis

### ✅ MÉTODO 1: Loop Simples (Recomendado para Dev)
```bash
./start-dev-forever.sh
```

**Características:**
- Loop infinito básico
- Reinicia automaticamente se crashar
- Simples e direto
- Fácil de parar (Ctrl+C)

---

### 🔥 MÉTODO 2: Com ENTR (Auto-reload)
```bash
./start-dev-ultra.sh
```

**Características:**
- Monitora arquivos `.ts`, `.tsx`, `.js`, `.jsx`
- Reinicia automaticamente quando você salvar
- Ultra responsivo
- Perfeito para desenvolvimento ativo

**Instalação do ENTR:**
```bash
sudo apt-get update && sudo apt-get install -y entr
```

---

### 🚀 MÉTODO 3: PM2 (Profissional)
```bash
./start-pm2.sh
```

**Características:**
- Process manager profissional
- Logs persistentes em `./logs/`
- Auto-restart ilimitado
- Monitoramento de memória
- Dashboard visual (`pm2 monit`)
- Sobrevive a crashes do sistema

**Instalação do PM2:**
```bash
npm install -g pm2
```

**Comandos PM2:**
```bash
pm2 status              # Ver status
pm2 logs dua-dev        # Ver logs
pm2 restart dua-dev     # Reiniciar
pm2 stop dua-dev        # Parar
pm2 delete dua-dev      # Remover
pm2 monit               # Monitor visual
```

---

## 🎯 COMO USAR

### Opção 1: Start Simples
```bash
./start-dev-forever.sh
```

### Opção 2: Start com Watch
```bash
./start-dev-ultra.sh
```

### Opção 3: Start Profissional
```bash
./start-pm2.sh
```

---

## 🛑 COMO PARAR

### Método 1 e 2:
```bash
Ctrl + C  (no terminal onde está rodando)
```

### Método 3 (PM2):
```bash
pm2 stop dua-dev
# ou para remover completamente:
pm2 delete dua-dev
```

---

## 📊 MONITORAMENTO

### Ver se está rodando:
```bash
# Método 1 e 2:
curl http://localhost:3000

# Método 3 (PM2):
pm2 status
```

### Ver logs:
```bash
# Método 3 (PM2):
pm2 logs dua-dev

# Logs salvos em:
./logs/pm2-error.log
./logs/pm2-out.log
```

---

## ⚡ CONFIGURAÇÕES

### Porta:
- Padrão: **3000**
- Configurado em: `package.json` → `scripts.dev`

### Auto-restart:
- **Método 1**: Restart em 2 segundos após crash
- **Método 2**: Restart imediato ao detectar mudança
- **Método 3**: Restart configurável (ecosystem.config.json)

### Limites:
- **Método 3 (PM2)**: Max 1GB de memória por processo
- **Método 3 (PM2)**: Restart após 10s uptime mínimo
- **Método 3 (PM2)**: 999999 restarts máximos (infinito)

---

## 🔧 TROUBLESHOOTING

### Porta 3000 já em uso:
```bash
# Matar processo na porta 3000:
pkill -f "next dev"

# Ou usar outro método:
lsof -ti:3000 | xargs kill -9
```

### PM2 não encontrado:
```bash
npm install -g pm2
```

### ENTR não encontrado:
```bash
sudo apt-get update
sudo apt-get install -y entr
```

### Servidor não inicia:
```bash
# Verificar dependências:
npm install

# Limpar cache:
rm -rf .next
npm run build
```

---

## 📋 RECOMENDAÇÕES

### Para Desenvolvimento Ativo:
✅ Use **Método 2** (start-dev-ultra.sh)
- Auto-reload quando salvar arquivos
- Feedback instantâneo

### Para Desenvolvimento Longo:
✅ Use **Método 3** (PM2)
- Mais estável
- Logs persistentes
- Sobrevive a crashes

### Para Teste Rápido:
✅ Use **Método 1** (start-dev-forever.sh)
- Simples e direto
- Fácil de controlar

---

## 🎯 EXEMPLO DE USO

```bash
# Terminal 1: Iniciar servidor
./start-pm2.sh

# Terminal 2: Ver logs
pm2 logs dua-dev

# Terminal 3: Desenvolvimento normal
code .

# O servidor NUNCA vai parar sozinho!
# Mesmo se crashar, reinicia automaticamente
```

---

## 📦 ARQUIVOS CRIADOS

- `start-dev-forever.sh` - Loop simples infinito
- `start-dev-ultra.sh` - Com entr watch
- `start-pm2.sh` - PM2 profissional
- `ecosystem.config.json` - Config do PM2
- `logs/pm2-*.log` - Logs do PM2 (criado automaticamente)

---

## ✅ STATUS ATUAL

O servidor está configurado para **NUNCA FECHAR**:

1. ✅ Scripts criados e executáveis
2. ✅ Configurações de auto-restart prontas
3. ✅ Logs configurados
4. ✅ 3 métodos disponíveis

**Escolha um método acima e execute!**

---

## 🚨 IMPORTANTE

- O servidor **só para** se você mandar (Ctrl+C ou pm2 stop)
- Reinicia **automaticamente** em caso de:
  - Crash
  - Erro de código
  - Falta de memória (PM2)
  - Mudanças em arquivos (ENTR)

**Servidor 100% confiável e sempre disponível na porta 3000!** 🎯
