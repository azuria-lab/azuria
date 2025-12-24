import { emitEvent } from '../core/eventBus';

export interface AgentRecommendation {
  message: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  data?: Record<string, unknown>;
}

export interface AgentState {
  [key: string]: unknown;
}

export abstract class BaseAgent {
  protected recommendations: AgentRecommendation[] = [];
  protected threshold = 0.5;

  abstract analyze(state: AgentState): void;

  emit(eventType: string, payload: unknown, priority = 5) {
    emitEvent(eventType, payload, { source: this.constructor.name, priority });
  }

  emitEvents() {
    // No-op default
  }

  getRecommendations(): AgentRecommendation[] {
    return [...this.recommendations];
  }

  protected reset() {
    this.recommendations = [];
  }

  adapt(delta: number) {
    this.threshold = Math.max(0.1, Math.min(0.9, this.threshold + delta));
  }
}

