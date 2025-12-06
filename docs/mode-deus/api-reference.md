---
title: Referência da API (Internal Tools)
date: 2025-12-05
author: Agente Azuria
version: 1.0.0
---

# Referência da API (Internal Tools)

Estas são as funções registradas no `Function Registry` que a IA (LLM) pode invocar autonomamente para realizar tarefas ou cálculos.

## Categoria: Calculation (`calculo`)

### `calcularPrecoIdeal`
Calcula o preço de venda sugerido para atingir uma margem específica.

*   **Parâmetros:**
    *   `custoProduto` (number, required): Custo base do produto.
    *   `margemDesejada` (number, required): % de margem alvo.
    *   `custoOperacional` (number): Custos fixos/variáveis adicionais.
    *   `impostos` (number): Carga tributária total %.

### `calcularMargem`
Calcula a margem real dado um preço de venda.

*   **Parâmetros:**
    *   `precoVenda` (number, required)
    *   `custoProduto` (number, required)
    *   `custoOperacional` (number)

### `calcularPrecoMinimo`
Calcula o preço de breakeven (lucro zero).

*   **Parâmetros:**
    *   `custoProduto` (number, required)
    *   `custoOperacional` (number)
    *   `impostos` (number)

---

## Categoria: Fiscal (`fiscal`)

### `calcularICMS`
Calcula valor do ICMS em operações interestaduais ou internas.

*   **Parâmetros:**
    *   `preco` (number, required)
    *   `aliquota` (number, required): % da alíquota.
    *   `ufOrigem` (string): Estado de origem (ex: 'SP').
    *   `ufDestino` (string): Estado de destino.

### `calcularST`
Calcula a Substituição Tributária.

*   **Parâmetros:**
    *   `preco` (number, required)
    *   `mva` (number, required): Margem de Valor Agregado %.
    *   `aliquotaInterna` (number, required).

### `calcularMVA`
Consulta ou calcula a MVA ajustada.

*   **Parâmetros:**
    *   `ncm` (string, required): Código NCM.
    *   `uf` (string, required): Estado destino.

---

## Categoria: Marketplace (`marketplace`)

### `getTaxasMarketplace`
Retorna a tabela de taxas de um canal de venda.

*   **Parâmetros:**
    *   `marketplace` (string, required): 'mercadolivre', 'shopee', etc.
    *   `categoria` (string): Categoria do item (pode afetar taxa).

### `calcularComissao`
Calcula o valor monetário da comissão.

*   **Parâmetros:**
    *   `marketplace` (string, required)
    *   `precoVenda` (number, required)
    *   `categoria` (string)

---

## Categoria: Bidding (`licitacao`)

### `calcularLance`
Sugere um lance competitivo para pregão.

*   **Parâmetros:**
    *   `precoReferencia` (number, required): Valor máximo do edital.
    *   `custoTotal` (number, required)
    *   `margemDesejada` (number, default: 10)

### `avaliarRisco`
Analisa viabilidade do edital.

*   **Parâmetros:**
    *   `precoReferencia` (number)
    *   `custoTotal` (number)
    *   `prazoEntrega` (number)

---

## Categoria: UI (`ui`)

### `setInputValue`
Preenche automaticamente um campo na tela do usuário.

*   **Parâmetros:**
    *   `campoId` (string, required): ID do elemento HTML/React.
    *   `valor` (string, required).
    *   `destacar` (boolean): Se deve piscar/focar o campo.

### `aplicarSugestaoNaTela`
Aplica um conjunto de valores (ex: otimização completa).

*   **Parâmetros:**
    *   `tipo` (string): 'preco', 'margem', etc.
    *   `valores` (object): Mapa de campos e valores.
    *   `confirmarAntes` (boolean): Se requer modal de confirmação.
