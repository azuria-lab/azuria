/**
 * Evolution Store
 * 
 * Armazena eventos de evolução da IA com persistência no Supabase.
 * Mantém cache em memória para performance com fallback para persistência.
 */

import { supabase } from '../integrations/supabase/client';

// Helper para tabelas não tipadas no schema
const untypedFrom = (table: string) => {
  // @ts-expect-error - No overload matches this call
  return supabase.from(table);
};

// ============================================================================
// Types
// ============================================================================

export type EvolutionEventType = 'learning' | 'pattern' | 'insight' | 'memory' | 'query';

export interface EvolutionEntry {
  id: string;
  type: EvolutionEventType;
  payload: Record<string, unknown>;
  created_at: number;
}

export interface EvolutionSnapshot {
  id: string;
  snapshot: Record<string, unknown>;
  created_at: number;
}

// ============================================================================
// In-Memory Cache (para performance)
// ============================================================================

const eventsCache: EvolutionEntry[] = [];
const snapshotsCache: EvolutionSnapshot[] = [];
const MAX_CACHE_SIZE = 300;
const MAX_SNAPSHOTS = 100;

// Flag para indicar se está usando Supabase ou apenas memória
let useSupabase = true;

// ============================================================================
// Supabase Operations
// ============================================================================

async function persistEvent(entry: EvolutionEntry): Promise<void> {
  if (!useSupabase) {return;}
  
  try {
    const { error } = await untypedFrom('evolution_events').insert({
      id: entry.id,
      type: entry.type,
      payload: entry.payload,
      created_at: new Date(entry.created_at).toISOString(),
    });
    
    if (error) {
      // Se tabela não existe, desabilita Supabase silenciosamente
      if (error.code === '42P01') {
        useSupabase = false;
      }
    }
  } catch {
    // Fallback silencioso para memória
    useSupabase = false;
  }
}

async function persistSnapshot(snap: EvolutionSnapshot): Promise<void> {
  if (!useSupabase) {return;}
  
  try {
    const { error } = await untypedFrom('evolution_snapshots').insert({
      id: snap.id,
      snapshot: snap.snapshot,
      created_at: new Date(snap.created_at).toISOString(),
    });
    
    if (error?.code === '42P01') {
      useSupabase = false;
    }
  } catch {
    useSupabase = false;
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Adiciona um evento de evolução
 */
export function addEvolutionEvent(
  type: EvolutionEventType, 
  payload: Record<string, unknown>
): EvolutionEntry {
  const entry: EvolutionEntry = {
    id: `evo_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    type,
    payload,
    created_at: Date.now(),
  };
  
  // Adicionar ao cache (início para ordem decrescente)
  eventsCache.unshift(entry);
  
  // Limitar tamanho do cache
  if (eventsCache.length > MAX_CACHE_SIZE) {
    eventsCache.pop();
  }
  
  // Persistir assincronamente (fire and forget)
  persistEvent(entry).catch(() => {
    // Silencioso - já está no cache
  });
  
  return entry;
}

/**
 * Lista eventos de evolução
 */
export function listEvolutionEvents(limit = 50): EvolutionEntry[] {
  return eventsCache.slice(0, Math.min(limit, MAX_CACHE_SIZE));
}

/**
 * Adiciona um snapshot de evolução
 */
export function addEvolutionSnapshot(snapshot: Record<string, unknown>): EvolutionSnapshot {
  const snap: EvolutionSnapshot = {
    id: `snap_${Date.now()}`,
    snapshot,
    created_at: Date.now(),
  };
  
  snapshotsCache.unshift(snap);
  
  if (snapshotsCache.length > MAX_SNAPSHOTS) {
    snapshotsCache.pop();
  }
  
  // Persistir assincronamente
  persistSnapshot(snap).catch(() => {
    // Silencioso
  });
  
  return snap;
}

/**
 * Lista snapshots de evolução
 */
export function listEvolutionSnapshots(limit = 20): EvolutionSnapshot[] {
  return snapshotsCache.slice(0, Math.min(limit, MAX_SNAPSHOTS));
}

/**
 * Carrega eventos do Supabase para o cache (para inicialização)
 */
export async function loadEventsFromStorage(limit = 100): Promise<void> {
  if (!useSupabase) {return;}
  
  try {
    // @ts-expect-error - Type instantiation is excessively deep
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await untypedFrom('evolution_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (result.error) {
      if (result.error.code === '42P01') {
        useSupabase = false;
      }
      return;
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = result.data as any[];
    if (data && data.length > 0) {
      // Limpar cache e carregar do storage
      eventsCache.length = 0;
      for (const row of data) {
        eventsCache.push({
          id: row.id,
          type: row.type as EvolutionEventType,
          payload: row.payload as Record<string, unknown>,
          created_at: new Date(row.created_at).getTime(),
        });
      }
    }
  } catch {
    useSupabase = false;
  }
}

/**
 * Retorna estatísticas do store
 */
export function getEvolutionStats(): {
  eventsCount: number;
  snapshotsCount: number;
  usingSupabase: boolean;
  oldestEvent?: number;
  newestEvent?: number;
} {
  return {
    eventsCount: eventsCache.length,
    snapshotsCount: snapshotsCache.length,
    usingSupabase: useSupabase,
    oldestEvent: eventsCache.at(-1)?.created_at,
    newestEvent: eventsCache[0]?.created_at,
  };
}

