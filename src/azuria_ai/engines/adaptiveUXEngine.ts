import { emitEvent } from '../core/eventBus';

interface LayoutSuggestion {
  moveSections?: string[];
  highlight?: string[];
  shortcuts?: string[];
  hide?: string[];
}

interface UserBehavior {
  lowUseSections?: string[];
  frequentPaths?: string[];
  intent?: string;
}

export function adaptLayoutFromBehavior(behavior: UserBehavior): LayoutSuggestion {
  const suggestion: LayoutSuggestion = {};

  if (behavior?.lowUseSections) {
    suggestion.hide = behavior.lowUseSections.slice(0, 2);
  }
  if (behavior?.frequentPaths) {
    suggestion.shortcuts = behavior.frequentPaths.slice(0, 3);
  }
  if (behavior?.intent === 'pricing') {
    suggestion.highlight = ['calculadora', 'margem', 'icms'];
  }
  return suggestion;
}

export function proposeAdaptiveUX(behavior: UserBehavior) {
  const layout = adaptLayoutFromBehavior(behavior);
  emitEvent('ui:adaptive-layout', { layout }, { source: 'adaptiveUXEngine', priority: 4 });
  return layout;
}

