/**
 * Advanced Calculator History Service
 * Handles persistence of advanced calculations with all premium features
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/logger';
import type { Json, TablesInsert } from '@/integrations/supabase/types';

// Types for Advanced Calculator History
export interface AdvancedCalculationEntry {
  id: string;
  user_id: string | null;
  date: Date;
  
  // Basic inputs
  cost: number;
  targetMargin: number;
  shipping: number;
  packaging: number;
  marketing: number;
  otherCosts: number;
  
  // Marketplace settings
  marketplaceId: string;
  paymentMethod: 'credit' | 'debit' | 'pix' | 'boleto';
  includePaymentFee: boolean;
  
  // Results
  suggestedPrice: number;
  totalMargin: number;
  netProfit: number;
  totalCost: number;
  
  // Premium features data (stored as JSONB)
  features?: {
    aiSuggestions?: unknown;
    roiMetrics?: unknown;
    discounts?: unknown;
    costBreakdown?: unknown;
    beforeAfter?: unknown;
    sensitivity?: unknown;
    scenarios?: unknown[];
  };
  
  // Metadata
  notes?: string;
  tags?: string[];
}

export interface SaveCalculationParams {
  userId?: string;
  cost: number;
  targetMargin: number;
  shipping: number;
  packaging: number;
  marketing: number;
  otherCosts: number;
  marketplaceId: string;
  paymentMethod: 'credit' | 'debit' | 'pix' | 'boleto';
  includePaymentFee: boolean;
  suggestedPrice: number;
  totalMargin: number;
  netProfit: number;
  totalCost: number;
  features?: AdvancedCalculationEntry['features'];
  notes?: string;
  tags?: string[];
}

class AdvancedCalculatorHistoryService {
  private static readonly STORAGE_KEY = 'azuria_advanced_calc_history';
  private static readonly MAX_HISTORY_ITEMS = 50;

  /**
   * Check if Supabase is available
   */
  static isSupabaseAvailable(): boolean {
    const env = import.meta.env;
    const hasUrl = Boolean(env.VITE_SUPABASE_URL || env.VITE_SUPABASE_PROJECT_ID);
    const hasKey = Boolean(env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY);
    return hasUrl && hasKey;
  }

  /**
   * Save calculation to history
   * Tries Supabase first, falls back to localStorage
   */
  static async saveCalculation(params: SaveCalculationParams): Promise<AdvancedCalculationEntry> {
    const entry: AdvancedCalculationEntry = {
      id: this.generateId(),
      user_id: params.userId || null,
      date: new Date(),
      cost: params.cost,
      targetMargin: params.targetMargin,
      shipping: params.shipping,
      packaging: params.packaging,
      marketing: params.marketing,
      otherCosts: params.otherCosts,
      marketplaceId: params.marketplaceId,
      paymentMethod: params.paymentMethod,
      includePaymentFee: params.includePaymentFee,
      suggestedPrice: params.suggestedPrice,
      totalMargin: params.totalMargin,
      netProfit: params.netProfit,
      totalCost: params.totalCost,
      features: params.features,
      notes: params.notes,
      tags: params.tags,
    };

    try {
      if (params.userId && this.isSupabaseAvailable()) {
        await this.saveToSupabase(entry);
        logger.info('[AdvancedHistory] Saved to Supabase:', entry.id);
      } else {
        this.saveToLocalStorage(entry);
        logger.info('[AdvancedHistory] Saved to localStorage:', entry.id);
      }
      return entry;
    } catch (error) {
      logger.error('[AdvancedHistory] Failed to save, falling back to localStorage:', error);
      this.saveToLocalStorage(entry);
      return entry;
    }
  }

  /**
   * Get calculation history
   */
  static async getHistory(userId?: string): Promise<AdvancedCalculationEntry[]> {
    try {
      if (userId && this.isSupabaseAvailable()) {
        return await this.getFromSupabase(userId);
      } else {
        return this.getFromLocalStorage();
      }
    } catch (error) {
      logger.error('[AdvancedHistory] Failed to get from remote, falling back to localStorage:', error);
      return this.getFromLocalStorage();
    }
  }

  /**
   * Delete single entry
   */
  static async deleteEntry(id: string, userId?: string): Promise<void> {
    try {
      if (userId && this.isSupabaseAvailable()) {
        await this.deleteFromSupabase(id);
      } else {
        this.deleteFromLocalStorage(id);
      }
    } catch (error) {
      logger.error('[AdvancedHistory] Failed to delete from remote, falling back to localStorage:', error);
      this.deleteFromLocalStorage(id);
    }
  }

  /**
   * Clear all history
   */
  static async clearHistory(userId?: string): Promise<void> {
    try {
      if (userId && this.isSupabaseAvailable()) {
        await this.clearFromSupabase(userId);
      } else {
        this.clearFromLocalStorage();
      }
    } catch (error) {
      logger.error('[AdvancedHistory] Failed to clear remote, falling back to localStorage:', error);
      this.clearFromLocalStorage();
    }
  }

  // ========== SUPABASE METHODS ==========

  private static async saveToSupabase(entry: AdvancedCalculationEntry): Promise<void> {
    const payload: TablesInsert<'advanced_calculation_history'> = {
      id: entry.id,
      user_id: entry.user_id,
      date: entry.date.toISOString(),
      cost: entry.cost,
      target_margin: entry.targetMargin,
      shipping: entry.shipping,
      packaging: entry.packaging,
      marketing: entry.marketing,
      other_costs: entry.otherCosts,
      marketplace_id: entry.marketplaceId,
      payment_method: entry.paymentMethod,
      include_payment_fee: entry.includePaymentFee,
      suggested_price: entry.suggestedPrice,
      total_margin: entry.totalMargin,
      net_profit: entry.netProfit,
      total_cost: entry.totalCost,
      features: entry.features as unknown as Json,
      notes: entry.notes,
      tags: entry.tags,
    };

    const { error } = await supabase
      .from('advanced_calculation_history')
      // @ts-expect-error - Table exists but types may not be fully synced
      .insert(payload);

    if (error) {
      throw error;
    }
  }

  private static async getFromSupabase(userId: string): Promise<AdvancedCalculationEntry[]> {
    const { data, error } = await supabase
      .from('advanced_calculation_history')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(this.MAX_HISTORY_ITEMS);

    if (error) {
      throw error;
    }

    return (data || []).map((row) => ({
      id: row.id,
      user_id: row.user_id,
      date: new Date(row.date),
      cost: row.cost,
      targetMargin: row.target_margin,
      shipping: row.shipping,
      packaging: row.packaging,
      marketing: row.marketing,
      otherCosts: row.other_costs,
      marketplaceId: row.marketplace_id,
      paymentMethod: row.payment_method as 'credit' | 'debit' | 'pix' | 'boleto',
      includePaymentFee: row.include_payment_fee,
      suggestedPrice: row.suggested_price,
      totalMargin: row.total_margin,
      netProfit: row.net_profit,
      totalCost: row.total_cost,
      features: row.features as AdvancedCalculationEntry['features'],
      notes: row.notes || undefined,
      tags: row.tags || undefined,
    }));
  }

  private static async deleteFromSupabase(id: string): Promise<void> {
    const { error } = await supabase
      .from('advanced_calculation_history')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  private static async clearFromSupabase(userId: string): Promise<void> {
    const { error } = await supabase
      .from('advanced_calculation_history')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  }

  // ========== LOCALSTORAGE METHODS ==========

  private static saveToLocalStorage(entry: AdvancedCalculationEntry): void {
    const history = this.getFromLocalStorage();
    history.unshift(entry);
    
    const trimmed = history.slice(0, this.MAX_HISTORY_ITEMS);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
  }

  private static getFromLocalStorage(): AdvancedCalculationEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return [];
      }
      
      const parsed = JSON.parse(stored);
      return parsed.map((item: AdvancedCalculationEntry) => ({
        ...item,
        date: new Date(item.date),
      }));
    } catch (error) {
      logger.error('[AdvancedHistory] Failed to parse localStorage:', error);
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

  // ========== UTILITIES ==========

  private static generateId(): string {
    return `adv_calc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

export default AdvancedCalculatorHistoryService;
