import { emitEvent } from '../core/eventBus';

type FrictionLevel = 'low' | 'medium' | 'high';

interface PaywallVariant {
  variantId: string;
  friction: FrictionLevel;
  message: string;
}

const variants: PaywallVariant[] = [
  { variantId: 'A', friction: 'low', message: 'Experimente o PRO sem compromisso.' },
  { variantId: 'B', friction: 'medium', message: 'Desbloqueie recursos avançados agora.' },
  { variantId: 'C', friction: 'high', message: 'Plano completo: suporte premium e relatórios.' },
];

export function selectPaywallVariant(userType: 'free' | 'pro' | 'enterprise', abSlot = 0): PaywallVariant {
  const idx = abSlot % variants.length;
  const base = variants[idx];

  if (userType === 'free') {return base;}
  if (userType === 'pro') {return { ...base, friction: 'medium', message: 'Faça upgrade para Enterprise com onboarding dedicado.' };}
  return { ...base, friction: 'low', message: 'Fale com nosso time para planos customizados.' };
}

export function runPaywallExperiment(userType: 'free' | 'pro' | 'enterprise', abSlot = 0) {
  const variant = selectPaywallVariant(userType, abSlot);
  emitEvent(
    'ai:pricing-opportunity',
    { variant },
    { source: 'smartPaywallEngine', priority: 5 }
  );
  return variant;
}

