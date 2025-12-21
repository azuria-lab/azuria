/**
 * Agent Registry
 *
 * Este módulo gerencia o registro e descoberta de agentes internos da Azuria AI.
 *
 * Funcionalidades a serem implementadas:
 * - Registro de agentes disponíveis (cálculo, fiscal, marketplace, licitação, UI)
 * - Metadados de cada agente (capacidades, endpoints, prioridade)
 * - Sistema de descoberta de agentes por capacidade
 * - Validação de disponibilidade de agentes
 */

export type AgentCapability =
  | 'calculation'
  | 'tax'
  | 'pricing'
  | 'marketplace'
  | 'bidding'
  | 'risk'
  | 'opportunity'
  | 'analytics'
  | 'ui'
  | 'general';

export interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: AgentCapability[];
  endpoint?: string;
  priority: number;
}

export interface AgentRegistry {
  // Lógica de registro será implementada na próxima fase
  agents?: Agent[];
}

// Registro de agentes
const agentMap = new Map<string, Agent>();

/**
 * Registra um novo agente no sistema
 * @param agent - Configuração do agente
 */
export function registerAgent(agent: Agent): void {
  agentMap.set(agent.id, agent);
}

/**
 * Obtém um agente por ID
 * @param agentId - ID do agente
 * @returns Agente encontrado ou undefined
 */
export function getAgent(agentId: string): Agent | undefined {
  return agentMap.get(agentId);
}

/**
 * Lista todos os agentes registrados
 * @returns Array de agentes
 */
export function listAgents(): Agent[] {
  return Array.from(agentMap.values());
}

/**
 * Busca agentes por capacidade
 * @param capability - Capacidade desejada
 * @returns Lista de agentes que possuem a capacidade
 */
export function findAgentsByCapability(capability: AgentCapability): Agent[] {
  return listAgents().filter(agent => agent.capabilities.includes(capability));
}

/**
 * Obtém um agente por ID (alias para compatibilidade)
 * @deprecated Use getAgent instead
 */
export function getAgentById(agentId: string): Agent | undefined {
  return getAgent(agentId);
}
