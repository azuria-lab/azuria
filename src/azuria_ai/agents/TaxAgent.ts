import { AgentState, BaseAgent } from './baseAgent';

interface TaxData {
  icms?: number;
  origin?: string;
  destination?: string;
}

export class TaxAgent extends BaseAgent {
  analyze(state: AgentState): void {
    this.reset();
    const taxes = (state?.taxes as TaxData) || {};
    if (taxes.icms && taxes.icms > 0.3) {
      this.recommendations.push({
        message: 'ICMS acima de 30%, revisar alíquota.',
        severity: 'high',
        data: { icms: taxes.icms },
      });
    }
    if (taxes.origin && taxes.destination && taxes.origin === taxes.destination) {
      this.recommendations.push({
        message: 'Origem e destino iguais, verifique DIFAL.',
        severity: 'medium',
      });
    }
  }

  emitEvents() {
    this.recommendations.forEach(rec => {
      if (rec.severity === 'high' || rec.severity === 'critical') {
        this.emit('agent:tax-warning', rec, 7);
      } else {
        this.emit('agent:tax-correction-suggested', rec, 5);
      }
    });
  }

  adapt(delta: number) {
    super.adapt(delta);
  }
}

