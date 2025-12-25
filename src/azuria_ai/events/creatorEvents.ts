export interface CreatorEvent {
  severity: string;
  area: string;
   
  details: Record<string, unknown>;
  recommendation: string;
}

