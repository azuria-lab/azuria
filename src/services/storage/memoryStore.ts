import type { KeyValueStore } from './types';

export class MemoryStore<T extends { id: string }> implements KeyValueStore<T> {
  private map = new Map<string, T>();

  async get(id: string): Promise<T | undefined> {
    return this.map.get(id);
  }

  async put(value: T): Promise<void> {
    this.map.set(value.id, value);
  }

  async delete(id: string): Promise<void> {
    this.map.delete(id);
  }

  async getAll(): Promise<T[]> {
    return Array.from(this.map.values());
  }
}
