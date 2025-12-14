/**
 * @fileoverview Configuração otimizada do React Query
 * 
 * Estratégias de otimização:
 * 1. staleTime por tipo de dado (frequência de atualização)
 * 2. gcTime otimizado para reduzir re-fetches
 * 3. Retry inteligente com backoff exponencial
 * 4. Prefetch helpers para navegação
 */

import { QueryClient, QueryKey } from '@tanstack/react-query';

/**
 * Tempos de cache otimizados por tipo de dado
 */
export const CACHE_TIMES = {
  /** Dados que mudam frequentemente (1 min) */
  REALTIME: 1 * 60 * 1000,
  /** Dados padrão (5 min) */
  DEFAULT: 5 * 60 * 1000,
  /** Dados semi-estáticos (15 min) */
  STATIC: 15 * 60 * 1000,
  /** Dados de configuração (30 min) */
  CONFIG: 30 * 60 * 1000,
  /** Dados de referência (1 hora) */
  REFERENCE: 60 * 60 * 1000,
} as const;

/**
 * Tempos de garbage collection (quando dados são removidos da memória)
 */
export const GC_TIMES = {
  /** Dados efêmeros (5 min) */
  SHORT: 5 * 60 * 1000,
  /** Dados padrão (15 min) */
  DEFAULT: 15 * 60 * 1000,
  /** Dados persistentes (30 min) */
  LONG: 30 * 60 * 1000,
} as const;

/**
 * Query keys centralizadas para consistência e prefetch
 */
export const QUERY_KEYS = {
  // Dashboard
  dashboard: ['dashboard'] as const,
  dashboardStats: ['dashboard', 'stats'] as const,
  dashboardActivity: ['dashboard', 'activity'] as const,
  
  // User
  user: ['user'] as const,
  userProfile: (userId: string) => ['user', 'profile', userId] as const,
  userSettings: (userId: string) => ['user', 'settings', userId] as const,
  
  // Calculations
  calculations: ['calculations'] as const,
  calculationHistory: (userId: string) => ['calculations', 'history', userId] as const,
  
  // Analytics
  analytics: ['analytics'] as const,
  analyticsOverview: ['analytics', 'overview'] as const,
  analyticsTrends: (period: string) => ['analytics', 'trends', period] as const,
  
  // Integrations
  integrations: ['integrations'] as const,
  integrationsStatus: ['integrations', 'status'] as const,
  
  // Templates
  templates: ['templates'] as const,
  templateById: (id: string) => ['templates', id] as const,
  
  // AI/Bidding
  bidding: ['bidding'] as const,
  biddingAnalysis: (id: string) => ['bidding', 'analysis', id] as const,
} as const;

/**
 * QueryClient otimizado com configurações de performance
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dados são considerados frescos por 5 minutos
      staleTime: CACHE_TIMES.DEFAULT,
      // Dados são mantidos na memória por 15 minutos
      gcTime: GC_TIMES.DEFAULT,
      // Retry com backoff exponencial
      retry: (failureCount, error) => {
        // Não fazer retry em erros de autenticação/autorização
        if (error instanceof Error) {
          const message = error.message.toLowerCase();
          if (message.includes('401') || message.includes('403') || message.includes('unauthorized')) {
            return false;
          }
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Não refetch ao focar janela (evita requests desnecessários)
      refetchOnWindowFocus: false,
      // Refetch ao reconectar internet
      refetchOnReconnect: 'always',
      // Não refetch ao montar se dados estão frescos
      refetchOnMount: false,
      // Não usar dados stale como placeholder
      placeholderData: undefined,
    },
    mutations: {
      // Retry apenas em erros de rede
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('network')) {
          return failureCount < 2;
        }
        return false;
      },
    },
  },
});

/**
 * Prefetch uma query se ainda não estiver em cache
 */
export async function prefetchQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  staleTime = CACHE_TIMES.DEFAULT
): Promise<void> {
  const existingData = queryClient.getQueryData(queryKey);
  
  // Só faz prefetch se não houver dados ou estiverem stale
  if (!existingData) {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime,
    });
  }
}

/**
 * Invalida queries relacionadas a uma feature
 */
export function invalidateFeatureQueries(feature: keyof typeof QUERY_KEYS): void {
  const key = QUERY_KEYS[feature];
  if (Array.isArray(key)) {
    queryClient.invalidateQueries({ queryKey: key });
  }
}

/**
 * Limpa cache completo (chamada no logout)
 */
export function clearAllQueries(): void {
  queryClient.clear();
}

export default queryClient;
