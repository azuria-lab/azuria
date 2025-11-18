// Serviço de logging para Azuria AI
type LogLevel = 'info' | 'warn' | 'error' | 'debug';
type LogMetadata = Record<string, unknown>;

interface AppInsightsClient {
  trackException(args: {
    exception: Error;
    properties?: Record<string, string>;
  }): void;
  trackEvent(
    name: string,
    properties?: Record<string, string>,
    measurements?: Record<string, number>
  ): void;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: LogMetadata;
  timestamp: Date;
  service: string;
}

const serializeProperties = (metadata?: LogMetadata): Record<string, string> | undefined => {
  if (!metadata) {
    return undefined;
  }
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => [key, String(value)])
  );
};

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private log(level: LogEntry['level'], message: string, data?: LogMetadata, service = 'AzuriaAI'): void {
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
      // eslint-disable-next-line no-console
      const logMethod = (console[level as keyof Console] as typeof console.log | undefined) ?? console.log;
      logMethod(`[${service}] ${message}`, data || '');
    }

    // Em produção, enviar para serviço de monitoramento
    if (process.env.NODE_ENV === 'production' && level === 'error') {
      this.sendToMonitoring(entry);
    }
  }

  info(message: string, data?: LogMetadata): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: LogMetadata): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: LogMetadata): void {
    this.log('error', message, data);
  }

  debug(message: string, data?: LogMetadata): void {
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
      if (typeof window !== 'undefined') {
        const analyticsWindow = window as Window & { appInsights?: AppInsightsClient };
        if (analyticsWindow.appInsights) {
          analyticsWindow.appInsights.trackException({
          exception: new Error(entry.message),
          properties: {
            service: entry.service,
            data: JSON.stringify(entry.data),
          },
        });
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erro ao enviar log para monitoramento:', error);
    }
  }

  /**
   * Registra métricas de uso da IA
   */
  trackAIUsage(action: string, duration: number, success: boolean, metadata?: LogMetadata): void {
    this.info(`AI Usage: ${action}`, {
      action,
      duration,
      success,
      metadata
    });

    // Envia métricas em produção
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      const analyticsWindow = window as Window & { appInsights?: AppInsightsClient };
      analyticsWindow.appInsights?.trackEvent(
        'ai_usage',
        {
          action,
          success: success.toString(),
          ...serializeProperties(metadata),
        },
        {
          duration,
        }
      );
    }
  }

  /**
   * Registra erro da IA
   */
  trackAIError(action: string, error: unknown, context?: LogMetadata): void {
    const serializedError =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { message: String(error) };

    this.error(`AI Error: ${action}`, {
      action,
      error: serializedError.message,
      stack: serializedError.stack,
      context
    });
  }
}

export const logger = new Logger();