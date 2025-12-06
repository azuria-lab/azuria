/**
 * Azuria AI Context Module
 *
 * Export all context-related modules
 */

export {
  useScreenContextWatcher,
  emitScreenDataUpdate,
} from './screenContextWatcher';
export type { ScreenContext } from './screenContextWatcher';

export {
  extractDashboardContext,
  extractHistoryContext,
  extractLotContext,
  extractPricingAIContext,
  extractMarketplaceContext,
  extractAnalyticsContext,
  extractBiddingContext,
  extractContextForScreen,
} from './contextExtractors';
export type { ExtractedContext } from './contextExtractors';
