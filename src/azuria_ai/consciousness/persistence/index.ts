/**
 * ══════════════════════════════════════════════════════════════════════════════
 * PERSISTENCE INDEX
 * ══════════════════════════════════════════════════════════════════════════════
 */

export {
  SupabasePersistence,
  initPersistence,
  stopPersistence,
  persistMessage,
  persistFeedback,
  updateMessageOutcome,
  loadPreferences,
  savePreferences,
  loadRecentMessages,
  loadUserMetrics,
  saveDailyMetrics,
  flush,
  type PersistedMessage,
  type PersistedPreferences,
  type PersistedFeedback,
  type PersistedDailyMetrics,
} from './SupabasePersistence';

