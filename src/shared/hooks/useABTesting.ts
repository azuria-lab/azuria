
import { useCallback, useEffect, useState } from 'react';
import { logger } from '@/services/logger';
import { useAuthContext } from '@/domains/auth';

interface ABTest {
  id: string;
  name: string;
  variants: {
    id: string;
    name: string;
    weight: number;
  }[];
  active: boolean;
  description?: string;
}

interface ABTestAssignment {
  testId: string;
  variantId: string;
  assignedAt: number;
}

const AB_TESTS: ABTest[] = [
  {
    id: 'calculator_layout',
    name: 'Layout da Calculadora',
    variants: [
      { id: 'default', name: 'Layout Padrão', weight: 50 },
      { id: 'compact', name: 'Layout Compacto', weight: 50 }
    ],
    active: true,
    description: 'Teste do layout da calculadora principal'
  },
  {
    id: 'pricing_cta',
    name: 'Call-to-Action dos Planos',
    variants: [
      { id: 'upgrade_now', name: 'Upgrade Agora', weight: 33 },
      { id: 'try_pro', name: 'Experimentar PRO', weight: 33 },
      { id: 'unlock_features', name: 'Desbloquear Recursos', weight: 34 }
    ],
    active: true,
    description: 'Teste do texto do botão de upgrade'
  },
  {
    id: 'onboarding_flow',
    name: 'Fluxo de Onboarding',
    variants: [
      { id: 'tutorial', name: 'Com Tutorial', weight: 50 },
      { id: 'direct', name: 'Direto ao App', weight: 50 }
    ],
    active: true,
    description: 'Teste do fluxo inicial para novos usuários'
  }
];

export const useABTesting = () => {
  const { user } = useAuthContext();
  const [assignments, setAssignments] = useState<ABTestAssignment[]>([]);

  // Load existing assignments
  useEffect(() => {
    const saved = localStorage.getItem('ab_test_assignments');
    if (saved) {
      setAssignments(JSON.parse(saved));
    }
  }, []);

  // Save assignments when they change
  useEffect(() => {
    localStorage.setItem('ab_test_assignments', JSON.stringify(assignments));
  }, [assignments]);

  // Get user segment for consistent assignment
  const getUserSegment = useCallback((): number => {
    if (!user) {return Math.floor(Math.random() * 100);}
    
    // Create consistent hash from user ID
    let hash = 0;
    const str = user.id;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash) % 100;
  }, [user]);

  // Assign user to test variant
  const getVariant = useCallback((testId: string): string | null => {
    const test = AB_TESTS.find(t => t.id === testId);
    if (!test || !test.active) {return null;}

    // Check existing assignment
    const existing = assignments.find(a => a.testId === testId);
    if (existing) {return existing.variantId;}

    // Create new assignment
    const segment = getUserSegment();
    let cumulativeWeight = 0;
    
    for (const variant of test.variants) {
      cumulativeWeight += variant.weight;
      if (segment < cumulativeWeight) {
        const assignment: ABTestAssignment = {
          testId,
          variantId: variant.id,
          assignedAt: Date.now()
        };
        
        setAssignments(prev => [...prev, assignment]);
        
  // Track assignment
  logger.debug('AB Test Assignment', { testId, variantId: variant.id });
        
        return variant.id;
      }
    }
    
    // Fallback to first variant
    return test.variants[0]?.id || null;
  }, [assignments, getUserSegment]);

  // Track conversion for A/B test
  const trackConversion = useCallback((testId: string, conversionType: string = 'conversion') => {
    const variant = getVariant(testId);
    if (!variant) {return;}

    const conversionData = {
      testId,
      variantId: variant,
      conversionType,
      timestamp: Date.now(),
      userId: user?.id
    };

    // Store conversion locally
    const conversions: typeof conversionData[] = JSON.parse(localStorage.getItem('ab_test_conversions') || '[]');
    conversions.push(conversionData);
    localStorage.setItem('ab_test_conversions', JSON.stringify(conversions));

    logger.info('A/B Test Conversion', conversionData);
  }, [getVariant, user]);

  // Get all active tests
  const getActiveTests = useCallback(() => {
    return AB_TESTS.filter(test => test.active);
  }, []);

  // Get test results (for analytics dashboard)
  const getTestResults = useCallback(() => {
  const conversions: Array<{ testId: string; variantId: string }> = JSON.parse(localStorage.getItem('ab_test_conversions') || '[]');
    
    return AB_TESTS.map(test => {
      const testAssignments = assignments.filter(a => a.testId === test.id);
  const testConversions = conversions.filter((c) => c.testId === test.id);
      
      const variantStats = test.variants.map(variant => {
        const variantAssignments = testAssignments.filter(a => a.variantId === variant.id);
  const variantConversions = testConversions.filter((c) => c.variantId === variant.id);
        
        return {
          ...variant,
          assignments: variantAssignments.length,
          conversions: variantConversions.length,
          conversionRate: variantAssignments.length > 0 
            ? (variantConversions.length / variantAssignments.length) * 100 
            : 0
        };
      });
      
      return {
        ...test,
        totalAssignments: testAssignments.length,
        totalConversions: testConversions.length,
        variants: variantStats
      };
    });
  }, [assignments]);

  return {
    getVariant,
    trackConversion,
    getActiveTests,
    getTestResults,
    assignments
  };
};
