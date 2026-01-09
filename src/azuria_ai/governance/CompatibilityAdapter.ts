/**
 * ══════════════════════════════════════════════════════════════════════════════
 * COMPATIBILITY ADAPTER - Adaptador de Compatibilidade para Engines Legado
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Este adaptador intercepta todas as chamadas de emitEvent e redireciona
 * através do sistema de governança, sem necessidade de modificar os engines.
 *
 * @usage
 * ```typescript
 * import { installCompatibilityAdapter } from '@/azuria_ai/governance/CompatibilityAdapter';
 *
 * // No início da aplicação, antes de inicializar os engines:
 * installCompatibilityAdapter();
 *
 * // Agora todos os emitEvent() passam pela governança automaticamente!
 * ```
 *
 * @module azuria_ai/governance/CompatibilityAdapter
 */

import * as eventBusModule from '../core/eventBus';
import type { EventType } from '../core/eventBus';

// ═══════════════════════════════════════════════════════════════════════════════
// ESTADO
// ═══════════════════════════════════════════════════════════════════════════════

let originalEmitEvent: typeof eventBusModule.emitEvent | null = null;
let governedEmitterModule: typeof import('../core/GovernedEmitter') | null = null;
let isInstalled = false;

/** Estatísticas do adaptador */
interface AdapterStats {
  totalIntercepted: number;
  bySource: Map<string, number>;
  startedAt: number | null;
}

const stats: AdapterStats = {
  totalIntercepted: 0,
  bySource: new Map(),
  startedAt: null,
};

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES PÚBLICAS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Instala o adaptador de compatibilidade
 *
 * Após instalação, todos os emitEvent() serão automaticamente
 * redirecionados através do sistema de governança.
 */
export async function installCompatibilityAdapter(): Promise<void> {
  if (isInstalled) {
    // eslint-disable-next-line no-console
    console.warn('[CompatibilityAdapter] Already installed');
    return;
  }

  try {
    // Carregar GovernedEmitter
    governedEmitterModule = await import('../core/GovernedEmitter');

    // Inicializar se ainda não foi
    if (!governedEmitterModule.isGovernedEmitterEnabled()) {
      await governedEmitterModule.initGovernedEmitter();
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('[CompatibilityAdapter] GovernedEmitter not available, using passthrough:', error);
  }

  // Salvar referência original
  originalEmitEvent = eventBusModule.emitEvent;

  // Criar função interceptora
  const interceptedEmitEvent = (
    eventType: EventType,
    payload: unknown,
    options?: { source?: string; priority?: number }
  ): void => {
    const source = options?.source ?? 'legacy-engine';

    // Atualizar estatísticas
    stats.totalIntercepted++;
    stats.bySource.set(source, (stats.bySource.get(source) ?? 0) + 1);

    // Se GovernedEmitter disponível, usar
    if (governedEmitterModule && governedEmitterModule.isGovernedEmitterEnabled()) {
      governedEmitterModule.governedEmit(eventType, payload, {
        source,
        priority: options?.priority,
      });
    } else {
      // Fallback para emissão direta
      originalEmitEvent!(eventType, payload, options);
    }
  };

  // Sobrescrever emitEvent no módulo (usando any para permitir a sobrescrita)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (eventBusModule as any).emitEvent = interceptedEmitEvent;

  isInstalled = true;
  stats.startedAt = Date.now();

  // eslint-disable-next-line no-console
  console.log('[CompatibilityAdapter] ✓ Installed - all emitEvent calls are now governed');
}

/**
 * Desinstala o adaptador de compatibilidade
 */
export function uninstallCompatibilityAdapter(): void {
  if (!isInstalled || !originalEmitEvent) {
    return;
  }

  // Restaurar original
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (eventBusModule as any).emitEvent = originalEmitEvent;
  originalEmitEvent = null;

  isInstalled = false;

  // eslint-disable-next-line no-console
  console.log('[CompatibilityAdapter] Uninstalled');
}

/**
 * Verifica se o adaptador está instalado
 */
export function isCompatibilityAdapterInstalled(): boolean {
  return isInstalled;
}

/**
 * Retorna estatísticas do adaptador
 */
export function getCompatibilityAdapterStats(): {
  isInstalled: boolean;
  totalIntercepted: number;
  bySource: Record<string, number>;
  uptimeMs: number | null;
} {
  return {
    isInstalled,
    totalIntercepted: stats.totalIntercepted,
    bySource: Object.fromEntries(stats.bySource),
    uptimeMs: stats.startedAt ? Date.now() - stats.startedAt : null,
  };
}

/**
 * Reseta as estatísticas
 */
export function resetCompatibilityAdapterStats(): void {
  stats.totalIntercepted = 0;
  stats.bySource.clear();
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTO-INSTALL OPCIONAL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Instalação automática (pode ser importada para side-effect)
 *
 * @usage
 * ```typescript
 * // Apenas importe para instalar automaticamente
 * import '@/azuria_ai/governance/CompatibilityAdapter/auto';
 * ```
 */
export async function autoInstall(): Promise<void> {
  // Só instalar se não estiver em test environment
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') {
    return;
  }

  await installCompatibilityAdapter();
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  install: installCompatibilityAdapter,
  uninstall: uninstallCompatibilityAdapter,
  isInstalled: isCompatibilityAdapterInstalled,
  getStats: getCompatibilityAdapterStats,
  resetStats: resetCompatibilityAdapterStats,
};
