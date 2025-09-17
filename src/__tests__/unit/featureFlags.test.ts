import { describe, expect, it } from 'vitest';
import { FEATURE_FLAGS, isFeatureEnabled, listEnabledFlags } from '@/config/featureFlags';

describe('featureFlags', () => {
  it('retorna defaults corretos', () => {
    for (const key of Object.keys(FEATURE_FLAGS) as (keyof typeof FEATURE_FLAGS)[]) {
      expect(isFeatureEnabled(key)).toBe(FEATURE_FLAGS[key]);
    }
  });

  it('aceita overrides diretos', () => {
    expect(isFeatureEnabled('NEW_DASHBOARD_LAYOUT', { NEW_DASHBOARD_LAYOUT: true })).toBe(true);
  });

  it('lista apenas flags verdadeiras', () => {
    const enabled = listEnabledFlags();
    for (const f of enabled) {
      expect(isFeatureEnabled(f)).toBe(true);
    }
  });
});
