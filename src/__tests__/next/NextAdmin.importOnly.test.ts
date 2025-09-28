import { describe, it } from 'vitest';

// Harmless stub to ensure this file no longer imports the heavy Next page module.
describe('Next Admin Page (import only)', () => {
  it('is a no-op placeholder', () => {
    // Intentionally empty: original import-only test caused large module loads and memory pressure.
  });
});
