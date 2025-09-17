/**
 * Registro central de Feature Flags.
 * Override via Vite env: VITE_FF_<NOME>=true|false
 * Nomes devem ser UPPER_SNAKE_CASE.
 *
 * Agora cada flag contém metadata para governança.
 */

export interface FeatureFlagMeta {
  enabledByDefault: boolean;
  owner: string;             // Responsável primário (GitHub handle ou squad)
  createdAt: string;         // ISO date
  expiresAt?: string;        // ISO date (quando revisit / kill switch), opcional
  description: string;       // Contexto de negócio / intenção
  tags?: string[];           // Ex: ['experiment','perf','security']
}

// Definição das flags com metadata. Manter ordenado alfabeticamente para diff limpo.
export const FEATURE_FLAGS: Record<string, FeatureFlagMeta> = {
  ENABLE_CALC_SIMULATOR_V2: {
    enabledByDefault: false,
    owner: 'core-calculations',
    createdAt: '2025-09-01',
    expiresAt: '2025-11-01',
    description: 'Nova engine de simulação com caching incremental',
    tags: ['experiment','calc']
  },
  EXPERIMENTAL_AI_PRICING: {
    enabledByDefault: false,
    owner: 'pricing-squad',
    createdAt: '2025-08-20',
    expiresAt: '2025-10-15',
    description: 'Modelo de precificação assistido por IA (fase exploratória)',
    tags: ['experiment','ai']
  },
  NEW_DASHBOARD_LAYOUT: {
    enabledByDefault: false,
    owner: 'ui-foundation',
    createdAt: '2025-09-10',
    expiresAt: '2025-10-30',
    description: 'Layout responsivo revisado do dashboard principal',
    tags: ['ui','ux']
  },
  OFFLINE_ENHANCED_SYNC: {
    enabledByDefault: true,
    owner: 'platform-offline',
    createdAt: '2025-07-15',
    description: 'Sincronização incremental com resolução de conflitos otimizada',
    tags: ['offline','reliability']
  },
  PERFORMANCE_LOGGING: {
    enabledByDefault: false,
    owner: 'observability',
    createdAt: '2025-09-05',
    expiresAt: '2025-12-01',
    description: 'Log extra de métricas de performance (fase de calibração)',
    tags: ['perf','observability']
  }
};

export type FeatureFlagName = keyof typeof FEATURE_FLAGS;

function coerceBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === null || value === undefined) {
    return fallback;
  }
  const v = value.trim().toLowerCase();
  if (["1","true","yes","on"].includes(v)) {
    return true;
  }
  if (["0","false","no","off"].includes(v)) {
    return false;
  }
  return fallback;
}

/**
 * Resolve valor final (default + override via import.meta.env)
 */
export function isFeatureEnabled(flag: FeatureFlagName, overrides?: Partial<Record<FeatureFlagName, boolean>>): boolean {
  const meta = FEATURE_FLAGS[flag];
  if (!meta) {
    return false;
  }
  const base = meta.enabledByDefault;
  // Legacy: permitir que chamadores enviem overrides diretos
  if (overrides && flag in overrides && typeof overrides[flag] === 'boolean') {
    return overrides[flag] as boolean;
  }
  // Tentativa de leitura via Vite env (durante build substitui):
  const envKey = `VITE_FF_${flag}`;
  let raw: string | undefined;
  try {
    interface ImportMetaLike { env?: Record<string, string | undefined> }
    const im = (import.meta as unknown as ImportMetaLike);
    if (im && im.env) {
      raw = im.env[envKey];
    }
  } catch {
    // ignore
  }
  return coerceBoolean(raw, base);
}

/** Lista flags habilitadas (para debug / telemetry) */
export function listEnabledFlags(): FeatureFlagName[] {
  return (Object.keys(FEATURE_FLAGS) as FeatureFlagName[]).filter(f => isFeatureEnabled(f));
}

/** Retorna metadata (sem aplicar override) */
export function getFeatureFlagMeta(flag: FeatureFlagName): FeatureFlagMeta | undefined {
  return FEATURE_FLAGS[flag];
}

/** Lista metadata das flags expostas (sem override) */
export function listAllFeatureFlags(): Array<{ name: FeatureFlagName } & FeatureFlagMeta> {
  return (Object.keys(FEATURE_FLAGS) as FeatureFlagName[]).map(name => ({ name, ...FEATURE_FLAGS[name] }));
}
