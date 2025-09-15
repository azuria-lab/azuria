/* eslint-disable no-console */
// Simple logger service to centralize logging and allow environment-based control

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

const getLevel = (): LogLevel => {
  const envMode: string | undefined = (import.meta as ImportMeta & { env?: { MODE?: string } })?.env?.MODE || process.env.NODE_ENV || 'development';
  if (envMode === 'production') {
    return 'warn';
  }
  return 'debug';
};

const levelPriority: Record<Exclude<LogLevel, 'none'>, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const currentLevel = getLevel();

function shouldLog(target: Exclude<LogLevel, 'none'>) {
  return levelPriority[target] >= levelPriority[currentLevel as Exclude<LogLevel, 'none'>];
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) {
      console.debug(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (shouldLog('info')) {
      console.info(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (shouldLog('error')) {
      console.error(...args);
    }
  },
};
