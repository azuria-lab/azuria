// ============================================
// SHARED HOOKS - Central Export Hub
// ============================================
// This file provides centralized exports for all shared hooks
// Organized by category for easier maintenance

// ============================================
// CORE UTILITY HOOKS
// ============================================
export { useToast, toast } from './use-toast';
export { useIsMobile } from './use-mobile';
export { useDebounce } from './useDebounce';
export { useAdvancedCache } from './useAdvancedCache';

// ============================================
// ANALYTICS & METRICS HOOKS
// ============================================
export { useAnalytics, useRevenueAnalytics } from './useAnalytics';
export { useABTesting } from './useABTesting';
export { useBusinessMetrics } from './useBusinessMetrics';
export { useAdvancedBusinessMetrics } from './useAdvancedBusinessMetrics';
export { useRealTimeMetrics } from './useRealTimeMetrics';
export { useHeatmap } from './useHeatmap';
export { useMLPricing } from './useMLPricing';
export { useRealTimeAnalytics } from './useRealTimeAnalytics';

// ============================================
// AUTH & SECURITY HOOKS  
// ============================================
export { useAuth } from './auth/index';
export { useAuthState } from './auth/useAuthState';
export { useAuthMethods } from './auth/useAuthMethods';
export { useUserProfile } from './auth/useUserProfile';
export { useTwoFactorAuth } from './useTwoFactorAuth';

// ============================================
// AI & AUTOMATION HOOKS
// ============================================
export { useAIChatbot } from './useAIChatbot';
export { useAIPredictions } from './useAIPredictions';
export { useAIMarketAnalysis } from './useAIMarketAnalysis';
export { usePersonalizedRecommendations } from './usePersonalizedRecommendations';
export { useAdvancedAutomation, useAutomationRule, useAlertsByRule, useExecutionsByRule } from './useAdvancedAutomation';

// ============================================
// CALCULATOR-RELATED SHARED HOOKS
// ============================================
export { useCalculationHistory } from './useCalculationHistory';
export { useCalculationCache } from './useCalculationCache';
export { useOptimizedCalculator } from './useOptimizedCalculator';
export { useRealTimeHistory } from './useRealTimeHistory';
export { useVirtualScroll } from './useVirtualScroll';

// Calculator legacy re-exports (with backward compatibility aliases)
export { useSimpleCalculator, useRapidCalculator } from './useSimpleCalculator';
export { useSimpleCalculatorUI, useRapidCalculatorUI } from './useSimpleCalculatorUI';

// ============================================
// BUSINESS & MARKETPLACE HOOKS
// ============================================
export { useBusinessSettings } from './useBusinessSettings';
export { useCalculator } from './useCalculator';
export { useCompetitors } from './useCompetitors';
export { useCompetitorAlerts } from './useCompetitorAlerts';
export { useMarketplaceIntegrations } from './useMarketplaceIntegrations';

// ============================================
// API & INTEGRATION HOOKS
// ============================================
export { useAdvancedRateLimit } from './useAdvancedRateLimit';
export { useBidirectionalWebhooks } from './useBidirectionalWebhooks';
export { useApiManagement } from './useApiManagement';

// ============================================
// EXPORT & REPORTING HOOKS
// ============================================
export { useAdvancedExportReports } from './useAdvancedExportReports';
export { useAdvancedReports } from './useAdvancedReports';

// ============================================
// TEMPLATE & COLLABORATION HOOKS
// ============================================
export { useTemplates, useTemplatePurchases, useTemplateReviews } from './useTemplates';
export { useTemplateApplication } from './useTemplateApplication';
export { 
  useCollaboration,
  useSharedCalculations,
  useCalculationComments,
  useShareCalculation,
  useAddComment,
  useRequestApproval,
  useApproveCalculation,
  useCollaborationNotifications,
  useMarkNotificationAsRead
} from './useCollaboration';

// ============================================
// DASHBOARD & UI HOOKS
// ============================================
export { useDashboard } from './useDashboard';
export { useOfflineCalculator } from './useOfflineCalculator';
export { useAccessibility } from './useAccessibility';

// ============================================
// AUDIT & SECURITY HOOKS
// ============================================
export { useAuditLog } from './useAuditLog';
export { useAuditLogs } from './useAuditLogs';

// ============================================
// TESTING & OPTIMIZATION HOOKS
// ============================================
export { useOptimizedHooks } from './useOptimizedHooks';