/**
 * Mini Dashboard
 * 
 * Painel lateral da IA que mostra insights e ações rápidas.
 */

import React, { useEffect, useState } from 'react';
import { type AzuriaEvent, on, unsubscribeFromEvent } from '../core/eventBus';
import { BarChart3, Calculator, FileText, Sparkles, TrendingUp, X } from 'lucide-react';
import { rewriteWithBrandVoice, type ToneProfileKey } from '../engines/brandVoiceEngine';

export interface MiniDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  isAdmin?: boolean;
}

interface Insight {
  type: 'warning' | 'suggestion' | 'info';
  message: string;
  action?: string;
  timestamp: number;
  brandTone?: string;
  persona?: string;
  refinedMessage?: string;
  emotion?: string;
  affectiveMessage?: string;
  emotionConfidence?: number;
}

interface PredictiveInsightItem {
  id: string;
  message: string;
  riskLevel: 'safe' | 'alert' | 'critical';
  predictiveScore: number;
  suggestedActions?: string[];
  timestamp: number;
}

interface CognitiveItem {
  id: string;
  message: string;
  type: 'pattern' | 'forecast' | 'anomaly';
  timestamp: number;
}

interface SocialState {
  emotionalState?: string;
  skillLevel?: string;
  riskTolerance?: string;
  preferredPace?: string;
}

interface AdaptiveState {
  showAdvanced?: boolean;
  conciseMode?: boolean;
  detailedExplanations?: boolean;
  tone?: string;
}

interface DiagnosticState {
  signalQuality?: number;
  confidence?: number;
  drift?: boolean;
  errors?: number;
  plannerActions?: string[];
  timeline?: string[];
  forecastText?: string;
  anomalies?: string[];
  evolutionScore?: number;
  weaknesses?: string[];
  patches?: string[];
  globalState?: Record<string, unknown>;
  lastUnifiedRecommendation?: string;
  integratedConfidence?: number;
  healthScore?: number;
  emotionalTone?: string;
  emotionMessage?: string;
  adaptiveLayout?: Record<string, unknown>;
  engagementScore?: number;
  churnRisk?: number;
  upgradeProbability?: number;
  coherenceScore?: number;
  governanceAlerts?: string[];
  trustLevel?: string;
  internalInsights?: string[];
  contradictions?: string[];
  reconstructionConfidence?: number;
  sensors?: string[];
  strategicHealth?: number;
  strategicRisks?: string[];
  longTermGoals?: Array<{ target?: string; id?: string }>;
  strategicPlan?: Array<{ target?: string; id?: string }>;
}

interface EngagementNarrativeState {
  motivationLevel?: number;
  achievementCount?: number;
  recentStreak?: number;
  recommendedNextAction?: string;
  lastStory?: string;
}

interface UXEvolutionState {
  uxFrictionPoints?: number;
  positivePatterns?: number;
  autoFixesApplied?: string[];
  abandonRate?: number;
  optimizedFlows?: string[];
}

interface GovernanceState {
  ethicalWarnings?: number;
  safetyBreaks?: number;
}

interface SystemMindState {
  globalHealthScore?: number;
  confidenceMap?: Record<string, number>;
  internalRisks?: string[];
  activeConflicts?: string[];
  systemUptimeCognitive?: number;
  realityConfidence?: number;
  externalForces?: string[];
  contextSnapshot?: Record<string, unknown>;
  truthScore?: number;
  contradictionsDetected?: string[];
  stabilityScore?: number;
  predictedFailure?: number;
  loadBalanceStatus?: string;
  recoveryEvents?: string[];
  marketOpportunities?: string[];
  marketRisks?: string[];
  metaState?: string;
  decisionQuality?: number;
  scenarioConfidence?: number;
  personalityRiskAttitude?: string;
  opportunityBias?: number;
  decisionStyle?: string;
}

function renderAsciiGraph(count: number) {
  const bars = Math.min(20, Math.max(1, count));
  return '#'.repeat(bars);
}

/**
 * Helper to format percentage values, returning 'n/d' if undefined
 */
function formatPercent(value: number | undefined, decimals = 0): string {
  if (value === undefined) {
    return 'n/d';
  }
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Helper to format a numeric score as percentage
 */
 
function _formatScore(value: number | undefined): string {
  if (value === undefined) {
    return 'n/d';
  }
  return `${Math.round(value * 100)}%`;
}

/**
 * Helper to format decimal values
 */
function formatDecimal(value: number | undefined, decimals = 2): string {
  if (value === undefined) {
    return 'n/d';
  }
  return value.toFixed(decimals);
}

export const MiniDashboard: React.FC<MiniDashboardProps> = ({
  isOpen,
  onClose,
  userId: _userId,
  isAdmin = false,
}) => {
  const [lastInsight, setLastInsight] = useState<Insight | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsightItem[]>([]);
  const [cognitiveEvents, setCognitiveEvents] = useState<CognitiveItem[]>([]);
  const [socialState, setSocialState] = useState<SocialState>({});
  const [adaptiveState, setAdaptiveState] = useState<AdaptiveState>({});
  const [diagnostics, setDiagnostics] = useState<DiagnosticState>({});
  const [timeline, setTimeline] = useState<string[]>([]);
  const [forecastText, setForecastText] = useState<string>('Sem previsão ainda.');
  const [temporalAlerts, setTemporalAlerts] = useState<string[]>([]);
  const [_engagementNarrative, _setEngagementNarrative] = useState<EngagementNarrativeState>({});
  const [_uxEvolution, _setUxEvolution] = useState<UXEvolutionState>({});
  const [governance, setGovernance] = useState<GovernanceState>({});
  const [systemMind, setSystemMind] = useState<SystemMindState>({});

  // Escutar eventos de insights
  useEffect(() => {
    const subscriptionId = on('insight:generated', (event: AzuriaEvent) => {
      const brandTone = (event.payload.brandTone as ToneProfileKey | undefined) ?? 'padrao';
      const insight: Insight = {
        type: event.payload.type || 'info',
        message: rewriteWithBrandVoice(event.payload.message || '', brandTone),
        refinedMessage: event.payload.refinedMessage,
        brandTone: event.payload.brandTone,
        persona: event.payload.persona,
        emotion: event.payload.emotion,
        affectiveMessage: event.payload.affectiveMessage,
        emotionConfidence: event.payload.emotionConfidence,
        action: event.payload.action,
        timestamp: event.timestamp,
      };

      setLastInsight(insight);
      setInsights((prev) => [insight, ...prev].slice(0, 10)); // Manter últimos 10
    });

    const predictiveSubscription = on('ai:predictive-insight', (event: AzuriaEvent) => {
      const predictive: PredictiveInsightItem = {
        id: event.payload?.id || `predict-${event.timestamp}`,
        message: event.payload?.message || 'Insight preditivo disponível.',
        riskLevel: event.payload?.riskLevel || 'alert',
        predictiveScore: event.payload?.predictiveScore ?? 0.5,
        suggestedActions: event.payload?.suggestedActions || [],
        timestamp: event.timestamp,
      };

      setPredictiveInsights(prev => [predictive, ...prev].slice(0, 5));
    });

    const patternSubscription = on('ai:pattern-detected', (event: AzuriaEvent) => {
      const item: CognitiveItem = {
        id: `pattern-${event.timestamp}`,
        message:
          event.payload?.patterns?.join('; ') ||
          'Padrão de uso identificado.',
        type: 'pattern',
        timestamp: event.timestamp,
      };
      setCognitiveEvents(prev => [item, ...prev].slice(0, 5));
    });

    const forecastSubscription = on('ai:forecast-generated', (event: AzuriaEvent) => {
      const item: CognitiveItem = {
        id: `forecast-${event.timestamp}`,
        message: event.payload?.message || 'Previsão gerada com base no uso recente.',
        type: 'forecast',
        timestamp: event.timestamp,
      };
      setCognitiveEvents(prev => [item, ...prev].slice(0, 5));
    });

    const anomalySubscription = on('ai:anomaly-detected', (event: AzuriaEvent) => {
      const item: CognitiveItem = {
        id: `anomaly-${event.timestamp}`,
        message: event.payload?.message || 'Comportamento fora do padrão detectado.',
        type: 'anomaly',
        timestamp: event.timestamp,
      };
      setCognitiveEvents(prev => [item, ...prev].slice(0, 5));
    });

    const emotionSubscription = on('ai:emotion-inferred', (event: AzuriaEvent) => {
      setSocialState(prev => ({
        ...prev,
        emotionalState: event.payload?.emotionalState,
      }));
    });

    const profileSubscription = on('ai:user-profile-updated', (event: AzuriaEvent) => {
      setSocialState(prev => ({
        ...prev,
        ...event.payload?.userModel,
      }));
    });

    const adaptiveSubscription = on('ui:adaptive-interface-changed', (event: AzuriaEvent) => {
      setAdaptiveState(event.payload?.adaptation || {});
    });

    const motivationSub = on('ai:user-motivation-level', (event: AzuriaEvent) => {
      setEngagementNarrative(prev => ({
        ...prev,
        motivationLevel: event.payload?.motivationLevel,
      }));
    });

    const achievementSub = on('ai:achievement-unlocked', (_event: AzuriaEvent) => {
      setEngagementNarrative(prev => ({
        ...prev,
        achievementCount: (prev.achievementCount ?? 0) + 1,
      }));
    });

    const streakSub = on('ai:engagement-progress', (event: AzuriaEvent) => {
      setEngagementNarrative(prev => ({
        ...prev,
        recentStreak: event.payload?.streak ?? prev.recentStreak,
      }));
    });

    const nextActionSub = on('ai:next-best-action', (event: AzuriaEvent) => {
      setEngagementNarrative(prev => ({
        ...prev,
        recommendedNextAction: event.payload?.action,
      }));
    });

    const storySub = on('ai:story-generated', (event: AzuriaEvent) => {
      setEngagementNarrative(prev => ({
        ...prev,
        lastStory: event.payload?.story,
      }));
    });

    const behaviorSub = on('ai:behavior-pattern-detected', (_event: AzuriaEvent) => {
      setUxEvolution(prev => ({
        ...prev,
        positivePatterns: prev.positivePatterns || 0,
      }));
    });

    const frictionSub = on('ai:ux-friction-detected', (event: AzuriaEvent) => {
      setUxEvolution(prev => ({
        ...prev,
        uxFrictionPoints: (prev.uxFrictionPoints || 0) + 1,
        abandonRate: event.payload?.struggle || prev.abandonRate,
      }));
    });

    const autofixSub = on('ai:autofix-applied', (event: AzuriaEvent) => {
      setUxEvolution(prev => ({
        ...prev,
        autoFixesApplied: [...(prev.autoFixesApplied || []), ...(event.payload?.fixes || [])].slice(0, 5),
      }));
    });

    const optimizedSub = on('ai:ux-optimized', (event: AzuriaEvent) => {
      setUxEvolution(prev => ({
        ...prev,
        optimizedFlows: [...(prev.optimizedFlows || []), ...(event.payload?.combined || [])].slice(0, 5),
      }));
    });

    const ethicalSub = on('ai:ethical-warning', () => {
      setGovernance(prev => ({
        ...prev,
        ethicalWarnings: (prev.ethicalWarnings || 0) + 1,
      }));
    });

    const safetySub = on('ai:safety-break', () => {
      setGovernance(prev => ({
        ...prev,
        safetyBreaks: (prev.safetyBreaks || 0) + 1,
      }));
    });

    const mindSub = on('ai:mind-snapshot', (event: AzuriaEvent) => {
      const forces = event.payload?.forces as Record<string, unknown> | undefined;
      
      /**
       * Convert force entry to string, handling all types properly
       */
      const formatForceEntry = (k: string, v: unknown): string => {
        if (v === null || v === undefined) {
          return `${k}:`;
        }
        if (typeof v === 'object') {
          return `${k}:${JSON.stringify(v)}`;
        }
        // v is primitive (string, number, boolean, symbol, bigint)
        return `${k}:${String(v as string | number | boolean)}`;
      };
      
      const externalForces = forces
        ? Object.entries(forces).map(([k, v]) => formatForceEntry(k, v))
        : undefined;
      
      setSystemMind({
        globalHealthScore: event.payload?.healthScore,
        confidenceMap: event.payload?.confidenceMap,
        internalRisks: event.payload?.anomalies,
        activeConflicts: event.payload?.anomalies,
        systemUptimeCognitive: Date.now(),
        realityConfidence: event.payload?.confidence,
        externalForces,
        contextSnapshot: event.payload?.state,
      });
    });

    const mindWarnSub = on('ai:mind-warning', (event: AzuriaEvent) => {
      setSystemMind(prev => ({
        ...prev,
        internalRisks: event.payload?.anomalies || prev.internalRisks,
      }));
    });

    const truthSub = on('ai:truth-alert', (event: AzuriaEvent) => {
      setSystemMind(prev => ({
        ...prev,
        truthScore: event.payload?.severity === 'critical' ? 0.2 : 0.6,
        contradictionsDetected: event.payload?.details?.contradictions || prev.contradictionsDetected,
      }));
    });

    const stabilitySub = on('ai:stability-alert', (event: AzuriaEvent) => {
      setSystemMind(prev => ({
        ...prev,
        stabilityScore: 1 - (event.payload?.riskLevel || 0),
        predictedFailure: event.payload?.riskLevel,
        loadBalanceStatus: event.payload?.details?.stage,
        recoveryEvents: event.payload?.details?.recoveryEvents || prev.recoveryEvents,
      }));
    });

    const marketSub = on('ai:market-insight', (event: AzuriaEvent) => {
      setSystemMind(prev => ({
        ...prev,
        marketOpportunities: event.payload?.details?.opps || prev.marketOpportunities,
        marketRisks: event.payload?.details?.risks || prev.marketRisks,
      }));
    });

    const metaLayerSub = on('ai:meta-layer-updated', (event: AzuriaEvent) => {
      setSystemMind(prev => ({
        ...prev,
        metaState: event.payload?.snapshot ? 'online' : prev.metaState,
        scenarioConfidence: event.payload?.snapshot?.scenarios?.confidence,
        decisionQuality: event.payload?.snapshot?.decision?.quality || prev.decisionQuality,
      }));
    });

    const coreSyncSub = on('ai:core-sync', (event: AzuriaEvent) => {
      const st = event.payload?.state;
      if (!st) {return;}
      setSystemMind(prev => ({
        ...prev,
        personalityRiskAttitude: st.personalityRiskAttitude ?? prev.personalityRiskAttitude,
        opportunityBias: st.opportunityBias ?? prev.opportunityBias,
        decisionStyle: st.decisionStyle ?? prev.decisionStyle,
      }));
    });

    const signalSubscription = on('ai:signal-quality', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        signalQuality: event.payload?.signalQuality ?? prev.signalQuality,
      }));
    });

    const confidenceSubscription = on('ai:model-confidence', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        confidence: event.payload?.confidence ?? prev.confidence,
      }));
    });

    const driftSubscription = on('ai:internal-drift', () => {
      setDiagnostics(prev => ({ ...prev, drift: true }));
    });

    const stabilitySubscription = on('ai:stability-restored', () => {
      setDiagnostics(prev => ({ ...prev, drift: false }));
    });

    const plannerSubscription = on('ai:planner-plan-generated', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        plannerActions: [
          `Plano criado: ${event.payload?.plan?.goalId || ''}`,
          ...(prev.plannerActions || []),
        ].slice(0, 5),
      }));
    });

    const evolutionScoreSub = on('ai:evolution-score-updated', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({ ...prev, evolutionScore: event.payload?.evolutionScore }));
    });

    const evolutionWeaknessSub = on('ai:evolution-weakness-found', (event: AzuriaEvent) => {
      const weaknesses = event.payload?.weaknesses || [];
      setDiagnostics(prev => ({ ...prev, weaknesses }));
    });

    const evolutionPatchSub = on('ai:evolution-patch-proposed', (event: AzuriaEvent) => {
      const patches = event.payload?.suggestions || [];
      setDiagnostics(prev => ({ ...prev, patches }));
    });

    const coreSyncDiagnosticsSub = on('ai:core-sync', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        globalState: event.payload?.state,
        lastUnifiedRecommendation: event.payload?.recommendation ?? prev.lastUnifiedRecommendation,
        integratedConfidence: event.payload?.state?.confidence ?? prev.integratedConfidence,
        healthScore: event.payload?.state?.healthScore ?? prev.healthScore,
      }));
    });

    const emotionUpdateSub = on('ui:emotion-updated', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        emotionalTone: event.payload?.tone,
        emotionMessage: event.payload?.message,
      }));
    });

    const adaptiveLayoutSub = on('ui:adaptive-layout', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        adaptiveLayout: event.payload?.layout,
      }));
    });

    const pricingOpportunitySub = on('ai:pricing-opportunity', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        engagementScore: event.payload?.engagementScore ?? prev.engagementScore,
      }));
    });

    const churnRiskSub = on('ai:churn-risk', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        churnRisk: event.payload?.churnRisk ?? prev.churnRisk,
      }));
    });

    const upgradeSub = on('ai:upgrade-opportunity', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        upgradeProbability: event.payload?.upgradeProbability ?? prev.upgradeProbability,
      }));
    });

    const coherenceSub = on('ai:decision-validated', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        coherenceScore: event.payload?.coherenceScore,
        trustLevel: event.payload?.trustLevel,
      }));
    });

    const governanceAlertSub = on('ai:governance-alert', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        governanceAlerts: [
          event.payload?.message || `Alerta de governança: ${event.payload?.risk ?? ''}`,
          ...(prev.governanceAlerts || []),
        ].slice(0, 5),
      }));
    });

    const internalInsightSub = on('ai:internal-insight', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        internalInsights: [
          event.payload?.reason || 'Insight interno registrado.',
          ...(prev.internalInsights || []),
        ].slice(0, 5),
      }));
    });

    const contradictionSub = on('ai:contradiction-detected', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        contradictions: [
          ...(event.payload?.contradictions || []),
          ...(prev.contradictions || []),
        ].slice(0, 5),
      }));
    });

    const contextReconstructedSub = on('ai:context-reconstructed', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        reconstructionConfidence: event.payload?.confidence,
      }));
    });

    const virtualSignalSub = on('ai:virtual-signal', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        sensors: [
          `Freq: ${(event.payload?.sample?.eventFrequency || 0).toFixed(1)} | Lat: ${(event.payload?.sample?.avgLatency || 0).toFixed(0)}ms`,
          ...(prev.sensors || []),
        ].slice(0, 5),
      }));
    });

    const strategicPlanSub = on('ai:strategic-plan-generated', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        strategicPlan: event.payload?.plan,
      }));
    });

    const strategicRiskSub = on('ai:structural-risk-detected', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        strategicRisks: event.payload?.risks || [],
      }));
    });

    const longTermGoalSub = on('ai:long-term-goal-defined', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        longTermGoals: event.payload?.goals || [],
      }));
    });

    const systemHealthSub = on('ai:system-health-updated', (event: AzuriaEvent) => {
      setDiagnostics(prev => ({
        ...prev,
        strategicHealth: event.payload?.health,
      }));
    });

    const temporalEventSub = on('ai:temporal-event', (event: AzuriaEvent) => {
      const entry = `${new Date(event.payload?.entry?.timestamp || Date.now()).toLocaleTimeString()} - ${event.payload?.scope || ''} - ${event.payload?.entry?.event}`;
      setTimeline(prev => [entry, ...prev].slice(0, 20));
    });

    const trendSub = on('ai:trend-detected', (event: AzuriaEvent) => {
      setForecastText(`Trend: ${event.payload?.trend || 'n/d'} Repetições: ${(event.payload?.repetitions || []).join(', ')}`);
    });

    const futureSub = on('ai:future-state-predicted', (event: AzuriaEvent) => {
      setForecastText(`Prev: ${event.payload?.expected || 'n/d'} | Reps: ${(event.payload?.repetitions || []).join(', ')}`);
    });

    const temporalAnomalySub = on('ai:temporal-anomaly', (event: AzuriaEvent) => {
      setTemporalAlerts(prev => [`Anomalia: ${event.payload?.message || 'detectada'}`, ...prev].slice(0, 5));
    });

    return () => {
      unsubscribeFromEvent(subscriptionId);
      unsubscribeFromEvent(predictiveSubscription);
      unsubscribeFromEvent(patternSubscription);
      unsubscribeFromEvent(forecastSubscription);
      unsubscribeFromEvent(anomalySubscription);
      unsubscribeFromEvent(emotionSubscription);
      unsubscribeFromEvent(profileSubscription);
      unsubscribeFromEvent(adaptiveSubscription);
      unsubscribeFromEvent(signalSubscription);
      unsubscribeFromEvent(confidenceSubscription);
      unsubscribeFromEvent(driftSubscription);
      unsubscribeFromEvent(stabilitySubscription);
      unsubscribeFromEvent(plannerSubscription);
      unsubscribeFromEvent(temporalEventSub);
      unsubscribeFromEvent(trendSub);
      unsubscribeFromEvent(futureSub);
      unsubscribeFromEvent(temporalAnomalySub);
      unsubscribeFromEvent(evolutionScoreSub);
      unsubscribeFromEvent(evolutionWeaknessSub);
      unsubscribeFromEvent(evolutionPatchSub);
      unsubscribeFromEvent(coreSyncSub);
      unsubscribeFromEvent(emotionUpdateSub);
      unsubscribeFromEvent(adaptiveLayoutSub);
      unsubscribeFromEvent(pricingOpportunitySub);
      unsubscribeFromEvent(churnRiskSub);
      unsubscribeFromEvent(upgradeSub);
      unsubscribeFromEvent(coherenceSub);
      unsubscribeFromEvent(governanceAlertSub);
      unsubscribeFromEvent(internalInsightSub);
      unsubscribeFromEvent(contradictionSub);
      unsubscribeFromEvent(contextReconstructedSub);
      unsubscribeFromEvent(virtualSignalSub);
      unsubscribeFromEvent(strategicPlanSub);
      unsubscribeFromEvent(strategicRiskSub);
      unsubscribeFromEvent(longTermGoalSub);
      unsubscribeFromEvent(systemHealthSub);
      unsubscribeFromEvent(motivationSub);
      unsubscribeFromEvent(achievementSub);
      unsubscribeFromEvent(streakSub);
      unsubscribeFromEvent(nextActionSub);
      unsubscribeFromEvent(storySub);
      unsubscribeFromEvent(behaviorSub);
      unsubscribeFromEvent(frictionSub);
      unsubscribeFromEvent(autofixSub);
      unsubscribeFromEvent(optimizedSub);
      unsubscribeFromEvent(ethicalSub);
      unsubscribeFromEvent(safetySub);
      unsubscribeFromEvent(mindSub);
      unsubscribeFromEvent(mindWarnSub);
      unsubscribeFromEvent(truthSub);
      unsubscribeFromEvent(stabilitySub);
      unsubscribeFromEvent(marketSub);
      unsubscribeFromEvent(metaLayerSub);
      unsubscribeFromEvent(coreSyncDiagnosticsSub);
    };
  }, []);

  if (!isOpen) {return null;}

  const insightTypeStyles = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    suggestion: 'bg-blue-50 border-blue-200 text-blue-800',
    info: 'bg-cyan-50 border-cyan-200 text-cyan-800',
  };

  const insightIcons = {
    warning: '⚠️',
    suggestion: '💡',
    info: 'ℹ️',
  };

  const quickActions = [
    {
      icon: TrendingUp,
      label: 'Otimizar preço',
      action: 'optimize_price',
      color: 'text-green-600',
    },
    {
      icon: Calculator,
      label: 'Simular ICMS',
      action: 'simulate_icms',
      color: 'text-blue-600',
    },
    {
      icon: FileText,
      label: 'Explicar cálculo',
      action: 'explain_calculation',
      color: 'text-purple-600',
    },
    {
      icon: BarChart3,
      label: 'Ver cenários',
      action: 'view_scenarios',
      color: 'text-orange-600',
    },
  ];

  const handleQuickAction = (action: string) => {
    // eslint-disable-next-line no-console
    console.log('Quick action:', action);
    // NOTE: Quick action implementation pending - will emit events to trigger specific workflows
  };

  return (
    <>
      {/* Backdrop - clickable overlay to close panel */}
      <button
        type="button"
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity cursor-default border-0"
        onClick={onClose}
        aria-label="Fechar painel"
      />

      {/* Panel */}
      <div
        className="
          fixed top-0 right-0 h-full w-full sm:w-[420px]
          bg-background shadow-2xl z-50 border-l border-border
          transform transition-transform duration-300 ease-out
          overflow-y-auto
        "
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 shadow-sm z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Dashboard IA</h2>
                <p className="text-xs text-muted-foreground">Insights e métricas</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Último Insight */}
          {lastInsight && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Último Insight</h3>
              <div className="bg-card rounded-lg border border-border p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-base">{insightIcons[lastInsight.type]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed">{lastInsight.message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Métricas Principais */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Métricas Principais</h3>
            <div className="grid grid-cols-1 gap-3">
              {diagnostics.engagementScore !== undefined && (
                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Engajamento</span>
                    <span className="text-sm font-semibold text-foreground">{formatPercent(diagnostics.engagementScore)}</span>
                  </div>
                </div>
              )}
              {diagnostics.healthScore !== undefined && (
                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Saúde do Sistema</span>
                    <span className="text-sm font-semibold text-foreground">{formatPercent(diagnostics.healthScore)}</span>
                  </div>
                </div>
              )}
              {diagnostics.confidence !== undefined && (
                <div className="bg-card rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Confiança</span>
                    <span className="text-sm font-semibold text-foreground">{formatPercent(diagnostics.confidence)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Ações Rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.action}
                    onClick={() => handleQuickAction(action.action)}
                    className="
                      p-4 rounded-lg border border-border bg-card
                      hover:border-primary/30 hover:bg-accent/50
                      transition-all duration-200
                      flex flex-col items-center gap-2.5
                      group
                    "
                  >
                    <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium text-foreground text-center">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Histórico de Insights */}
          {insights.length > 1 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Histórico de Insights</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {insights.slice(1, 6).map((insight, index) => (
                  <div
                    key={`${insight.timestamp}-${index}`}
                    className="bg-card rounded-lg border border-border p-3"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs">{insightIcons[insight.type]}</span>
                      </div>
                      <p className="text-xs text-muted-foreground flex-1 leading-relaxed">{insight.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Previsões Relevantes */}
          {predictiveInsights.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Previsões</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {predictiveInsights.slice(0, 3).map(item => (
                  <div
                    key={item.id}
                    className="bg-card rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-foreground capitalize">{item.riskLevel}</span>
                      <span className="text-xs text-muted-foreground">{(item.predictiveScore * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cognição (padrões e anomalias) */}
          {cognitiveEvents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Cognição
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cognitiveEvents.map(item => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border bg-purple-50 border-purple-200 text-purple-900"
                  >
                    <div className="text-xs font-semibold capitalize">{item.type}</div>
                    <p className="text-sm mt-1">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estado Social */}
          {(socialState.emotionalState || socialState.skillLevel) && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-600" />
                Estado Social
              </h3>
              <div className="p-3 rounded-lg border bg-pink-50 border-pink-200 text-pink-900 space-y-1 text-sm">
                {socialState.emotionalState && (
                  <div>Emoção: {socialState.emotionalState}</div>
                )}
                {socialState.skillLevel && <div>Nível: {socialState.skillLevel}</div>}
                {socialState.riskTolerance && <div>Risco: {socialState.riskTolerance}</div>}
                {socialState.preferredPace && <div>Ritmo: {socialState.preferredPace}</div>}
              </div>
            </div>
          )}

          {/* Interface Adaptativa */}
          {Object.keys(adaptiveState).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Interface Adaptativa
              </h3>
              <div className="p-3 rounded-lg border bg-teal-50 border-teal-200 text-teal-900 space-y-1 text-sm">
                {'conciseMode' in adaptiveState && (
                  <div>Modo conciso: {adaptiveState.conciseMode ? 'Ativo' : 'Desativado'}</div>
                )}
                {'showAdvanced' in adaptiveState && (
                  <div>Mostrar avançado: {adaptiveState.showAdvanced ? 'Sim' : 'Não'}</div>
                )}
                {'detailedExplanations' in adaptiveState && (
                  <div>
                    Explicações detalhadas: {adaptiveState.detailedExplanations ? 'Sim' : 'Não'}
                  </div>
                )}
                {adaptiveState.tone && <div>Tom: {adaptiveState.tone}</div>}
              </div>
            </div>
          )}

          {/* Diagnóstico do Modo Deus - ADMIN ONLY */}
          {isAdmin && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gray-700 animate-pulse" />
              Diagnóstico do Modo Deus
            </h3>
            <div className="p-3 rounded-lg border bg-gray-50 border-gray-200 text-gray-900 space-y-1 text-sm">
              <div>Sinal interno: {formatPercent(diagnostics.signalQuality)}</div>
              <div>Confiança global: {formatPercent(diagnostics.confidence)}</div>
              <div>Drift: {diagnostics.drift ? 'Detectado' : 'Normal'}</div>
              <div>Erros recentes: {diagnostics.errors ?? 0}</div>
              {diagnostics.plannerActions && diagnostics.plannerActions.length > 0 && (
                <div className="pt-1">
                  <div className="font-semibold text-xs">Ações do Meta-Planner:</div>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    {diagnostics.plannerActions.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Linha do Tempo & Previsão */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Timeline & Forecast
            </h3>
            <div className="p-3 rounded-lg border bg-blue-50 border-blue-200 text-blue-900 space-y-2 text-sm">
              <div className="font-semibold text-xs">Últimos eventos</div>
              <div className="font-mono whitespace-pre-wrap text-xs bg-blue-100 p-2 rounded">
                {timeline.slice(0, 10).join('\n') || 'Sem eventos ainda.'}
              </div>
              <div className="font-semibold text-xs pt-1">ASCII trend</div>
              <div className="font-mono text-xs">
                {renderAsciiGraph(timeline.length)}
              </div>
              <div className="font-semibold text-xs pt-1">Previsão</div>
              <div>{forecastText}</div>
              {temporalAlerts.length > 0 && (
                <div className="pt-1">
                  <div className="font-semibold text-xs">Alertas:</div>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    {temporalAlerts.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 🧬 Evolução Interna */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-600" />
              🧬 Evolução Interna
            </h3>
            <div className="p-3 rounded-lg border bg-green-50 border-green-200 text-green-900 space-y-1 text-sm">
              <div>Evolution Score: {formatPercent(diagnostics.evolutionScore)}</div>
              {diagnostics.weaknesses && diagnostics.weaknesses.length > 0 && (
                <div>
                  <div className="font-semibold text-xs">Fraquezas:</div>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    {diagnostics.weaknesses.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              {diagnostics.patches && diagnostics.patches.length > 0 && (
                <div>
                  <div className="font-semibold text-xs">Patches sugeridos:</div>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    {diagnostics.patches.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Núcleo Integrado */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-700" />
              Núcleo Integrado
            </h3>
            <div className="p-3 rounded-lg border bg-indigo-50 border-indigo-200 text-indigo-900 space-y-1 text-sm">
              <div>Confiança integrada: {formatPercent(diagnostics.integratedConfidence)}</div>
              <div>Health score: {formatPercent(diagnostics.healthScore)}</div>
              <div>Recomendação: {diagnostics.lastUnifiedRecommendation || 'Sem recomendação'}</div>
              <div>Coherence Score: {formatDecimal(diagnostics.coherenceScore)}</div>
              <div>Trust Level: {diagnostics.trustLevel || 'n/d'}</div>
              <div className="pt-1">
                <div className="font-semibold text-xs">Estado global (compacto)</div>
                <div className="font-mono text-xs bg-indigo-100 p-2 rounded max-h-32 overflow-y-auto">
                  {diagnostics.globalState ? JSON.stringify(diagnostics.globalState).slice(0, 400) + '...' : 'n/d'}
                </div>
              </div>
              <div className="pt-1">
                <div className="font-semibold text-xs">Tom emocional: {diagnostics.emotionalTone || 'n/d'}</div>
                <div className="text-xs">{diagnostics.emotionMessage || ''}</div>
              </div>
              {diagnostics.adaptiveLayout && (
                <div className="pt-1">
                  <div className="font-semibold text-xs">Layout adaptado:</div>
                  <div className="font-mono text-xs bg-indigo-100 p-2 rounded max-h-24 overflow-y-auto">
                    {JSON.stringify(diagnostics.adaptiveLayout).slice(0, 300)}...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Governance Alerts */}
          {diagnostics.governanceAlerts && diagnostics.governanceAlerts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-600" />
                Governance Alerts
              </h3>
              <div className="p-3 rounded-lg border bg-red-50 border-red-200 text-red-900 space-y-1 text-sm">
                <ul className="list-disc list-inside space-y-1">
                  {diagnostics.governanceAlerts.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Internal Insights / Contradições - ADMIN ONLY */}
          {isAdmin && Boolean(diagnostics.internalInsights?.length ?? diagnostics.contradictions?.length) && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gray-500" />
                Insights Internos / Coerência
              </h3>
              {diagnostics.internalInsights?.length ? (
                <div className="p-3 rounded-lg border bg-gray-50 border-gray-200 text-gray-900 space-y-1 text-sm">
                  <div className="font-semibold text-xs">Internal XAI</div>
                  <ul className="list-disc list-inside space-y-1">
                    {diagnostics.internalInsights.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {diagnostics.contradictions?.length ? (
                <div className="p-3 rounded-lg border bg-orange-50 border-orange-200 text-orange-900 space-y-1 text-sm">
                  <div className="font-semibold text-xs">Contradições</div>
                  <ul className="list-disc list-inside space-y-1">
                    {diagnostics.contradictions.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {diagnostics.reconstructionConfidence === undefined ? null : (
                <div className="p-2 rounded bg-blue-50 text-blue-900 text-xs border border-blue-200">
                  Confiança de reconstrução: {formatPercent(diagnostics.reconstructionConfidence)}
                </div>
              )}
              {diagnostics.sensors && diagnostics.sensors.length > 0 && (
                <div className="p-2 rounded bg-slate-50 text-slate-900 text-xs border border-slate-200 space-y-1">
                  <div className="font-semibold">Sensores Virtuais</div>
                  <ul className="list-disc list-inside space-y-1">
                    {diagnostics.sensors.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Estratégia Global */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Estratégia Global
            </h3>
            <div className="p-3 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-900 space-y-1 text-sm">
              <div>Saúde sistêmica: {formatPercent(diagnostics.strategicHealth)}</div>
              {diagnostics.strategicRisks && diagnostics.strategicRisks.length > 0 && (
                <div>
                  <div className="font-semibold text-xs">Riscos estruturais</div>
                  <ul className="list-disc list-inside space-y-1">
                    {diagnostics.strategicRisks.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              {diagnostics.longTermGoals && diagnostics.longTermGoals.length > 0 && (
                <div>
                  <div className="font-semibold text-xs">Metas de longo prazo</div>
                  <ul className="list-disc list-inside space-y-1">
                    {diagnostics.longTermGoals.map((g) => (
                      <li key={g.target ?? g.id ?? JSON.stringify(g)}>{g.target ?? g.id}</li>
                    ))}
                  </ul>
                </div>
              )}
              {diagnostics.strategicPlan && (
                <div className="font-mono text-xs bg-emerald-100 p-2 rounded max-h-32 overflow-y-auto">
                  {JSON.stringify(diagnostics.strategicPlan).slice(0, 400)}...
                </div>
              )}
            </div>
          </div>

          {/* Empty State */}
          {!lastInsight && insights.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Nenhum insight ainda
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Faça um cálculo para receber sugestões
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MiniDashboard;
