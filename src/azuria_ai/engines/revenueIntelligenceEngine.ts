import { emitEvent } from '../core/eventBus';

interface BehaviorProfile {
  sessions: number;
  clicks: number;
  errors: number;
  timeSpent: number;
  paywallViews: number;
  plan?: 'free' | 'pro' | 'enterprise';
}

interface RevenueSignals {
  churnRisk: number;
  engagementScore: number;
  upgradeProbability: number;
}

function clamp(v: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

export function evaluateRevenueSignals(profile: BehaviorProfile): RevenueSignals {
  const churnRisk = clamp(
    0.2 +
      (profile.errors || 0) * 0.02 +
      (profile.paywallViews || 0) * 0.03 -
      (profile.sessions || 0) * 0.01
  );
  const engagementScore = clamp(
    0.3 +
      (profile.sessions || 0) * 0.02 +
      (profile.clicks || 0) * 0.005 -
      (profile.errors || 0) * 0.01
  );
  const upgradeProbability = clamp(
    0.15 + engagementScore * 0.5 + (profile.paywallViews || 0) * 0.05
  );

  return { churnRisk, engagementScore, upgradeProbability };
}

export function analyzeRevenueOpportunity(profile: BehaviorProfile) {
  const signals = evaluateRevenueSignals(profile);

  if (signals.churnRisk > 0.6) {
    emitEvent(
      'ai:churn-risk',
      { churnRisk: signals.churnRisk, profile },
      { source: 'revenueIntelligenceEngine', priority: 6 }
    );
  }

  if (signals.upgradeProbability > 0.5) {
    emitEvent(
      'ai:upgrade-opportunity',
      { upgradeProbability: signals.upgradeProbability, profile },
      { source: 'revenueIntelligenceEngine', priority: 6 }
    );
  }

  if (signals.engagementScore > 0.55) {
    emitEvent(
      'ai:pricing-opportunity',
      { engagementScore: signals.engagementScore, profile },
      { source: 'revenueIntelligenceEngine', priority: 5 }
    );
  }

  return signals;
}

export function getUpgradeMessage(prob: number) {
  if (prob > 0.75) {return 'Usuário quente para upgrade — ofereça plano PRO com desconto.';}
  if (prob > 0.55) {return 'Boa chance de upgrade — destaque benefícios avançados.';}
  return 'Mantenha engajamento antes de propor upgrade.';
}

