
import { useCallback, useRef, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { hmacSha256Hex, randomUUID, timingSafeEqualHex } from '@/utils/crypto';
import { logger } from '@/services/logger';

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  direction: 'incoming' | 'outgoing' | 'bidirectional';
  events: string[];
  active: boolean;
  security: {
    secret?: string;
    signatureHeader?: string;
    authMethod?: 'hmac' | 'bearer' | 'basic';
  };
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    maxBackoffMs: number;
  };
  filters?: {
    conditions: Array<{
      field: string;
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: unknown;
    }>;
  };
  lastTriggered?: string;
  stats: {
    totalSent: number;
    totalReceived: number;
    successRate: number;
    avgResponseTime: number;
  };
}

export interface WebhookPayload {
  id: string;
  event: string;
  timestamp: string;
  data: unknown;
  source: string;
  signature?: string;
}

export interface IncomingWebhookHandler {
  event: string;
  handler: (payload: WebhookPayload) => Promise<unknown>;
}

export const useBidirectionalWebhooks = () => {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [incomingHandlers, setIncomingHandlers] = useState<Map<string, IncomingWebhookHandler>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const retryQueues = useRef<Map<string, WebhookPayload[]>>(new Map());

  // Gerar assinatura HMAC para segurança (assíncrono via Web Crypto)
  const generateSignature = useCallback(async (payload: string, secret: string): Promise<string> => {
    return hmacSha256Hex(secret, payload);
  }, []);

  // Verificar assinatura de webhook recebido
  const verifySignature = useCallback(async (payload: string, signature: string, secret: string): Promise<boolean> => {
    const expectedSignature = await generateSignature(payload, secret);
    return timingSafeEqualHex(signature, expectedSignature);
  }, [generateSignature]);

  // Adicionar endpoint de webhook
  const addEndpoint = useCallback((endpoint: Omit<WebhookEndpoint, 'id' | 'stats'>) => {
    const newEndpoint: WebhookEndpoint = {
      ...endpoint,
      id: randomUUID(),
      stats: {
        totalSent: 0,
        totalReceived: 0,
        successRate: 100,
        avgResponseTime: 0
      }
    };

    setEndpoints(prev => [...prev, newEndpoint]);
    
    if (endpoint.direction === 'incoming' || endpoint.direction === 'bidirectional') {
      // Registrar endpoint para receber webhooks
      toast.success(`Endpoint "${endpoint.name}" configurado para receber webhooks`);
    }

    return newEndpoint.id;
  }, []);

  // Registrar handler para webhook recebido
  const registerIncomingHandler = useCallback((event: string, handler: (payload: WebhookPayload) => Promise<unknown>) => {
    setIncomingHandlers(prev => new Map(prev.set(event, { event, handler })));
  }, []);

  // Processar webhook recebido
  const processIncomingWebhook = useCallback(async (
    endpointId: string,
    payload: WebhookPayload,
    signature?: string
  ) => {
    const endpoint = endpoints.find(e => e.id === endpointId);
    if (!endpoint || !endpoint.active) {
      throw new Error('Endpoint não encontrado ou inativo');
    }

    // Verificar assinatura se configurada
    if (endpoint.security.secret && signature) {
      const payloadString = JSON.stringify(payload);
      const valid = await verifySignature(payloadString, signature, endpoint.security.secret);
      if (!valid) {
        throw new Error('Assinatura inválida');
      }
    }

    // Aplicar filtros se configurados
    if (endpoint.filters?.conditions.length) {
      const passesFilter = endpoint.filters.conditions.every(condition => {
        const dataObj = (typeof payload.data === 'object' && payload.data !== null)
          ? (payload.data as Record<string, unknown>)
          : {};
        const fieldValue = dataObj[condition.field];
        switch (condition.operator) {
          case 'equals':
            return fieldValue === condition.value;
          case 'contains':
            return String(fieldValue ?? '').includes(String(condition.value ?? ''));
          case 'greater_than':
            return Number(fieldValue) > Number(condition.value);
          case 'less_than':
            return Number(fieldValue) < Number(condition.value);
          default:
            return true;
        }
      });

      if (!passesFilter) {
  logger.info('Webhook filtrado:', payload);
        return { processed: false, reason: 'Filtrado' };
      }
    }

    // Processar com handler específico
    const handler = incomingHandlers.get(payload.event);
    if (!handler) {
  logger.warn(`Nenhum handler encontrado para evento: ${payload.event}`);
      return { processed: false, reason: 'Handler não encontrado' };
    }

    try {
      const result = await handler.handler(payload);
      
      // Atualizar estatísticas
      setEndpoints(prev => prev.map(e => 
        e.id === endpointId 
          ? {
              ...e,
              stats: {
                ...e.stats,
                totalReceived: e.stats.totalReceived + 1
              },
              lastTriggered: new Date().toISOString()
            }
          : e
      ));

      return { processed: true, result };
    } catch (error) {
  logger.error('Erro ao processar webhook:', error);
      throw error;
    }
  }, [endpoints, incomingHandlers, verifySignature]);

  // Enviar webhook com retry automático
  const sendWebhook = useCallback(async (
    endpointId: string,
    event: string,
  data: unknown,
    options?: { immediate?: boolean; customPayload?: Partial<WebhookPayload> }
  ) => {
    const endpoint = endpoints.find(e => e.id === endpointId);
    if (!endpoint || !endpoint.active) {
      throw new Error('Endpoint não encontrado ou inativo');
    }

    if (endpoint.direction === 'incoming') {
      throw new Error('Endpoint configurado apenas para receber webhooks');
    }

    const payload: WebhookPayload = {
  id: randomUUID(),
      event,
      timestamp: new Date().toISOString(),
      data,
      source: 'Precifica+',
      ...options?.customPayload
    };

    // Adicionar assinatura se configurada
    if (endpoint.security.secret) {
      const payloadString = JSON.stringify(payload);
      payload.signature = await generateSignature(payloadString, endpoint.security.secret);
    }

    const sendAttempt = async (attempt: number = 1): Promise<void> => {
      const startTime = Date.now();
      
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'Precifica+ Webhook/1.0'
        };

        // Adicionar autenticação
        if (endpoint.security.authMethod === 'bearer' && endpoint.security.secret) {
          headers['Authorization'] = `Bearer ${endpoint.security.secret}`;
        }

        if (endpoint.security.signatureHeader && payload.signature) {
          headers[endpoint.security.signatureHeader] = `sha256=${payload.signature}`;
        }

        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(30000) // 30 segundos timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseTime = Date.now() - startTime;

        // Atualizar estatísticas de sucesso
        setEndpoints(prev => prev.map(e => 
          e.id === endpointId 
            ? {
                ...e,
                stats: {
                  ...e.stats,
                  totalSent: e.stats.totalSent + 1,
                  avgResponseTime: (e.stats.avgResponseTime + responseTime) / 2
                },
                lastTriggered: new Date().toISOString()
              }
            : e
        ));

  logger.info(`Webhook enviado com sucesso para ${endpoint.name}`);
        
      } catch (error) {
  logger.error(`Erro no envio do webhook (tentativa ${attempt}):`, error);

        // Implementar retry com backoff exponencial
        if (attempt < endpoint.retryPolicy.maxRetries) {
          const backoffMs = Math.min(
            1000 * Math.pow(endpoint.retryPolicy.backoffMultiplier, attempt - 1),
            endpoint.retryPolicy.maxBackoffMs
          );

          logger.info(`Reagendando webhook em ${backoffMs}ms (tentativa ${attempt + 1})`);
          
          setTimeout(() => {
            sendAttempt(attempt + 1);
          }, backoffMs);
        } else {
          // Adicionar à dead letter queue
          const queue = retryQueues.current.get(endpointId) || [];
          queue.push(payload);
          retryQueues.current.set(endpointId, queue);

          // Atualizar taxa de sucesso
          setEndpoints(prev => prev.map(e => 
            e.id === endpointId 
              ? {
                  ...e,
                  stats: {
                    ...e.stats,
                    totalSent: e.stats.totalSent + 1,
                    successRate: Math.max(0, e.stats.successRate - 5)
                  }
                }
              : e
          ));

          throw new Error(`Falha no envio após ${endpoint.retryPolicy.maxRetries} tentativas`);
        }
      }
    };

    if (options?.immediate) {
      await sendAttempt();
    } else {
      // Envio assíncrono
  sendAttempt().catch((err) => logger.error('Erro no envio assíncrono de webhook:', err));
    }
  }, [endpoints, generateSignature]);

  // Testar conectividade de endpoint
  const testEndpoint = useCallback(async (endpointId: string): Promise<boolean> => {
    try {
      await sendWebhook(endpointId, 'test_connection', {
        message: 'Teste de conectividade do Precifica+',
        timestamp: new Date().toISOString()
      }, { immediate: true });
      
      return true;
    } catch (error) {
  logger.error('Teste de endpoint falhou:', error);
      return false;
    }
  }, [sendWebhook]);

  // Processar dead letter queue
  const processDeadLetterQueue = useCallback(async (endpointId: string) => {
    const queue = retryQueues.current.get(endpointId);
    if (!queue || queue.length === 0) {
      return;
    }

    setIsProcessing(true);
    
    try {
      for (const payload of queue) {
        await sendWebhook(endpointId, payload.event, payload.data, { immediate: true });
      }
      
      retryQueues.current.set(endpointId, []);
      toast.success('Dead letter queue processada com sucesso');
    } catch (_error) {
      toast.error('Erro ao processar dead letter queue');
    } finally {
      setIsProcessing(false);
    }
  }, [sendWebhook]);

  // Atualizar endpoint
  const updateEndpoint = useCallback((endpointId: string, updates: Partial<WebhookEndpoint>) => {
    setEndpoints(prev => prev.map(e => 
      e.id === endpointId ? { ...e, ...updates } : e
    ));
  }, []);

  // Remover endpoint
  const removeEndpoint = useCallback((endpointId: string) => {
    setEndpoints(prev => prev.filter(e => e.id !== endpointId));
    retryQueues.current.delete(endpointId);
  }, []);

  return {
    endpoints,
    addEndpoint,
    updateEndpoint,
    removeEndpoint,
    registerIncomingHandler,
    processIncomingWebhook,
    sendWebhook,
    testEndpoint,
    processDeadLetterQueue,
    isProcessing,
    deadLetterQueueSize: (endpointId: string) => retryQueues.current.get(endpointId)?.length || 0
  };
};
