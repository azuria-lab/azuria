// Serviço de logging para Azuria AI

/**
 * Tipo para dados estruturados de log
 * Permite qualquer estrutura de objeto, mas mantém type safety
 */
export type LogData = Record<string, unknown>;

/**
 * Contexto de erro com informações adicionais
 */
export interface ErrorContext {
  message?: string;
  stack?: string;
  code?: string | number;
  [key: string]: unknown;
}

/**
 * Type guard para verificar se é um Error
 */
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Converte unknown para Error ou ErrorContext
 * Útil para tratar erros de catch blocks
 */
export function toErrorContext(error: unknown): Error | ErrorContext {
  if (isError(error)) {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    return error as ErrorContext;
  }

  return {
    message: String(error)
  };
}

/**
 * Entrada de log do sistema
 */
export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: LogData;
  timestamp: Date;
  service: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  private log(level: LogEntry['level'], message: string, data?: LogData, service = 'AzuriaAI'): void {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
      service
    };

    this.logs.push(entry);

    // Mantém apenas os logs mais recentes
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      const logMethod = console[level] || console.log;
      logMethod(`[${service}] ${message}`, data || '');
    }

    // Em produção, enviar para serviço de monitoramento
    if (process.env.NODE_ENV === 'production' && level === 'error') {
      this.sendToMonitoring(entry);
    }
  }

  info(message: string, data?: LogData): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: LogData): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: LogData): void {
    this.log('error', message, data);
  }

  debug(message: string, data?: LogData): void {
    this.log('debug', message, data);
  }

  /**
   * Obtém logs recentes
   */
  getRecentLogs(limit = 50): LogEntry[] {
    return this.logs.slice(-limit);
  }

  /**
   * Obtém logs por nível
   */
  getLogsByLevel(level: LogEntry['level']): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Limpa logs antigos
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Envia logs críticos para monitoramento
   */
  private async sendToMonitoring(entry: LogEntry): Promise<void> {
    try {
      // Integração com Application Insights ou serviço similar
      interface AppInsights {
        trackException: (data: { exception: Error; properties?: Record<string, string> }) => void;
      }

      const appInsights = (globalThis as unknown as { appInsights?: AppInsights }).appInsights;

      if (globalThis.window !== undefined && appInsights) {
        appInsights.trackException({
          exception: new Error(entry.message),
          properties: {
            service: entry.service,
            data: JSON.stringify(entry.data)
          }
        });
      }
    } catch (error) {
      // Silent fail in production - não usar console em produção
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao enviar log para monitoramento:', error);
      }
    }
  }

  /**
   * Registra métricas de uso da IA
   */
  trackAIUsage(action: string, duration: number, success: boolean, metadata?: LogData): void {
    this.info(`AI Usage: ${action}`, {
      action,
      duration,
      success,
      metadata
    });

    // Envia métricas em produção
    interface AppInsights {
      trackEvent: (name: string, properties?: Record<string, string>, measurements?: Record<string, number>) => void;
    }

    const appInsights = (globalThis as unknown as { appInsights?: AppInsights }).appInsights;

    if (process.env.NODE_ENV === 'production' && globalThis.window !== undefined && appInsights) {
      appInsights.trackEvent('ai_usage', {
        action,
        success: success.toString(),
        ...(metadata as Record<string, string>)
      }, {
        duration
      });
    }
  }

  /**
   * Registra erro da IA
   */
  trackAIError(action: string, error: Error | ErrorContext, context?: LogData): void {
    const errorMessage = error instanceof Error ? error.message : (error.message || 'Unknown error');
    const errorStack = error instanceof Error ? error.stack : (error.stack || undefined);

    this.error(`AI Error: ${action}`, {
      action,
      error: errorMessage,
      stack: errorStack,
      context
    });
  }
}

export const logger = new Logger();