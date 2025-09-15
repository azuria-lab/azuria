// Advanced A/B Testing System
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { logger } from './logger';

interface ABTest {
  id: string;
  name: string;
  variants: ABVariant[];
  targetMetric: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  allocation: Record<string, number>; // variant -> percentage
}

interface ABVariant {
  id: string;
  name: string;
  description: string;
  config: Record<string, unknown>;
}

interface ABTestResult {
  testId: string;
  variantId: string;
  userId: string;
  assignedAt: Date;
  conversions: ABConversion[];
}

interface ABConversion {
  eventName: string;
  value?: number;
  timestamp: Date;
}

interface ABTestContextType {
  getVariant: (testId: string) => string | null;
  trackConversion: (testId: string, eventName: string, value?: number) => void;
  getTestConfig: (testId: string, variantId: string) => Record<string, unknown>;
  isInTest: (testId: string) => boolean;
  getAllActiveTests: () => ABTest[];
}

const ABTestContext = createContext<ABTestContextType | null>(null);

export function useABTest() {
  const context = useContext(ABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within ABTestProvider');
  }
  return context;
}

class ABTestingEngine {
  private tests: Map<string, ABTest> = new Map();
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> testId -> variantId
  private results: ABTestResult[] = [];
  private userId: string | null = null;

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultTests();
  }

  setUserId(userId: string) {
    this.userId = userId;
    this.loadUserAssignments();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('ab_tests');
      if (stored) {
        const data = JSON.parse(stored) as { tests: Array<Omit<ABTest, 'startDate' | 'endDate'> & { startDate: string; endDate: string }> };
        this.tests = new Map(data.tests.map((test) => [test.id, {
          ...test,
          startDate: new Date(test.startDate),
          endDate: new Date(test.endDate)
        }]));
      }
    } catch (error) {
      logger.warn('Failed to load A/B tests from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = {
        tests: Array.from(this.tests.values()).map(test => ({
          ...test,
          startDate: test.startDate.toISOString(),
          endDate: test.endDate.toISOString()
        }))
      };
      localStorage.setItem('ab_tests', JSON.stringify(data));
    } catch (error) {
      logger.warn('Failed to save A/B tests to storage:', error);
    }
  }

  private loadUserAssignments() {
    if (!this.userId) {return;}

    try {
      const stored = localStorage.getItem(`ab_assignments_${this.userId}`);
      if (stored) {
        const data = JSON.parse(stored) as Record<string, string>;
        this.userAssignments.set(this.userId, new Map(Object.entries(data)));
      }
    } catch (error) {
      logger.warn('Failed to load user assignments:', error);
    }
  }

  private saveUserAssignments() {
    if (!this.userId) {return;}

    try {
      const assignments = this.userAssignments.get(this.userId);
      if (assignments) {
        const data = Object.fromEntries(assignments);
        localStorage.setItem(`ab_assignments_${this.userId}`, JSON.stringify(data));
      }
    } catch (error) {
      logger.warn('Failed to save user assignments:', error);
    }
  }

  private initializeDefaultTests() {
    // Pricing Calculator Button Colors
    this.addTest({
      id: 'calc_button_color',
      name: 'Calculator Button Color Test',
      variants: [
        {
          id: 'blue',
          name: 'Blue Button',
          description: 'Original blue button design',
          config: { buttonColor: 'blue', className: 'bg-blue-500 hover:bg-blue-600' }
        },
        {
          id: 'green',
          name: 'Green Button',
          description: 'Green button for higher conversion',
          config: { buttonColor: 'green', className: 'bg-green-500 hover:bg-green-600' }
        },
        {
          id: 'purple',
          name: 'Purple Button',
          description: 'Purple gradient button',
          config: { buttonColor: 'purple', className: 'bg-gradient-to-r from-purple-500 to-pink-500' }
        }
      ],
      targetMetric: 'calculation_completed',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
      allocation: { blue: 40, green: 30, purple: 30 }
    });

    // Homepage Hero Text
    this.addTest({
      id: 'hero_headline',
      name: 'Homepage Hero Headline Test',
      variants: [
        {
          id: 'original',
          name: 'Original Headline',
          description: 'Current headline text',
          config: { 
            headline: 'Precificação Inteligente para Seu Negócio',
            subheadline: 'Calcule preços estratégicos com nossa IA avançada'
          }
        },
        {
          id: 'benefit_focused',
          name: 'Benefit-Focused',
          description: 'Focus on business benefits',
          config: { 
            headline: 'Aumente Seus Lucros em até 30%',
            subheadline: 'Com precificação baseada em inteligência artificial'
          }
        },
        {
          id: 'urgency',
          name: 'Urgency-Driven',
          description: 'Create urgency and FOMO',
          config: { 
            headline: 'Pare de Perder Dinheiro com Preços Errados',
            subheadline: 'Descubra o preço ideal em segundos'
          }
        }
      ],
      targetMetric: 'signup_started',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      isActive: true,
      allocation: { original: 34, benefit_focused: 33, urgency: 33 }
    });

    // Pricing Page Layout
    this.addTest({
      id: 'pricing_layout',
      name: 'Pricing Page Layout Test',
      variants: [
        {
          id: 'standard',
          name: 'Standard Layout',
          description: 'Standard 3-column pricing layout',
          config: { layout: 'standard', highlightPlan: 'pro' }
        },
        {
          id: 'comparison',
          name: 'Comparison Table',
          description: 'Feature comparison table format',
          config: { layout: 'table', highlightPlan: 'premium' }
        }
      ],
      targetMetric: 'plan_selected',
      startDate: new Date(),
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days
      isActive: true,
      allocation: { standard: 50, comparison: 50 }
    });
  }

  addTest(test: ABTest) {
    this.tests.set(test.id, test);
    this.saveToStorage();
  }

  getVariant(testId: string): string | null {
    if (!this.userId) {return null;}

    const test = this.tests.get(testId);
    if (!test || !test.isActive) {return null;}

    // Check if user already assigned
    const userAssignments = this.userAssignments.get(this.userId);
    if (userAssignments?.has(testId)) {
      return userAssignments.get(testId) || null;
    }

    // Assign user to variant
    const variant = this.assignUserToVariant(testId);
    if (variant) {
  const existing = this.userAssignments.get(this.userId) ?? new Map<string, string>();
  existing.set(testId, variant);
  this.userAssignments.set(this.userId, existing);
      this.saveUserAssignments();

      // Track assignment
      this.trackAssignment(testId, variant);
    }

    return variant;
  }

  private assignUserToVariant(testId: string): string | null {
    const test = this.tests.get(testId);
    if (!test || !this.userId) {return null;}

    // Use deterministic assignment based on user ID hash
    const hash = this.hashUserId(this.userId + testId);
    const percentage = hash % 100;

    let cumulative = 0;
    for (const [variantId, allocation] of Object.entries(test.allocation)) {
      cumulative += allocation;
      if (percentage < cumulative) {
        return variantId;
      }
    }

    return test.variants[0]?.id || null;
  }

  private hashUserId(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  trackConversion(testId: string, eventName: string, value?: number) {
    if (!this.userId) {return;}

    const variantId = this.getVariant(testId);
    if (!variantId) {return;}

    const conversion: ABConversion = {
      eventName,
      value,
      timestamp: new Date()
    };

    // Find or create result
    let result = this.results.find(r => 
      r.testId === testId && r.variantId === variantId && r.userId === this.userId
    );

    if (!result) {
      result = {
        testId,
        variantId,
        userId: this.userId,
        assignedAt: new Date(),
        conversions: []
      };
      this.results.push(result);
    }

    result.conversions.push(conversion);
    this.saveResults();

    // Send to analytics
    this.sendAnalytics('ab_conversion', {
      testId,
      variantId,
      eventName,
      value,
      userId: this.userId
    });
  }

  private trackAssignment(testId: string, variantId: string) {
    this.sendAnalytics('ab_assignment', {
      testId,
      variantId,
      userId: this.userId,
      timestamp: new Date()
    });
  }

  getTestConfig(testId: string, variantId: string): Record<string, unknown> {
    const test = this.tests.get(testId);
    if (!test) {return {};}

    const variant = test.variants.find(v => v.id === variantId);
    return variant?.config || {};
  }

  isInTest(testId: string): boolean {
    return this.getVariant(testId) !== null;
  }

  getAllActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter(test => test.isActive);
  }

  getTestResults(testId: string) {
    return this.results.filter(r => r.testId === testId);
  }

  private saveResults() {
    try {
      localStorage.setItem('ab_results', JSON.stringify(this.results));
    } catch (error) {
      logger.warn('Failed to save A/B test results:', error);
    }
  }

  private sendAnalytics(event: string, data: Record<string, unknown>) {
    try {
      fetch('/api/analytics/ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data }),
        keepalive: true
      });
    } catch (error) {
      logger.warn('Failed to send A/B test analytics:', error);
    }
  }
}

const abTestingEngine = new ABTestingEngine();

export function ABTestProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize with user ID if available
    const initializeEngine = async () => {
      try {
        // Get user ID from auth or generate anonymous ID
        const userId = getUserId() || generateAnonymousId();
        abTestingEngine.setUserId(userId);
        setIsInitialized(true);
      } catch (error) {
        logger.warn('Failed to initialize A/B testing:', error);
        setIsInitialized(true); // Continue without A/B testing
      }
    };

    initializeEngine();
  }, []);

  const contextValue: ABTestContextType = {
    getVariant: (testId: string) => abTestingEngine.getVariant(testId),
    trackConversion: (testId: string, eventName: string, value?: number) => 
      abTestingEngine.trackConversion(testId, eventName, value),
    getTestConfig: (testId: string, variantId: string) => 
      abTestingEngine.getTestConfig(testId, variantId),
    isInTest: (testId: string) => abTestingEngine.isInTest(testId),
    getAllActiveTests: () => abTestingEngine.getAllActiveTests()
  };

  if (!isInitialized) {
    return <div>Loading...</div>; // Or return children for SSR compatibility
  }

  return (
    <ABTestContext.Provider value={contextValue}>
      {children}
    </ABTestContext.Provider>
  );
}

// Helper functions
function getUserId(): string | null {
  try {
    const authData = localStorage.getItem('supabase.auth.token');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.user?.id || null;
    }
  } catch (error) {
    logger.warn('Failed to get user ID:', error);
  }
  return null;
}

function generateAnonymousId(): string {
  let anonymousId = localStorage.getItem('anonymous_id');
  if (!anonymousId) {
    anonymousId = 'anon_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('anonymous_id', anonymousId);
  }
  return anonymousId;
}

// Hook for easy component usage
export function useABTestVariant(testId: string) {
  const { getVariant, getTestConfig, trackConversion, isInTest } = useABTest();
  
  const variant = getVariant(testId);
  const config = variant ? getTestConfig(testId, variant) : {};
  
  return {
    variant,
    config,
    isInTest: isInTest(testId),
    trackConversion: (eventName: string, value?: number) => 
      trackConversion(testId, eventName, value)
  };
}

export { abTestingEngine };