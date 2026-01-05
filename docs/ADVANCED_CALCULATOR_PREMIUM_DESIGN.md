# Calculadora Avançada Premium - Design e Arquitetura

## Visão Geral

A Calculadora Avançada será reconstruída como uma ferramenta premium, principal do projeto, seguindo o design limpo estilo Apple da Calculadora Rápida, mas com funcionalidades avançadas para marketplaces e templates.

## Princípios de Design

1. **Design Limpo Estilo Apple**
   - Espaçamento generoso
   - Tipografia clara e hierárquica
   - Bordas coloridas sutis
   - Animações suaves
   - Inputs grandes (h-12 min-h-[44px])

2. **Estrutura Modular**
   - Componentes separados por responsabilidade
   - Layout simples e direto
   - Reutilização de componentes

3. **Experiência Premium**
   - Feedback visual claro
   - Transições suaves
   - Estados de loading elegantes
   - Resultados destacados

## Estrutura de Componentes

```
AdvancedCalculator (Principal)
├── TemplateSelector (Seleção de template/marketplace)
├── ProductInfoSection (Informações do produto)
├── CostInputSection (Custos - Marketplace, Frete, Embalagem, Marketing, Outros)
├── MarginSection (Margem de lucro)
├── ActionButtons (Calcular, Salvar Template, Reset)
├── ResultDisplay (Resultado principal)
└── BreakdownSection (Detalhamento de custos)
```

## Campos da Calculadora

### 1. Template/Marketplace
- Seleção de template pré-configurado ou marketplace
- Carrega automaticamente taxas e configurações

### 2. Informações do Produto
- Nome do produto (opcional)
- Custo do produto (R$)

### 3. Custos Operacionais
- Marketplace Fee (comissão %)
- Payment Fee (taxa de pagamento %)
- Shipping (frete R$)
- Packaging (embalagem R$)
- Marketing (publicidade R$)
- Other Costs (outros custos R$)

### 4. Margem
- Target Margin (margem alvo %)

### 5. Resultado
- Preço de Venda Sugerido
- Lucro Líquido
- Margem Real
- Breakdown Completo

## Fluxo de Uso

1. Usuário seleciona um template (ex: Mercado Livre)
2. Template carrega automaticamente todas as configurações
3. Usuário informa o custo do produto
4. Usuário pode ajustar configurações se necessário
5. Cálculo automático em tempo real
6. Resultado destacado com breakdown completo
7. Opção de salvar como template personalizado
