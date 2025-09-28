import { beforeEach, describe, expect, it } from 'vitest';
import { isFeatureEnabled, resetFeatureFlags, setFeatureFlag } from '../../lib/featureFlags';

describe('feature flags', () => {
  beforeEach(() => {
    resetFeatureFlags();
  });

  it('returns default value when no overrides', () => {
    expect(isFeatureEnabled('MARKETPLACE_DYNAMIC_FEES')).toBe(true);
    expect(isFeatureEnabled('ADV_CALC_ENHANCED_SUMMARY')).toBe(false);
  });

  it('applies runtime override', () => {
    setFeatureFlag('ADV_CALC_ENHANCED_SUMMARY', true);
    expect(isFeatureEnabled('ADV_CALC_ENHANCED_SUMMARY')).toBe(true);
  });

  it('env override wins over default but can be superseded by runtime override', () => {
    process.env.VITE_FF_ADV_CALC_ENHANCED_SUMMARY = 'true';
    expect(isFeatureEnabled('ADV_CALC_ENHANCED_SUMMARY')).toBe(true);
    setFeatureFlag('ADV_CALC_ENHANCED_SUMMARY', false);
    expect(isFeatureEnabled('ADV_CALC_ENHANCED_SUMMARY')).toBe(false);
  });
});
