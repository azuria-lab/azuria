/**
 * Context Store
 *
 * Armazena informações sobre a tela atual e contextos de cada módulo.
 * Permite que a IA acesse o estado contextual do usuário.
 */

interface ScreenContextData {
  screen: string;
  data: Record<string, unknown>;
  timestamp: number;
}

// Armazenamento em memória
let currentScreen: string = 'unknown';
const contextStore: Map<string, ScreenContextData> = new Map();

/**
 * Define a tela atual
 */
export function setCurrentScreen(screenName: string): void {
  currentScreen = screenName;
}

/**
 * Obtém a tela atual
 */
export function getCurrentScreen(): string {
  return currentScreen;
}

/**
 * Atualiza o contexto de uma tela específica
 */
export function updateContext(screen: string, data: Record<string, unknown>): void {
  const context: ScreenContextData = {
    screen,
    data,
    timestamp: Date.now(),
  };

  contextStore.set(screen, context);
}

/**
 * Obtém o contexto de uma tela específica
 */
export function getContext(screen: string): ScreenContextData | null {
  return contextStore.get(screen) || null;
}

/**
 * Obtém o contexto da tela atual
 */
export function getCurrentContext(): ScreenContextData | null {
  return getContext(currentScreen);
}

/**
 * Limpa o contexto de uma tela
 */
export function clearContext(screen: string): void {
  contextStore.delete(screen);
}

/**
 * Limpa todos os contextos
 */
export function clearAllContexts(): void {
  contextStore.clear();
}

/**
 * Obtém estatísticas do context store
 */
export function getContextStats() {
  return {
    currentScreen,
    totalContexts: contextStore.size,
    screens: Array.from(contextStore.keys()),
  };
}
