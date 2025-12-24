import { AgentState, BaseAgent } from './baseAgent';

interface MarketplaceAgentState extends AgentState {
  marketplaceFees?: number;
  category?: string;
  policyViolation?: boolean;
}

export class MarketplaceAgent extends BaseAgent {
  analyze(state: MarketplaceAgentState): void {
    this.reset();
    const fees = state.marketplaceFees ?? 0;
    const category = state.category || 'general';
    if (fees > 0.2) {
      this.recommendations.push({
        message: 'Tarifas elevadas no marketplace, avaliar alternativas.',
        severity: 'medium',
        data: { fees, category },
      });
    }

    if (state.policyViolation) {
      this.recommendations.push({
        message: 'Possível violação de política de listing.',
        severity: 'high',
        data: { category },
      });
    }
  }

  emitEvents() {
    this.recommendations.forEach(rec => {
      if (rec.severity === 'high') {
        this.emit('agent:listing-issue', rec, 7);
      } else {
        this.emit('agent:competitive-price', rec, 6);
      }
    });
  }

  adapt(delta: number) {
    super.adapt(delta);
  }
}

