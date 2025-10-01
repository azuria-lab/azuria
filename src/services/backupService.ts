/**
 * Backup Service
 * Sistema de backup automático para dados críticos
 */

import React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';
import { generateSecureBackupId } from '@/utils/secureRandom';

export interface BackupConfig {
  enabled: boolean;
  interval: number; // ms
  retentionDays: number;
  includeSettings: boolean;
  includeCalculations: boolean;
  includeTemplates: boolean;
  maxBackupSize: number; // MB
}

export interface BackupData {
  id: string;
  timestamp: Date;
  size: number;
  type: 'automatic' | 'manual';
  status: 'pending' | 'completed' | 'failed';
  data: {
  userProfile?: Record<string, unknown> | null;
  settings?: Record<string, unknown>;
  calculations?: unknown[];
  templates?: unknown[];
    metadata: {
      version: string;
      userAgent: string;
      url: string;
    };
  };
  error?: string;
}

export class BackupService {
  private static instance: BackupService;
  private config: BackupConfig;
  private backupTimer?: number;
  private isRunning = false;

  private constructor() {
    this.config = {
      enabled: true,
      interval: 24 * 60 * 60 * 1000, // 24 hours
      retentionDays: 30,
      includeSettings: true,
      includeCalculations: true,
      includeTemplates: true,
      maxBackupSize: 50 // 50MB
    };
  }

  static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  /**
   * Initialize backup service
   */
  initialize(config?: Partial<BackupConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    if (this.config.enabled) {
      this.startAutomaticBackups();
  logger.info('💾 Automatic backup service started');
    }
  }

  /**
   * Create manual backup
   */
  async createBackup(type: 'automatic' | 'manual' = 'manual'): Promise<BackupData> {
    const backupId = this.generateBackupId();
    const startTime = Date.now();

    const backup: BackupData = {
      id: backupId,
      timestamp: new Date(),
      size: 0,
      type,
      status: 'pending',
      data: {
        metadata: {
          version: '1.0.0',
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      }
    };

    try {
  logger.info(`💾 Starting ${type} backup...`);

      // Get user profile
      if (this.config.includeSettings) {
        backup.data.userProfile = await this.backupUserProfile();
        backup.data.settings = await this.backupUserSettings();
      }

      // Get calculations
      if (this.config.includeCalculations) {
        backup.data.calculations = await this.backupCalculations();
      }

      // Get templates
      if (this.config.includeTemplates) {
        backup.data.templates = await this.backupTemplates();
      }

      // Calculate size
      const dataString = JSON.stringify(backup.data);
      backup.size = new Blob([dataString]).size;

      // Check size limit
      if (backup.size > this.config.maxBackupSize * 1024 * 1024) {
        throw new Error(`Backup size (${(backup.size / 1024 / 1024).toFixed(2)}MB) exceeds limit (${this.config.maxBackupSize}MB)`);
      }

      backup.status = 'completed';
      
      // Store backup
      this.storeBackup(backup);

  logger.info(`💾 Backup completed in ${Date.now() - startTime}ms`);
  logger.info(`💾 Backup size: ${(backup.size / 1024).toFixed(2)}KB`);

      return backup;
    } catch (error) {
      backup.status = 'failed';
      backup.error = error instanceof Error ? error.message : 'Unknown error';
      
  logger.error('💾 Backup failed:', error);
      this.storeBackup(backup);
      
      throw error;
    }
  }

  /**
   * Restore from backup
   */
  async restoreBackup(backupId: string): Promise<void> {
    const backup = this.getBackup(backupId);
    if (!backup) {
      throw new Error('Backup not found');
    }

    if (backup.status !== 'completed') {
      throw new Error('Cannot restore from incomplete backup');
    }

    try {
  logger.info('💾 Starting restore...');

      // This would typically restore to Supabase
      // For now, we'll just update localStorage
      if (backup.data.settings) {
        Object.entries(backup.data.settings).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });
      }

  logger.info('💾 Restore completed');
    } catch (error) {
  logger.error('💾 Restore failed:', error);
      throw error;
    }
  }

  /**
   * Get all backups
   */
  getBackups(): BackupData[] {
    try {
      const stored = localStorage.getItem('azuria-backups');
      if (!stored) {return [];}

      const parsed = JSON.parse(stored) as Array<Omit<BackupData, 'timestamp'> & { timestamp: string }>;
      return parsed.map((b) => ({
        ...b,
        timestamp: new Date(b.timestamp)
      }));
    } catch {
      return [];
    }
  }

  /**
   * Get specific backup
   */
  getBackup(backupId: string): BackupData | null {
    const backups = this.getBackups();
    return backups.find(b => b.id === backupId) || null;
  }

  /**
   * Delete backup
   */
  deleteBackup(backupId: string): boolean {
    const backups = this.getBackups();
    const index = backups.findIndex(b => b.id === backupId);
    
    if (index === -1) {return false;}
    
    backups.splice(index, 1);
    this.saveBackups(backups);
    return true;
  }

  /**
   * Clean old backups
   */
  cleanOldBackups(): number {
    const backups = this.getBackups();
    const cutoff = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
    
    const oldBackups = backups.filter(b => b.timestamp.getTime() < cutoff);
    const newBackups = backups.filter(b => b.timestamp.getTime() >= cutoff);
    
    if (oldBackups.length > 0) {
      this.saveBackups(newBackups);
  logger.info(`💾 Cleaned ${oldBackups.length} old backups`);
    }
    
    return oldBackups.length;
  }

  /**
   * Export backup as file
   */
  exportBackup(backupId: string): void {
    const backup = this.getBackup(backupId);
    if (!backup) {
      throw new Error('Backup not found');
    }

    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `azuria-backup-${backup.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Import backup from file
   */
  async importBackup(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target?.result as string);
          backup.timestamp = new Date(backup.timestamp);
          
          // Validate backup structure
          if (!backup.id || !backup.data) {
            throw new Error('Invalid backup file format');
          }
          
          this.storeBackup(backup);
          resolve(backup);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Get backup statistics
   */
  getStats() {
    const backups = this.getBackups();
    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
    
    return {
      totalBackups: backups.length,
      totalSize: totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
      automaticBackups: backups.filter(b => b.type === 'automatic').length,
      manualBackups: backups.filter(b => b.type === 'manual').length,
      failedBackups: backups.filter(b => b.status === 'failed').length,
      oldestBackup: backups.length > 0 ? 
        Math.min(...backups.map(b => b.timestamp.getTime())) : null,
      newestBackup: backups.length > 0 ? 
        Math.max(...backups.map(b => b.timestamp.getTime())) : null
    };
  }

  /**
   * Stop automatic backups
   */
  stop() {
    if (this.backupTimer) {
      clearInterval(this.backupTimer);
      this.backupTimer = undefined;
    }
    this.isRunning = false;
  }

  private startAutomaticBackups() {
    if (this.isRunning) {return;}
    
    this.isRunning = true;
    
    // Clean old backups on startup
    this.cleanOldBackups();
    
    // Set up periodic backups
    this.backupTimer = window.setInterval(() => {
      if (!this.isRunning) {return;}
      
      this.createBackup('automatic').catch(error => {
        logger.error('💾 Automatic backup failed:', error);
      });
      
      // Clean old backups
      this.cleanOldBackups();
    }, this.config.interval);
  }

  private async backupUserProfile() {
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .single();
      
      return profile;
    } catch (error) {
      logger.warn('Failed to backup user profile:', error);
      return null;
    }
  }

  private async backupUserSettings() {
  const settings: Record<string, unknown> = {};
    
    // Get all localStorage items that start with our prefix
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('azuria-')) {
        try {
          settings[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          settings[key] = localStorage.getItem(key);
        }
      }
    }
    
    return settings;
  }

  private async backupCalculations() {
    try {
      const { data: calculations } = await supabase
        .from('calculation_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100); // Last 100 calculations
      
      return calculations || [];
    } catch (error) {
      logger.warn('Failed to backup calculations:', error);
      return [];
    }
  }

  private async backupTemplates() {
    try {
      const { data: templates } = await supabase
        .from('calculation_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      return templates || [];
    } catch (error) {
      logger.warn('Failed to backup templates:', error);
      return [];
    }
  }

  private storeBackup(backup: BackupData) {
    const backups = this.getBackups();
    const existingIndex = backups.findIndex(b => b.id === backup.id);
    
    if (existingIndex >= 0) {
      backups[existingIndex] = backup;
    } else {
      backups.push(backup);
    }
    
    this.saveBackups(backups);
  }

  private saveBackups(backups: BackupData[]) {
    try {
      localStorage.setItem('azuria-backups', JSON.stringify(backups));
    } catch (error) {
      logger.error('Failed to save backups:', error);
    }
  }

  private generateBackupId(): string {
    return generateSecureBackupId();
  }
}

// Global instance
export const backupService = BackupService.getInstance();

// React hook for backup management
export const useBackup = () => {
  const [backups, setBackups] = React.useState<BackupData[]>([]);
  const [isCreating, setIsCreating] = React.useState(false);
  const [stats, setStats] = React.useState(() => backupService.getStats());

  const refreshBackups = React.useCallback(() => {
    setBackups(backupService.getBackups());
    setStats(backupService.getStats());
  }, []);

  React.useEffect(() => {
    refreshBackups();
  }, [refreshBackups]);

  const createBackup = React.useCallback(async () => {
    setIsCreating(true);
    try {
      const backup = await backupService.createBackup('manual');
      refreshBackups();
      return backup;
    } finally {
      setIsCreating(false);
    }
  }, [refreshBackups]);

  const deleteBackup = React.useCallback((backupId: string) => {
    const success = backupService.deleteBackup(backupId);
    if (success) {
      refreshBackups();
    }
    return success;
  }, [refreshBackups]);

  const exportBackup = React.useCallback((backupId: string) => {
    backupService.exportBackup(backupId);
  }, []);

  const importBackup = React.useCallback(async (file: File) => {
    const backup = await backupService.importBackup(file);
    refreshBackups();
    return backup;
  }, [refreshBackups]);

  return {
    backups,
    stats,
    isCreating,
    createBackup,
    deleteBackup,
    exportBackup,
    importBackup,
    refreshBackups
  };
};