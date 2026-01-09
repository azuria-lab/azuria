/**
 * ══════════════════════════════════════════════════════════════════════════════
 * LEVELS - Sistema de Níveis de Consciência
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Este módulo exporta o sistema de níveis que separa ADMIN vs USER.
 *
 * Níveis:
 * - ADMIN (Inteligência Estratégica): Visão completa, métricas, decisões
 * - USER (Co-Pilot Operacional): Assistência contextual, sugestões
 *
 * @example
 * ```typescript
 * import { ConsciousnessLevels } from '@/azuria_ai/levels';
 *
 * // Ativar nível
 * ConsciousnessLevels.activate('USER');
 *
 * // Verificar permissão
 * if (ConsciousnessLevels.hasFeatureAccess('USER', 'suggestions')) {
 *   // Pode mostrar sugestões
 * }
 *
 * // Verificar se engine é permitido
 * if (ConsciousnessLevels.canUseEngine('USER', 'analyticsEngine')) {
 *   // Não permitido para USER
 * }
 * ```
 *
 * @module azuria_ai/levels
 */

export {
  ConsciousnessLevels,
  initLevels,
  shutdownLevels,
  activateLevel,
  deactivateLevel,
  getLevelConfig,
  getCurrentLevel,
  hasFeatureAccess,
  canUseEngine,
  canReceiveEvent,
  hasReachedSuggestionLimit,
  filterEnginesForRole,
  filterEventsForRole,
  checkActionPermission,
  getLevelStats,
  recordSuggestionShown,
  recordInsightGenerated,
  recordActionExecuted,
  recordEventProcessed,
  ADMIN_LEVEL_CONFIG,
  USER_LEVEL_CONFIG,
  SYSTEM_LEVEL_CONFIG,
  FEATURE_PERMISSIONS,
  type CognitiveRole,
  type FeatureCategory,
  type FeaturePermission,
  type LevelConfig,
  type LevelContext,
  type PermissionCheckResult,
} from './ConsciousnessLevels';
