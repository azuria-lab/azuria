interface AgentMemoryEntry {
  action?: any;
  outcome?: 'success' | 'failure';
  reason?: string;
  metrics?: Record<string, number>;
  context?: any;
  timestamp: number;
}

interface AgentMemoryState {
  history: AgentMemoryEntry[];
  performance: Record<string, number>;
  heuristics: Record<string, number>;
  lastDecision?: AgentMemoryEntry;
}

const MEMORY_LIMIT = 200;
const agentMemory: Record<string, AgentMemoryState> = {};

function ensure(agentId: string): AgentMemoryState {
  if (!agentMemory[agentId]) {
    agentMemory[agentId] = {
      history: [],
      performance: {},
      heuristics: {},
    };
  }
  return agentMemory[agentId];
}

export function recordAgentEvent(agentId: string, entry: AgentMemoryEntry) {
  const state = ensure(agentId);
  state.history.push(entry);
  state.lastDecision = entry;
  if (state.history.length > MEMORY_LIMIT) state.history.shift();
}

export function updateHeuristic(agentId: string, key: string, value: number) {
  const state = ensure(agentId);
  state.heuristics[key] = value;
}

export function getAgentMemory(agentId: string): AgentMemoryState {
  return ensure(agentId);
}

export function updatePerformance(agentId: string, metric: string, delta: number) {
  const state = ensure(agentId);
  state.performance[metric] = (state.performance[metric] || 0) + delta;
}

