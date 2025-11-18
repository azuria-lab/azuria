/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
// Serviço de logging para Azuria AI
export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  timestamp: Date;
  service: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private log(level: LogEntry['level'], message: string, data?: any, service = 'AzuriaAI'): void {
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

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  debug(message: string, data?: any): void {
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
      if (typeof window !== 'undefined' && (window as any).appInsights) {
        (window as any).appInsights.trackException({
          exception: new Error(entry.message),
          properties: {
            service: entry.service,
            data: JSON.stringify(entry.data)
          }
        });
      }
    } catch (error) {
      console.error('Erro ao enviar log para monitoramento:', error);
    }
  }

  /**
   * Registra métricas de uso da IA
   */
  trackAIUsage(action: string, duration: number, success: boolean, metadata?: any): void {
    this.info(`AI Usage: ${action}`, {
      action,
      duration,
      success,
      metadata
    });

    // Envia métricas em produção
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && (window as any).appInsights) {
      (window as any).appInsights.trackEvent('ai_usage', {
        action,
        success: success.toString(),
        ...metadata
      }, {
        duration
      });
    }
  }

  /**
   * Registra erro da IA
   */
  trackAIError(action: string, error: any, context?: any): void {
    this.error(`AI Error: ${action}`, {
      action,
      error: error.message || error,
      stack: error.stack,
      context
    });
  }
}

export const logger = new Logger();