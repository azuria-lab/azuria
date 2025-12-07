import { BaseAgent } from './baseAgent';

export class OpportunityAgent extends BaseAgent {
  analyze(state: any): void {
    this.reset();
    const stock = state?.stock ?? 0;
    const demand = state?.demand ?? 0;
    if (demand > stock && stock > 0) {
      this.recommendations.push({
        message: 'Demanda alta vs estoque; oportunidade de ajuste de preço.',
        severity: 'medium',
        data: { stock, demand },
      });
    }
    if (state?.bundleOpportunity) {
      this.recommendations.push({
        message: 'Sugestão: criar bundle promocional.',
        severity: 'low',
      });
    }
  }

  emitEvents() {
    this.recommendations.forEach(rec => {
      if (rec.severity === 'medium' || rec.severity === 'high') {
        this.emit('agent:opportunity-found', rec, 6);
      } else {
        this.emit('agent:boost-suggested', rec, 5);
      }
    });
  }

  adapt(delta: number) {
    super.adapt(delta);
  }
}

