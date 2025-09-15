import { IndexedDbStore } from './indexedDbStore.ts';
import { MemoryStore } from './memoryStore.ts';
import type { KeyValueStore, StoreOptions } from './types.ts';

export function createStore<T extends { id: string }>(storeName: string, options?: StoreOptions): KeyValueStore<T> {
  const hasIndexedDb = typeof indexedDB !== 'undefined';
  if (hasIndexedDb) {
    return new IndexedDbStore<T>(storeName, options);
  }
  return new MemoryStore<T>();
}

export * from './types';
