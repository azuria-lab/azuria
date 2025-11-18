/**
 * Utilitário de retry para operações Supabase
 * Ajuda a lidar com problemas temporários de conexão
 */

import { logger } from '@/services/logger';

export interface RetryOptions {
	maxRetries?: number;
	initialDelay?: number;
	maxDelay?: number;
	backoffMultiplier?: number;
	retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
	maxRetries: 3,
	initialDelay: 1000, // 1 segundo
	maxDelay: 10000, // 10 segundos
	backoffMultiplier: 2,
	retryableErrors: [
		'network',
		'timeout',
		'ECONNRESET',
		'ETIMEDOUT',
		'ENOTFOUND',
		'ECONNREFUSED',
		'Failed to fetch',
		'NetworkError',
		'Network request failed',
	],
};

/**
 * Verifica se um erro é retryable (pode ser tentado novamente)
 */
function isRetryableError(error: unknown): boolean {
	if (!error) { return false; }

	const errorMessage = error instanceof Error ? error.message : String(error);
	const errorString = errorMessage.toLowerCase();

	return DEFAULT_OPTIONS.retryableErrors.some(retryableError =>
		errorString.includes(retryableError.toLowerCase())
	);
}

/**
 * Calcula o delay para o próximo retry usando backoff exponencial
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
	const delay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1);
	return Math.min(delay, options.maxDelay);
}

/**
 * Executa uma operação Supabase com retry automático em caso de erros de conexão
 * 
 * @param operation Função que retorna uma Promise com o resultado da operação Supabase
 * @param options Opções de retry
 * @returns Resultado da operação ou lança o último erro se todas as tentativas falharem
 * 
 * @example
 * ```typescript
 * const { data, error } = await withRetry(
 *   () => supabase.from('users').select('*').eq('id', userId).single()
 * );
 * ```
 */
export async function withRetry<T>(
	operation: () => Promise<T>,
	options: RetryOptions = {}
): Promise<T> {
	const opts = { ...DEFAULT_OPTIONS, ...options };
	let lastError: unknown;

	for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
		try {
			const result = await operation();
			
			// Se for um objeto com propriedade 'error', verificar se é um erro retryable
			if (result && typeof result === 'object' && 'error' in result) {
				const supabaseResult = result as { error: unknown; data?: unknown };
				
				if (supabaseResult.error) {
					// Se o erro do Supabase for retryable, tentar novamente
					if (isRetryableError(supabaseResult.error)) {
						if (attempt < opts.maxRetries) {
							const delay = calculateDelay(attempt, opts);
							logger.warn(
								`[Supabase Retry] Tentativa ${attempt}/${opts.maxRetries} falhou, tentando novamente em ${delay}ms`,
								{ error: supabaseResult.error }
							);
							await new Promise(resolve => setTimeout(resolve, delay));
							continue;
						}
					}
					
					// Se não for retryable ou esgotaram as tentativas, retornar o resultado
					return result as T;
				}
			}
			
			// Sucesso
			if (attempt > 1) {
				logger.info(`[Supabase Retry] Operação bem-sucedida na tentativa ${attempt}`);
			}
			return result;
		} catch (error) {
			lastError = error;

			// Se não for um erro retryable, não tentar novamente
			if (!isRetryableError(error)) {
				logger.error('[Supabase Retry] Erro não retryable:', error);
				throw error;
			}

			// Se ainda há tentativas disponíveis, aguardar e tentar novamente
			if (attempt < opts.maxRetries) {
				const delay = calculateDelay(attempt, opts);
				logger.warn(
					`[Supabase Retry] Tentativa ${attempt}/${opts.maxRetries} falhou, tentando novamente em ${delay}ms`,
					{ error }
				);
				await new Promise(resolve => setTimeout(resolve, delay));
			} else {
				logger.error(
					`[Supabase Retry] Todas as ${opts.maxRetries} tentativas falharam`,
					{ error }
				);
			}
		}
	}

	// Se chegou aqui, todas as tentativas falharam
	throw lastError || new Error('Operação falhou após todas as tentativas');
}

/**
 * Wrapper para operações Supabase que adiciona retry automático
 * Útil para operações críticas que não podem falhar facilmente
 */
export function createRetryableSupabaseOperation<T>(
	operation: () => Promise<T>,
	options?: RetryOptions
) {
	return () => withRetry(operation, options);
}

