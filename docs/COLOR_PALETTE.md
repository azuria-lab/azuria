# Paleta de Cores - Azuria

Este documento define a paleta de cores oficial do projeto Azuria, implementada no Dashboard e na Calculadora Rápida. **Todas as melhorias e novos componentes devem seguir esta paleta de cores para manter a consistência visual.**

## 🎨 Cores Principais

### Cores Customizadas (Hexadecimais)

#### `#148D8D` - Teal Azuria (Custo do Produto)
- **Uso**: Campo principal de entrada de custo, card principal da calculadora
- **Aplicação**: 
  - Borda lateral de inputs (`border-l-4`)
  - Ícones e containers
  - Cards principais
- **Contexto**: Representa o valor base, entrada principal de dados

```tsx
// Exemplo de uso
style={{ borderLeftColor: '#148D8D' }}
className="focus:ring-[#148D8D]/20"
```

#### `#895129` - Marrom (Custos Adicionais)
- **Uso**: Seção de custos adicionais, frete, outros custos
- **Aplicação**:
  - Borda lateral de inputs relacionados a custos adicionais
  - Ícones e containers da seção
  - Cards de configuração de frete
- **Contexto**: Representa custos complementares e variáveis

```tsx
// Exemplo de uso
style={{ borderLeftColor: '#895129' }}
className="focus:ring-[#895129]/20"
```

### Cores do Sistema Tailwind

#### Azul (`blue-500`, `blue-600`)
- **Uso**: Funcionalidades principais, ações primárias, resultados intermediários
- **Aplicação**:
  - Botões de ação principais
  - Cards de métricas (Dashboard)
  - Resultado quando margem está abaixo do recomendado
  - Modo manual de cálculo
- **Classes**: `border-l-blue-500`, `text-blue-600`, `bg-blue-50`, `border-blue-100`

#### Verde (`green-500`, `green-600`)
- **Uso**: Status positivo, margem saudável, sucesso
- **Aplicação**:
  - Resultado quando margem é saudável (≥10%)
  - Margem de lucro quando ≥30%
  - Indicadores de sucesso
  - Cards de métricas positivas
- **Classes**: `border-l-green-500`, `text-green-600`, `bg-green-50`, `border-green-200`

#### Ciano (`cyan-500`, `cyan-600`)
- **Uso**: Margem intermediária, status de atenção moderada
- **Aplicação**:
  - Margem de lucro entre 10-20%
  - Indicadores intermediários
- **Classes**: `border-l-cyan-500`, `text-cyan-600`, `bg-cyan-50`, `border-cyan-100`

#### Cinza (`slate-500`, `slate-600`)
- **Uso**: Impostos e taxas, margem baixa, elementos neutros
- **Aplicação**:
  - Seção de Impostos e Taxas
  - Margem de lucro abaixo de 10%
  - Elementos informativos neutros
- **Classes**: `border-l-slate-500`, `text-slate-600`, `bg-slate-50`, `border-slate-200`

#### Índigo (`indigo-500`, `indigo-600`)
- **Uso**: Ferramentas avançadas, recursos extras
- **Aplicação**:
  - Seção de Ferramentas Avançadas
  - Recursos adicionais e complementares
- **Classes**: `border-l-indigo-500`, `text-indigo-600`, `bg-indigo-50`, `border-indigo-100`

## 📐 Padrões de Aplicação

### Bordas Laterais
Sempre use `border-l-4` para destacar seções importantes:

```tsx
// Cores customizadas
<div style={{ borderLeftColor: '#148D8D' }} className="border-l-4">
  {/* Conteúdo */}
</div>

// Cores Tailwind
<div className="border-l-4 border-l-blue-500">
  {/* Conteúdo */}
</div>
```

### Ícones e Containers
Use containers com fundo e borda sutil:

```tsx
// Cores customizadas
<div 
  className="p-1.5 rounded-md border" 
  style={{ 
    backgroundColor: '#148D8D15', // 15 = ~8% opacity
    borderColor: '#148D8D30'      // 30 = ~19% opacity
  }}
>
  <Icon className="h-4 w-4" style={{ color: '#148D8D' }} />
</div>

// Cores Tailwind
<div className="p-1.5 rounded-md bg-blue-50 border border-blue-100">
  <Icon className="h-4 w-4 text-blue-600" />
</div>
```

### Focus Rings
Use opacidade de 20% para focus rings:

```tsx
className="focus:ring-2 focus:ring-[#148D8D]/20"
// ou
className="focus:ring-2 focus:ring-blue-500/20"
```

### Cards e Containers
Aplique cores consistentes em cards:

```tsx
<Card className="border-l-4 border-l-blue-500">
  {/* Conteúdo */}
</Card>
```

## 🎯 Mapeamento por Funcionalidade

### Calculadora Rápida

| Seção | Cor | Código | Uso |
|-------|-----|--------|-----|
| Custo do Produto | Teal Azuria | `#148D8D` | Campo principal |
| Custos Adicionais | Marrom | `#895129` | Outros custos, frete |
| Impostos e Taxas | Cinza | `slate-500/600` | Impostos, taxa de cartão |
| Margem ≥30% | Verde | `green-500/600` | Excelente |
| Margem 20-30% | Azul | `blue-500/600` | Boa |
| Margem 10-20% | Ciano | `cyan-500/600` | Adequada |
| Margem <10% | Cinza | `slate-500/600` | Baixa |
| Resultado Saudável | Verde | `green-500/600` | Margem ≥10% |
| Resultado Atenção | Azul | `blue-500/600` | Margem <10% |
| Modo Manual | Azul | `blue-500/600` | Configurações |
| Ferramentas Avançadas | Índigo | `indigo-500/600` | Recursos extras |

### Dashboard

| Elemento | Cor | Código | Uso |
|----------|-----|--------|-----|
| Total de Cálculos | Azul | `blue-500` | Métrica principal |
| Análises de IA | Roxo | `purple-500` | Funcionalidade IA |
| Lucro Otimizado | Verde | `green-500` | Métrica positiva |
| Tempo Economizado | Laranja | `orange-500` | Métrica de eficiência |

## 🚫 Cores a Evitar

Para manter a consistência, **evite usar**:
- ❌ Laranja (`orange`) - exceto em casos específicos do Dashboard
- ❌ Roxo (`purple`) - exceto em casos específicos do Dashboard
- ❌ Vermelho (`red`) - use apenas para erros críticos
- ❌ Amarelo (`yellow`) - use apenas para avisos importantes

## ✅ Boas Práticas

1. **Sempre use as cores definidas** nesta paleta
2. **Mantenha consistência** entre componentes similares
3. **Use bordas laterais** (`border-l-4`) para destacar seções
4. **Aplique opacidade** nos fundos (15-20%) para sutileza
5. **Mantenha contraste** adequado para acessibilidade
6. **Use cores customizadas** apenas quando especificado (`#148D8D`, `#895129`)
7. **Prefira cores neutras e frias** (azul, verde, cinza, ciano) sobre cores quentes

## 📝 Notas de Implementação

- Cores customizadas devem ser aplicadas via `style` prop quando necessário
- Cores Tailwind devem ser preferidas quando possível para melhor manutenção
- Sempre teste o contraste para garantir acessibilidade
- Mantenha a hierarquia visual clara usando cores de forma consistente

## 🔄 Atualizações

Este documento deve ser atualizado sempre que novas cores forem adicionadas ou quando houver mudanças na paleta oficial do projeto.

---

**Última atualização**: Dezembro 2024
**Versão**: 1.0

