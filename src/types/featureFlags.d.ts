declare module '@/lib/featureFlags' {
  export type FeatureFlagName = 'ADV_CALC_ENHANCED_SUMMARY' | 'MARKETPLACE_DYNAMIC_FEES' | 'TELEMETRY_SQL_PERCENTILES' | 'BUNDLE_OPTIMIZATION_PANEL';
  export function isFeatureEnabled(flag: FeatureFlagName): boolean;
}