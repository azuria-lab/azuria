# 🎯 Guia Rápido - Calculadora Avançada

## 📖 Como Usar

### 1️⃣ Etapa 1: Dados do Produto

![Etapa 1](./docs/assets/step1.png)

**Campos:**
- **Nome do Produto** (opcional): Ex: "Tênis Nike Air Max"
- **Categoria** (opcional): Selecione entre 6 opções
- **Custo do Produto** (obrigatório): Quanto você paga pelo produto

**Dica:** 💡 O custo aparece em laranja no preview abaixo do campo.

**Próximo:** Clique em "Próximo" após preencher o custo.

---

### 2️⃣ Etapa 2: Custos e Marketplace

![Etapa 2](./docs/assets/step2.png)

#### 📊 Margem de Lucro
- Use o **slider** para ajustar de 0% a 100%
- Ou clique nos **botões rápidos**: 10%, 20%, 30%, 40%, 50%
- Sua margem atual aparece em destaque

#### 🛒 Marketplace
Selecione onde você vende:
- **Mercado Livre** (12% de comissão)
- **Shopee** (8% de comissão)
- **Amazon** (15% de comissão)
- **Custom** (personalizado)

#### 💳 Meio de Pagamento
Escolha o tipo principal:
- **Cartão de Crédito:** 2.5%
- **Cartão de Débito:** 1.5%
- **PIX:** 0.5%
- **Boleto:** 3.0%

#### 💰 Custos Adicionais
Preencha os custos extras (todos opcionais):
- **Frete:** Custo de envio
- **Embalagem:** Caixas, plástico bolha, etc.
- **Marketing:** Anúncios pagos
- **Outros:** Custos diversos

**💡 Total automático:** O sistema soma todos os custos em tempo real.

**Calcular:** Clique em "Calcular" para ir para os resultados.

---

### 3️⃣ Etapa 3: Resultado Final

![Etapa 3](./docs/assets/step3.png)

#### 📊 Cards de Resultados

**🟢 Preço Sugerido**
- Preço final de venda recomendado
- Já inclui todas as taxas e custos

**🔵 Lucro Líquido**
- Quanto você ganha de fato
- Após descontar todos os custos e taxas

**🟣 Margem Total**
- Percentual de lucro real sobre o custo
- Considera todos os descontos

**🟠 Total de Taxas**
- Soma de marketplace + meio de pagamento
- Valor em reais descontado

#### 🎮 Simulação de Cenários

Teste diferentes margens instantaneamente:
- **-10%:** Reduz margem em 10 pontos
- **-5%:** Reduz margem em 5 pontos
- **+5%:** Aumenta margem em 5 pontos
- **+10%:** Aumenta margem em 10 pontos

**Feedback visual:** Emoji 📈 ou 📉 mostra o ajuste.

#### 🔧 Ações Disponíveis

**📥 Exportar PDF**
- Gera relatório completo
- Inclui todos os dados e resultados
- Nome: `azuria-calculo-[timestamp].pdf`

**📜 Histórico (X)**
- Mostra últimos 10 cálculos
- Clique para expandir/recolher
- Dados salvos localmente

**🧠 Otimizar com IA** 🔒
- Em breve: Sugestões automáticas
- Análise de mercado com IA
- Precificação inteligente

---

## 📱 Painel Lateral em Tempo Real

### 💚 Destaque: Preço Sugerido
Grande card verde com o preço final calculado.

### 📊 Métricas
- **🟢 Lucro Líquido:** Ganho real
- **🔵 Margem Total:** Percentual final
- **🟠 Custos Totais:** Soma de tudo
- **🟡 Taxas:** Descontos do marketplace + pagamento

### ℹ️ Info Card
Quando nenhum dado foi preenchido:
> "Preencha os dados para ver os cálculos em tempo real"

### ⚠️ Aviso Tributário
Card amarelo explicando:
> Para análise tributária completa (Simples Nacional, Lucro Presumido, Lucro Real), use a **Calculadora Tributária**.

---

## 🎨 Entendendo as Cores

| Cor | Significado | Onde aparece |
|-----|-------------|--------------|
| 🟠 **Laranja** | Custos | Custo do produto, custos adicionais |
| 🟡 **Amarelo** | Impostos/Taxas | Taxas de marketplace e pagamento |
| 🟢 **Verde** | Lucro/Sucesso | Preço sugerido, lucro líquido |
| 🔵 **Azul** | Informação | Margem total, dados gerais |
| 🟣 **Roxo** | Destaque | Cards especiais |
| ⚫ **Cinza** | Neutro | Labels, estrutura |

---

## 💡 Dicas de Uso

### Para Iniciantes

1. **Comece simples:**
   - Preencha apenas custo e margem
   - Deixe custos adicionais em branco
   - Use marketplace padrão (Mercado Livre)

2. **Teste margens:**
   - Experimente 30% primeiro
   - Use simulação de cenários
   - Compare resultados

3. **Entenda o painel:**
   - Observe o painel lateral mudando
   - Veja como custos afetam o preço
   - Note a diferença entre lucro e margem

### Para Vendedores Experientes

1. **Seja preciso:**
   - Inclua TODOS os custos adicionais
   - Escolha o marketplace correto
   - Selecione meio de pagamento real

2. **Use histórico:**
   - Compare produtos similares
   - Analise tendências de margem
   - Refine sua estratégia

3. **Exporte relatórios:**
   - Salve PDFs para análise
   - Compartilhe com equipe
   - Mantenha registro histórico

### Para E-commerce

1. **Análise por categoria:**
   - Categorize produtos corretamente
   - Compare margens entre categorias
   - Identifique produtos mais lucrativos

2. **Simule cenários:**
   - Teste promoções (-5%, -10%)
   - Calcule preço de lançamento
   - Planeje reajustes (+5%, +10%)

3. **Prepare-se para IA:**
   - Mantenha histórico organizado
   - Use categorias consistentes
   - Aguarde integração de IA

---

## ❓ FAQ

### P: O que é "Margem Total"?
**R:** É a margem de lucro REAL após descontar todos os custos e taxas. Diferente da "margem desejada", que é apenas sobre o custo base.

### P: Por que o preço sugerido é maior que o esperado?
**R:** O preço final inclui:
- Custo do produto
- Custos adicionais (frete, embalagem, etc.)
- Margem de lucro desejada
- Taxa do marketplace
- Taxa do meio de pagamento

### P: Posso usar sem preencher nome/categoria?
**R:** Sim! Apenas o **custo do produto** é obrigatório. Outros campos são opcionais.

### P: O histórico é salvo na nuvem?
**R:** Atualmente é salvo **localmente** no navegador. Sincronização com Supabase em breve.

### P: Como funciona a exportação PDF?
**R:** Gera um relatório completo com:
- Logo Azuria
- Data/hora
- Dados do produto
- Todos os custos
- Resultados finais

### P: Quando a IA estará disponível?
**R:** Em desenvolvimento! A interface já está preparada. Aguarde novidades.

### P: E a Calculadora Tributária?
**R:** Será uma calculadora separada e dedicada para análise tributária completa (Simples, Lucro Presumido, Lucro Real).

---

## 🐛 Problemas Comuns

### Painel lateral não atualiza
**Solução:** Verifique se preencheu o custo do produto (campo obrigatório).

### Preço muito alto
**Solução:** 
- Revise custos adicionais (podem estar duplicados)
- Verifique se marketplace/pagamento estão corretos
- Reduza margem desejada

### Preço muito baixo
**Solução:**
- Aumente margem de lucro
- Revise se incluiu todos os custos
- Use simulação +5% ou +10%

### Histórico não aparece
**Solução:** Você precisa calcular ao menos 1 vez. Vá até Etapa 3 para gerar histórico.

### PDF não baixa
**Solução:** 
- Verifique permissões do navegador
- Teste em modo anônimo
- Limpe cache do navegador

---

## 📞 Suporte

Precisa de ajuda? Entre em contato:
- 📧 Email: suporte@azuria.app.br
- 💬 Chat: Disponível no site
- 📚 Docs: [Documentação Completa](./ADVANCED_CALCULATOR_IMPLEMENTATION.md)

---

**Azuria** - Precificação Inteligente 🚀
