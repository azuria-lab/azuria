/**
 * ══════════════════════════════════════════════════════════════════════════════
 * RULES INDEX - Índice de Regras de Decisão
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Central de export para todas as regras de decisão do ConsciousnessCore.
 */

import { calculationRules } from './calculationRules';
import { navigationRules } from './navigationRules';
import { addDecisionRule } from '../DecisionEngine';

// Re-export individual rules
export { calculationRules } from './calculationRules';
export { navigationRules } from './navigationRules';

// All rules combined
export const allContextRules = [
  ...calculationRules,
  ...navigationRules,
];

/**
 * Registra todas as regras contextuais no DecisionEngine
 */
export function registerAllContextRules(): void {
  for (const rule of allContextRules) {
    addDecisionRule(rule);
  }
  
  // eslint-disable-next-line no-console
  console.log(`[Rules] Registered ${allContextRules.length} context rules`);
}

export default allContextRules;

