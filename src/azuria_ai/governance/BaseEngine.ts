/**
 * ══════════════════════════════════════════════════════════════════════════════
 * BASE ENGINE - Classe Base para Engines Governados
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Esta classe fornece uma base para criar engines que respeitam a governança.
 * Engines que estendem BaseEngine automaticamente:
 * - Se registram no sistema de governança
 * - Pedem permissão antes de emitir eventos
 * - Registram suas ações para auditoria
 *
 * @example
 * ```typescript
 * class MyEngine extends BaseEngine {
 *   constructor() {
 *     super({
 *       id: 'myEngine',
 *       name: 'My Custom Engine',
 *       category: 'cognitive',
 *       allowedEvents: ['ai:pattern-detected', 'ai:insight'],
 *     });
 *   }
 *
 *   async analyzeData(data: unknown) {
 *     // Usar emit governado ao invés de emitEvent direto
 *     await this.emit('ai:pattern-detected', { patterns: [...] });
 *   }
 * }
 * ```
 *
 * @module azuria_ai/governance/BaseEngine
 */

import { eventBus, type EventType } from '../core/eventBus';
import {
  type EngineCategory,
  EngineGovernance,
  type EnginePrivilege,
  recordEmission,
  registerEngine,
  requestActionPermission,
  requestEmitPermission,
} from './EngineGovernance';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

/** Configuração do engine */
export interface BaseEngineConfig {
  /** ID único do engine */
  id: string;
  /** Nome amigável */
  name: string;
  /** Categoria funcional */
  category: EngineCategory;
  /** Nível de privilégio */
  privilege?: EnginePrivilege;
  /** Eventos que pode emitir */
  allowedEvents?: EventType[];
  /** Eventos que deseja ouvir */
  subscribedEvents?: EventType[];
  /** Modo debug */
  debug?: boolean;
}

/** Resultado de emissão */
export interface EmitResult {
  success: boolean;
  reason?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BASE ENGINE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export abstract class BaseEngine {
  protected readonly id: string;
  protected readonly name: string;
  protected readonly category: EngineCategory;
  protected readonly privilege: EnginePrivilege;
  protected readonly allowedEvents: EventType[];
  protected readonly debug: boolean;

  private initialized = false;
  private subscriptionIds: string[] = [];

  constructor(config: BaseEngineConfig) {
    this.id = config.id;
    this.name = config.name;
    this.category = config.category;
    this.privilege = config.privilege ?? 'standard';
    this.allowedEvents = config.allowedEvents ?? [];
    this.debug = config.debug ?? false;

    // Auto-registrar no sistema de governança
    this.register(config);
  }

  /**
   * Registra o engine no sistema de governança
   */
  private register(config: BaseEngineConfig): void {
    registerEngine(this.id, {
      name: config.name,
      category: config.category,
      privilege: config.privilege,
      allowedEvents: config.allowedEvents,
      subscribedEvents: config.subscribedEvents,
    });
  }

  /**
   * Inicializa o engine
   * Subclasses devem chamar super.init() e então fazer sua inicialização
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.log('Initializing...');

    // Subclasses podem sobrescrever para adicionar lógica
    await this.onInit();

    this.initialized = true;
    this.log('Initialized');
  }

  /**
   * Desliga o engine
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    this.log('Shutting down...');

    // Remover subscriptions
    this.subscriptionIds.forEach((subId) => {
      eventBus.off(subId);
    });
    this.subscriptionIds = [];

    // Subclasses podem sobrescrever
    await this.onShutdown();

    this.initialized = false;
    this.log('Shutdown complete');
  }

  /**
   * Emite um evento com governança
   * Solicita permissão antes de emitir
   */
  protected async emit(
    eventType: EventType,
    payload: unknown,
    options?: {
      priority?: 'low' | 'normal' | 'high' | 'critical';
      reason?: string;
      /** Se deve pular a verificação de permissão (usar com cuidado) */
      skipPermission?: boolean;
    }
  ): Promise<EmitResult> {
    // Verificar se o evento está na lista de permitidos
    if (!this.allowedEvents.includes(eventType) && !options?.skipPermission) {
      this.warn(`Event '${eventType}' not in allowed list`);
      return {
        success: false,
        reason: 'event_not_allowed',
      };
    }

    // Pular permissão se solicitado (apenas para engines de sistema)
    if (options?.skipPermission && this.privilege === 'system') {
      this.directEmit(eventType, payload, options.priority);
      return { success: true };
    }

    // Solicitar permissão
    const permission = await requestEmitPermission({
      engineId: this.id,
      eventType,
      payload,
      priority: options?.priority,
      reason: options?.reason,
    });

    if (!permission.granted) {
      this.log(`Permission denied for '${eventType}': ${permission.reason}`);
      return {
        success: false,
        reason: permission.reason,
      };
    }

    // Emitir com payload possivelmente modificado
    const finalPayload = permission.modifiedPayload ?? payload;

    // Atrasar se solicitado
    if (permission.delayMs && permission.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, permission.delayMs));
    }

    this.directEmit(eventType, finalPayload, options?.priority);
    recordEmission(this.id);

    return { success: true };
  }

  /**
   * Emissão direta (sem governança) - usar apenas internamente
   */
  private directEmit(
    eventType: EventType,
    payload: unknown,
    priority?: string
  ): void {
    eventBus.emit(eventType, payload, {
      source: this.id,
      priority: priority === 'critical' ? 10 : priority === 'high' ? 7 : priority === 'low' ? 1 : 5,
    });
  }

  /**
   * Executa uma ação com governança
   */
  protected async executeAction<T>(
    action: string,
    executor: () => T | Promise<T>,
    payload?: unknown
  ): Promise<{ success: boolean; result?: T; reason?: string }> {
    // Solicitar permissão
    const permission = await requestActionPermission(this.id, action, payload);

    if (!permission.granted) {
      this.log(`Action '${action}' denied: ${permission.reason}`);
      return {
        success: false,
        reason: permission.reason,
      };
    }

    // Executar ação
    try {
      const result = await executor();
      return {
        success: true,
        result,
      };
    } catch (error) {
      this.warn(`Action '${action}' failed:`, error);
      return {
        success: false,
        reason: 'execution_error',
      };
    }
  }

  /**
   * Registra um listener para eventos (via EventBusProxy quando possível)
   */
  protected subscribe(eventType: EventType, handler: (event: unknown) => void): void {
    const subId = eventBus.on(eventType, handler);
    this.subscriptionIds.push(subId);
    this.log(`Subscribed to '${eventType}'`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HOOKS PARA SUBCLASSES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Hook chamado durante inicialização
   * Subclasses podem sobrescrever para adicionar lógica
   */
  protected async onInit(): Promise<void> {
    // Implementação padrão vazia
  }

  /**
   * Hook chamado durante shutdown
   * Subclasses podem sobrescrever para cleanup
   */
  protected async onShutdown(): Promise<void> {
    // Implementação padrão vazia
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGGING
  // ═══════════════════════════════════════════════════════════════════════════

  protected log(message: string, data?: unknown): void {
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(`[${this.name}] ${message}`, data ?? '');
    }
  }

  protected warn(message: string, data?: unknown): void {
    // eslint-disable-next-line no-console
    console.warn(`[${this.name}] ${message}`, data ?? '');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ═══════════════════════════════════════════════════════════════════════════

  get engineId(): string {
    return this.id;
  }

  get engineName(): string {
    return this.name;
  }

  get engineCategory(): EngineCategory {
    return this.category;
  }

  get isInitialized(): boolean {
    return this.initialized;
  }
}

export default BaseEngine;
