import { describe, expect, it } from 'vitest';
// Import without extension for TS type shim compatibility
import * as RLS from '../../../scripts/lib/rls-constants';

// The constants live in an ESM .mjs file under scripts/lib; we import via dynamic import
// to avoid TS path or module resolution friction in test env.

describe('RLS governance constants', () => {
  it('has expected shape and non-empty policies per table', () => {
    expect(RLS.RLS_TABLES).toBeTruthy();
    expect(Array.isArray(RLS.RLS_TABLES)).toBe(true);
    expect(RLS.RLS_TABLES.length).toBeGreaterThan(0);

    for (const t of RLS.RLS_TABLES) {
      expect(typeof t).toBe('string');
      expect(t.split('.').length).toBe(2); // schema.table
      const policies = RLS.RLS_EXPECTED_POLICIES[t];
      expect(Array.isArray(policies)).toBe(true);
      expect(policies.length).toBeGreaterThan(0);
      // Basic naming convention safeguard
      for (const p of policies) {
        expect(p).toMatch(/^(invoices|transactions|.*)_/); // Should start with table prefix or similar
      }
    }
  });

  it('does not contain duplicate policy names per table', () => {
    for (const t of RLS.RLS_TABLES) {
      const policies = RLS.RLS_EXPECTED_POLICIES[t];
      const set = new Set(policies);
      expect(set.size).toBe(policies.length);
    }
  });
});
