/*
 Feature Flags System
 Layers of resolution (lowest precedence first):
 1. Hardcoded defaults in DEFAULT_FLAGS
 2. Build-time environment variables (process.env / import.meta.env via runtimeEnv abstraction)
 3. localStorage overrides (key: azuria:ff:<FLAG>) – only in browser
 4. Query string (?ff-FLAG=on|off) – dev only, sets a sessionStorage marker and updates localStorage for persistence
 5. In-memory runtime overrides via setFeatureFlag (useful in tests)

 All flags are normalized to boolean.
*/

export type FeatureFlagName = keyof typeof DEFAULT_FLAGS;

const DEFAULT_FLAGS = {
  ADV_CALC_ENHANCED_SUMMARY: false,
  MARKETPLACE_DYNAMIC_FEES: true,
  TELEMETRY_SQL_PERCENTILES: false,
  BUNDLE_OPTIMIZATION_PANEL: false,
} as const;

// Runtime in-memory overrides (highest precedence)
const runtimeOverrides: Partial<Record<FeatureFlagName, boolean>> = {};

function readEnvOverride(flag: FeatureFlagName): boolean | undefined {
  const envKeyVariants = [
    flag,
    `VITE_FF_${flag}`,
    `NEXT_PUBLIC_FF_${flag}`
  ];
  for (const key of envKeyVariants) {
    const raw = (process.env[key] as string | undefined)?.trim();
    if (raw !== undefined) {
      if (/^(1|true|on|yes)$/i.test(raw)) {
        return true;
      }
      if (/^(0|false|off|no)$/i.test(raw)) {
        return false;
      }
    }
  }
  return undefined;
}

function readStorageOverride(flag: FeatureFlagName): boolean | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    const ls = localStorage.getItem(`azuria:ff:${flag}`);
    if (ls !== null) {
      return ls === '1';
    }
  } catch { /* ignore storage errors */ }
  return undefined;
}

function applyQueryParamOverrides() {
  if (typeof window === 'undefined') {
    return;
  }
  if (process.env.NODE_ENV === 'production') {
    return; // restrict to dev/test
  }
  const params = new URLSearchParams(window.location.search);
  for (const flag of Object.keys(DEFAULT_FLAGS) as FeatureFlagName[]) {
    const qp = params.get(`ff-${flag}`);
    if (qp) {
      const val = /^(1|true|on|yes)$/i.test(qp) ? '1' : '0';
      try {
        localStorage.setItem(`azuria:ff:${flag}`, val);
      } catch { /* ignore */ }
      if (val === '1') {
        runtimeOverrides[flag] = true;
      } else {
        runtimeOverrides[flag] = false;
      }
    }
  }
}

let queryApplied = false;

export function isFeatureEnabled(flag: FeatureFlagName): boolean {
  if (!queryApplied) { applyQueryParamOverrides(); queryApplied = true; }
  if (flag in runtimeOverrides) {
    return !!runtimeOverrides[flag];
  }
  const storage = readStorageOverride(flag);
  if (storage !== undefined) {
    return storage;
  }
  const envOverride = readEnvOverride(flag);
  if (envOverride !== undefined) {
    return envOverride;
  }
  return DEFAULT_FLAGS[flag];
}

export function setFeatureFlag(flag: FeatureFlagName, value: boolean) {
  runtimeOverrides[flag] = value;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`azuria:ff:${flag}`, value ? '1' : '0');
    } catch { /* ignore */ }
  }
}

export function resetFeatureFlags() {
  for (const k of Object.keys(runtimeOverrides) as FeatureFlagName[]) {
    delete runtimeOverrides[k];
  }
}

export function listFeatureFlags() {
  const entries = Object.keys(DEFAULT_FLAGS).map(f => {
    const name = f as FeatureFlagName;
    return {
      name,
      default: DEFAULT_FLAGS[name],
      active: isFeatureEnabled(name)
    };
  });
  return entries;
}

export const allFeatureFlags = Object.freeze({ ...DEFAULT_FLAGS });
