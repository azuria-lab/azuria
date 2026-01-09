/**
 * ══════════════════════════════════════════════════════════════════════════════
 * GOVERNANCE - Sistema de Governança de Engines
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Este módulo exporta o sistema de governança que controla quando e como
 * os engines podem agir no sistema Azuria.
 *
 * Componentes:
 * - EngineGovernance: Sistema central de permissões
 * - BaseEngine: Classe base para engines governados
 *
 * @example
 * ```typescript
 * import { EngineGovernance, BaseEngine } from '@/azuria_ai/governance';
 *
 * // Registrar um engine
 * EngineGovernance.register('myEngine', {
 *   name: 'My Engine',
 *   category: 'cognitive',
 *   allowedEvents: ['ai:insight'],
 * });
 *
 * // Solicitar permissão para emitir
 * const permission = await EngineGovernance.requestEmit({
 *   engineId: 'myEngine',
 *   eventType: 'ai:insight',
 *   payload: { message: 'Hello' },
 * });
 * ```
 *
 * @module azuria_ai/governance
 */

// ════════════════════════════════════════════════════════════════════════════
// ENGINE GOVERNANCE
// ════════════════════════════════════════════════════════════════════════════

export {
  EngineGovernance,
  initEngineGovernance,
  shutdownEngineGovernance,
  registerEngine,
  unregisterEngine,
  getEngine,
  listEngines,
  listEnginesByCategory,
  requestEmitPermission,
  requestActionPermission,
  recordEmission,
  getGovernanceStats,
  type EngineCategory,
  type EnginePrivilege,
  type EngineRegistration,
  type EmitPermissionRequest,
  type PermissionResponse,
  type GovernanceConfig,
} from './EngineGovernance';

// ════════════════════════════════════════════════════════════════════════════
// BASE ENGINE
// ════════════════════════════════════════════════════════════════════════════

export {
  BaseEngine,
  type BaseEngineConfig,
  type EmitResult,
} from './BaseEngine';
// ════════════════════════════════════════════════════════════════════════════
// COMPATIBILITY ADAPTER
// ════════════════════════════════════════════════════════════════════════════

/**
 * Adaptador de compatibilidade para engines legado.
 * Intercepta emitEvent e redireciona para governança.
 *
 * @example
 * ```typescript
 * import { installCompatibilityAdapter } from '@/azuria_ai/governance';
 *
 * // Instalar no início da aplicação
 * await installCompatibilityAdapter();
 *
 * // Agora todos os emitEvent() passam pela governança!
 * ```
 */
export {
  installCompatibilityAdapter,
  uninstallCompatibilityAdapter,
  isCompatibilityAdapterInstalled,
  getCompatibilityAdapterStats,
  resetCompatibilityAdapterStats,
} from './CompatibilityAdapter';

// ════════════════════════════════════════════════════════════════════════════
// ENGINE MIGRATION HELPER
// ════════════════════════════════════════════════════════════════════════════

/**
 * Utilitários para migração de engines para o sistema governado.
 */
export {
  inferCategory,
  inferEngineId,
  calculateMigrationEffort,
  generateFunctionWrapper,
  generateClassMigration,
  createCompatibilityAdapter,
  generateMigrationReport,
  type DetectedEngine,
  type AnalysisResult,
} from './EngineMigrationHelper';