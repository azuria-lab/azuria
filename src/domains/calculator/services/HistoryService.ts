// History service for calculation storage and retrieval
import type { CalculationHistory, CalculationResult } from '../types/calculator';
import { logger } from '@/services/logger';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export class HistoryService {
  private static readonly STORAGE_KEY = 'calculator_history';
  private static readonly MAX_HISTORY_ITEMS = 50;

  static async saveCalculation(
    result: CalculationResult,
    params: {
      cost: string;
      otherCosts: string;
      shipping: string;
      margin: number;
      tax: string;
      cardFee: string;
      includeShipping?: boolean;
    },
    userId?: string
  ): Promise<CalculationHistory> {
    const historyItem: CalculationHistory = {
      id: this.generateId(),
      date: new Date(),
      cost: params.cost,
      otherCosts: params.otherCosts,
      shipping: params.shipping,
      margin: params.margin,
      tax: params.tax,
      cardFee: params.cardFee,
      includeShipping: params.includeShipping,
      result
    };

    try {
      // Try Supabase first if available
      if (userId && this.isSupabaseAvailable()) {
        await this.saveToSupabase(historyItem);
      } else {
        // Fallback to localStorage
        this.saveToLocalStorage(historyItem);
      }
      
      return historyItem;
    } catch (error) {
      logger.error('Failed to save to remote, falling back to localStorage:', error);
      this.saveToLocalStorage(historyItem);
      return historyItem;
    }
  }

  static async getHistory(userId?: string): Promise<CalculationHistory[]> {
    try {
      if (userId && this.isSupabaseAvailable()) {
        return await this.getFromSupabase(userId);
      } else {
        return this.getFromLocalStorage();
      }
    } catch (error) {
      logger.error('Failed to get history from remote, falling back to localStorage:', error);
      return this.getFromLocalStorage();
    }
  }

  static async deleteHistoryItem(id: string, userId?: string): Promise<void> {
    try {
      if (userId && this.isSupabaseAvailable()) {
        await this.deleteFromSupabase(id);
      } else {
        this.deleteFromLocalStorage(id);
      }
    } catch (error) {
      logger.error('Failed to delete from remote, falling back to localStorage:', error);
      this.deleteFromLocalStorage(id);
    }
  }

  static async clearHistory(userId?: string): Promise<void> {
    try {
      if (userId && this.isSupabaseAvailable()) {
        await this.clearFromSupabase(userId);
      } else {
        this.clearFromLocalStorage();
      }
    } catch (error) {
      logger.error('Failed to clear remote history, falling back to localStorage:', error);
      this.clearFromLocalStorage();
    }
  }

  // Local storage methods
  private static saveToLocalStorage(item: CalculationHistory): void {
    const history = this.getFromLocalStorage();
    history.unshift(item);
    
    // Keep only the most recent items
    const trimmedHistory = history.slice(0, this.MAX_HISTORY_ITEMS);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedHistory));
  }

  private static getFromLocalStorage(): CalculationHistory[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private static deleteFromLocalStorage(id: string): void {
    const history = this.getFromLocalStorage();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  private static clearFromLocalStorage(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Supabase methods (placeholders for future implementation)
  private static async saveToSupabase(item: CalculationHistory): Promise<void> {
    // Map to DB schema
    const payload = {
      user_id: (await supabase.auth.getUser()).data.user?.id ?? null,
      cost: item.cost,
      margin: item.margin,
      tax: item.tax,
      card_fee: item.cardFee,
      shipping: item.shipping,
      other_costs: item.otherCosts,
      include_shipping: item.includeShipping ?? false,
      result: (item.result as unknown as Json),
      date: new Date().toISOString()
    };

    const { error } = await supabase.from('calculation_history').insert(payload);
    if (error) {throw error;}
  }

  private static async getFromSupabase(userId: string): Promise<CalculationHistory[]> {
    const { data, error } = await supabase
      .from('calculation_history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(50);

    if (error) {throw error;}

    type Row = {
      id: string;
      date: string;
      cost: string | null;
      margin: number | null;
      tax: string | null;
      card_fee: string | null;
      shipping: string | null;
      other_costs: string | null;
      include_shipping: boolean | null;
      result: unknown;
    };
    return (data || []).map((row: Row) => ({
      id: row.id,
      date: new Date(row.date),
      cost: String(row.cost ?? ''),
      margin: Number(row.margin ?? 0),
      tax: row.tax ?? '',
      cardFee: row.card_fee ?? '',
      shipping: row.shipping ?? '',
      otherCosts: row.other_costs ?? '',
      includeShipping: !!row.include_shipping,
      result: row.result as unknown as CalculationResult,
    }));
  }

  private static async deleteFromSupabase(id: string): Promise<void> {
    const { error } = await supabase
      .from('calculation_history')
      .delete()
      .eq('id', id);
    if (error) {throw error;}
  }

  private static async clearFromSupabase(userId: string): Promise<void> {
    const { error } = await supabase
      .from('calculation_history')
      .delete()
      .eq('user_id', userId);
    if (error) {throw error;}
  }

  // Utility methods
  private static generateId(): string {
    return `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static isSupabaseAvailable(): boolean {
    const env = (import.meta as ImportMeta).env as unknown as { VITE_SUPABASE_URL?: string; VITE_SUPABASE_PROJECT_ID?: string; VITE_SUPABASE_ANON_KEY?: string; VITE_SUPABASE_PUBLISHABLE_KEY?: string };
    const hasUrl = Boolean(env?.VITE_SUPABASE_URL || env?.VITE_SUPABASE_PROJECT_ID);
    const hasKey = Boolean(env?.VITE_SUPABASE_ANON_KEY || env?.VITE_SUPABASE_PUBLISHABLE_KEY);
    return hasUrl && hasKey;
  }
}
