export interface EvolutionLearning {
  source: string;
  concept: string;
  confidence: number;
  example?: string;
}

export interface EvolutionPattern {
  pattern: string;
  frequency: number;
  impact: number;
  details: any;
}

export interface EvolutionInsight {
  insight: string;
  relevance: number;
  recommendedAction?: string;
}

export interface EvolutionMemory {
  key: string;
  value: any;
  reason: string;
}

export interface EvolutionQuery {
  question: string;
  context: any;
}

