export interface KeyValueStore<T extends { id: string }> {
  get(id: string): Promise<T | undefined>;
  put(value: T): Promise<void>;
  delete(id: string): Promise<void>;
  getAll(): Promise<T[]>;
}

export interface StoreOptions {
  dbName?: string;
  version?: number;
}
