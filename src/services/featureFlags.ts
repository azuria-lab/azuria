/**
 * Feature Flags Service
 * Sistema de feature flags para releases controladas
 */

import React, { useMemo } from 'react';
import { logger } from '@/services/logger';

/**
 * Definição de uma feature flag individual
 * 
 * Representa uma funcionalidade que pode ser habilitada/desabilitada dinamicamente
 * com controle granular por ambiente, usuário e porcentagem de rollout.
 * 
 * @interface FeatureFlag
 * 
 * @property {string} key - Identificador único da flag (ex: 'dark_mode')
 * @property {string} name - Nome amigável para exibição
 * @property {string} description - Descrição do que a flag controla
 * @property {boolean} enabled - Se a flag está globalmente habilitada
 * @property {number} [percentage] - Porcentagem de usuários (0-100) para A/B testing
 * @property {string[]} [userSegments] - Segmentos permitidos (ex: ['pro', 'premium'])
 * @property {Date} [startDate] - Data de ativação da flag
 * @property {Date} [endDate] - Data de expiração da flag
 * @property {string[]} [dependencies] - Flags que devem estar ativas (AND lógico)
 * @property {('development' | 'staging' | 'production')[]} [environment] - Ambientes permitidos
 * 
 * @example
 * ```typescript
 * const betaFlag: FeatureFlag = {
 *   key: 'beta_calculator',
 *   name: 'Beta Calculator',
 *   description: 'New experimental calculator',
 *   enabled: false,
 *   percentage: 10,  // 10% dos usuários
 *   environment: ['development', 'staging']
 * };
 * ```
 */
export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  percentage?: number; // Para A/B testing
  userSegments?: string[];
  startDate?: Date;
  endDate?: Date;
  dependencies?: string[];
  environment?: ('development' | 'staging' | 'production')[];
}

/**
 * Configuração do serviço de feature flags
 * 
 * Define comportamento global do sistema de flags (ambiente, usuário, cache).
 * 
 * @interface FeatureFlagConfig
 * 
 * @property {boolean} enabled - Se o sistema de flags está ativo
 * @property {'development' | 'staging' | 'production'} environment - Ambiente atual
 * @property {string} [userId] - ID do usuário para A/B testing determinístico
 * @property {string} [userSegment] - Segmento do usuário (ex: 'premium')
 * @property {number} cacheTimeout - Tempo de cache em milissegundos (padrão: 300000 = 5min)
 * 
 * @example
 * ```typescript
 * const config: FeatureFlagConfig = {
 *   enabled: true,
 *   environment: 'production',
 *   userId: 'user-123',
 *   userSegment: 'premium',
 *   cacheTimeout: 300000  // 5 minutos
 * };
 * ```
 */
export interface FeatureFlagConfig {
  enabled: boolean;
  environment: 'development' | 'staging' | 'production';
  userId?: string;
  userSegment?: string;
  cacheTimeout: number; // ms
}

/**
 * Serviço singleton de gerenciamento de feature flags
 * 
 * Controla habilitação de funcionalidades com suporte a:
 * - A/B testing por porcentagem de usuários (determinístico via hash)
 * - Segmentação de usuários (free, pro, premium, admin)
 * - Controle por ambiente (dev, staging, production)
 * - Janelas de tempo (startDate/endDate)
 * - Dependências entre flags
 * - Cache de resultados para performance
 * 
 * @class FeatureFlagsService
 * 
 * @example
 * ```typescript
 * // Inicialização
 * const flags = FeatureFlagsService.getInstance();
 * flags.initialize({
 *   environment: 'production',
 *   userId: 'user-123',
 *   userSegment: 'premium'
 * });
 * 
 * // Verificar flag
 * if (flags.isEnabled('beta_calculator')) {
 *   renderBetaCalculator();
 * }
 * 
 * // Criar nova flag
 * flags.setFlag({
 *   key: 'new_feature',
 *   name: 'New Feature',
 *   description: 'Experimental feature',
 *   enabled: true,
 *   percentage: 50,  // 50% rollout
 *   userSegments: ['premium']
 * });
 * 
 * // Debug
 * console.log(flags.getDebugInfo());
 * ```
 * 
 * @remarks
 * **Default flags** (setupDefaultFlags):
 * - `ai_gemini_integration`: AI Gemini para análise de preços
 * - `advanced_analytics`: Dashboard de analytics avançado
 * - `collaboration_features`: Recursos de time (pro/premium)
 * - `automation_workflows`: Automação de workflows (premium)
 * - `beta_calculator`: Calculadora experimental (10% rollout)
 * - `performance_monitoring`: Monitoramento de performance
 * - `security_dashboard`: Dashboard de segurança (admin)
 * - `dark_mode`: Tema escuro
 * - `marketplace_integration`: Integração com marketplaces
 */
export class FeatureFlagsService {
  private static instance: FeatureFlagsService;
  private config: FeatureFlagConfig;
  private flags: Map<string, FeatureFlag> = new Map();
  private cache: Map<string, { value: boolean; timestamp: number }> = new Map();

  private constructor() {
    this.config = {
      enabled: true,
      environment: ((import.meta as unknown as { env?: { MODE?: 'development' | 'staging' | 'production' } })
        .env?.MODE) || 'development',
      cacheTimeout: 300000 // 5 minutes
    };
  }

  static getInstance(): FeatureFlagsService {
    if (!FeatureFlagsService.instance) {
      FeatureFlagsService.instance = new FeatureFlagsService();
    }
    return FeatureFlagsService.instance;
  }

  /**
   * Inicializa o serviço de feature flags
   * 
   * Carrega configuração, define flags padrão e persiste em localStorage.
   * 
   * @param {Partial<FeatureFlagConfig>} [config] - Configuração parcial para override
   * 
   * @example
   * ```typescript
   * flags.initialize({
   *   environment: 'production',
   *   userId: 'user-456',
   *   userSegment: 'pro',
   *   cacheTimeout: 600000  // 10 minutos
   * });
   * ```
   */
  initialize(config?: Partial<FeatureFlagConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.setupDefaultFlags();
    this.loadFromStorage();

  logger.info('Feature flags initialized');
  }

  /**
   * Verifica se uma feature flag está habilitada para o usuário
   * 
   * Avalia todas as condições (ambiente, segmento, porcentagem, datas, dependências).
   * Resultados são cacheados para performance.
   * 
   * @param {string} flagKey - Chave da feature flag (ex: 'dark_mode')
   * @param {string} [userId] - ID do usuário (sobrescreve config.userId)
   * 
   * @returns {boolean} true se a flag está habilitada para o usuário
   * 
   * @example
   * ```typescript
   * // Verificação simples
   * if (flags.isEnabled('dark_mode')) {
   *   applyDarkTheme();
   * }
   * 
   * // Com userId específico
   * if (flags.isEnabled('beta_calculator', 'user-789')) {
   *   renderBetaFeature();
   * }
   * 
   * // Fallback para false se flag não existir
   * const hasNewUI = flags.isEnabled('nonexistent_flag');  // false
   * ```
   */
  isEnabled(flagKey: string, userId?: string): boolean {
    if (!this.config.enabled) {
      return true; // Default to enabled when feature flags are disabled
    }

    // Check cache first
    const cached = this.cache.get(flagKey);
    if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
      return cached.value;
    }

    const flag = this.flags.get(flagKey);
    if (!flag) {
      logger.warn(`Feature flag "${flagKey}" not found, defaulting to false`);
      return false;
    }

    const result = this.evaluateFlag(flag, userId);
    
    // Cache the result
    this.cache.set(flagKey, {
      value: result,
      timestamp: Date.now()
    });

    return result;
  }

  /**
   * Busca detalhes de uma feature flag específica
   * 
   * @param {string} flagKey - Chave da flag
   * @returns {FeatureFlag | undefined} Definição da flag ou undefined se não existir
   */
  getFlag(flagKey: string): FeatureFlag | undefined {
    return this.flags.get(flagKey);
  }

  /**
   * Lista todas as feature flags registradas
   * 
   * @returns {FeatureFlag[]} Array com todas as flags (padrão + custom)
   */
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  /**
   * Registra ou atualiza uma feature flag
   * 
   * @param {FeatureFlag} flag - Definição completa da flag
   * 
   * @example
   * ```typescript
   * flags.setFlag({
   *   key: 'custom_feature',
   *   name: 'Custom Feature',
   *   description: 'My custom flag',
   *   enabled: true,
   *   percentage: 25
   * });
   * ```
   */
  setFlag(flag: FeatureFlag) {
    this.flags.set(flag.key, flag);
    this.saveToStorage();
    this.clearCache(flag.key);
  }

  /**
   * Habilita uma feature flag existente
   * 
   * @param {string} flagKey - Chave da flag a habilitar
   */
  enable(flagKey: string) {
    const flag = this.flags.get(flagKey);
    if (flag) {
      flag.enabled = true;
      this.setFlag(flag);
    }
  }

  /**
   * Desabilita uma feature flag existente
   * 
   * @param {string} flagKey - Chave da flag a desabilitar
   */
  disable(flagKey: string) {
    const flag = this.flags.get(flagKey);
    if (flag) {
      flag.enabled = false;
      this.setFlag(flag);
    }
  }

  /**
   * Define contexto do usuário para avaliação de flags
   * 
   * @param {string} userId - ID do usuário
   * @param {string} [segment] - Segmento do usuário (ex: 'premium')
   * 
   * @example
   * ```typescript
   * flags.setUserContext('user-123', 'premium');
   * // Agora todas as flags com userSegments: ['premium'] ficam disponíveis
   * ```
   */
  setUserContext(userId: string, segment?: string) {
    this.config.userId = userId;
    this.config.userSegment = segment;
    this.clearAllCache();
  }

  /**
   * Retorna informações de debug sobre flags ativas
   * 
   * @returns {object} Objeto com config, flags avaliadas e tamanho do cache
   * 
   * @example
   * ```typescript
   * console.log(flags.getDebugInfo());
   * // {
   * //   config: { enabled: true, environment: 'production', ... },
   * //   flags: [{ key: 'dark_mode', enabled: true, flag: {...} }, ...],
   * //   cacheSize: 12
   * // }
   * ```
   */
  getDebugInfo() {
    const flags = Array.from(this.flags.entries()).map(([key, flag]) => ({
      key,
      enabled: this.isEnabled(key),
      flag: flag
    }));

    return {
      config: this.config,
      flags,
      cacheSize: this.cache.size
    };
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.cache.clear();
  }

  private evaluateFlag(flag: FeatureFlag, userId?: string): boolean {
    const currentUserId = userId || this.config.userId;

    // Check if flag is globally disabled
    if (!flag.enabled) {
      return false;
    }

    // Check environment
    if (flag.environment && !flag.environment.includes(this.config.environment)) {
      return false;
    }

    // Check date range
    const now = new Date();
    if (flag.startDate && now < flag.startDate) {
      return false;
    }
    if (flag.endDate && now > flag.endDate) {
      return false;
    }

    // Check user segments
    if (flag.userSegments && flag.userSegments.length > 0) {
      if (!this.config.userSegment || !flag.userSegments.includes(this.config.userSegment)) {
        return false;
      }
    }

    // Check percentage rollout (for A/B testing)
    if (flag.percentage !== undefined && flag.percentage < 100) {
      if (!currentUserId) {
        return Math.random() * 100 < flag.percentage;
      }
      
      // Deterministic percentage based on user ID
      const hash = this.hashString(currentUserId + flag.key);
      const userPercentage = hash % 100;
      return userPercentage < flag.percentage;
    }

    // Check dependencies
    if (flag.dependencies && flag.dependencies.length > 0) {
      return flag.dependencies.every(dep => this.isEnabled(dep, currentUserId));
    }

    return true;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private clearCache(flagKey: string) {
    this.cache.delete(flagKey);
  }

  private saveToStorage() {
    try {
      const flagsData = Array.from(this.flags.entries()).map(([key, flag]) => [
        key,
        {
          ...flag,
          startDate: flag.startDate?.toISOString(),
          endDate: flag.endDate?.toISOString()
        }
      ]);
      
      localStorage.setItem('azuria-feature-flags', JSON.stringify(flagsData));
    } catch (error) {
      logger.error('Failed to save feature flags:', error);
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('azuria-feature-flags');
      if (!stored) {return;}

      const flagsData = JSON.parse(stored) as Array<[string, Omit<FeatureFlag, 'startDate' | 'endDate'> & { startDate?: string; endDate?: string }]>;
      flagsData.forEach(([key, flagData]) => {
        this.flags.set(key, {
          ...flagData,
          startDate: flagData.startDate ? new Date(flagData.startDate) : undefined,
          endDate: flagData.endDate ? new Date(flagData.endDate) : undefined
        });
      });
    } catch (error) {
      logger.error('Failed to load feature flags from storage:', error);
    }
  }

  private setupDefaultFlags() {
    const defaultFlags: FeatureFlag[] = [
      {
        key: 'ai_gemini_integration',
        name: 'AI Gemini Integration',
        description: 'Enable Gemini AI for pricing analysis',
        enabled: true,
        environment: ['production']
      },
      {
        key: 'advanced_analytics',
        name: 'Advanced Analytics',
        description: 'Show advanced analytics dashboard',
        enabled: true,
        percentage: 100
      },
      {
        key: 'collaboration_features',
        name: 'Collaboration Features',
        description: 'Enable team collaboration features',
        enabled: true,
        userSegments: ['pro', 'premium']
      },
      {
        key: 'automation_workflows',
        name: 'Automation Workflows',
        description: 'Enable workflow automation',
        enabled: true,
        userSegments: ['premium']
      },
      {
        key: 'beta_calculator',
        name: 'Beta Calculator',
        description: 'New experimental calculator',
        enabled: false,
        percentage: 10,
        environment: ['development', 'staging']
      },
      {
        key: 'performance_monitoring',
        name: 'Performance Monitoring',
        description: 'Enable performance monitoring',
        enabled: true
      },
      {
        key: 'security_dashboard',
        name: 'Security Dashboard',
        description: 'Show security monitoring dashboard',
        enabled: true,
        userSegments: ['admin']
      },
      {
        key: 'dark_mode',
        name: 'Dark Mode',
        description: 'Enable dark theme toggle',
        enabled: true
      },
      {
        key: 'marketplace_integration',
        name: 'Marketplace Integration',
        description: 'Connect to external marketplaces',
        enabled: false,
        environment: ['staging', 'production']
      }
    ];

    defaultFlags.forEach(flag => {
      if (!this.flags.has(flag.key)) {
        this.flags.set(flag.key, flag);
      }
    });
  }
}

// Global instance
export const featureFlags = FeatureFlagsService.getInstance();

/**
 * React hook para verificar uma única feature flag
 * 
 * Retorna estado booleano que atualiza automaticamente quando flagKey ou userId mudam.
 * 
 * @param {string} flagKey - Chave da feature flag
 * @param {string} [userId] - ID do usuário opcional
 * 
 * @returns {boolean} true se a flag está habilitada
 * 
 * @example
 * ```typescript
 * function DarkModeToggle() {
 *   const isDarkModeEnabled = useFeatureFlag('dark_mode');
 * 
 *   if (!isDarkModeEnabled) {
 *     return null;  // Não renderiza se flag desabilitada
 *   }
 * 
 *   return <ThemeToggleButton />;
 * }
 * 
 * // Com userId específico
 * function BetaFeature({ userId }) {
 *   const hasBeta = useFeatureFlag('beta_calculator', userId);
 *   return hasBeta ? <BetaCalculator /> : <StandardCalculator />;
 * }
 * ```
 */
export const useFeatureFlag = (flagKey: string, userId?: string) => {
  const [isEnabled, setIsEnabled] = React.useState(
    () => featureFlags.isEnabled(flagKey, userId)
  );

  React.useEffect(() => {
    // Re-check when dependencies change
    setIsEnabled(featureFlags.isEnabled(flagKey, userId));
  }, [flagKey, userId]);

  return isEnabled;
};

/**
 * React hook para verificar múltiplas feature flags de uma vez
 * 
 * Retorna objeto com status de cada flag. Otimizado para evitar re-renders desnecessários.
 * 
 * @param {string[]} flagKeys - Array de chaves de flags
 * @param {string} [userId] - ID do usuário opcional
 * 
 * @returns {Record<string, boolean>} Objeto com flagKey → boolean
 * 
 * @example
 * ```typescript
 * function FeaturePanel() {
 *   const flags = useFeatureFlags([
 *     'dark_mode',
 *     'beta_calculator',
 *     'advanced_analytics'
 *   ]);
 * 
 *   return (
 *     <div>
 *       {flags.dark_mode && <DarkModeToggle />}
 *       {flags.beta_calculator && <BetaCalculator />}
 *       {flags.advanced_analytics && <AnalyticsDashboard />}
 *     </div>
 *   );
 * }
 * 
 * // Com userId
 * function UserFeatures({ userId }) {
 *   const { collaboration_features, automation_workflows } = useFeatureFlags(
 *     ['collaboration_features', 'automation_workflows'],
 *     userId
 *   );
 * 
 *   return (
 *     <>
 *       {collaboration_features && <TeamInvite />}
 *       {automation_workflows && <AutomationBuilder />}
 *     </>
 *   );
 * }
 * ```
 */
export const useFeatureFlags = (flagKeys: string[], userId?: string) => {
  const [flags, setFlags] = React.useState(() => 
    flagKeys.reduce((acc, key) => {
      acc[key] = featureFlags.isEnabled(key, userId);
      return acc;
    }, {} as Record<string, boolean>)
  );

  const flagKeysKey = useMemo(() => flagKeys.join(','), [flagKeys]);

  React.useEffect(() => {
    const newFlags = flagKeys.reduce((acc, key) => {
      acc[key] = featureFlags.isEnabled(key, userId);
      return acc;
    }, {} as Record<string, boolean>);
    
    setFlags(newFlags);
    // flagKeys is represented by flagKeysKey to stabilize deps
  }, [flagKeys, flagKeysKey, userId]);

  return flags;
};

/**
 * Higher-Order Component (HOC) para renderização condicional por feature flag
 * 
 * Envolve um componente e só renderiza se a flag estiver habilitada.
 * Retorna null se flag desabilitada (sem fallback).
 * 
 * @param {string} flagKey - Chave da feature flag
 * 
 * @returns {<P extends object>(Component: React.ComponentType<P>) => React.ComponentType<P>} HOC function
 * 
 * @example
 * ```typescript
 * // Componente protegido por flag
 * const BetaCalculator = () => <div>Beta Calculator UI</div>;
 * 
 * // Wrapped com HOC
 * const BetaCalculatorWithFlag = withFeatureFlag('beta_calculator')(BetaCalculator);
 * 
 * // Uso normal
 * <BetaCalculatorWithFlag />  // Renderiza apenas se 'beta_calculator' estiver habilitada
 * 
 * // Composição com outros HOCs
 * const SecureAdminPanel = compose(
 *   withAuth,
 *   withFeatureFlag('security_dashboard')
 * )(AdminPanel);
 * 
 * // Definição inline
 * export default withFeatureFlag('advanced_analytics')(
 *   function AnalyticsDashboard() {
 *     return <div>Analytics...</div>;
 *   }
 * );
 * ```
 * 
 * @remarks
 * **Quando usar**:
 * - Componentes inteiros que devem ser escondidos
 * - Páginas/rotas condicionais
 * - Features em rollout gradual
 * 
 * **Quando NÃO usar**:
 * - Se precisar de fallback customizado (use hook diretamente)
 * - Múltiplas flags no mesmo componente (use useFeatureFlags)
 */
export const withFeatureFlag = (flagKey: string) => {
  return function <P extends object>(Component: React.ComponentType<P>) {
    return function FeatureFlagWrapper(props: P) {
      const isEnabled = useFeatureFlag(flagKey);
      
      if (!isEnabled) {
        return null;
      }
      
      return React.createElement(Component, props);
    };
  };
};