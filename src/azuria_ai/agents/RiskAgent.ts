import { BaseAgent } from './baseAgent';

export class RiskAgent extends BaseAgent {
  analyze(state: any): void {
    this.reset();
    const anomaly = state?.anomalyScore ?? 0;
    const loss = state?.predictedLoss ?? 0;

    if (anomaly > 0.7) {
      this.recommendations.push({
        message: 'Comportamento fora do padrão detectado.',
        severity: 'high',
        data: { anomaly },
      });
    }
    if (loss > 0) {
      this.recommendations.push({
        message: 'Risco de prejuízo previsto.',
        severity: 'critical',
        data: { loss },
      });
    }
  }

  emitEvents() {
    this.recommendations.forEach(rec => {
      if (rec.severity === 'critical') {
        this.emit('agent:loss-predicted', rec, 8);
      } else {
        this.emit('agent:risk-detected', rec, 7);
      }
    });
  }

  adapt(delta: number) {
    super.adapt(delta);
  }
}

