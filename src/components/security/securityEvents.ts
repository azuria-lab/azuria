export type SecurityEventDetail = {
  type: string;
  details: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
};

export const dispatchSecurityEvent = (
  type: string,
  details: Record<string, unknown>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
) => {
  window.dispatchEvent(new CustomEvent<SecurityEventDetail>('security-event', {
    detail: { type, details, severity }
  }));
};
