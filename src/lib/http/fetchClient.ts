/* Resilient fetch client
 * - Retries exponenciais com jitter para respostas 429/5xx e erros de rede
 * - Timeout via AbortController
 * - Normalização de erros
 * - Helpers para JSON seguro
 */

export interface FetchClientOptions extends RequestInit {
  timeoutMs?: number;           // Timeout por requisição
  retries?: number;             // Número máximo de tentativas (exclui a tentativa inicial?) -> inclui
  retryDelayBaseMs?: number;    // Base para backoff exponencial
  retryOnStatuses?: number[];   // Lista de status para retry
  retryOnNetworkError?: boolean;// Retry em erros de rede / aborted
  signal?: AbortSignal;         // Permite abort externo
}

export interface FetchErrorData {
  status?: number;
  statusText?: string;
  body?: unknown;
  url?: string;
  attempt: number;
  retries: number;
  message: string;
  cause?: unknown;
}

export class FetchClientError extends Error {
  data: FetchErrorData;
  constructor(message: string, data: FetchErrorData) {
    super(message);
    this.name = 'FetchClientError';
    this.data = data;
  }
}

const DEFAULT_RETRY_STATUSES = [429, 500, 502, 503, 504];

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

function computeDelay(base: number, attempt: number) {
  // Exponential backoff + jitter
  const exp = base * Math.pow(2, attempt - 1);
  const jitter = Math.random() * (exp * 0.2); // 0–20%
  return Math.min(exp + jitter, 30_000); // Cap 30s
}

async function parseJsonSafe(res: Response) {
  const text = await res.text().catch(() => '');
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text; // fallback texto cru
  }
}

export async function resilientFetch(input: RequestInfo | URL, opts: FetchClientOptions = {}): Promise<Response> {
  const {
    timeoutMs = 10_000,
    retries = 2,
    retryDelayBaseMs = 250,
    retryOnStatuses = DEFAULT_RETRY_STATUSES,
    retryOnNetworkError = true,
    signal: externalSignal,
    ...init
  } = opts;

  let attempt = 0;
  let lastError: unknown;

  const controller = new AbortController();
  const signals: AbortSignal[] = [controller.signal];
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    }
    externalSignal.addEventListener('abort', () => controller.abort(externalSignal.reason));
    signals.push(externalSignal);
  }

  const mergedInit: RequestInit = { ...init, signal: controller.signal };

  const startAll = performance.now?.() ?? Date.now();
  // (reservado para futura coleta agregada se necessário)
  while (attempt <= retries) {
    attempt++;
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    try {
      // Timeout
      timeoutHandle = setTimeout(() => controller.abort('timeout'), timeoutMs);
      const res = await fetch(input, mergedInit);
      clearTimeout(timeoutHandle);

      if (retryOnStatuses.includes(res.status) && attempt <= retries) {
        const delay = computeDelay(retryDelayBaseMs, attempt);
        await sleep(delay);
        continue; // retry
      }
      if (!res.ok) {
        const body = await parseJsonSafe(res);
        throw new FetchClientError(`HTTP ${res.status}`, {
          status: res.status,
          statusText: res.statusText,
            body,
          url: typeof input === 'string' ? input : (input as Request).url,
          attempt,
          retries,
          message: `Request failed with status ${res.status}`
        });
      }
  // sucesso
      // Emitir evento de sucesso
      emitFetchMetrics({
        input,
        status: res.status,
        ok: true,
        attempt,
        retries,
        errorType: undefined,
        startedAt: startAll,
      });
      return res;
    } catch (err: unknown) {
      clearTimeout(timeoutHandle);
      const e = err as Record<string, unknown> | undefined;
      const isAbort = (e && e['name']) === 'AbortError';
      const code = (e && e['code']) as string | undefined;
      const networkLike = isAbort || code === 'ECONNRESET' || code === 'ENOTFOUND';
      const canRetry = networkLike && retryOnNetworkError && attempt <= retries;
      lastError = err;
      if (canRetry) {
        const delay = computeDelay(retryDelayBaseMs, attempt);
        await sleep(delay);
        continue;
      }
      // Wrap erro final
      if (!(err instanceof FetchClientError)) {
        const msg = (err as Error)?.message || 'Network error';
        throw new FetchClientError(msg, {
          attempt,
          retries,
          message: msg,
          cause: err,
          url: typeof input === 'string' ? input : (input as Request).url,
        });
      }
      throw err; // já normalizado
    }
  }

  // Teoricamente não chega aqui, mas fallback
  throw new FetchClientError('Exhausted retries', {
    attempt,
    retries,
    message: 'Exhausted retries',
    cause: lastError,
    url: typeof input === 'string' ? input : (input as Request).url,
  });
}

interface FetchMetricsEventDetail {
  url: string;
  method?: string;
  status?: number;
  ok: boolean;
  attempt: number; // tentativa em que concluiu (sucesso ou erro final)
  retries: number; // máximo configurado
  retriesPerformed: number; // attempt-1 no final
  durationMs: number;
  errorType?: string; // http | timeout | network | abort | unknown
  startedAt: number;
  endedAt: number;
}

function emitFetchMetrics(params: { input: RequestInfo | URL; status?: number; ok: boolean; attempt: number; retries: number; errorType?: string; startedAt: number; }) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') {
    return; // SSR safe
  }
  const endedAt = performance.now?.() ?? Date.now();
  const url = typeof params.input === 'string' ? params.input : (params.input as Request).url;
  const method = (params.input instanceof Request) ? params.input.method : undefined;
  const detail: FetchMetricsEventDetail = {
    url,
    method,
    status: params.status,
    ok: params.ok,
    attempt: params.attempt,
    retries: params.retries,
    retriesPerformed: params.attempt - 1,
    durationMs: endedAt - params.startedAt,
    errorType: params.errorType,
    startedAt: params.startedAt,
    endedAt,
  };
  try {
    window.dispatchEvent(new CustomEvent('fetch:metrics', { detail }));
  } catch {
    // swallow - nunca quebrar fluxo
  }
}

// Helper conveniência para JSON
export async function fetchJson<T = unknown>(input: RequestInfo | URL, opts?: FetchClientOptions): Promise<T> {
  const res = await resilientFetch(input, {
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', ...(opts?.headers || {}) },
    ...opts,
  });
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new FetchClientError('Falha ao parsear JSON', {
      attempt: 1,
      retries: opts?.retries ?? 2,
      message: 'Falha ao parsear JSON',
      url: typeof input === 'string' ? input : (input as Request).url,
    });
  }
  return data as T;
}
