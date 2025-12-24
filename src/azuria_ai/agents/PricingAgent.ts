import { AgentState, BaseAgent } from './baseAgent';

interface PricingAgentState extends AgentState {
  margin?: number;
  cost?: number;
  price?: number;
}

export class PricingAgent extends BaseAgent {
  analyze(state: PricingAgentState): void {
    this.reset();
    const margin = state.margin ?? 0;
    const cost = state.cost ?? 0;
    const price = state.price ?? 0;

    if (margin < 0.1) {
      this.recommendations.push({
        message: 'Margem baixa detectada. Risco de subprecificação.',
        severity: 'high',
        data: { margin },
      });
    }

    const targetPrice = cost > 0 ? cost * 1.3 : price;
    if (price && targetPrice && price < targetPrice) {
      this.recommendations.push({
        message: 'Preço pode estar subestimado; sugerir ajuste.',
        severity: 'medium',
        data: { suggestedPrice: targetPrice },
      });
    }
  }

  emitEvents() {
    this.recommendations.forEach(rec => {
      if (rec.severity === 'high') {
        this.emit('agent:margin-risk', rec, 7);
      } else {
        this.emit('agent:optimal-price', rec, 6);
      }
    });
  }

  adapt(delta: number) {
    super.adapt(delta);
  }
}

