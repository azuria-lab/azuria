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
   
  details: Record<string, unknown>;
}

export interface EvolutionInsight {
  insight: string;
  relevance: number;
  recommendedAction?: string;
}

export interface EvolutionMemory {
  key: string;
   
  value: unknown;
  reason: string;
}

export interface EvolutionQuery {
  question: string;
   
  context: Record<string, unknown>;
}

