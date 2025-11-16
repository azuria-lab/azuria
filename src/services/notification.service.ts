/**
 * Notification Service
 * 
 * Serviço para gerenciamento de notificações e alertas
 */

import type { 
  AlertConfig,
  Notification, 
  NotificationFilter, 
  NotificationRule, 
  NotificationStats,
  Webhook,
  WebhookLog
} from '@/types/notification-system';

class NotificationService {
  private listeners: ((notification: Notification) => void)[] = [];

  /**
   * Subscribe to real-time notifications
   */
  subscribe(callback: (notification: Notification) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Emit notification to all subscribers
   */
  private emit(notification: Notification): void {
    for (const callback of this.listeners) {
      callback(notification);
    }
  }

  /**
   * Lista notificações com filtros
   */
  async listNotifications(filters?: NotificationFilter): Promise<{ notifications: Notification[]; total: number }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const now = new Date();
    const mockNotifications: Notification[] = [
      {
        id: 'notif-1',
        type: 'competitor_price',
        priority: 'high',
        status: 'unread',
        title: 'Concorrente reduziu preço',
        message: 'iPhone 15 Pro: Concorrente vendendo por R$ 6.799 (-5.5%)',
        description: 'TechStore Brasil está vendendo R$ 500 abaixo do seu preço',
        actionable: true,
        actions: [
          { id: 'adjust-price', label: 'Ajustar Preço', action: 'adjust_price', variant: 'primary' },
          { id: 'view-product', label: 'Ver Produto', action: 'view_product', variant: 'secondary' }
        ],
        source: { type: 'product', id: 'prod-1', name: 'iPhone 15 Pro 256GB' },
        createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif-2',
        type: 'stock_alert',
        priority: 'critical',
        status: 'unread',
        title: 'Estoque crítico',
        message: 'Apple Watch Ultra 2: Apenas 3 unidades restantes',
        description: 'Estoque abaixo do limite mínimo de 5 unidades',
        actionable: true,
        actions: [
          { id: 'reorder', label: 'Reabastecer', action: 'reorder', variant: 'primary' },
          { id: 'pause-sales', label: 'Pausar Vendas', action: 'pause_sales', variant: 'destructive' }
        ],
        source: { type: 'product', id: 'prod-5', name: 'Apple Watch Ultra 2' },
        createdAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString()
      },
      {
        id: 'notif-3',
        type: 'sale_completed',
        priority: 'medium',
        status: 'unread',
        title: 'Nova venda realizada',
        message: 'Samsung Galaxy S24 Ultra vendido no Mercado Livre',
        description: 'Valor: R$ 6.499 • Marketplace: Mercado Livre',
        actionable: false,
        source: { type: 'marketplace', id: 'mercado-livre', name: 'Mercado Livre' },
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif-4',
        type: 'price_alert',
        priority: 'high',
        status: 'read',
        title: 'Preço acima do mercado',
        message: 'MacBook Air M3: Seu preço está 8% acima da média',
        description: 'Média do mercado: R$ 8.599 • Seu preço: R$ 9.299',
        actionable: true,
        actions: [
          { id: 'adjust-price', label: 'Ajustar Preço', action: 'adjust_price', variant: 'primary' }
        ],
        source: { type: 'product', id: 'prod-3', name: 'MacBook Air M3 13"' },
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        readAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif-5',
        type: 'sync_error',
        priority: 'medium',
        status: 'unread',
        title: 'Erro na sincronização',
        message: 'Falha ao sincronizar 3 produtos com a Shopee',
        description: 'Produtos: iPhone 15 Pro, AirPods Pro 2, Watch Ultra 2',
        actionable: true,
        actions: [
          { id: 'retry-sync', label: 'Tentar Novamente', action: 'retry_sync', variant: 'primary' },
          { id: 'view-logs', label: 'Ver Logs', action: 'view_logs', variant: 'secondary' }
        ],
        source: { type: 'marketplace', id: 'shopee', name: 'Shopee' },
        createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif-6',
        type: 'review_received',
        priority: 'low',
        status: 'read',
        title: 'Nova avaliação recebida',
        message: 'AirPods Pro 2ª Geração recebeu avaliação 5 estrelas',
        description: '"Excelente produto, chegou rápido!" - Cliente: João Silva',
        actionable: true,
        actions: [
          { id: 'reply', label: 'Responder', action: 'reply_review', variant: 'primary' }
        ],
        source: { type: 'product', id: 'prod-4', name: 'AirPods Pro 2ª Geração' },
        createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
        readAt: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'notif-7',
        type: 'webhook',
        priority: 'low',
        status: 'read',
        title: 'Webhook executado com sucesso',
        message: 'Webhook "Atualização de Estoque" chamado',
        description: 'Status: 200 OK • Duração: 245ms',
        actionable: false,
        source: { type: 'system' },
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        readAt: new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString()
      }
    ];

    let filtered = [...mockNotifications];

    if (filters?.status && filters.status.length > 0) {
      filtered = filtered.filter(n => filters.status?.includes(n.status));
    }

    if (filters?.type && filters.type.length > 0) {
      filtered = filtered.filter(n => filters.type?.includes(n.type));
    }

    if (filters?.priority && filters.priority.length > 0) {
      filtered = filtered.filter(n => filters.priority?.includes(n.priority));
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(search) ||
        n.message.toLowerCase().includes(search)
      );
    }

    return {
      notifications: filtered,
      total: filtered.length
    };
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(_notificationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  /**
   * Marca todas notificações como lidas
   */
  async markAllAsRead(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  /**
   * Arquiva notificação
   */
  async archiveNotification(_notificationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  /**
   * Deleta notificação
   */
  async deleteNotification(_notificationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  /**
   * Retorna estatísticas de notificações
   */
  async getStats(): Promise<NotificationStats> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      total: 125,
      unread: 4,
      byType: {
        price_alert: 23,
        stock_alert: 18,
        competitor_price: 15,
        sale_completed: 42,
        sync_error: 8,
        review_received: 12,
        order_pending: 5,
        system: 1,
        webhook: 1
      },
      byPriority: {
        low: 45,
        medium: 52,
        high: 23,
        critical: 5
      },
      todayCount: 7,
      weekCount: 35,
      averagePerDay: 5
    };
  }

  /**
   * Lista regras de notificação
   */
  async listRules(): Promise<NotificationRule[]> {
    await new Promise(resolve => setTimeout(resolve, 400));

    return [
      {
        id: 'rule-1',
        name: 'Alerta de Preço Concorrente',
        description: 'Notifica quando concorrente reduz preço em mais de 5%',
        enabled: true,
        trigger: {
          type: 'competitor_price',
          conditions: [
            { field: 'price_change_percent', operator: 'greater_than', value: 5 }
          ]
        },
        actions: [
          { type: 'notification', config: { priority: 'high' } },
          { type: 'email', config: { recipients: ['admin@azuria.com'] } }
        ],
        cooldown: 60,
        maxPerDay: 10,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        lastTriggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        triggerCount: 145
      },
      {
        id: 'rule-2',
        name: 'Estoque Baixo',
        description: 'Notifica quando estoque atinge limite mínimo',
        enabled: true,
        trigger: {
          type: 'stock_alert',
          conditions: [
            { field: 'stock_level', operator: 'less_than', value: 'threshold' }
          ]
        },
        actions: [
          { type: 'notification', config: { priority: 'high' } },
          { type: 'webhook', config: { webhookId: 'webhook-1' } }
        ],
        cooldown: 120,
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        lastTriggeredAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        triggerCount: 87
      }
    ];
  }

  /**
   * Cria nova regra
   */
  async createRule(rule: Partial<NotificationRule>): Promise<NotificationRule> {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      id: `rule-${Date.now()}`,
      name: rule.name || 'Nova Regra',
      description: rule.description || '',
      enabled: rule.enabled ?? true,
      trigger: rule.trigger || { type: 'system', conditions: [] },
      actions: rule.actions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      triggerCount: 0,
      ...rule
    } as NotificationRule;
  }

  /**
   * Lista webhooks
   */
  async listWebhooks(): Promise<Webhook[]> {
    await new Promise(resolve => setTimeout(resolve, 400));

    return [
      {
        id: 'webhook-1',
        name: 'Atualização de Estoque',
        description: 'Notifica sistema ERP sobre mudanças de estoque',
        url: 'https://api.example.com/webhooks/stock-update',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        enabled: true,
        events: ['stock_alert'],
        secret: '••••••••',
        authentication: {
          type: 'bearer',
          config: { token: '••••••••' }
        },
        retryOnFailure: true,
        maxRetries: 3,
        retryDelay: 30,
        stats: {
          totalCalls: 245,
          successfulCalls: 238,
          failedCalls: 7,
          lastCallAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          lastStatus: 200
        },
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'webhook-2',
        name: 'Slack - Vendas',
        description: 'Envia notificação no Slack quando há nova venda',
        url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX',
        method: 'POST',
        enabled: true,
        events: ['sale_completed'],
        authentication: { type: 'none', config: {} },
        retryOnFailure: true,
        maxRetries: 2,
        retryDelay: 15,
        stats: {
          totalCalls: 523,
          successfulCalls: 520,
          failedCalls: 3,
          lastCallAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          lastStatus: 200
        },
        createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  /**
   * Cria webhook
   */
  async createWebhook(webhook: Partial<Webhook>): Promise<Webhook> {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      id: `webhook-${Date.now()}`,
      name: webhook.name || 'Novo Webhook',
      url: webhook.url || '',
      method: webhook.method || 'POST',
      enabled: webhook.enabled ?? true,
      events: webhook.events || [],
      retryOnFailure: webhook.retryOnFailure ?? true,
      maxRetries: webhook.maxRetries ?? 3,
      retryDelay: webhook.retryDelay ?? 30,
      stats: {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...webhook
    } as Webhook;
  }

  /**
   * Testa webhook
   */
  async testWebhook(_webhookId: string): Promise<{ success: boolean; status: number; duration: number }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = Math.random() > 0.1;
    return {
      success,
      status: success ? 200 : 500,
      duration: 150 + Math.random() * 200
    };
  }

  /**
   * Lista logs de webhook
   */
  async listWebhookLogs(webhookId: string): Promise<WebhookLog[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const now = new Date();
    return [
      {
        id: 'log-1',
        webhookId,
        webhookName: 'Atualização de Estoque',
        event: 'stock_alert',
        request: {
          url: 'https://api.example.com/webhooks/stock-update',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: { productId: 'prod-5', stock: 3, threshold: 5 }
        },
        response: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: '{"success": true}',
          duration: 245
        },
        status: 'success',
        retryCount: 0,
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000 + 245).toISOString()
      },
      {
        id: 'log-2',
        webhookId,
        webhookName: 'Atualização de Estoque',
        event: 'stock_alert',
        request: {
          url: 'https://api.example.com/webhooks/stock-update',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: { productId: 'prod-3', stock: 8, threshold: 5 }
        },
        status: 'failed',
        error: 'Connection timeout',
        retryCount: 3,
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  /**
   * Retorna configuração de alertas
   */
  async getAlertConfig(): Promise<AlertConfig> {
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      priceAlerts: {
        enabled: true,
        competitorPriceChange: { enabled: true, threshold: 5 },
        aboveMarketPrice: { enabled: true, threshold: 8 },
        belowCost: { enabled: true }
      },
      stockAlerts: {
        enabled: true,
        lowStock: { enabled: true, useProductThreshold: true },
        outOfStock: { enabled: true },
        overstock: { enabled: false, threshold: 60 }
      },
      salesAlerts: {
        enabled: true,
        newOrder: true,
        orderCancelled: true,
        paymentReceived: false
      },
      syncAlerts: {
        enabled: true,
        syncFailure: true,
        syncSuccess: false
      }
    };
  }

  /**
   * Atualiza configuração de alertas
   */
  async updateAlertConfig(config: Partial<AlertConfig>): Promise<AlertConfig> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const current = await this.getAlertConfig();
    return { ...current, ...config };
  }

  /**
   * Simula envio de notificação em tempo real
   */
  simulateRealtimeNotification(): void {
    const notification: Notification = {
      id: `notif-${Date.now()}`,
      type: 'sale_completed',
      priority: 'medium',
      status: 'unread',
      title: 'Nova venda!',
      message: 'iPhone 15 Pro vendido por R$ 7.299',
      actionable: false,
      source: { type: 'marketplace', name: 'Mercado Livre' },
      createdAt: new Date().toISOString()
    };

    this.emit(notification);
  }
}

export const notificationService = new NotificationService();
