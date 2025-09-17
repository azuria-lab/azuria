// Execução em runtime (apenas loga avisos em dev).
// Para falhar hard use o script `npm run validate:env` em CI.

interface Issue { type: 'missing' | 'warning'; key: string; message: string }

const REQUIRED = ['VITE_SUPABASE_URL','VITE_SUPABASE_ANON_KEY'] as const;
// OPTIONAL mantido para futura expansão.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OPTIONAL = ['VITE_OPENAI_API_KEY','VITE_GA_MEASUREMENT_ID'] as const;

function readEnv(k: string): string | undefined {
  try {
    const im = import.meta as unknown as { env?: Record<string, string | undefined> };
    if (im?.env && k in im.env) {
      return im.env[k];
    }
  } catch { /* ignore */ }
  if (typeof process !== 'undefined' && process.env && k in process.env) {
    return process.env[k];
  }
  return undefined;
}

function validate(): Issue[] {
  const issues: Issue[] = [];
  for (const k of REQUIRED) {
    if (!readEnv(k)) {
      issues.push({ type: 'missing', key: k, message: 'Ausente' });
    }
  }
  return issues;
}

export function logEnvDiagnostics() {
  const issues = validate();
  if (!issues.length) {
    return;
  }
  // eslint-disable-next-line no-console
  console.warn('[env] Avisos de configuração:', issues.map(i => `${i.key}=${i.message}`).join('; '));
}

// Auto-exec em dev
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  try { logEnvDiagnostics(); } catch { /* ignore */ }
}
