
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// =============================================================================
// TYPE-CHECK DETECTION (Simplified)
// =============================================================================

/**
 * Detecta se estamos em ambiente de type-check de forma simples
 * Usa variáveis de ambiente definidas pelo script de type-check
 */
function detectTypeCheckMode(): boolean {
	// Verificar no Node.js (type-check roda no Node)
	if (typeof process !== 'undefined' && process.env) {
		const env = process.env;
		if (
			env.TSC === 'true' ||
			env.TYPESCRIPT === 'true' ||
			env.NODE_ENV === 'type-check' ||
			env.TSC_COMPILE_ON_ERROR === 'true'
		) {
			return true;
		}
	}
	
	// No browser, nunca é type-check
	if (globalThis.window !== undefined) {
		return false;
	}
	
	// Em ambiente sem window e sem indicadores, assumir type-check por segurança
	return typeof process === 'undefined';
}

const isTypeCheck = detectTypeCheckMode();

// =============================================================================
// ENVIRONMENT VARIABLES
// =============================================================================

/**
 * Obtém variável de ambiente de forma segura
 */
function getEnvVar(key: string, defaultValue = ''): string {
	if (isTypeCheck) {
		return defaultValue;
	}
	
	try {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore - import.meta só existe em runtime Vite
		const env = import.meta?.env;
		const value = env?.[key];
		if (value !== undefined && value !== null) {
			return String(value);
		}
		return defaultValue;
	} catch {
		return defaultValue;
	}
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const MODE = isTypeCheck ? 'cloud' : getEnvVar('VITE_SUPABASE_MODE', 'cloud').toLowerCase();

// Cloud credentials with fallbacks
const CLOUD_URL = isTypeCheck ? undefined : (
	getEnvVar('VITE_SUPABASE_CLOUD_URL') || 
	getEnvVar('VITE_SUPABASE_URL') || 
	'https://crpzkppsriranmeumfqs.supabase.co'
);

const CLOUD_ANON_KEY = isTypeCheck ? undefined : (
	getEnvVar('VITE_SUPABASE_CLOUD_ANON_KEY') || 
	getEnvVar('VITE_SUPABASE_ANON_KEY') || 
	getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') ||
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycHprcHBzcmlyYW5tZXVtZnFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1ODkwNjcsImV4cCI6MjA3MjE2NTA2N30.OB2LjijKKxDJMg4zwv-ky-u2yH4MUbeUpe-YPi37WnM'
);

// Local credentials
const LOCAL_URL = isTypeCheck ? 'http://127.0.0.1:54321' : getEnvVar('VITE_SUPABASE_LOCAL_URL', 'http://127.0.0.1:54321');
const LOCAL_ANON_KEY = isTypeCheck ? undefined : getEnvVar('VITE_SUPABASE_LOCAL_ANON_KEY', '');

// Determine URLs based on mode
let finalUrl: string | undefined;
let finalKey: string | undefined;

if (MODE === 'local') {
	finalUrl = LOCAL_URL;
	finalKey = LOCAL_ANON_KEY;
} else {
	// Cloud mode (default, also used for hybrid)
	finalUrl = CLOUD_URL;
	finalKey = CLOUD_ANON_KEY;
}

// =============================================================================
// CLIENT OPTIONS
// =============================================================================

/**
 * Obtém storage de forma segura
 */
function getStorage(): Storage | undefined {
	if (globalThis.window !== undefined) {
		return globalThis.localStorage;
	}
	return undefined;
}

/**
 * Fetch com timeout
 */
function createTimeoutFetch() {
	if (isTypeCheck) {
		return undefined;
	}
	
	return (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 60000);

		let signal = controller.signal;
		if (options?.signal) {
			const existingSignal = options.signal;
			const combinedController = new AbortController();
			existingSignal.addEventListener('abort', () => combinedController.abort());
			controller.signal.addEventListener('abort', () => combinedController.abort());
			signal = combinedController.signal;
		}

		return fetch(url, { ...options, signal }).finally(() => clearTimeout(timeoutId));
	};
}

const clientOptions = {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
		storage: getStorage(),
	},
	global: {
		headers: { 'x-client-info': 'azuria-web' },
		fetch: createTimeoutFetch(),
	},
	db: { schema: 'public' as const },
	realtime: { params: { eventsPerSecond: 10 } },
};

// =============================================================================
// MOCK OPTIONS FOR TYPE-CHECK
// =============================================================================

const mockFetch = (): Promise<Response> => Promise.resolve({
	ok: false,
	status: 0,
	statusText: 'Type-check mode',
	url: '',
	headers: new Headers(),
	json: () => Promise.resolve({}),
	text: () => Promise.resolve(''),
	blob: () => Promise.resolve(new Blob()),
	arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
	clone: function() { return this; },
	body: null,
	bodyUsed: false,
	redirected: false,
	type: 'error' as ResponseType,
} as Response);

const mockOptions = {
	auth: {
		persistSession: false,
		autoRefreshToken: false,
		detectSessionInUrl: false,
		storage: undefined,
	},
	global: { headers: {}, fetch: mockFetch },
	db: { schema: 'public' as const },
	realtime: { params: { eventsPerSecond: 0 } },
};

// =============================================================================
// CLIENT CREATION
// =============================================================================

let supabaseInstance: SupabaseClient<Database>;

if (isTypeCheck) {
	// Durante type-check, criar cliente mock
	const mockUrl = 'http://127.0.0.1:0';
	const mockKey = 'mock-key';
	supabaseInstance = createClient<Database>(mockUrl, mockKey, mockOptions);
} else {
	// Em runtime, criar cliente real
	supabaseInstance = createClient<Database>(
		finalUrl ?? '',
		finalKey ?? '',
		clientOptions
	);
}

// =============================================================================
// EXPORTS
// =============================================================================

// Exportar instância única com aliases para compatibilidade
// Todos apontam para a mesma instância para evitar "Multiple GoTrueClient"
export const supabaseAuth = supabaseInstance;
export const supabaseData = supabaseInstance;
export const supabase = supabaseInstance;
