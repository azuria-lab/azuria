# 📸 Guia Visual - Screenshots e GIFs

Este documento serve como guia para adicionar screenshots e GIFs à documentação do Azuria.

---

## 📋 Checklist de Screenshots

### Páginas Principais

#### 🏠 Landing Page
- [ ] Screenshot completo da landing page
- [ ] Screenshot da seção de features
- [ ] Screenshot da seção de planos
- [ ] Screenshot do footer

**Localização sugerida:** `docs/images/landing/`

#### 📊 Dashboard
- [ ] Screenshot do dashboard principal
- [ ] Screenshot com métricas visíveis
- [ ] Screenshot do sidebar
- [ ] Screenshot do header

**Localização sugerida:** `docs/images/dashboard/`

#### 🧮 Calculadoras

**Calculadora Básica:**
- [ ] Screenshot da calculadora simples
- [ ] Screenshot com resultado calculado
- [ ] GIF do fluxo completo de cálculo

**Calculadora Avançada:**
- [ ] Screenshot da Etapa 1 (Dados do Produto)
- [ ] Screenshot da Etapa 2 (Custos e Marketplace)
- [ ] Screenshot da Etapa 3 (Resultado)
- [ ] GIF do wizard completo
- [ ] Screenshot do preview em tempo real

**Calculadora Tributária:**
- [ ] Screenshot da seleção de regime
- [ ] Screenshot dos resultados comparativos
- [ ] Screenshot da recomendação

**Calculadora de Licitação:**
- [ ] Screenshot do formulário
- [ ] Screenshot dos resultados
- [ ] Screenshot do dashboard de licitações

**Localização sugerida:** `docs/images/calculators/`

#### 🤖 IA

**Azuria AI Hub:**
- [ ] Screenshot do hub unificado
- [ ] Screenshot do chat
- [ ] Screenshot da precificação inteligente
- [ ] Screenshot da análise competitiva
- [ ] GIF do fluxo de chat completo
- [ ] GIF da precificação inteligente

**Localização sugerida:** `docs/images/ai/`

#### 🏪 Marketplace

**Dashboard de Marketplace:**
- [ ] Screenshot do dashboard
- [ ] Screenshot da gestão de produtos
- [ ] Screenshot do comparador
- [ ] GIF da sincronização

**Localização sugerida:** `docs/images/marketplace/`

#### 📊 Analytics

**Dashboard de Analytics:**
- [ ] Screenshot do dashboard principal
- [ ] Screenshot dos gráficos
- [ ] Screenshot das métricas
- [ ] Screenshot dos relatórios

**Localização sugerida:** `docs/images/analytics/`

#### 👥 Colaboração

**Sistema de Colaboração:**
- [ ] Screenshot do painel de colaboração
- [ ] Screenshot do compartilhamento
- [ ] Screenshot do workflow de aprovação
- [ ] Screenshot dos comentários

**Localização sugerida:** `docs/images/collaboration/`

#### ⚙️ Automação

**Dashboard de Automação:**
- [ ] Screenshot do dashboard
- [ ] Screenshot do construtor de regras
- [ ] Screenshot do workflow builder
- [ ] GIF da criação de uma regra

**Localização sugerida:** `docs/images/automation/`

#### 💳 Assinatura

**Página de Planos:**
- [ ] Screenshot da página de planos
- [ ] Screenshot da comparação de planos
- [ ] Screenshot do checkout

**Localização sugerida:** `docs/images/subscription/`

---

## 🎬 Checklist de GIFs

### Fluxos Principais

#### 1. Fluxo de Cálculo Completo
- [ ] GIF mostrando: Entrada de dados → Cálculo → Resultado
- [ ] Duração: 10-15 segundos
- [ ] Incluir: Calculadora básica e avançada

#### 2. Fluxo de IA - Chat
- [ ] GIF mostrando: Abertura do chat → Pergunta → Resposta da IA
- [ ] Duração: 15-20 segundos
- [ ] Incluir: Múltiplas interações

#### 3. Fluxo de IA - Precificação Inteligente
- [ ] GIF mostrando: Seleção de produto → Análise da IA → Sugestão de preço
- [ ] Duração: 15-20 segundos

#### 4. Fluxo de Marketplace
- [ ] GIF mostrando: Adição de produto → Sincronização → Atualização no dashboard
- [ ] Duração: 20-25 segundos

#### 5. Fluxo de Colaboração
- [ ] GIF mostrando: Compartilhamento → Aprovação → Comentário
- [ ] Duração: 20-25 segundos

#### 6. Fluxo de Automação
- [ ] GIF mostrando: Criação de regra → Execução → Notificação
- [ ] Duração: 25-30 segundos

#### 7. Fluxo de Assinatura
- [ ] GIF mostrando: Seleção de plano → Checkout → Confirmação
- [ ] Duração: 15-20 segundos

**Localização sugerida:** `docs/images/gifs/`

---

## 📐 Especificações Técnicas

### Screenshots

- **Formato:** PNG ou WebP
- **Resolução:** Mínimo 1920x1080 (Full HD)
- **Qualidade:** Alta (sem compressão excessiva)
- **Tamanho máximo:** 2MB por imagem
- **Nomenclatura:** `feature-page-description.png`
  - Exemplo: `calculator-advanced-wizard-step1.png`

### GIFs

- **Formato:** GIF ou MP4 (preferível MP4 para melhor qualidade)
- **Resolução:** 1280x720 (HD) ou 1920x1080 (Full HD)
- **Duração:** 10-30 segundos
- **FPS:** 15-30 FPS
- **Tamanho máximo:** 10MB por GIF
- **Nomenclatura:** `feature-flow-description.gif`
  - Exemplo: `ai-chat-complete-flow.gif`

### Otimização

- Use ferramentas como [TinyPNG](https://tinypng.com/) para comprimir PNGs
- Use ferramentas como [EZGIF](https://ezgif.com/) para otimizar GIFs
- Considere usar WebP para screenshots (melhor compressão)
- Considere usar MP4 para animações (melhor qualidade/tamanho)

---

## 📝 Como Adicionar

### 1. Estrutura de Pastas

```
docs/
  images/
    landing/
    dashboard/
    calculators/
    ai/
    marketplace/
    analytics/
    collaboration/
    automation/
    subscription/
    gifs/
```

### 2. Adicionar no README.md

```markdown
![Calculadora Avançada - Wizard Etapa 1](./docs/images/calculators/calculator-advanced-wizard-step1.png)
```

### 3. Adicionar em Documentos Específicos

```markdown
## Screenshots

### Calculadora Avançada

![Wizard Etapa 1](./images/calculators/calculator-advanced-wizard-step1.png)
![Wizard Etapa 2](./images/calculators/calculator-advanced-wizard-step2.png)
![Resultado](./images/calculators/calculator-advanced-result.png)

### GIFs

![Fluxo Completo](./images/gifs/calculator-complete-flow.gif)
```

---

## 🎨 Ferramentas Recomendadas

### Captura de Tela

- **Windows:** Snipping Tool, ShareX, Greenshot
- **macOS:** Screenshot (Cmd+Shift+4), CleanShot X
- **Linux:** Flameshot, Shutter

### Criação de GIFs

- **Windows:** ScreenToGif, OBS Studio
- **macOS:** Kap, CleanShot X, ScreenFlow
- **Linux:** Peek, OBS Studio
- **Online:** [EZGIF](https://ezgif.com/), [CloudConvert](https://cloudconvert.com/)

### Edição

- **Imagens:** GIMP, Photoshop, Figma
- **Vídeos/GIFs:** FFmpeg, HandBrake, Adobe Premiere

---

## ✅ Checklist de Qualidade

Antes de adicionar uma imagem/GIF:

- [ ] Resolução adequada (mínimo HD)
- [ ] Tamanho otimizado (sem ser muito pesado)
- [ ] Nome descritivo e consistente
- [ ] Sem informações sensíveis (emails, tokens, etc.)
- [ ] Sem dados pessoais de usuários
- [ ] Texto legível
- [ ] Cores consistentes com o tema
- [ ] Sem elementos desnecessários (cursos, notificações, etc.)

---

## 📌 Placeholders Atuais

Atualmente, os seguintes locais estão preparados para receber imagens:

### README.md

- Seção "Funcionalidades Principais" - Screenshots de cada calculadora
- Seção "Módulo de IA" - Screenshot do hub de IA
- Seção "Dashboard" - Screenshot do dashboard principal

### docs/IA_COMPLETA.md

- Seção "Azuria AI Assistant" - Screenshot do chat
- Seção "Intelligent Pricing" - Screenshot da precificação
- Seção "Competitive AI Analysis" - Screenshot da análise

### docs/PLANOS_E_ASSINATURA.md

- Seção "Comparação de Planos" - Screenshot da tabela
- Seção "Checkout" - Screenshot do processo

### docs/LICITACAO_COMPLETA.md

- Seção "Calculadora de Licitação" - Screenshot da calculadora
- Seção "Dashboard de Licitações" - Screenshot do dashboard

---

## 🚀 Próximos Passos

1. **Capturar Screenshots:** Use as ferramentas recomendadas para capturar todas as telas listadas
2. **Criar GIFs:** Grave os fluxos principais usando as ferramentas de gravação
3. **Otimizar:** Comprima e otimize todas as imagens/GIFs
4. **Organizar:** Coloque os arquivos nas pastas corretas
5. **Adicionar:** Atualize os documentos com as referências às imagens
6. **Validar:** Verifique que todas as imagens carregam corretamente

---

**Última atualização:** Janeiro 2025  
**Status:** Aguardando captura de screenshots e criação de GIFs

