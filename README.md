# 📊 Azuria - Plataforma Inteligente de Precificação

[![CI](https://img.shields.io/github/actions/workflow/status/azuria-lab/azuria/ci.yml?branch=main&label=CI)](https://github.com/azuria-lab/azuria/actions/workflows/ci.yml)
[![Dependabot](https://img.shields.io/badge/dependabot-security-blue)](https://github.com/azuria-lab/azuria/security/dependabot)
[![Changelog](https://img.shields.io/badge/changes-tracked-success)](./CHANGELOG.md)
[![SBOM](https://img.shields.io/badge/SBOM-pending-lightgrey)](#-sbom--compliance)
[![Coverage](https://img.shields.io/badge/coverage-pending-lightgrey)](#cobertura-de-testes)

| Stack | Versão |
|-------|--------|
| React | 18.3.1 |
| TypeScript | 5.0 |
| Vite | 5.0 |
| Supabase | 2.49 |
| PWA | Ready |

## 🚀 Visão Geral

O **Azuria** é uma plataforma SaaS avançada de precificação desenvolvida especificamente para lojistas e empreendedores brasileiros. Combina cálculos inteligentes de preço de venda, análise de concorrência em tempo real e insights baseados em IA para maximizar a lucratividade dos negócios.

### ✨ Principais Funcionalidades

- 🧮 **Calculadora Inteligente**: Cálculo automático de preços com base em custos, margens e impostos brasileiros
- 📊 **Analytics Avançado**: Dashboard em tempo real com métricas de negócio e KPIs
- 🤖 **IA Integrada**: Recomendações personalizadas e análise preditiva de demanda
- 🏪 **Multi-Marketplace**: Integração com Mercado Livre, Amazon, Shopee e outros
- 📱 **PWA Completo**: Experiência mobile-first com funcionalidades offline
- 🔄 **Automação**: Workflows inteligentes para ajuste automático de preços
- 👥 **Colaboração**: Sistema de equipes com aprovações e comentários
- 📈 **Relatórios**: Exportação avançada e relatórios automatizados

## 🏗️ Arquitetura Técnica

### Stack Tecnológico Principal

```typescript
Frontend:
├── React 18.3.1 (Hooks, Suspense, Concurrent Features)
├── TypeScript 5.0 (Strict Mode)
├── Vite 5.0 (Build Tool + Dev Server)
├── Tailwind CSS 3.0 (Utility-First Styling)
└── Framer Motion (Animations)

Backend & Services:
├── Supabase (Database, Auth, Storage, Edge Functions)
├── PostgreSQL (Primary Database)
├── Row Level Security (RLS)
└── Real-time Subscriptions

UI & Components:
├── Shadcn/UI (Component Library)
├── Radix UI (Primitive Components)
├── Lucide React (Icon System)
├── Recharts (Data Visualization)
└── Sonner (Toast Notifications)

State Management:
├── React Query v5 (Server State)
├── React Context (Global State)
├── React Hook Form (Form State)
└── Zustand (Client State - when needed)

Development Tools:
├── ESLint + Prettier (Code Quality)
├── Vitest (Unit Testing)
├── TypeScript (Type Safety)
└── Git Hooks (Pre-commit validation)
```

### Estrutura de Diretórios

```text
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes base (Shadcn/UI)
│   ├── calculators/     # Componentes de cálculo
│   ├── analytics/       # Dashboards e métricas
│   ├── ai/              # Componentes de IA
│   ├── auth/            # Autenticação
│   ├── layout/          # Layout e navegação
│   └── forms/           # Formulários
├── hooks/               # Custom React Hooks
│   ├── calculator/      # Hooks de cálculo
│   ├── analytics/       # Hooks de analytics
│   ├── auth/            # Hooks de autenticação
│   └── api/             # Hooks de API
├── services/            # Serviços externos
│   ├── supabase/        # Cliente Supabase
│   ├── analytics/       # Google Analytics
│   └── marketplace/     # APIs de marketplace
├── types/               # Definições TypeScript
├── utils/               # Funções utilitárias
├── contexts/            # React Contexts
├── pages/               # Páginas da aplicação
└── integrations/        # Integrações externas
```

## 🚦 Quick Start

### Pré-requisitos

- Node.js 18+
- npm (repositório padronizado para npm-only)
- Conta Supabase (para backend)
- Git

### Instalação

```bash
# Clone o repositório
git clone <YOUR_GIT_URL>
cd azuria

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Configure o Supabase (ver seção Configuração)
npm run setup:supabase

# Inicie o servidor de desenvolvimento
npm run dev
```

### Configuração do Ambiente

1. **Supabase Setup**:

  ```bash
   # Crie um projeto no Supabase Dashboard
   # Copie as credenciais para .env.local
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

1. **Variáveis de Ambiente**:

  ```env
   # Supabase
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   
   # Analytics (opcional)
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   
   # API Keys (para funcionalidades PRO)
   VITE_OPENAI_API_KEY=your-openai-key
   VITE_MARKETPLACE_API_KEY=your-marketplace-key
   ```

## 🧪 Desenvolvimento

### Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build local
npm run test         # Executar testes
npm run test:ui      # Interface visual dos testes
npm run lint         # Verificar código
npm run type-check   # Verificar tipos TypeScript
```

### Padrões de Desenvolvimento

#### Estrutura de Componentes

```typescript
// Exemplo de componente bem estruturado
interface ComponentProps {
  // Props sempre tipadas com interface
  data: BusinessData;
  onAction?: (id: string) => void;
  className?: string;
}

export default function Component({ 
  data, 
  onAction, 
  className 
}: ComponentProps) {
  // Hooks sempre no topo
  const [state, setState] = useState<StateType>();
  const { data: apiData } = useQuery({...});
  
  // Handlers organizados
  const handleAction = useCallback((id: string) => {
    onAction?.(id);
  }, [onAction]);
  
  // Render condicional limpo
  if (!data) return <LoadingSpinner />;
  
  return (
    <div className={cn("base-classes", className)}>
      {/* Conteúdo */}
    </div>
  );
}
```

#### Custom Hooks Pattern

```typescript
// Hook personalizado bem estruturado
export const useCustomFeature = (config: Config) => {
  const [state, setState] = useState<State>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = useCallback(async (data: InputData) => {
    try {
      setLoading(true);
      setError(null);
      // Lógica do hook
      const result = await api.call(data);
      setState(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { state, loading, error, execute };
};
```

## 🏭 Build e Deploy

### Build Local

```bash
# Build otimizado para produção
npm run build

# Análise do bundle
npm run analyze

# Preview local do build
npm run preview
```

### Deploy Automático (Lovable)

O projeto está configurado para deploy automático via Lovable:

1. **Push para main**: Deploy automático em staging
2. **Publish**: Deploy em produção via dashboard Lovable
3. **Custom Domain**: Configurável nas configurações do projeto

### Deploy Manual

```bash
# Build para produção
npm run build

# Deploy em serviços estáticos
# Vercel, Netlify, GitHub Pages, etc.
# Arquivos ficam em ./dist
```

## 📊 Funcionalidades Principais

### 1. Sistema de Cálculo Inteligente

- **Cálculo Básico**: Custo + Margem + Impostos = Preço de Venda
- **Cálculo Avançado**: Inclui taxas de marketplace, frete, sazonalidade
- **Simulação**: Cenários múltiplos com diferentes margens
- **Histórico**: Persistência e análise de cálculos anteriores

### 2. Analytics e Métricas

```typescript
// Exemplo de uso do sistema de analytics
const { analytics } = useRealTimeAnalytics({
  period: 'today',
  segment: 'pro'
});

console.log(analytics.dailyActiveUsers); // Usuários ativos hoje
console.log(analytics.conversionRate);   // Taxa de conversão
console.log(analytics.revenueImpact);    // Impacto na receita
```

### 3. Sistema PWA

- **Offline First**: Funciona sem internet
- **Cache Inteligente**: Estratégias de cache otimizadas
- **Push Notifications**: Alertas de preços e atualizações
- **Background Sync**: Sincronização automática quando online

### 4. Integração com IA

```typescript
// Exemplo de uso da IA
const { getPricingRecommendations } = useAIPricing();

const recommendations = await getPricingRecommendations({
  product: "Smartphone Samsung",
  cost: 800,
  marketplace: "mercado_livre"
});
```

## 🔧 APIs e Integrações

### Supabase Integration

```typescript
// Cliente Supabase configurado
import { supabase } from '@/integrations/supabase/client';

// Exemplos de uso
const { data } = await supabase
  .from('calculation_history')
  .select('*')
  .eq('user_id', user.id);
```

### External APIs

- **Mercado Livre API**: Dados de concorrência
- **Google Analytics**: Métricas de uso
- **OpenAI API**: Recomendações inteligentes
- **Webhook Integrations**: Automação com ferramentas externas

## 🧪 Testes

```bash
# Executar todos os testes
npm run test

# Testes com interface visual
npm run test:ui

# Testes específicos
npm run test calculator

# Coverage
npm run test:coverage
```

### Cobertura de Testes

Status atual: badge acima marcado como "pending" enquanto a automação completa de publicação de badge não é habilitada.

Limiares definidos (Vitest / `vitest.config.ts`):

- Statements: 70%
- Lines: 70%
- Functions: 70%
- Branches: 60%

Como gerar localmente o relatório:

```bash
npm run test:coverage
```

Saída principal: `./coverage/` (inclui `lcov-report/index.html`).

Próximos passos planejados para o badge dinâmico:

1. Publicar cobertura em um serviço externo (Codecov / Coveralls) ou gerar badge estático via GitHub Pages.
2. Adicionar etapa no workflow de CI para atualizar badge após cada execução em `main`.
3. Tornar o badge colorido de acordo com a % (ex.: >=80% verde, 60–79% amarelo, <60% vermelho) após incremento progressivo das metas.

Até a automação: use o relatório local ou artifact de coverage no workflow `CI` para auditoria.

### Estratégia de Testes

1. **Unit Tests**: Componentes isolados e hooks
2. **Integration Tests**: Fluxos completos
3. **E2E Tests**: Cenários de usuário (futuro)

## 🔒 Segurança

### Row Level Security (RLS)

Todas as tabelas do Supabase utilizam RLS para garantir que usuários só acessem seus próprios dados:

```sql
-- Exemplo de política RLS
CREATE POLICY "Users can view own calculations" ON calculation_history
  FOR SELECT USING (auth.uid() = user_id);
```

### Autenticação

- **Supabase Auth**: Sistema robusto de autenticação
- **JWT Tokens**: Tokens seguros com refresh automático
- **Multi-factor**: Suporte a 2FA (futuro)

## 🎯 Performance

### Otimizações Implementadas

- **Code Splitting**: Carregamento sob demanda
- **Lazy Loading**: Componentes e rotas lazy
- **Image Optimization**: Carregamento otimizado de imagens
- **Caching Strategy**: Cache inteligente de dados
- **Bundle Analysis**: Monitoramento do tamanho do bundle

### Web Vitals

O projeto monitora automaticamente as Core Web Vitals:

- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

## 📈 Monitoramento

### Analytics Integrados

- **Google Analytics 4**: Comportamento do usuário
- **Internal Analytics**: Métricas de negócio específicas
- **Error Tracking**: Monitoramento de erros (Sentry - futuro)
- **Performance Monitoring**: Web Vitals e métricas customizadas

## 🤝 Contribuindo

1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
4. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
5. **Push** para a branch (`git push origin feature/AmazingFeature`)
6. **Abra** um Pull Request

## 📜 Licença

O Azuria é um software proprietário e de uso restrito. Nenhuma parte deste código, documentação ou ativos associados pode ser copiada, modificada, distribuída, publicada, sublicenciada ou utilizada para fins comerciais sem autorização expressa e por escrito da Azuria.

O acesso ao código-fonte é concedido exclusivamente para fins internos autorizados. Todo uso não autorizado está sujeito a sanções civis e criminais. Para solicitações de parceria, auditoria ou integração empresarial, entre em contato: [legal@azuria.com](mailto:legal@azuria.com).

### Licenças de Terceiros

<!-- GOVERNANCE-ALLOW-LICENSING-START -->
Este repositório utiliza dependências de terceiros amplamente reconhecidas no ecossistema (por exemplo: React, Vite, TypeScript, Tailwind, entre outras). Cada dependência permanece regida pelos seus próprios termos (ex.: MIT, Apache-2.0, ISC, BSD, etc.) conforme indicado nos respectivos pacotes ou repositórios oficiais. Esta licença proprietária não altera nem restringe os direitos concedidos por essas licenças originais.

Ao redistribuir artefatos internos ou implantar a aplicação, cabe ao operador preservar eventuais avisos e termos exigidos por licenças de terceiros. Para auditoria ou compliance formal, gere um SBOM ou utilize ferramentas de inventário de licenças.

Um inventário gerado das licenças diretas encontra-se em [`THIRD_PARTY_LICENSES.md`](./THIRD_PARTY_LICENSES.md).
<!-- GOVERNANCE-ALLOW-LICENSING-END -->

Referências adicionais:

- Histórico de mudanças: consulte `CHANGELOG.md`
- Rumo estratégico: consulte `ROADMAP.md`
- Política de segurança: `SECURITY.md`
- Código de Conduta: `CODE_OF_CONDUCT.md`
- Guia de Contribuição: `CONTRIBUTING.md`

## 🔐 Segurança

Achou uma vulnerabilidade? Siga a nossa política em `SECURITY.md` para reporte responsável.

### Padrões de Commit

```text
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: mudanças de formatação
refactor: refatoração de código
test: adiciona ou modifica testes
chore: tarefas de manutenção
perf: melhoria de performance
build: mudanças de build ou dependências
ci: alterações em pipelines/CI
```

## 🧾 Versionamento Automático

Utilizamos **semantic-release** (planejado / em implantação) para:

- Gerar versão automaticamente a partir de Conventional Commits
- Atualizar `CHANGELOG.md`
- Criar tag e release no GitHub
- (Futuro) Publicar artefatos/bundle assinados

Regras de mapeamento:

- `feat:` → `minor`
- `fix:` / `perf:` → `patch`
- `BREAKING CHANGE:` no corpo ou `!` no tipo → `major`

Enquanto semantic-release não estiver ativo em `main`, as versões permanecem `0.x`.

### Convenção de Branches

```text
feature/...   -> novas funcionalidades
fix/...       -> correções
chore/...     -> manutenção/governança
perf/...      -> otimizações
refactor/...  -> refatorações estruturais
```

## 🧬 SBOM & Compliance

Será gerado um SBOM (CycloneDX) no pipeline para auditoria de dependências.

Passos planejados:

1. Adicionar script `sbom` usando `@cyclonedx/cyclonedx-npm`.
2. Job opcional em CI gerando `sbom.json` (armazenado como artifact).
3. (Futuro) Assinatura e upload para repositório interno.

Execução local (após implantação):

```bash
npm run sbom
```

Arquivo resultado: `./sbom.json`.

## 🆘 Suporte

- **Documentação**: [docs/](./docs/)
- **Issues**: [GitHub Issues](./issues)
- **Discord**: [Comunidade Azuria](https://discord.com/invite/azuria)
- **Email**: [suporte@azuria.app](mailto:suporte@azuria.app)

## 🧰 Política de Gerenciador de Pacotes (NPM-Only)

Este repositório é padronizado para uso exclusivo de **npm**. Isso garante:

- Reprodutibilidade consistente em CI/CD
- Um único lockfile fonte de verdade (`package-lock.json`)
- Evita divergências e problemas de auditoria/licenciamento

### Regras

1. Não commit(e) `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`, `npm-shrinkwrap.json` ou `shrinkwrap.yaml`.
1. Instale dependências sempre com:

```bash
npm ci   # em pipelines ou ambientes limpos
npm install  # para adicionar/atualizar pacotes
```

1. Antes de abrir PR: execute o guard opcional

```bash
npm run verify:package-manager
```

### Automação

- Script de verificação: `scripts/verify-package-manager.mjs`
- Workflow: `.github/workflows/package-manager-guard.yml` (impede lockfiles alternativos)
- Hook (implícito via `preinstall`): alerta se algo estiver fora do padrão

Se um lockfile alternativo aparecer, o workflow falhará e o script indicará quais arquivos remover.

---

**Desenvolvido com ❤️ para empreendedores brasileiros**  
*Azuria - Maximizando sua lucratividade com inteligência*
