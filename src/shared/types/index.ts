// ============================================
// SHARED TYPES - Central Export Hub
// ============================================
// This file provides centralized exports for all shared types
// Organized by category for easier maintenance

// ============================================
// AUTH & USER TYPES
// ============================================
export type { UserProfileWithDisplayData, UserProfile } from './auth';

// ============================================
// AI & CHATBOT TYPES
// ============================================
export type { 
  ChatMessage, 
  ChatSession, 
  MLPredictionResult,
  PredictiveAnalysis,
  PersonalizedRecommendation,
  AIConfig,
  AIContext,
  AIAction,
  BusinessProfile,
  TaxRegimeType,
  TaxRegime,
  TaxAnalysis,
  AIAlert,
  CompetitorPlatform,
  CompetitorPricing,
  PricingAnalysis
} from './ai';

// ============================================
// ANALYTICS & METRICS TYPES
// ============================================
export type { AnalyticsEvent, GAEvent } from './analytics';
export type { RealTimeMetrics, PriceData, CategoryData, CompetitorData } from './realTimeMetrics';
export type { BusinessMetric, SalesData, ProductPerformance } from './businessMetrics';

// ============================================
// AUTOMATION & WORKFLOWS TYPES
// ============================================
export type { 
  AutomationRule, 
  RuleCondition, 
  RuleAction,
  ScheduleConfig,
  AutomationExecution,
  AutomationAlert,
  AutomationWorkflow,
  WorkflowStep,
  WorkflowApproval,
  AutomationTemplate
} from './automation';

// ============================================
// MARKETPLACE & COMPETITOR TYPES
// ============================================
export type { 
  MarketplaceTemplate, 
  TaxTemplate,
  StateICMSRule 
} from './marketplaceTemplates';
export type { CompetitorAlert, AlertSettings } from './competitorAlerts';

// ============================================
// DASHBOARD & UI TYPES
// ============================================
export type { 
  DashboardWidget,
  WidgetType,
  WidgetConfig,
  Dashboard,
  DashboardSettings,
  DashboardTemplate
} from './dashboard';

// ============================================
// COLLABORATION & SHARING TYPES
// ============================================
export type { 
  CalculationShare,
  CalculationComment,
  CalculationApproval,
  CollaborationNotification,
  ShareRequest,
  ApprovalRequest
} from './collaboration';

// ============================================
// ENTERPRISE & MULTI-TENANT TYPES
// ============================================
export type { 
  TeamMember,
  Team,
  Permission,
  TeamSettings,
  ApiKey,
  WhiteLabelConfig,
  AdvancedReport,
  ReportFilters
} from './enterprise';

export type {
  Organization,
  Store,
  StoreAddress,
  OrganizationSettings,
  StoreSettings,
  OrganizationMember,
  MultiTenantContext,
  ConsolidatedMetrics,
  StoreMetrics
} from './multi-tenant';

// ============================================
// AUDIT & SECURITY TYPES
// ============================================
export type { AuditLog, AuditLogFilters } from './auditLogs';

// ============================================
// ECOMMERCE & INTEGRATION TYPES
// ============================================
export type { 
  EcommerceConnection,
  EcommerceProduct,
  PriceSync,
  WebhookEvent,
  SyncSettings
} from './ecommerce';

// ============================================
// DATABASE TYPES
// ============================================
export type { BaseTable, UserOwnedTable } from './database/core';
export type { UserProfilesTable, BusinessSettingsTable } from './database/user-profiles';
export type { AutomationRulesTable, AutomationExecutionsTable } from './database/automation';
export type { CalculationSharesTable, CalculationCommentsTable } from './database/collaboration';

// ============================================
// CALCULATOR DOMAIN RE-EXPORTS
// ============================================
// Re-export calculator types for backward compatibility
export type { CalculationResult, CalculationHistory } from './simpleCalculator';
export type { ChartData, ExportData, ScheduleOptions, ScheduledReport } from './export';