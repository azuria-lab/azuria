
export interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  category: 'auth' | 'calculation' | 'settings' | 'data' | 'security';
  userId: string;
  userName: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface AuditLogFilters {
  searchTerm: string;
  categoryFilter: string;
  riskFilter: string;
}
