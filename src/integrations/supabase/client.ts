
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { logger } from '@/services/logger';

// Read mode from environment (cloud, local, or hybrid)
const MODE = (import.meta.env.VITE_SUPABASE_MODE || 'cloud').toLowerCase();

// Cloud credentials (used for auth in hybrid mode, or everything in cloud mode)
const CLOUD_URL = (import.meta.env.VITE_SUPABASE_CLOUD_URL || import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_PROJECT_ID && `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`) as string | undefined;
const CLOUD_ANON_KEY = (import.meta.env.VITE_SUPABASE_CLOUD_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

// Local credentials (used for data in hybrid mode, or everything in local mode)
const LOCAL_URL = (import.meta.env.VITE_SUPABASE_LOCAL_URL || 'http://127.0.0.1:54321') as string;
const LOCAL_ANON_KEY = (import.meta.env.VITE_SUPABASE_LOCAL_ANON_KEY || '') as string | undefined;

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
	
	if (!authUrl || !authKey) {
		logger.warn('[Supabase] Hybrid mode: Missing cloud credentials (VITE_SUPABASE_CLOUD_URL or VITE_SUPABASE_CLOUD_ANON_KEY)');
	}
} else if (MODE === 'local') {
	// Local mode: Everything local
	authUrl = LOCAL_URL;
	authKey = LOCAL_ANON_KEY;
	dataUrl = LOCAL_URL;
	dataKey = LOCAL_ANON_KEY;
	
	if (!dataKey) {
		logger.warn('[Supabase] Local mode: Missing local credentials (VITE_SUPABASE_LOCAL_ANON_KEY). Run: npm run supabase:status');
	}
} else {
	// Cloud mode (default): Everything cloud
	authUrl = CLOUD_URL;
	authKey = CLOUD_ANON_KEY;
	dataUrl = CLOUD_URL;
	dataKey = CLOUD_ANON_KEY;
	
	if (!authUrl || !authKey) {
		logger.warn('[Supabase] Cloud mode: Missing cloud credentials (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY)');
	}
}

// Create clients
// Cliente para autenticação (cloud em modo híbrido, local em modo local, cloud em modo cloud)
export const supabaseAuth = createClient<Database>(
	authUrl ?? '',
	authKey ?? ''
);

// Cliente para dados (local em modo híbrido, local em modo local, cloud em modo cloud)
// Em modo híbrido, sincronizamos o token de autenticação do cloud para o local
export const supabaseData = createClient<Database>(
	dataUrl ?? '',
	dataKey ?? ''
);

// Cliente legado (para compatibilidade) - usa o mesmo que dataUrl/dataKey
export const supabase = createClient<Database>(
	dataUrl ?? '',
	dataKey ?? ''
);

// Sincronizar token de autenticação do cloud para o local em modo híbrido
// NOTA: Código mantido para uso futuro, mas atualmente usando Cloud para tudo
if (MODE === 'hybrid' && dataUrl !== authUrl) {
	// Listener para sincronizar tokens quando a sessão mudar
	// Só executa se realmente estiver usando Local para dados
	supabaseAuth.auth.onAuthStateChange(async (_event, session) => {
		if (session?.access_token) {
			try {
				await supabaseData.auth.setSession({
					access_token: session.access_token,
					refresh_token: session.refresh_token || '',
				});
			} catch (err) {
				if (import.meta.env.DEV) {
					logger.warn('[Supabase] Token do Cloud não é válido no Local. Configure JWT secret compartilhado ou use Cloud para tudo.');
				}
			}
		} else {
			await supabaseData.auth.signOut().catch(() => {
				// Ignorar erros ao limpar sessão
			});
		}
	});
}

// Log mode for debugging
if (import.meta.env.DEV) {
	logger.info(`[Supabase] Mode: ${MODE}`, {
		auth: authUrl ? 'configured' : 'missing',
		data: dataUrl ? 'configured' : 'missing',
	});
}
