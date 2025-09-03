import type { WebVitalMetric } from './types';

export async function loadWebVitals() {
  try {
    const webVitals = await import('web-vitals');
    return webVitals;
  } catch {
    return null;
  }
}

export function subscribeToVitals(
  webVitals: any,
  handler: (metric: WebVitalMetric) => void,
  reportAllChanges = true
) {
  const { onCLS, onFCP, onLCP, onTTFB, onINP } = webVitals as any;
  onCLS(handler, { reportAllChanges });
  onFCP(handler);
  onLCP(handler, { reportAllChanges });
  onTTFB(handler);
  if (onINP) {
    onINP(handler, { reportAllChanges });
  }
}
