
# 📊 Azuria - Plataforma Inteligente de Precificação

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-blue.svg" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.0-purple.svg" alt="Vite">
  <img src="https://img.shields.io/badge/Supabase-2.49-green.svg" alt="Supabase">
  <img src="https://img.shields.io/badge/PWA-Ready-orange.svg" alt="PWA">
</div>

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

```
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
- npm ou yarn
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

2. **Variáveis de Ambiente**:
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

Este projeto é distribuído sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.

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
```

## 🆘 Suporte

- **Documentação**: [docs/](./docs/)
- **Issues**: [GitHub Issues](./issues)
- **Discord**: [Comunidade Azuria](https://discord.com/invite/azuria)
- **Email**: [suporte@azuria.app](mailto:suporte@azuria.app)

## 🗺️ Roadmap

### 🚀 Próximas Features

- [ ] **API Pública**: REST API para integrações
- [ ] **Mobile App**: Aplicativo nativo React Native
- [ ] **Marketplace**: Loja de templates e plugins
- [ ] **Enterprise**: Funcionalidades para grandes empresas
- [ ] **Multi-idioma**: Suporte internacional
- [ ] **White Label**: Solução customizável para parceiros

### 📊 Métricas do Projeto

- **+50 Componentes** reutilizáveis
- **+30 Custom Hooks** especializados
- **+20 Páginas** funcionais
- **+15 Integrações** externas
- **PWA Score 100%** no Lighthouse
- **Type Safety 100%** com TypeScript

---

**Desenvolvido com ❤️ para empreendedores brasileiros**  
*Azuria - Maximizando sua lucratividade com inteligência*
