import { emitEvent } from '../core/eventBus';
import { rewriteWithBrandVoice } from './brandVoiceEngine';

export interface EthicalState {
  risk?: number;
  intent?: string;
  userGoal?: string;
  aiPlan?: string;
}

function emitWarning(message: string, risk: number) {
  emitEvent('ai:ethical-warning', { message, risk }, { source: 'ethicalGuardEngine', priority: 9 });
}

export function evaluateEthicalRisk(state: EthicalState) {
  const risk = state.risk ?? (state.aiPlan?.includes('bypass') ? 0.8 : 0.2);
  if (risk >= 0.6) {
    emitWarning('Risco ético elevado detectado.', risk);
  }
  return risk;
}

export function detectUnsafeIntent(context: any) {
  if (!context) {return false;}
  const unsafe =
    context.intent === 'fraud' ||
    context.action === 'bypass_rules' ||
    context.message?.toLowerCase().includes('ilegal');
  if (unsafe) {
    emitWarning('Intenção insegura bloqueada.', 0.9);
  }
  return unsafe;
}

export function correctiveIntent(state: EthicalState) {
  const corrected = rewriteWithBrandVoice('Redirecionando para um caminho seguro e em conformidade.', 'padrao');
  emitEvent('ai:alignment-corrected', { message: corrected }, { source: 'ethicalGuardEngine', priority: 8 });
  return { ...state, correctedMessage: corrected };
}

export function scoreAlignment(userGoal?: string, aiPlan?: string) {
  if (!userGoal || !aiPlan) {return 0.5;}
  const aligned = aiPlan.toLowerCase().includes(userGoal.toLowerCase());
  const score = aligned ? 0.9 : 0.3;
  if (!aligned) {emitWarning('Plano desalinhado com objetivo do usuário.', 0.7);}
  return score;
}

export function enforceEthics(payload: any) {
  const risk = evaluateEthicalRisk(payload);
  const unsafe = detectUnsafeIntent(payload);
  if (risk >= 0.6 || unsafe) {
    const safe = correctiveIntent(payload);
    emitEvent('ai:unsafe-output-blocked', { reason: 'ethical_guard', original: payload }, { source: 'ethicalGuardEngine', priority: 10 });
    return { blocked: true, safe };
  }
  return { blocked: false };
}

