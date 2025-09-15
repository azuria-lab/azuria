/**
 * Feature Flags Service
 * Sistema de feature flags para releases controladas
 */

import React, { useMemo } from 'react';
import { logger } from '@/services/logger';

export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  percentage?: number; // Para A/B testing
  userSegments?: string[];
  startDate?: Date;
  endDate?: Date;
  dependencies?: string[];
  environment?: ('development' | 'staging' | 'production')[];
}

export interface FeatureFlagConfig {
  enabled: boolean;
  environment: 'development' | 'staging' | 'production';
  userId?: string;
  userSegment?: string;
  cacheTimeout: number; // ms
}

export class FeatureFlagsService {
  private static instance: FeatureFlagsService;
  private config: FeatureFlagConfig;
  private flags: Map<string, FeatureFlag> = new Map();
  private cache: Map<string, { value: boolean; timestamp: number }> = new Map();

  private constructor() {
    this.config = {
      enabled: true,
      environment: ((import.meta as unknown as { env?: { MODE?: 'development' | 'staging' | 'production' } })
        .env?.MODE) || 'development',
      cacheTimeout: 300000 // 5 minutes
    };
  }

  static getInstance(): FeatureFlagsService {
    if (!FeatureFlagsService.instance) {
      FeatureFlagsService.instance = new FeatureFlagsService();
    }
    return FeatureFlagsService.instance;
  }

  /**
   * Initialize feature flags
   */
  initialize(config?: Partial<FeatureFlagConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.setupDefaultFlags();
    this.loadFromStorage();

  logger.info('Feature flags initialized');
  }

  /**
   * Check if feature is enabled
   */
  isEnabled(flagKey: string, userId?: string): boolean {
    if (!this.config.enabled) {
      return true; // Default to enabled when feature flags are disabled
    }

    // Check cache first
    const cached = this.cache.get(flagKey);
    if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
      return cached.value;
    }

    const flag = this.flags.get(flagKey);
    if (!flag) {
      logger.warn(`Feature flag "${flagKey}" not found, defaulting to false`);
      return false;
    }

    const result = this.evaluateFlag(flag, userId);
    
    // Cache the result
    this.cache.set(flagKey, {
      value: result,
      timestamp: Date.now()
    });

    return result;
  }

  /**
   * Get feature flag details
   */
  getFlag(flagKey: string): FeatureFlag | undefined {
    return this.flags.get(flagKey);
  }

  /**
   * Get all flags
   */
  getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  /**
   * Set feature flag
   */
  setFlag(flag: FeatureFlag) {
    this.flags.set(flag.key, flag);
    this.saveToStorage();
    this.clearCache(flag.key);
  }

  /**
   * Enable feature
   */
  enable(flagKey: string) {
    const flag = this.flags.get(flagKey);
    if (flag) {
      flag.enabled = true;
      this.setFlag(flag);
    }
  }

  /**
   * Disable feature
   */
  disable(flagKey: string) {
    const flag = this.flags.get(flagKey);
    if (flag) {
      flag.enabled = false;
      this.setFlag(flag);
    }
  }

  /**
   * Set user context
   */
  setUserContext(userId: string, segment?: string) {
    this.config.userId = userId;
    this.config.userSegment = segment;
    this.clearAllCache();
  }

  /**
   * Get feature flags status for debugging
   */
  getDebugInfo() {
    const flags = Array.from(this.flags.entries()).map(([key, flag]) => ({
      key,
      enabled: this.isEnabled(key),
      flag: flag
    }));

    return {
      config: this.config,
      flags,
      cacheSize: this.cache.size
    };
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.cache.clear();
  }

  private evaluateFlag(flag: FeatureFlag, userId?: string): boolean {
    const currentUserId = userId || this.config.userId;

    // Check if flag is globally disabled
    if (!flag.enabled) {
      return false;
    }

    // Check environment
    if (flag.environment && !flag.environment.includes(this.config.environment)) {
      return false;
    }

    // Check date range
    const now = new Date();
    if (flag.startDate && now < flag.startDate) {
      return false;
    }
    if (flag.endDate && now > flag.endDate) {
      return false;
    }

    // Check user segments
    if (flag.userSegments && flag.userSegments.length > 0) {
      if (!this.config.userSegment || !flag.userSegments.includes(this.config.userSegment)) {
        return false;
      }
    }

    // Check percentage rollout (for A/B testing)
    if (flag.percentage !== undefined && flag.percentage < 100) {
      if (!currentUserId) {
        return Math.random() * 100 < flag.percentage;
      }
      
      // Deterministic percentage based on user ID
      const hash = this.hashString(currentUserId + flag.key);
      const userPercentage = hash % 100;
      return userPercentage < flag.percentage;
    }

    // Check dependencies
    if (flag.dependencies && flag.dependencies.length > 0) {
      return flag.dependencies.every(dep => this.isEnabled(dep, currentUserId));
    }

    return true;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private clearCache(flagKey: string) {
    this.cache.delete(flagKey);
  }

  private saveToStorage() {
    try {
      const flagsData = Array.from(this.flags.entries()).map(([key, flag]) => [
        key,
        {
          ...flag,
          startDate: flag.startDate?.toISOString(),
          endDate: flag.endDate?.toISOString()
        }
      ]);
      
      localStorage.setItem('azuria-feature-flags', JSON.stringify(flagsData));
    } catch (error) {
      logger.error('Failed to save feature flags:', error);
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('azuria-feature-flags');
      if (!stored) {return;}

      const flagsData = JSON.parse(stored) as Array<[string, Omit<FeatureFlag, 'startDate' | 'endDate'> & { startDate?: string; endDate?: string }]>;
      flagsData.forEach(([key, flagData]) => {
        this.flags.set(key, {
          ...flagData,
          startDate: flagData.startDate ? new Date(flagData.startDate) : undefined,
          endDate: flagData.endDate ? new Date(flagData.endDate) : undefined
        });
      });
    } catch (error) {
      logger.error('Failed to load feature flags from storage:', error);
    }
  }

  private setupDefaultFlags() {
    const defaultFlags: FeatureFlag[] = [
      {
        key: 'ai_gemini_integration',
        name: 'AI Gemini Integration',
        description: 'Enable Gemini AI for pricing analysis',
        enabled: true,
        environment: ['production']
      },
      {
        key: 'advanced_analytics',
        name: 'Advanced Analytics',
        description: 'Show advanced analytics dashboard',
        enabled: true,
        percentage: 100
      },
      {
        key: 'collaboration_features',
        name: 'Collaboration Features',
        description: 'Enable team collaboration features',
        enabled: true,
        userSegments: ['pro', 'premium']
      },
      {
        key: 'automation_workflows',
        name: 'Automation Workflows',
        description: 'Enable workflow automation',
        enabled: true,
        userSegments: ['premium']
      },
      {
        key: 'beta_calculator',
        name: 'Beta Calculator',
        description: 'New experimental calculator',
        enabled: false,
        percentage: 10,
        environment: ['development', 'staging']
      },
      {
        key: 'performance_monitoring',
        name: 'Performance Monitoring',
        description: 'Enable performance monitoring',
        enabled: true
      },
      {
        key: 'security_dashboard',
        name: 'Security Dashboard',
        description: 'Show security monitoring dashboard',
        enabled: true,
        userSegments: ['admin']
      },
      {
        key: 'interactive_tour',
        name: 'Interactive Tour',
        description: 'Show interactive tour for new users',
        enabled: true
      },
      {
        key: 'dark_mode',
        name: 'Dark Mode',
        description: 'Enable dark theme toggle',
        enabled: true
      },
      {
        key: 'marketplace_integration',
        name: 'Marketplace Integration',
        description: 'Connect to external marketplaces',
        enabled: false,
        environment: ['staging', 'production']
      }
    ];

    defaultFlags.forEach(flag => {
      if (!this.flags.has(flag.key)) {
        this.flags.set(flag.key, flag);
      }
    });
  }
}

// Global instance
export const featureFlags = FeatureFlagsService.getInstance();

// React hook for feature flags
export const useFeatureFlag = (flagKey: string, userId?: string) => {
  const [isEnabled, setIsEnabled] = React.useState(
    () => featureFlags.isEnabled(flagKey, userId)
  );

  React.useEffect(() => {
    // Re-check when dependencies change
    setIsEnabled(featureFlags.isEnabled(flagKey, userId));
  }, [flagKey, userId]);

  return isEnabled;
};

// React hook for multiple feature flags
export const useFeatureFlags = (flagKeys: string[], userId?: string) => {
  const [flags, setFlags] = React.useState(() => 
    flagKeys.reduce((acc, key) => {
      acc[key] = featureFlags.isEnabled(key, userId);
      return acc;
    }, {} as Record<string, boolean>)
  );

  const flagKeysKey = useMemo(() => flagKeys.join(','), [flagKeys]);

  React.useEffect(() => {
    const newFlags = flagKeys.reduce((acc, key) => {
      acc[key] = featureFlags.isEnabled(key, userId);
      return acc;
    }, {} as Record<string, boolean>);
    
    setFlags(newFlags);
    // flagKeys is represented by flagKeysKey to stabilize deps
  }, [flagKeys, flagKeysKey, userId]);

  return flags;
};

// Higher-order component for feature flags
export const withFeatureFlag = (flagKey: string) => {
  return function <P extends object>(Component: React.ComponentType<P>) {
    return function FeatureFlagWrapper(props: P) {
      const isEnabled = useFeatureFlag(flagKey);
      
      if (!isEnabled) {
        return null;
      }
      
      return React.createElement(Component, props);
    };
  };
};