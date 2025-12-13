/* eslint-disable no-console */
/**
 * Structured Logger
 * 
 * Logger com contexto estruturado para observabilidade.
 * Suporta correlação de requests, tracing e métricas.
 */

// ============================================================================
// Types
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  /** Identificador de correlação para tracking */
  correlationId?: string;
  /** Módulo ou componente de origem */
  module?: string;
  /** ID do usuário se disponível */
  userId?: string;
  /** ID da sessão */
  sessionId?: string;
  /** Ação ou operação sendo executada */
  action?: string;
  /** Dados adicionais */
  data?: Record<string, unknown>;
  /** Duração em ms (para métricas de performance) */
  durationMs?: number;
  /** Tags para categorização */
  tags?: string[];
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// ============================================================================
// Configuration
// ============================================================================

const getLogLevel = (): LogLevel => {
  if (globalThis.window !== undefined) {
    // Browser
    const mode = (import.meta as ImportMeta & { env?: { MODE?: string } })?.env?.MODE;
    return mode === 'production' ? 'warn' : 'debug';
  }
  // Server
  const env = process.env.NODE_ENV;
  return env === 'production' ? 'warn' : 'debug';
};

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

let currentLevel = getLogLevel();
let defaultContext: Partial<LogContext> = {};

// ============================================================================
// Helpers
// ============================================================================

function shouldLog(target: LogLevel): boolean {
  return levelPriority[target] >= levelPriority[currentLevel];
}

function formatLogEntry(entry: LogEntry): string {
  const parts = [
    `[${entry.timestamp}]`,
    `[${entry.level.toUpperCase()}]`,
  ];

  if (entry.context?.module) {
    parts.push(`[${entry.context.module}]`);
  }

  if (entry.context?.correlationId) {
    parts.push(`[${entry.context.correlationId.slice(0, 8)}]`);
  }

  parts.push(entry.message);

  return parts.join(' ');
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context: { ...defaultContext, ...context },
  };

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return entry;
}

function logToConsole(entry: LogEntry): void {
  const formatted = formatLogEntry(entry);
  const hasData = entry.context?.data || entry.error;

  switch (entry.level) {
    case 'debug':
      if (hasData) {
        console.debug(formatted, { context: entry.context, error: entry.error });
      } else {
        console.debug(formatted);
      }
      break;
    case 'info':
      if (hasData) {
        console.info(formatted, { context: entry.context, error: entry.error });
      } else {
        console.info(formatted);
      }
      break;
    case 'warn':
      if (hasData) {
        console.warn(formatted, { context: entry.context, error: entry.error });
      } else {
        console.warn(formatted);
      }
      break;
    case 'error':
      if (hasData) {
        console.error(formatted, { context: entry.context, error: entry.error });
      } else {
        console.error(formatted);
      }
      break;
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Configura o nível de log
 */
export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

/**
 * Define contexto padrão para todos os logs
 */
export function setDefaultContext(context: Partial<LogContext>): void {
  defaultContext = { ...defaultContext, ...context };
}

/**
 * Gera um ID de correlação único
 */
export function generateCorrelationId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Logger com contexto
 */
export const structuredLogger = {
  debug(message: string, context?: LogContext): void {
    if (!shouldLog('debug')) {
      return;
    }
    const entry = createLogEntry('debug', message, context);
    logToConsole(entry);
  },

  info(message: string, context?: LogContext): void {
    if (!shouldLog('info')) {
      return;
    }
    const entry = createLogEntry('info', message, context);
    logToConsole(entry);
  },

  warn(message: string, context?: LogContext): void {
    if (!shouldLog('warn')) {
      return;
    }
    const entry = createLogEntry('warn', message, context);
    logToConsole(entry);
  },

  error(message: string, error?: Error, context?: LogContext): void {
    if (!shouldLog('error')) {
      return;
    }
    const entry = createLogEntry('error', message, context, error);
    logToConsole(entry);
  },

  /**
   * Cria um logger com contexto pré-definido (para um módulo específico)
   */
  withContext(moduleContext: LogContext) {
    return {
      debug: (message: string, ctx?: LogContext) =>
        structuredLogger.debug(message, { ...moduleContext, ...ctx }),
      info: (message: string, ctx?: LogContext) =>
        structuredLogger.info(message, { ...moduleContext, ...ctx }),
      warn: (message: string, ctx?: LogContext) =>
        structuredLogger.warn(message, { ...moduleContext, ...ctx }),
      error: (message: string, err?: Error, ctx?: LogContext) =>
        structuredLogger.error(message, err, { ...moduleContext, ...ctx }),
    };
  },

  /**
   * Mede tempo de execução de uma operação
   */
  async timed<T>(
    operation: string,
    fn: () => Promise<T>,
    context?: LogContext
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const durationMs = Math.round(performance.now() - start);
      structuredLogger.info(`${operation} completed`, {
        ...context,
        action: operation,
        durationMs,
      });
      return result;
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);
      structuredLogger.error(
        `${operation} failed`,
        error instanceof Error ? error : new Error(String(error)),
        { ...context, action: operation, durationMs }
      );
      throw error;
    }
  },

  /**
   * Versão síncrona do timed
   */
  timedSync<T>(operation: string, fn: () => T, context?: LogContext): T {
    const start = performance.now();
    try {
      const result = fn();
      const durationMs = Math.round(performance.now() - start);
      structuredLogger.info(`${operation} completed`, {
        ...context,
        action: operation,
        durationMs,
      });
      return result;
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);
      structuredLogger.error(
        `${operation} failed`,
        error instanceof Error ? error : new Error(String(error)),
        { ...context, action: operation, durationMs }
      );
      throw error;
    }
  },
};

// Alias para compatibilidade
export const slog = structuredLogger;

export default structuredLogger;
