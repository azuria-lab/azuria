/**
 * Smart Pricing Service - Compatibility Layer
 * 
 * ⚠️ This file is maintained for backward compatibility.
 * The service has been refactored and is now in: ./smartPricing/
 * 
 * Please update your imports to:
 * import { smartPricingService } from '@/services/ai/smartPricing';
 */

export { smartPricingService } from './smartPricing';
export type {
  CompetitorAnalysisResult,
  MarketAnalysisResult,
  PriceImpactAnalysis,
  PricingAlternative,
  SmartPricingInput,
  SmartPricingRecommendation,
  VolumeAnalysisResult,
} from './smartPricing';
