export type ResourceId =
  | 'rapid-calculator'
  | 'advanced-calculator'
  | 'tax-calculator'
  | 'bidding-calculator'
  | 'analytics'
  | 'marketplaces'
  | 'automation'
  | 'ai';

export interface Resource {
  id: ResourceId;
  label: string;
  description: string;
  icon: string;
}

export interface FlowBlock {
  id: string;
  label: string;
  description: string;
  tooltip: string;
  icon: string;
  position: { x: number; y: number };
  highlight?: boolean;
  size?: 'normal' | 'large';
}

export interface FlowConnection {
  id: string;
  source: string;
  target: string;
}

