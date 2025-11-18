
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Verificar se estamos em ambiente de type-check (evitar execução durante type-check)
// Durante type-check, não devemos executar código que faz conexões
// IMPORTANTE: Esta verificação deve ser feita ANTES de qualquer código que possa executar
const isTypeCheck = (() => {
	try {
		// Verificar variáveis de ambiente do TypeScript PRIMEIRO
		if (typeof process !== 'undefined') {
			// Verificar variáveis de ambiente ANTES de acessar process.argv
			if (
				process.env.TSC_COMPILE_ON_ERROR === 'true' ||
				process.env.TS_NODE_TRANSPILE_ONLY === 'true' ||
				process.env.NODE_ENV === 'type-check' ||
				process.env.TSC === 'true' ||
				process.env.TYPESCRIPT === 'true'
			) {
				return true;
			}
			
			// Verificar process.argv apenas se existir
			if (process.argv && Array.isArray(process.argv)) {
				const argv = process.argv;
				if (argv.some(arg => {
					if (typeof arg !== 'string') { return false; }
					const argLower = arg.toLowerCase();
					return argLower.includes('tsc') || 
						argLower.includes('type-check') ||
						argLower.includes('--noemit') ||
						argLower.endsWith('tsc.exe') ||
						argLower.endsWith('tsc.cmd') ||
						argLower.includes('typescript') ||
						argLower.includes('typecheck');
				})) {
					return true;
				}
			}
			
			// Verificar se não há mainModule (indicando que não é execução real)
			if (!process.mainModule && !process.argv?.some(arg => typeof arg === 'string' && (arg.includes('node') || arg.includes('vite') || arg.includes('dev')))) {
				// Se não há window/document, provavelmente é type-check
				if (typeof window === 'undefined') {
					return true;
				}
			}
		}
		
		// Se não há window/document e não é Node.js com execução real, provavelmente é type-check
		if (typeof window === 'undefined' && typeof globalThis !== 'undefined') {
			if (typeof globalThis.document === 'undefined') {
				// Se também não há process ou process não indica execução real, é type-check
				if (typeof process === 'undefined') {
					return true;
				}
				// Se process existe mas não tem indicadores de execução real
				if (typeof process !== 'undefined' && !process.mainModule) {
					const hasRuntimeIndicators = process.argv?.some(arg => 
						typeof arg === 'string' && (
							arg.includes('node') || 
							arg.includes('vite') || 
							arg.includes('dev') ||
							arg.includes('build')
						)
					);
					if (!hasRuntimeIndicators) {
						return true;
					}
				}
			}
		}
	} catch {
		// Se houver qualquer erro ao verificar, assumir que é type-check para segurança máxima
		// Isso garante que nunca tentaremos fazer conexões durante type-check
		return true;
	}
	
	return false;
})();

// Importar logger normalmente - ele não faz conexões, apenas usa console
// Mas só vamos usá-lo se não estiver em type-check
import { logger } from '@/services/logger';

// Helper para acessar import.meta.env de forma segura durante type-check
// Durante type-check, retorna valores padrão sem acessar import.meta.env
// Isso evita erros de conexão e problemas de sintaxe durante a verificação de tipos
const getEnvVar = (key: string, defaultValue: string = ''): string => {
	// Durante type-check, retornar valor padrão SEM acessar import.meta.env
	// Isso evita erros de sintaxe e tentativas de conexão
	// IMPORTANTE: Esta verificação deve ser a PRIMEIRA coisa a fazer
	if (isTypeCheck) {
		return defaultValue;
	}
	
	// Durante runtime, acessar import.meta.env usando uma função que evita análise estática
	// O TypeScript não analisará este código durante type-check porque está dentro de um if
	// Mas ainda precisamos proteger contra execução acidental
	try {
		// Só executar se NÃO estiver em type-check (verificação dupla)
		if (!isTypeCheck) {
			// Usar Function constructor para evitar análise estática durante type-check
			// eslint-disable-next-line no-new-func
			const getMetaEnvValue = new Function(`
				try {
					// @ts-ignore - import.meta só existe em runtime
					if (typeof import !== 'undefined' && import.meta && import.meta.env) {
						return import.meta.env;
					}
					return undefined;
				} catch {
					return undefined;
				}
			`);
			
			const metaEnv = getMetaEnvValue() as Record<string, unknown> | undefined;
			if (metaEnv && typeof metaEnv[key] !== 'undefined') {
				return String(metaEnv[key]);
			}
		}
		return defaultValue;
	} catch {
		// Em caso de qualquer erro, retornar valor padrão
		return defaultValue;
	}
};

// Read mode from environment (cloud, local, or hybrid)
// Durante type-check, usar 'cloud' como padrão sem acessar import.meta.env
const MODE = isTypeCheck 
	? 'cloud' 
	: (getEnvVar('VITE_SUPABASE_MODE', 'cloud')).toLowerCase();

// Cloud credentials (used for auth in hybrid mode, or everything in cloud mode)
// Durante type-check, usar undefined sem acessar import.meta.env
const CLOUD_URL = isTypeCheck
	? undefined
	: (getEnvVar('VITE_SUPABASE_CLOUD_URL') || 
	   getEnvVar('VITE_SUPABASE_URL') || 
	   (getEnvVar('VITE_SUPABASE_PROJECT_ID') && `https://${getEnvVar('VITE_SUPABASE_PROJECT_ID')}.supabase.co`)) as string | undefined;
const CLOUD_ANON_KEY = isTypeCheck
	? undefined
	: (getEnvVar('VITE_SUPABASE_CLOUD_ANON_KEY') || 
	   getEnvVar('VITE_SUPABASE_ANON_KEY') || 
	   getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY')) as string | undefined;

// Local credentials (used for data in hybrid mode, or everything in local mode)
// Durante type-check, usar valores padrão sem acessar import.meta.env
const LOCAL_URL = isTypeCheck
	? 'http://127.0.0.1:54321'
	: (getEnvVar('VITE_SUPABASE_LOCAL_URL', 'http://127.0.0.1:54321')) as string;
const LOCAL_ANON_KEY = isTypeCheck
	? undefined
	: (getEnvVar('VITE_SUPABASE_LOCAL_ANON_KEY', '')) as string | undefined;

// Determine URLs and keys based on mode
let authUrl: string | undefined;
let authKey: string | undefined;
let dataUrl: string | undefined;
let dataKey: string | undefined;

if (MODE === 'hybrid') {
	// Hybrid mode: Cloud for auth, Cloud for data
	// NOTA: Modo híbrido real (Local para dados) requer JWT secret compartilhado
	// Por enquanto, usando Cloud para tudo para evitar problemas de autenticação
	authUrl = CLOUD_URL;
	authKey = CLOUD_ANON_KEY;
	dataUrl = CLOUD_URL; // Usando Cloud para dados (mais simples e confiável)
	dataKey = CLOUD_ANON_KEY;
	
	if ((!authUrl || !authKey) && !isTypeCheck) {
		logger.warn('[Supabase] Hybrid mode: Missing cloud credentials (VITE_SUPABASE_CLOUD_URL or VITE_SUPABASE_CLOUD_ANON_KEY)');
	}
} else if (MODE === 'local') {
	// Local mode: Everything local
	authUrl = LOCAL_URL;
	authKey = LOCAL_ANON_KEY;
	dataUrl = LOCAL_URL;
	dataKey = LOCAL_ANON_KEY;
	
	if (!dataKey && !isTypeCheck) {
		logger.warn('[Supabase] Local mode: Missing local credentials (VITE_SUPABASE_LOCAL_ANON_KEY). Run: npm run supabase:status');
	}
} else {
	// Cloud mode (default): Everything cloud
	authUrl = CLOUD_URL;
	authKey = CLOUD_ANON_KEY;
	dataUrl = CLOUD_URL;
	dataKey = CLOUD_ANON_KEY;
	
	if ((!authUrl || !authKey) && !isTypeCheck) {
		logger.warn('[Supabase] Cloud mode: Missing cloud credentials (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY)');
	}
}

// Configurações de conexão para evitar travamentos e perda de conexão
const clientOptions = {
	auth: {
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true,
		storage: typeof window !== 'undefined' ? window.localStorage : undefined,
	},
	global: {
		headers: {
			'x-client-info': 'azuria-web',
		},
		// Timeout de 60 segundos para requisições
		// Evitar fetch customizado durante type-check (usar fetch padrão)
		fetch: isTypeCheck ? undefined : (url: RequestInfo | URL, options?: RequestInit) => {
			// Criar um AbortController para timeout
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos

			// Combinar o signal existente com o nosso timeout
			let signal = controller.signal;
			if (options?.signal) {
				// Se já existe um signal, criar um novo que aborta quando qualquer um abortar
				const existingSignal = options.signal;
				const combinedController = new AbortController();
				
				// Abortar quando qualquer um dos signals abortar
				existingSignal.addEventListener('abort', () => combinedController.abort());
				controller.signal.addEventListener('abort', () => combinedController.abort());
				
				signal = combinedController.signal;
			}

			return fetch(url, {
				...options,
				signal,
			}).finally(() => {
				clearTimeout(timeoutId);
			});
		},
	},
	// Configurações de retry automático
	db: {
		schema: 'public' as const,
	},
	realtime: {
		params: {
			eventsPerSecond: 10,
		},
	},
};

// Create clients
// Durante type-check, criar clientes "mock" que não fazem conexões reais
// Isso evita erros de conexão durante a verificação de tipos

// Declarar variáveis com tipo explícito do SupabaseClient para preservar tipos
// IMPORTANTE: Usar tipo explícito SupabaseClient<Database> para garantir que os tipos sejam preservados
// mesmo durante type-check
let supabaseAuthInstance: SupabaseClient<Database>;
let supabaseDataInstance: SupabaseClient<Database>;
let supabaseInstance: SupabaseClient<Database>;

if (isTypeCheck) {
		// Durante type-check, criar clientes com URLs mock para evitar conexões
		// IMPORTANTE: Usar URLs válidas mas que não conectam, e garantir que o tipo Database seja preservado
		// O TypeScript precisa inferir os tipos corretamente mesmo com URLs mock
		const mockUrl = 'http://127.0.0.1:0'; // Porta 0 = inválida, não conecta
		const mockKey = 'mock-key-for-type-check-only';
		
		// Criar fetch mock ANTES de qualquer outra coisa
		// Este fetch será usado por TODAS as requisições durante type-check
		const mockFetchFn = function mockFetch(): Promise<Response> {
			// Retornar uma Promise resolvida imediatamente com resposta mock
			// Nunca tentar fazer conexão real
			return Promise.resolve({
				ok: false,
				status: 0,
				statusText: 'Type-check mode - no connection',
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
		};
		
		const mockOptions = {
			auth: {
				persistSession: false,
				autoRefreshToken: false,
				detectSessionInUrl: false,
				storage: undefined, // Sem storage durante type-check
			},
			global: {
				headers: {},
				// Fetch mock que nunca faz requisições reais
				// IMPORTANTE: Este fetch é chamado ANTES de qualquer tentativa de conexão
				fetch: mockFetchFn,
			},
			db: {
				schema: 'public' as const,
			},
			realtime: {
				params: {
					eventsPerSecond: 0,
				},
			},
		};
		
		// Criar clientes com tipo explícito para preservar tipos durante type-check
		// IMPORTANTE: Não usar type assertion aqui - deixar o TypeScript inferir corretamente
		// O tipo Database será preservado automaticamente pelo createClient<Database>
		// Mesmo com URLs mock, o createClient preserva os tipos genéricos
		try {
			// Criar clientes sem type assertion para preservar tipos corretamente
			// O TypeScript inferirá os tipos corretamente do createClient<Database>
			supabaseAuthInstance = createClient<Database>(mockUrl, mockKey, mockOptions);
			supabaseDataInstance = createClient<Database>(mockUrl, mockKey, mockOptions);
			supabaseInstance = createClient<Database>(mockUrl, mockKey, mockOptions);
		} catch (_error) {
			// Se houver qualquer erro durante a criação (improvável), usar createClient com tipo explícito
			// Isso garante que os tipos sejam preservados mesmo em caso de erro
			 
			const emptyUrl = '';
			 
			const emptyKey = '';
			supabaseAuthInstance = createClient<Database>(emptyUrl, emptyKey, mockOptions);
			supabaseDataInstance = createClient<Database>(emptyUrl, emptyKey, mockOptions);
			supabaseInstance = createClient<Database>(emptyUrl, emptyKey, mockOptions);
		}
	} else {
	// Em runtime, criar clientes normais
	supabaseAuthInstance = createClient<Database>(
		authUrl ?? '',
		authKey ?? '',
		clientOptions
	);
	
	supabaseDataInstance = createClient<Database>(
		dataUrl ?? '',
		dataKey ?? '',
		clientOptions
	);
	
	supabaseInstance = createClient<Database>(
		dataUrl ?? '',
		dataKey ?? '',
		clientOptions
	);
}

// Exportar instâncias
export const supabaseAuth = supabaseAuthInstance;
export const supabaseData = supabaseDataInstance;
export const supabase = supabaseInstance;

// Sincronizar token de autenticação do cloud para o local em modo híbrido
// NOTA: Código mantido para uso futuro, mas atualmente usando Cloud para tudo
// Evitar execução durante type-check
if (!isTypeCheck && MODE === 'hybrid' && dataUrl !== authUrl) {
	// Listener para sincronizar tokens quando a sessão mudar
	// Só executa se realmente estiver usando Local para dados
	supabaseAuth.auth.onAuthStateChange(async (_event, session) => {
		if (session?.access_token) {
			try {
				await supabaseData.auth.setSession({
					access_token: session.access_token,
					refresh_token: session.refresh_token || '',
				});
			} catch (_err) {
				if (!isTypeCheck) {
					try {
						// Usar função para evitar análise estática durante type-check
						const isDev = ((): boolean => {
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore - import.meta só existe em runtime
							return import.meta?.env?.DEV === true;
						})();
						
						if (isDev) {
					logger.warn('[Supabase] Token do Cloud não é válido no Local. Configure JWT secret compartilhado ou use Cloud para tudo.');
						}
					} catch {
						// Ignorar erros ao acessar import.meta.env
					}
				}
			}
		} else {
			await supabaseData.auth.signOut().catch(() => {
				// Ignorar erros ao limpar sessão
			});
		}
	});
}

// Log mode for debugging (evitar durante type-check)
if (!isTypeCheck) {
	try {
		// Usar função para evitar análise estática durante type-check
		const isDev = ((): boolean => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore - import.meta só existe em runtime
			return import.meta?.env?.DEV === true;
		})();
		
		if (isDev) {
	logger.info(`[Supabase] Mode: ${MODE}`, {
		auth: authUrl ? 'configured' : 'missing',
		data: dataUrl ? 'configured' : 'missing',
	});
		}
	} catch {
		// Ignorar erros ao acessar import.meta.env
	}
}
