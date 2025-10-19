/**
 * Health Check Service
 * Sistema de monitoramento de saúde da aplicação
 */

import React from 'react';
import { logger } from '@/services/logger';
import { supabase } from '@/integrations/supabase/client';

/**
 * Estado geral de saúde da aplicação
 * 
 * Representa o resultado agregado de todas as verificações de saúde,
 * incluindo status geral, score de confiabilidade e detalhes por check.
 * 
 * @interface HealthStatus
 * 
 * @property {'healthy' | 'degraded' | 'unhealthy'} status - Estado geral da aplicação
 * @property {Date} timestamp - Momento em que o check foi executado
 * @property {HealthCheck[]} checks - Lista de verificações individuais
 * @property {number} overallScore - Score de 0-100 baseado em falhas/warnings
 * 
 * @example
 * ```typescript
 * const healthStatus: HealthStatus = {
 *   status: 'healthy',
 *   timestamp: new Date(),
 *   checks: [
 *     { name: 'database', status: 'pass', responseTime: 45 },
 *     { name: 'auth', status: 'pass', responseTime: 32 }
 *   ],
 *   overallScore: 100
 * };
 * ```
 * 
 * @remarks
 * **Status levels**:
 * - `healthy`: Todos os checks críticos OK, <50% warnings
 * - `degraded`: Nenhum check crítico falhou, mas há failures/warnings
 * - `unhealthy`: Ao menos 1 check crítico falhou
 * 
 * **Score calculation**:
 * - Cada failure: -30 pontos
 * - Cada warning: -10 pontos (degraded) ou -5 pontos (healthy)
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  checks: HealthCheck[];
  overallScore: number;
}

/**
 * Resultado de uma verificação de saúde individual
 * 
 * Representa o resultado de um check específico (database, auth, etc).
 * 
 * @interface HealthCheck
 * 
 * @property {string} name - Identificador do check (ex: 'database', 'auth')
 * @property {'pass' | 'fail' | 'warn'} status - Resultado do check
 * @property {number} responseTime - Tempo de execução em milissegundos
 * @property {string} [message] - Mensagem descritiva opcional
 * @property {Record<string, unknown>} [details] - Dados adicionais do check
 * 
 * @example
 * ```typescript
 * const dbCheck: HealthCheck = {
 *   name: 'database',
 *   status: 'pass',
 *   responseTime: 45,
 *   message: 'Database connection healthy'
 * };
 * 
 * const perfCheck: HealthCheck = {
 *   name: 'performance',
 *   status: 'warn',
 *   responseTime: 120,
 *   message: 'Performance test completed in 120ms',
 *   details: { iterations: 100000, sum: 49823.4 }
 * };
 * ```
 */
export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  responseTime: number;
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Configuração do sistema de health checks
 * 
 * Define comportamento de monitoramento contínuo e endpoints verificados.
 * 
 * @interface HealthCheckConfig
 * 
 * @property {boolean} enabled - Se o monitoramento está ativo
 * @property {number} interval - Intervalo entre checks em milissegundos (padrão: 30000)
 * @property {number} timeout - Timeout por check em milissegundos (padrão: 5000)
 * @property {number} retries - Número de retentativas em caso de falha
 * @property {HealthEndpoint[]} endpoints - Lista de endpoints a serem verificados
 * 
 * @example
 * ```typescript
 * const config: HealthCheckConfig = {
 *   enabled: true,
 *   interval: 30000,  // 30 segundos
 *   timeout: 5000,    // 5 segundos
 *   retries: 3,
 *   endpoints: [
 *     { name: 'database', check: checkDB, critical: true },
 *     { name: 'api', check: checkAPI, critical: false }
 *   ]
 * };
 * ```
 */
export interface HealthCheckConfig {
  enabled: boolean;
  interval: number; // ms
  timeout: number; // ms
  retries: number;
  endpoints: HealthEndpoint[];
}

/**
 * Definição de um endpoint de health check
 * 
 * Encapsula a lógica de verificação de um componente específico.
 * 
 * @interface HealthEndpoint
 * 
 * @property {string} name - Nome identificador do endpoint
 * @property {string} [url] - URL opcional para checks HTTP
 * @property {() => Promise<HealthCheck>} check - Função de verificação assíncrona
 * @property {boolean} critical - Se a falha torna a aplicação unhealthy
 * 
 * @example
 * ```typescript
 * const databaseEndpoint: HealthEndpoint = {
 *   name: 'database',
 *   critical: true,
 *   check: async () => {
 *     const start = Date.now();
 *     try {
 *       await db.query('SELECT 1');
 *       return {
 *         name: 'database',
 *         status: 'pass',
 *         responseTime: Date.now() - start,
 *         message: 'Database connection healthy'
 *       };
 *     } catch (error) {
 *       return {
 *         name: 'database',
 *         status: 'fail',
 *         responseTime: Date.now() - start,
 *         message: error.message
 *       };
 *     }
 *   }
 * };
 * ```
 */
export interface HealthEndpoint {
  name: string;
  url?: string;
  check: () => Promise<HealthCheck>;
  critical: boolean;
}

/**
 * Serviço singleton de monitoramento de saúde da aplicação
 * 
 * Gerencia verificações periódicas de componentes críticos (database, auth, etc),
 * calcula status geral e notifica listeners sobre mudanças.
 * 
 * @class HealthCheckService
 * 
 * @example
 * ```typescript
 * // Inicializar monitoramento
 * const healthCheck = HealthCheckService.getInstance();
 * healthCheck.initialize({
 *   interval: 30000,  // Check a cada 30s
 *   timeout: 5000     // Timeout de 5s
 * });
 * 
 * // Observar mudanças de status
 * const unsubscribe = healthCheck.onStatusChange((status) => {
 *   if (status.status === 'unhealthy') {
 *     console.error('Application unhealthy!', status);
 *   }
 * });
 * 
 * // Executar check manual
 * const result = await healthCheck.runHealthChecks();
 * console.log('Status:', result.status, 'Score:', result.overallScore);
 * 
 * // Cleanup
 * unsubscribe();
 * healthCheck.stop();
 * ```
 * 
 * @remarks
 * **Default checks**:
 * - `database` (critical): Testa conexão com Supabase
 * - `auth` (critical): Valida serviço de autenticação
 * - `localStorage`: Verifica read/write de localStorage
 * - `performance`: CPU benchmark simples (100k iterações)
 * 
 * **Storage**: Histórico armazenado em localStorage (últimas 100 entradas, 24h)
 */
export class HealthCheckService {
  private static instance: HealthCheckService;
  private config: HealthCheckConfig;
  private currentStatus: HealthStatus | null = null;
  private checkInterval?: number;
  private listeners: ((status: HealthStatus) => void)[] = [];

  private constructor() {
    this.config = {
      enabled: true,
      interval: 30000, // 30 seconds
      timeout: 5000,   // 5 seconds
      retries: 3,
      endpoints: []
    };
  }

  static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  /**
   * Inicializa o sistema de health checks
   * 
   * Configura endpoints, inicia monitoramento periódico se habilitado.
   * 
   * @param {Partial<HealthCheckConfig>} [config] - Configuração parcial para override
   * 
   * @example
   * ```typescript
   * healthCheck.initialize({
   *   interval: 60000,  // Check a cada 1min
   *   timeout: 10000    // Timeout de 10s
   * });
   * ```
   */
  initialize(config?: Partial<HealthCheckConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.setupDefaultChecks();

    if (this.config.enabled) {
  this.startMonitoring();
  logger.info('Health monitoring started');
    }
  }

  /**
   * Registra listener para mudanças de status de saúde
   * 
   * Permite que componentes React sejam notificados quando o status mudar.
   * 
   * @param {(status: HealthStatus) => void} callback - Função executada a cada mudança de status
   * 
   * @returns {() => void} Função de cleanup para remover o listener
   * 
   * @example
   * ```typescript
   * const unsubscribe = healthCheck.onStatusChange((status) => {
   *   if (status.status === 'degraded') {
   *     toast.warning('Application performance degraded');
   *   }
   * });
   * 
   * // Cleanup
   * useEffect(() => {
   *   return unsubscribe;
   * }, []);
   * ```
   */
  onStatusChange(callback: (status: HealthStatus) => void) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Executa todas as verificações de saúde registradas
   * 
   * Processa todos os endpoints em paralelo, calcula status geral e notifica listeners.
   * 
   * @returns {Promise<HealthStatus>} Status de saúde agregado com score
   * 
   * @example
   * ```typescript
   * const status = await healthCheck.runHealthChecks();
   * 
   * if (status.status === 'healthy') {
   *   console.log('All systems operational');
   * } else {
   *   const failedChecks = status.checks.filter(c => c.status === 'fail');
   *   console.error('Failed checks:', failedChecks);
   * }
   * ```
   */
  async runHealthChecks(): Promise<HealthStatus> {
    const startTime = Date.now();
    const checks: HealthCheck[] = [];

    for (const endpoint of this.config.endpoints) {
      try {
        const check = await this.runSingleCheck(endpoint);
        checks.push(check);
      } catch (error) {
        checks.push({
          name: endpoint.name,
          status: 'fail',
          responseTime: Date.now() - startTime,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const status = this.calculateOverallStatus(checks);
    this.currentStatus = status;
    this.notifyListeners(status);

    return status;
  }

  /**
   * Retorna o último status de saúde calculado
   * 
   * @returns {HealthStatus | null} Status atual ou null se nunca executado
   * 
   * @example
   * ```typescript
   * const current = healthCheck.getCurrentStatus();
   * if (current) {
   *   console.log('Last check:', current.timestamp);
   * }
   * ```
   */
  getCurrentStatus(): HealthStatus | null {
    return this.currentStatus;
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
  }

  /**
   * Recupera histórico de health checks do localStorage
   * 
   * Filtra entradas recentes (últimas N horas) e deserializa timestamps.
   * 
   * @param {number} [hours=24] - Janela de histórico em horas (padrão: 24h)
   * 
   * @returns {HealthStatus[]} Array de status históricos ordenados cronologicamente
   * 
   * @example
   * ```typescript
   * // Últimas 24 horas
   * const history = healthCheck.getHealthHistory();
   * console.log('Checks nas últimas 24h:', history.length);
   * 
   * // Última hora
   * const recent = healthCheck.getHealthHistory(1);
   * const degradedCount = recent.filter(h => h.status === 'degraded').length;
   * ```
   */
  getHealthHistory(hours: number = 24): HealthStatus[] {
    try {
      const history = JSON.parse(
        localStorage.getItem('azuria-health-history') || '[]'
      ) as Array<{ timestamp: string } & Omit<HealthStatus, 'timestamp'>>;
      
      const cutoff = Date.now() - (hours * 60 * 60 * 1000);
      return history
        .filter((h) => new Date(h.timestamp).getTime() > cutoff)
        .map((h) => ({
          ...h,
          timestamp: new Date(h.timestamp)
        }));
    } catch {
      return [];
    }
  }

  private async runSingleCheck(endpoint: HealthEndpoint): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        endpoint.check(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), this.config.timeout)
        )
      ]);

      return {
        ...result,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: endpoint.name,
        status: 'fail',
        responseTime: Date.now() - startTime,
        message: error instanceof Error ? error.message : 'Check failed'
      };
    }
  }

  private calculateOverallStatus(checks: HealthCheck[]): HealthStatus {
    const criticalChecks = this.config.endpoints.filter(e => e.critical);
    const criticalResults = checks.filter(check => 
      criticalChecks.some(c => c.name === check.name)
    );

    const failedCritical = criticalResults.filter(c => c.status === 'fail').length;
    const totalFailed = checks.filter(c => c.status === 'fail').length;
    const totalWarnings = checks.filter(c => c.status === 'warn').length;

    let status: HealthStatus['status'];
    let overallScore: number;

    if (failedCritical > 0) {
      status = 'unhealthy';
      overallScore = 0;
    } else if (totalFailed > 0 || totalWarnings > checks.length / 2) {
      status = 'degraded';
      overallScore = Math.max(0, 100 - (totalFailed * 30) - (totalWarnings * 10));
    } else {
      status = 'healthy';
      overallScore = Math.max(70, 100 - (totalWarnings * 5));
    }

    return {
      status,
      timestamp: new Date(),
      checks,
      overallScore
    };
  }

  private startMonitoring() {
    // Run initial check
    this.runHealthChecks();

    // Set up periodic checks
    this.checkInterval = window.setInterval(() => {
      this.runHealthChecks();
    }, this.config.interval);
  }

  private notifyListeners(status: HealthStatus) {
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
  logger.error('Health check listener error:', error);
      }
    });

    // Store in history
    this.storeHealthHistory(status);
  }

  private storeHealthHistory(status: HealthStatus) {
    try {
      const history = this.getHealthHistory(24);
      history.push(status);

      // Keep only last 100 entries
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }

      localStorage.setItem('azuria-health-history', JSON.stringify(history));
    } catch (error) {
      logger.error('Failed to store health history:', error);
    }
  }

  private setupDefaultChecks() {
    this.config.endpoints = [
      // Database connectivity
      {
        name: 'database',
        critical: true,
        check: async (): Promise<HealthCheck> => {
          const startTime = Date.now();
          try {
            const { error } = await supabase
              .from('user_profiles')
              .select('count')
              .limit(1);

            if (error) {throw error;}

            return {
              name: 'database',
              status: 'pass',
              responseTime: Date.now() - startTime,
              message: 'Database connection healthy'
            };
          } catch (error) {
            return {
              name: 'database',
              status: 'fail',
              responseTime: Date.now() - startTime,
              message: error instanceof Error ? error.message : 'Database error'
            };
          }
        }
      },

      // Authentication service
      {
        name: 'auth',
        critical: true,
        check: async (): Promise<HealthCheck> => {
          const startTime = Date.now();
          try {
            const { error } = await supabase.auth.getSession();
            
            if (error) {throw error;}

            return {
              name: 'auth',
              status: 'pass',
              responseTime: Date.now() - startTime,
              message: 'Authentication service healthy'
            };
          } catch (error) {
            return {
              name: 'auth',
              status: 'fail',
              responseTime: Date.now() - startTime,
              message: error instanceof Error ? error.message : 'Auth error'
            };
          }
        }
      },

      // Local storage
      {
        name: 'localStorage',
        critical: false,
        check: async (): Promise<HealthCheck> => {
          const startTime = Date.now();
          try {
            const testKey = 'azuria-health-test';
            const testValue = Date.now().toString();
            
            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);

            if (retrieved !== testValue) {
              throw new Error('localStorage read/write mismatch');
            }

            return {
              name: 'localStorage',
              status: 'pass',
              responseTime: Date.now() - startTime,
              message: 'Local storage working'
            };
          } catch (error) {
            return {
              name: 'localStorage',
              status: 'warn',
              responseTime: Date.now() - startTime,
              message: error instanceof Error ? error.message : 'localStorage error'
            };
          }
        }
      },

      // Performance check
      {
        name: 'performance',
        critical: false,
        check: async (): Promise<HealthCheck> => {
          const startTime = Date.now();
          try {
            // Simple CPU performance test
            const iterations = 100000;
            let sum = 0;
            for (let i = 0; i < iterations; i++) {
              sum += Math.random();
            }

            const responseTime = Date.now() - startTime;
            
            return {
              name: 'performance',
              status: responseTime < 100 ? 'pass' : 'warn',
              responseTime,
              message: `Performance test completed in ${responseTime}ms`,
              details: { iterations, sum }
            };
          } catch (error) {
            return {
              name: 'performance',
              status: 'warn',
              responseTime: Date.now() - startTime,
              message: error instanceof Error ? error.message : 'Performance test failed'
            };
          }
        }
      }
    ];
  }
}

// Global instance
export const healthCheck = HealthCheckService.getInstance();

/**
 * React hook para monitoramento de saúde da aplicação
 * 
 * Fornece status em tempo real, controle manual de checks e acesso ao histórico.
 * Automaticamente se inscreve em mudanças de status e limpa listeners no unmount.
 * 
 * @returns {object} Estado e métodos de health checking
 * @returns {HealthStatus | null} returns.status - Status atual da aplicação (ou null se nunca executado)
 * @returns {boolean} returns.isLoading - Indica se check está em execução
 * @returns {() => Promise<HealthStatus>} returns.runCheck - Executa check manual
 * @returns {(hours?: number) => HealthStatus[]} returns.getHistory - Acessa histórico de checks
 * 
 * @example
 * ```typescript
 * function HealthDashboard() {
 *   const { status, isLoading, runCheck, getHistory } = useHealthCheck();
 * 
 *   useEffect(() => {
 *     if (status?.status === 'unhealthy') {
 *       toast.error('Application unhealthy!');
 *     }
 *   }, [status]);
 * 
 *   return (
 *     <div>
 *       <h1>Health Status: {status?.status || 'Unknown'}</h1>
 *       <p>Score: {status?.overallScore || 0}/100</p>
 * 
 *       <button onClick={runCheck} disabled={isLoading}>
 *         {isLoading ? 'Checking...' : 'Run Check'}
 *       </button>
 * 
 *       <ul>
 *         {status?.checks.map(check => (
 *           <li key={check.name}>
 *             {check.name}: {check.status} ({check.responseTime}ms)
 *           </li>
 *         ))}
 *       </ul>
 * 
 *       <h2>History (Last Hour)</h2>
 *       <p>Total checks: {getHistory(1).length}</p>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @remarks
 * **Auto-update**: Hook se inscreve automaticamente em mudanças de status.
 * **Cleanup**: Unsubscribe é feito automaticamente no unmount.
 * **Manual checks**: Use `runCheck()` para forçar verificação imediata.
 */
export const useHealthCheck = () => {
  const [status, setStatus] = React.useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Get current status
    setStatus(healthCheck.getCurrentStatus());

    // Subscribe to status changes
    const unsubscribe = healthCheck.onStatusChange(setStatus);

    return unsubscribe;
  }, []);

  const runCheck = async () => {
    setIsLoading(true);
    try {
      const result = await healthCheck.runHealthChecks();
      setStatus(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const getHistory = (hours?: number) => {
    return healthCheck.getHealthHistory(hours);
  };

  return {
    status,
    isLoading,
    runCheck,
    getHistory
  };
};
