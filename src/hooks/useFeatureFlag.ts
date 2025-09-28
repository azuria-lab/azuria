import { useSyncExternalStore } from 'react';
import { type FeatureFlagName, isFeatureEnabled, listFeatureFlags, resetFeatureFlags, setFeatureFlag } from '../../lib/featureFlags';

// Simple subscription model: we piggyback on storage events for cross-tab updates.
function subscribe(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }
  const handler = (e: StorageEvent) => {
    if (e.key && e.key.startsWith('azuria:ff:')) {
      callback();
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

function getSnapshot() {
  return listFeatureFlags();
}

export function useFeatureFlag(flag: FeatureFlagName): boolean {
  const flags = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const entry = flags.find(f => f.name === flag);
  return entry ? entry.active : false;
}

export function useAllFeatureFlags() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export { isFeatureEnabled, setFeatureFlag, resetFeatureFlags };
