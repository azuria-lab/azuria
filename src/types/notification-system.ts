/**
 * Notification System Types
 * 
 * Tipos para sistema de notificações e alertas
 */

export type NotificationType = 
  | 'price_alert'
  | 'stock_alert'
  | 'competitor_price'
  | 'sale_completed'
  | 'sync_error'
  | 'review_received'
  | 'order_pending'
  | 'system'
  | 'webhook';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export type NotificationStatus = 'unread' | 'read' | 'archived';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message: string;
  description?: string;
  data?: Record<string, unknown>;
  
  // Actions
  actionable: boolean;
  actions?: NotificationAction[];
  
  // Source
  source: {
    type: 'marketplace' | 'product' | 'system' | 'webhook';
    id?: string;
    name?: string;
  };
  
  // Metadata
  createdAt: string;
  readAt?: string;
  archivedAt?: string;
  expiresAt?: string;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive';
  data?: Record<string, unknown>;
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  
  // Trigger conditions
  trigger: {
    type: NotificationType;
    conditions: {
      field: string;
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
      value: string | number | boolean;
    }[];
  };
  
  // Actions
  actions: {
    type: 'notification' | 'email' | 'webhook' | 'sms';
    config: Record<string, unknown>;
  }[];
  
  // Frequency control
  cooldown?: number; // minutes
  maxPerDay?: number;
  
  createdAt: string;
  updatedAt: string;
  lastTriggeredAt?: string;
  triggerCount: number;
}

export interface Webhook {
  id: string;
  name: string;
  description?: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  enabled: boolean;
  
  // Events to listen
  events: NotificationType[];
  
  // Security
  secret?: string;
  authentication?: {
    type: 'none' | 'basic' | 'bearer' | 'api_key';
    config: Record<string, string>;
  };
  
  // Retry config
  retryOnFailure: boolean;
  maxRetries: number;
  retryDelay: number; // seconds
  
  // Stats
  stats: {
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    lastCallAt?: string;
    lastStatus?: number;
    lastError?: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  webhookName: string;
  event: NotificationType;
  
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: Record<string, unknown>;
  };
  
  response?: {
    status: number;
    headers: Record<string, string>;
    body: string;
    duration: number; // ms
  };
  
  status: 'pending' | 'success' | 'failed' | 'retrying';
  error?: string;
  retryCount: number;
  
  createdAt: string;
  completedAt?: string;
}

export interface AlertConfig {
  priceAlerts: {
    enabled: boolean;
    competitorPriceChange: {
      enabled: boolean;
      threshold: number; // percentage
    };
    aboveMarketPrice: {
      enabled: boolean;
      threshold: number; // percentage
    };
    belowCost: {
      enabled: boolean;
    };
  };
  stockAlerts: {
    enabled: boolean;
    lowStock: {
      enabled: boolean;
      useProductThreshold: boolean;
      globalThreshold?: number;
    };
    outOfStock: {
      enabled: boolean;
    };
    overstock: {
      enabled: boolean;
      threshold: number; // days of inventory
    };
  };
  salesAlerts: {
    enabled: boolean;
    newOrder: boolean;
    orderCancelled: boolean;
    paymentReceived: boolean;
  };
  syncAlerts: {
    enabled: boolean;
    syncFailure: boolean;
    syncSuccess: boolean;
  };
}

export interface NotificationFilter {
  type?: NotificationType[];
  priority?: NotificationPriority[];
  status?: NotificationStatus[];
  source?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
  sortBy?: 'created_at' | 'priority' | 'type';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
  todayCount: number;
  weekCount: number;
  averagePerDay: number;
}
