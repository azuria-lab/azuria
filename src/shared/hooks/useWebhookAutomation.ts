
import { useCallback, useState } from "react";
import { toast } from "@/components/ui/use-toast";

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  lastTriggered?: string;
  retries: number;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'calculation_completed' | 'price_changed' | 'margin_alert' | 'competitor_alert';
  conditions: {
    minMargin?: number;
    maxMargin?: number;
    categories?: string[];
    priceThreshold?: number;
  };
  webhooks: string[];
  active: boolean;
}

export const useWebhookAutomation = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addWebhook = useCallback((webhook: Omit<WebhookConfig, 'id'>) => {
    const newWebhook: WebhookConfig = {
      ...webhook,
      id: Date.now().toString(),
    };
    
    setWebhooks(prev => [...prev, newWebhook]);
    
    toast.success(`Webhook "${webhook.name}" adicionado com sucesso`);
    return newWebhook.id;
  }, []);

  const updateWebhook = useCallback((id: string, updates: Partial<WebhookConfig>) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === id ? { ...webhook, ...updates } : webhook
    ));
    
    toast.success("Webhook atualizado com sucesso");
  }, []);

  const deleteWebhook = useCallback((id: string) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== id));
    
    // Remove webhook de todas as regras de automação
    setAutomationRules(prev => prev.map(rule => ({
      ...rule,
      webhooks: rule.webhooks.filter(webhookId => webhookId !== id)
    })));
    
    toast.success("Webhook removido com sucesso");
  }, []);

  const testWebhook = useCallback(async (id: string) => {
    const webhook = webhooks.find(w => w.id === id);
    if (!webhook) {return;}

    setIsLoading(true);
    
    try {
      const testPayload = {
        event: "test",
        timestamp: new Date().toISOString(),
        source: "Precifica+",
        data: {
          message: "Este é um teste de webhook do Precifica+",
          webhook_name: webhook.name
        }
      };

  const _response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(testPayload),
      });

      // Atualizar último disparo
      updateWebhook(id, { lastTriggered: new Date().toLocaleString('pt-BR') });
      
      toast.success(`Webhook "${webhook.name}" testado com sucesso`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Erro ao testar webhook: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [webhooks, updateWebhook]);

  const triggerWebhook = useCallback(async (
    webhookId: string, 
    event: string, 
  data: unknown
  ) => {
    const webhook = webhooks.find(w => w.id === webhookId);
    if (!webhook || !webhook.active) {return;}

    try {
      const payload = {
        event,
        timestamp: new Date().toISOString(),
        source: "Precifica+",
        data
      };

      await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(payload),
      });

      // Atualizar último disparo
      updateWebhook(webhookId, { lastTriggered: new Date().toLocaleString('pt-BR') });
      
  } catch (_error) {
      // Implementar retry logic
      
      // Implementar retry logic
      if (webhook.retries < 3) {
        setTimeout(() => {
          void triggerWebhook(webhookId, event, data);
          updateWebhook(webhookId, { retries: webhook.retries + 1 });
        }, 5000 * (webhook.retries + 1)); // Backoff exponencial
      }
    }
  }, [webhooks, updateWebhook]);

  const addAutomationRule = useCallback((rule: Omit<AutomationRule, 'id'>) => {
    const newRule: AutomationRule = {
      ...rule,
      id: Date.now().toString(),
    };
    
    setAutomationRules(prev => [...prev, newRule]);
    
    toast.success(`Regra de automação "${rule.name}" criada`);
    return newRule.id;
  }, []);

  const updateAutomationRule = useCallback((id: string, updates: Partial<AutomationRule>) => {
    setAutomationRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
    
    toast.success("Regra de automação atualizada");
  }, []);

  const deleteAutomationRule = useCallback((id: string) => {
    setAutomationRules(prev => prev.filter(rule => rule.id !== id));
    
    toast.success("Regra de automação removida");
  }, []);

  const isExecutionData = (d: unknown): d is { margin?: number; category?: string } =>
    typeof d === 'object' && d !== null;

  const executeAutomation = useCallback(async (
    trigger: AutomationRule['trigger'],
    data: unknown
  ) => {
    const applicableRules = automationRules.filter(rule => 
      rule.active && rule.trigger === trigger
    );

    for (const rule of applicableRules) {
      // Verificar condições
      let shouldExecute = true;

    if (rule.conditions.minMargin && isExecutionData(data) && typeof data.margin === 'number' && data.margin < rule.conditions.minMargin) {
        shouldExecute = false;
      }
      
    if (rule.conditions.maxMargin && isExecutionData(data) && typeof data.margin === 'number' && data.margin > rule.conditions.maxMargin) {
        shouldExecute = false;
      }
      
    if (rule.conditions.categories && isExecutionData(data) && typeof data.category === 'string' && 
      !rule.conditions.categories.includes(data.category)) {
        shouldExecute = false;
      }

      if (shouldExecute) {
        // Disparar webhooks da regra
        for (const webhookId of rule.webhooks) {
          await triggerWebhook(webhookId, trigger, data);
        }
      }
    }
  }, [automationRules, triggerWebhook]);

  // Função para simular eventos automáticos (seria chamada pelos outros componentes)
  const simulateCalculationEvent = useCallback((calculationData: unknown) => {
    executeAutomation('calculation_completed', calculationData);
  }, [executeAutomation]);

  const simulatePriceChangeEvent = useCallback((priceData: unknown) => {
    executeAutomation('price_changed', priceData);
  }, [executeAutomation]);

  return {
    webhooks,
    automationRules,
    isLoading,
    addWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    triggerWebhook,
    addAutomationRule,
    updateAutomationRule,
    deleteAutomationRule,
    executeAutomation,
    simulateCalculationEvent,
    simulatePriceChangeEvent,
  };
};
