import { emitEvent, EventType } from '../core/eventBus';

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(eventType: EventType, payload: any, priority = 5) {
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

