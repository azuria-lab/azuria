import type { WebVitalMetric } from './types';

type WebVitalsModule = {
  onCLS: (cb: (m: WebVitalMetric) => void, opts?: { reportAllChanges?: boolean }) => void;
  onFCP: (cb: (m: WebVitalMetric) => void) => void;
  onLCP: (cb: (m: WebVitalMetric) => void, opts?: { reportAllChanges?: boolean }) => void;
  onTTFB: (cb: (m: WebVitalMetric) => void) => void;
  onINP?: (cb: (m: WebVitalMetric) => void, opts?: { reportAllChanges?: boolean }) => void;
};

export async function loadWebVitals(): Promise<WebVitalsModule | null> {
  try {
    const webVitals = (await import('web-vitals')) as unknown as WebVitalsModule;
    return webVitals;
  } catch {
    return null;
  }
}

export function subscribeToVitals(
  webVitals: WebVitalsModule,
  handler: (metric: WebVitalMetric) => void,
  reportAllChanges = true
) {
  const { onCLS, onFCP, onLCP, onTTFB, onINP } = webVitals;
  onCLS(handler, { reportAllChanges });
  onFCP(handler);
  onLCP(handler, { reportAllChanges });
  onTTFB(handler);
  if (typeof onINP === 'function') {
    onINP(handler, { reportAllChanges });
  }
}
