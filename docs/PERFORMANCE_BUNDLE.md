# Otimização de Bundle e Build

Este guia resume como medir, analisar e reduzir o tamanho do bundle no Azuria (Next.js + Vite coexistindo).

## Medir e analisar

- Vite (visualizador):
  - `npm run analyze` gera `bundle-visualizer.html` com os treemaps de módulos.
- Next.js (analisador de pacotes):
  - `npm run analyze:next` cria relatórios por página/rota (habilita o analyzer na `next build`).

Verifique os relatórios e identifique módulos grandes, duplicados ou carregados de forma desnecessária nas rotas iniciais.

## Estratégias práticas

1. Divisão de código (code-splitting)

- Use `dynamic(() => import('./Heavy'))` (Next) ou `const Heavy = lazy(() => import('./Heavy'))` (React) para módulos caros e rotas não críticas.
- Evite importar gráficos/editores/SDKs na rota inicial; carregue sob demanda.

1. Tree-shaking e importes granulares

- Prefira importes nomeados: `import { debounce } from 'lodash-es'` em vez de `import _ from 'lodash'`.
- Em bibliotecas UI, importe somente os componentes usados (ex.: shadcn/ui já é granular).

1. Eliminar dependências transitivas pesadas

- Procure duplicações (ex.: duas versões de `date-fns`/`lodash`).
- Remova utilitários redundantes em favor de nativos (`URL`, `Intl`, `crypto`) ou funções pequenas locais.

1. Imagens, ícones e CSS

- Use `next/image` para imagens em páginas Next.
- Ícones: importe SVGs individuais ou coleções treeshakeables (ex.: `lucide-react` já é modular).
- Evite CSS global pesado; utilize utilitários do Tailwind e classes por componente.

1. Limites e regressões

- Defina orçamentos mentais por rota (ex.: < 200KB gzip inicial). Monitore em PRs usando os relatórios.
- Habilite `ANALYZE=true` nos builds de PR quando suspeitar de regressões.

## Dicas específicas do projeto

- As rotas Next em `app/` devem manter importes do domínio estritamente necessários; mova helpers pesados para imports dinâmicos.
- Componentes de gráficos e editores ricos devem ser carregados dinamicamente e renderizados client-side somente quando visíveis.
- Evite importar módulos do Vite em páginas Next (e vice-versa); isso pode impedir tree-shaking adequado.

## Problemas comuns e como evitá-los

- “Moment.js” ou libs similares grandes: use alternativas menores (`date-fns`, `dayjs`).
- “lodash” completo: use `lodash-es` + importes nomeados.
- JSONs grandes embutidos: mova para fetch sob demanda ou divida em arquivos menores.

## Checklist rápida de PR

- [ ] Nova dependência realmente necessária? Há alternativa menor?
- [ ] Importes são granulares e treeshakeables?
- [ ] Nenhum gráfico/editor caro na rota inicial sem `dynamic()`?
- [ ] Relatório do analyzer sem inchada significativa (> +50KB gzip) nas rotas principais?
