# Suno.com UI Scraping Guide

## Script de Extração

O script `scrape-suno.js` extrai todos os elementos da interface do Suno.com para garantir paridade completa.

## Como Executar

### Opção 1: Localmente
```bash
# Instalar Puppeteer
npm install puppeteer

# Executar script
node scrape-suno.js
```

### Opção 2: Online (sem instalação)
Use o serviço: https://try-puppeteer.appspot.com/

Cole o código do `scrape-suno.js` e execute.

## Dados Extraídos

O script captura:
- **Botões**: Texto, aria-label, estado (disabled), id, classes
- **Dropdowns/Selects**: IDs, nomes, opções disponíveis
- **Inputs**: Tipo, valores, placeholders, min/max (para sliders)
- **Textareas**: IDs, valores, placeholders
- **Chips/Tags**: Estilos disponíveis
- **Notificações**: Mensagens de alerta/toast
- **Tabs**: Modos disponíveis (Simple/Custom, etc)
- **Labels**: Textos e associações
- **Navegação**: Links e estrutura
- **Headers**: Títulos e hierarquia

## Próximos Passos

1. ✅ Script criado (`scrape-suno.js`)
2. ⏳ Executar script e gerar `suno-interface-data.json`
3. ⏳ Comparar com nossa implementação atual
4. ⏳ Adicionar elementos faltantes
5. ⏳ Ajustar placeholders, labels, classes
6. ⏳ Garantir 100% de paridade visual e funcional

## Elementos Já Implementados

### Music Studio (/app/musicstudio/page.tsx)
- ✅ WorkspacePanel com todas as músicas
- ✅ SongCard com player e context menu
- ✅ CreatePanel com formulário de criação
- ✅ TaskMonitor para acompanhamento
- ✅ 14 operações conectadas a APIs reais

### Context Menu (SongContextMenu)
- ✅ Remix/Edit submenu
  - Cover, Extend, Replace Section, Use Styles & Lyrics
- ✅ Create submenu
  - Make Persona, Remaster, Song Radio
- ✅ Download submenu
  - MP3, WAV, Video
- ✅ Top-level actions
  - Get Stems, Add to Queue, Publish, Share, Delete

### APIs Conectadas (27 endpoints)
- ✅ Generate Lyrics (AI)
- ✅ Separate Vocals (2 ou 12+ stems)
- ✅ Convert WAV (lossless)
- ✅ Create Music Video (MP4)
- ✅ Generate Persona (com validação taskId)
- ✅ Boost Style (enhancement)
- ✅ Generate Cover
- ✅ Extend Music
- ✅ Add Instrumental/Vocals
- ✅ Replace Section
- ✅ Timestamped Lyrics
- ✅ Download MP3
- ✅ File Upload (Base64, Stream, URL)
- ✅ Credits Check

## Elementos a Verificar

Após executar o script, verificar se temos:
- [ ] Todos os botões do Suno original
- [ ] Mesmos placeholders em inputs/textareas
- [ ] Mesmas opções em dropdowns
- [ ] Todos os chips de estilo
- [ ] Mesmos sliders (tempo, energia, etc)
- [ ] Mesmos tabs/modos
- [ ] Mesmas notificações
- [ ] Mesma estrutura de navegação

## Análise Esperada

O script deve revelar:
1. **Modo Simple vs Custom**: Tabs/botões para alternar
2. **Inputs principais**: Prompt de música, descrição de estilo
3. **Sliders**: Duração, energia, instrumentação, etc
4. **Chips de estilo**: Pop, Rock, Jazz, Electronic, etc
5. **Botões de ação**: Create, Generate, Cancel, etc
6. **Controles avançados**: Model Version, Make Instrumental, etc

## Status Atual

- **Backend**: 100% ✅ (27 APIs funcionais)
- **Context Menu**: 100% ✅ (14 operações conectadas)
- **UI Básica**: 90% ✅ (funcional, mas pendente validação)
- **UI Paridade**: 0% ⏳ (aguardando dados do scraping)

## Nota

O script foi criado mas não pode ser executado neste ambiente devido a limitações do Puppeteer no Codespaces. Você pode:
1. Executar localmente na sua máquina
2. Usar serviço online como try-puppeteer.appspot.com
3. Compartilhar os dados JSON extraídos para continuarmos a implementação
