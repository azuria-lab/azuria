import { IndexedDbStore } from './indexedDbStore';
import { MemoryStore } from './memoryStore';
import type { KeyValueStore, StoreOptions } from './types';

export function createStore<T extends { id: string }>(storeName: string, options?: StoreOptions): KeyValueStore<T> {
  const hasIndexedDb = typeof indexedDB !== 'undefined';
  if (hasIndexedDb) {
    return new IndexedDbStore<T>(storeName, options);
  }
  return new MemoryStore<T>();
}

export * from './types';
