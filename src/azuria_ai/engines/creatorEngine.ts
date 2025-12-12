/* eslint-disable no-console */
import { emitEvent } from '../core/eventBus';
import { insertAlert } from '../../server/creatorStore';

export class CreatorEngine {
  constructor() {}

  async runSystemScan() {
    console.log('Rodando análise estruturada do ecossistema...');

    const insights = this.generateInsights();
    const risks = this.detectRisks();
    const roadmap = this.suggestRoadmap();

    const payload = {
      severity: this.getHighestSeverity(risks),
      area: 'ecosystem',
      details: { insights, risks, roadmap },
      recommendation: 'Revise o painel do criador para ações sugeridas.',
      originEngine: 'creatorEngine',
      confidence: 0.7,
      suggestedAction: 'Abrir /admin/creator e validar recomendações',
      timestamp: Date.now(),
      message: 'Novo alerta do Painel do Criador',
    };

    // Persistir antes de emitir para evitar duplicidade
    const saved = await insertAlert({
      type: 'alert',
      area: payload.area,
      severity: payload.severity,
      message: payload.message,
      payload,
      originEngine: payload.originEngine,
      confidence: payload.confidence,
      suggestedAction: payload.suggestedAction,
      status: 'new',
    });

    emitEvent('ai:creator-alert', saved);
    emitEvent('ai:creator-alert', saved);
  }

  generateInsights() {
    return {
      modulesUnderStress: ['pricingEngine', 'lotesEngine'],
      unusedFeatures: ['legacyReports'],
      optimizationTargets: ['analyticsPipeline', 'taxEngine'],
    };
  }

  detectRisks() {
    return [
      { module: 'pricingEngine', risk: 'alta complexidade crescente' },
      { module: 'taxEngine', risk: 'probabilidade de cálculos divergentes' },
    ];
  }

  suggestRoadmap() {
    return [
      'Refatorar taxEngine para pipelines independentes',
      'Unificar cálculos redundantes da BasicCalc e AdvancedCalc',
      'Criar módulo de precificação offline',
    ];
  }

  getHighestSeverity(risks: any[]) {
    return risks.length > 1 ? 'high' : 'medium';
  }
}

