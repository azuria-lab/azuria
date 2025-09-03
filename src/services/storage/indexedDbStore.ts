import type { KeyValueStore, StoreOptions } from './types';

const DEFAULT_DB = 'azuria-offline-db';
const DEFAULT_VERSION = 1;

async function openDb(dbName: string, version: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      // Ensure the known stores exist
      const ensureStore = (name: string, keyPath: string) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath });
        }
      };
      ensureStore('calculations', 'id');
      ensureStore('templates', 'id');
      ensureStore('settings', 'key');
    };
  });
}

export class IndexedDbStore<T extends { id: string }> implements KeyValueStore<T> {
  private dbPromise: Promise<IDBDatabase>;
  private storeName: string;

  constructor(storeName: string, options: StoreOptions = {}) {
    this.storeName = storeName;
    const dbName = options.dbName ?? DEFAULT_DB;
    const version = options.version ?? DEFAULT_VERSION;
    this.dbPromise = openDb(dbName, version);
  }

  private async withStore<R>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => R): Promise<R> {
    const db = await this.dbPromise;
    const tx = db.transaction([this.storeName], mode);
    const store = tx.objectStore(this.storeName);
    const result = fn(store);
    return new Promise<R>((resolve, reject) => {
      tx.oncomplete = () => resolve(result);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  async get(id: string): Promise<T | undefined> {
    const db = await this.dbPromise;
    const tx = db.transaction([this.storeName], 'readonly');
    const store = tx.objectStore(this.storeName);
    return new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  }

  async put(value: T): Promise<void> {
    await this.withStore('readwrite', (store) => {
      store.put(value);
    });
  }

  async delete(id: string): Promise<void> {
    await this.withStore('readwrite', (store) => {
      store.delete(id);
    });
  }

  async getAll(): Promise<T[]> {
    const db = await this.dbPromise;
    const tx = db.transaction([this.storeName], 'readonly');
    const store = tx.objectStore(this.storeName);
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as T[]) ?? []);
      req.onerror = () => reject(req.error);
    });
  }
}
