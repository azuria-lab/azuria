/**
 * =====================================================
 * AZURIA v2.0 - EXPORTS
 * =====================================================
 * Arquivo central de exports para os novos recursos
 * =====================================================
 */

// Engines
export { default as priceMonitoringAgent } from './engines/priceMonitoringAgent';
export { default as invoiceOCREngine } from './engines/invoiceOCREngine';
export { default as dynamicPricingEngine } from './engines/dynamicPricingEngine';

// Components - Widgets
export { PriceMonitoringWidget } from '@/components/widgets/PriceMonitoringWidget';

// Components - Modals
export { InvoiceOCRModal } from '@/components/modals/InvoiceOCRModal';
export { DynamicPricingModal } from '@/components/modals/DynamicPricingModal';

// Types
export type {
  MonitoredProduct,
  CompetitorPrice,
  PriceSuggestion,
  PriceAlert,
  MonitoringStats,
} from './engines/priceMonitoringAgent';

export type {
  InvoiceItem,
  InvoiceData,
  OCRResult,
} from './engines/invoiceOCREngine';

export type {
  PricingRule,
  PricingStrategy,
  PriceAdjustment,
  PriceSimulation,
  OptimizationResult,
} from './engines/dynamicPricingEngine';
