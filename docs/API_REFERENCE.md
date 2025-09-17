
# 📚 API Reference - Azuria

## 🎯 Visão Geral

Este documento detalha todos os hooks customizados, services e componentes principais do Azuria, fornecendo exemplos práticos de uso e especificações técnicas completas.

## 🧮 Calculator Hooks

### useCalculator

Hook principal para cálculos de precificação.

```typescript
const {
  inputs,
  result,
  loading,
  error,
  setInput,
  calculate,
  reset,
  exportResult
} = useCalculator();
```

#### Parâmetros de Entrada

```typescript
interface CalculatorInputs {
  cost: number;              // Custo do produto
  margin: number;            // Margem de lucro (%)
  tax?: number;              // Impostos (%)
  cardFee?: number;          // Taxa do cartão (%)
  shipping?: number;         // Frete (R$)
  otherCosts?: number;       // Outros custos (R$)
  marketplace?: Marketplace; // Marketplace selecionado
}
```

#### Resultado do Cálculo

```typescript
interface CalculationResult {
  sellingPrice: number;      // Preço de venda final
  grossProfit: number;       // Lucro bruto
  profitMargin: number;      // Margem de lucro real
  totalCosts: number;        // Total de custos
  breakdown: {               // Detalhamento
    baseCost: number;
    taxes: number;
    fees: number;
    shipping: number;
    other: number;
  };
  recommendations?: AIRecommendations;
}
```

#### Exemplo de Uso

```typescript
function PricingCalculator() {
  const { inputs, result, calculate, setInput } = useCalculator();
  
  const handleCostChange = (value: string) => {
    setInput('cost', parseFloat(value) || 0);
  };
  
  const handleCalculate = async () => {
    await calculate();
  };
  
  return (
    <div>
      <input 
        value={inputs.cost} 
        onChange={(e) => handleCostChange(e.target.value)}
        placeholder="Custo do produto"
      />
      <button onClick={handleCalculate}>Calcular</button>
      {result && (
        <div>Preço de Venda: R$ {result.sellingPrice.toFixed(2)}</div>
      )}
    </div>
  );
}
```

### useAdvancedCalculator

Hook para cálculos avançados com múltiplos cenários.

```typescript
const {
  scenarios,
  activeScenario,
  createScenario,
  deleteScenario,
  setActiveScenario,
  calculateBatch,
  exportScenarios
} = useAdvancedCalculator();
```

#### Cenários Múltiplos

```typescript
interface PricingScenario {
  id: string;
  name: string;
  inputs: CalculatorInputs;
  result?: CalculationResult;
  createdAt: Date;
  tags?: string[];
}

// Exemplo de uso
const createOptimisticScenario = () => {
  createScenario({
    name: "Cenário Otimista",
    inputs: {
      cost: 100,
      margin: 40,
      tax: 8.5,
      marketplace: "mercado_livre"
    }
  });
};
```

## 📊 Analytics Hooks

### useRealTimeAnalytics

Hook para métricas em tempo real.

```typescript
const {
  analytics,
  isRefreshing,
  lastUpdated,
  refreshAnalytics,
  trackAnalyticsEvent,
  filters
} = useRealTimeAnalytics({
  period: 'today',
  segment: 'pro'
});
```

#### Métricas Disponíveis

```typescript
interface RealTimeAnalytics {
  dailyActiveUsers: number;      // Usuários ativos do dia
  calculationsToday: number;     // Cálculos realizados hoje
  avgMarginToday: number;        // Margem média do dia
  conversionRate: number;        // Taxa de conversão
  revenueImpact: number;         // Impacto na receita
  churnRate: number;             // Taxa de churn
  userGrowth: number;            // Crescimento de usuários
  performanceScore: number;      // Score de performance
}
```

#### Exemplo de Tracking

```typescript
function TrackingExample() {
  const { trackAnalyticsEvent } = useRealTimeAnalytics();
  
  const handleCalculation = async (result: CalculationResult) => {
    // Automaticamente tracka o evento
    await trackAnalyticsEvent('calculation.completed', {
      sellingPrice: result.sellingPrice,
      margin: result.profitMargin,
      marketplace: result.marketplace
    });
  };
}
```

### useBusinessMetrics

Hook para KPIs de negócio.

```typescript
const {
  businessMetrics,
  cohortData,
  trends,
  isLoading
} = useBusinessMetrics();
```

#### Métricas de Negócio

```typescript
interface BusinessMetrics {
  mrr: number;                   // Monthly Recurring Revenue
  cac: number;                   // Customer Acquisition Cost
  ltv: number;                   // Customer Lifetime Value
  arpu: number;                  // Average Revenue Per User
  churnRate: number;             // Taxa de churn
  growthRate: number;            // Taxa de crescimento
  conversionFunnel: {
    visitors: number;
    signups: number;
    trials: number;
    conversions: number;
  };
}
```

## 🤖 AI Hooks

### useAIPricing

Hook para recomendações inteligentes de preço.

```typescript
const {
  recommendations,
  loading,
  getPricingRecommendations,
  getMarketAnalysis,
  getDemandForecast
} = useAIPricing();
```

#### Recomendações de IA

```typescript
interface AIRecommendations {
  suggestedPrice: number;        // Preço sugerido
  confidence: number;            // Nível de confiança (0-100)
  reasoning: string;             // Explicação da recomendação
  marketFactors: {
    competition: 'low' | 'medium' | 'high';
    demand: 'low' | 'medium' | 'high';
    seasonality: number;
  };
  alternativePrices: {
    conservative: number;
    aggressive: number;
    balanced: number;
  };
}

// Exemplo de uso
const getAIRecommendation = async () => {
  const recommendation = await getPricingRecommendations({
    product: "Smartphone Samsung Galaxy",
    cost: 800,
    category: "electronics",
    marketplace: "mercado_livre"
  });
  
  console.log(`IA sugere: R$ ${recommendation.suggestedPrice}`);
  console.log(`Confiança: ${recommendation.confidence}%`);
};
```

### useAIMarketAnalysis

Hook para análise de mercado com IA.

```typescript
const {
  marketData,
  competitors,
  insights,
  getMarketInsights,
  analyzeTrends
} = useAIMarketAnalysis();
```

## 🔐 Authentication Hooks

### useAuthContext

Hook para gerenciamento de autenticação.

```typescript
const {
  user,
  session,
  loading,
  signIn,
  signUp,
  signOut,
  updateProfile
} = useAuthContext();
```

#### Métodos de Autenticação

```typescript
// Login
const handleLogin = async (email: string, password: string) => {
  const { error } = await signIn(email, password);
  if (error) {
    console.error('Erro no login:', error.message);
  }
};

// Cadastro
const handleSignUp = async (email: string, password: string) => {
  const { error } = await signUp(email, password);
  if (error) {
    console.error('Erro no cadastro:', error.message);
  }
};

// Logout
const handleLogout = async () => {
  await signOut();
};
```

### useProStatus

Hook para verificação do status PRO.

```typescript
const {
  isPro,
  subscription,
  checkProStatus,
  upgradeModal,
  showUpgradeModal
} = useProStatus();
```

## 🏪 Marketplace Hooks

### useMarketplaceAPI

Hook para integração com marketplaces.

```typescript
const {
  marketplaces,
  selectedMarketplace,
  setMarketplace,
  getCompetitors,
  getMarketData,
  syncProducts
} = useMarketplaceAPI();
```

#### Dados de Marketplace

```typescript
interface MarketplaceData {
  id: string;
  name: string;
  fees: {
    commission: number;        // Comissão (%)
    payment: number;          // Taxa de pagamento (%)
    advertising?: number;     // Taxa de publicidade (%)
  };
  categories: Category[];
  supported: boolean;
}

// Marketplaces suportados
const SUPPORTED_MARKETPLACES = [
  'mercado_livre',
  'amazon',
  'shopee',
  'magalu',
  'americanas'
] as const;
```

## 📱 PWA Hooks

### useAdvancedPWA

Hook para funcionalidades PWA avançadas.

```typescript
const {
  isInstallable,
  isInstalled,
  isOnline,
  installApp,
  updateAvailable,
  handleUpdate,
  pushNotifications,
  scheduleBackgroundSync
} = useAdvancedPWA();
```

#### Notificações Push

```typescript
// Solicitar permissão para notificações
const enableNotifications = async () => {
  const permission = await pushNotifications.requestPermission();
  if (permission) {
    console.log('Notificações habilitadas!');
  }
};

// Agendar sincronização em background
const schedulePriceUpdates = () => {
  scheduleBackgroundSync('price-updates');
};
```

## 🔄 Automation Hooks

### useAdvancedAutomation

Hook para automações e workflows.

```typescript
const {
  workflows,
  templates,
  createWorkflow,
  executeWorkflow,
  scheduleWorkflow
} = useAdvancedAutomation();
```

#### Workflow Configuration

```typescript
interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: {
    type: 'schedule' | 'event' | 'webhook';
    config: any;
  };
  steps: WorkflowStep[];
  isActive: boolean;
}

interface WorkflowStep {
  id: string;
  type: 'calculation' | 'notification' | 'api_call' | 'condition';
  config: any;
  nextSteps: string[];
}
```

## 📊 Services

### GoogleAnalyticsService

Serviço para integração com Google Analytics.

```typescript
import { GoogleAnalyticsService } from '@/services/googleAnalytics';

// Inicializar
GoogleAnalyticsService.initialize(userId, userType);

// Trackear evento
GoogleAnalyticsService.trackEvent({
  event_name: 'calculation_completed',
  event_category: 'pricing',
  event_label: 'basic_calculator',
  value: sellingPrice
});

// Trackear conversão
GoogleAnalyticsService.trackConversion('upgrade_to_pro', {
  value: subscriptionValue,
  currency: 'BRL'
});
```

### InternalAnalyticsService

Serviço para analytics interno.

```typescript
import { InternalAnalyticsService } from '@/services/internalAnalytics';

// Trackear evento interno
await InternalAnalyticsService.trackEvent({
  event: 'price_calculation',
  userId: user.id,
  data: {
    cost: 100,
    margin: 30,
    sellingPrice: 142.85,
    marketplace: 'mercado_livre'
  }
});

// Obter métricas
const metrics = await InternalAnalyticsService.getMetrics({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  userId: user.id
});
```

## 🧩 Component Patterns

### Componente com Loading State

```typescript
interface ComponentProps {
  data?: DataType;
  loading?: boolean;
  error?: Error;
  onAction?: (item: DataType) => void;
}

function Component({ data, loading, error, onAction }: ComponentProps) {
  if (loading) return <Skeleton />;
  if (error) return <ErrorDisplay error={error} />;
  if (!data) return <EmptyState />;
  
  return (
    <div>
      {/* Conteúdo do componente */}
    </div>
  );
}
```

### Hook com Error Handling

```typescript
export const useCustomHook = () => {
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = useCallback(async (params: Params) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await api.call(params);
      setData(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      // Log para analytics
      console.error('Hook error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { data, loading, error, execute };
};
```

## 🔧 Utilities

### Format Currency

```typescript
import { formatCurrency } from '@/utils/formatCurrency';

// Formatar valores monetários
const formatted = formatCurrency(142.85); // "R$ 142,85"
const compact = formatCurrency(1500.50, { compact: true }); // "R$ 1,5k"
```

### Calculate Selling Price

```typescript
import { calculateSellingPrice } from '@/utils/calculator/calculateSellingPrice';

const result = calculateSellingPrice({
  cost: 100,
  margin: 30,
  tax: 8.5,
  fees: 5,
  marketplace: 'mercado_livre'
});

console.log(result.sellingPrice); // 157.32
```

## 🎨 Styling Patterns

### Tailwind Class Utilities

```typescript
import { cn } from '@/lib/utils';

// Combinar classes condicionalmente
const buttonClass = cn(
  "px-4 py-2 rounded-lg font-medium transition-colors",
  variant === 'primary' && "bg-blue-600 text-white hover:bg-blue-700",
  variant === 'secondary' && "bg-gray-200 text-gray-900 hover:bg-gray-300",
  disabled && "opacity-50 cursor-not-allowed"
);
```

### Component Variants

```typescript
const variants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline"
};
```

## 📋 Error Handling Patterns

### Async Operations

```typescript
const handleAsyncOperation = async () => {
  try {
    setLoading(true);
    const result = await riskyOperation();
    
    // Sucesso
    toast.success('Operação concluída com sucesso!');
    return result;
  } catch (error) {
    // Log do erro
    console.error('Operation failed:', error);
    
    // Notificação ao usuário
    toast.error('Erro na operação. Tente novamente.');
    
    // Re-throw se necessário
    throw error;
  } finally {
    setLoading(false);
  }
};
```

### Form Validation

```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';

const schema = z.object({
  cost: z.number().min(0.01, 'Custo deve ser maior que zero'),
  margin: z.number().min(0).max(100, 'Margem deve estar entre 0 e 100%'),
  marketplace: z.enum(['mercado_livre', 'amazon', 'shopee'])
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});
```

---

## 🤝 Contribuindo para a API

Ao criar novos hooks ou services:

1. **Tipagem Completa**: Sempre use TypeScript com tipos explícitos
2. **Error Handling**: Implemente tratamento de erro robusto
3. **Loading States**: Gerencie estados de carregamento
4. **Caching**: Use React Query para cache quando apropriado
5. **Testing**: Escreva testes para lógica complexa
6. **Documentation**: Documente todos os parâmetros e retornos

### Template para Novo Hook

```typescript
interface UseCustomHookParams {
  // Parâmetros de entrada
}

interface UseCustomHookReturn {
  // Valores de retorno
}

export const useCustomHook = (params: UseCustomHookParams): UseCustomHookReturn => {
  // Implementação
  
  return {
    // Retornos
  };
};
```

Esta documentação é atualizada constantemente. Para dúvidas específicas, consulte o código fonte ou abra uma issue no repositório.
