/**
 * SSE Manager - Server-Sent Events para o Painel do Criador
 * 
 * Gerencia conexões SSE com heartbeat periódico para manter conexões vivas
 * através de proxies e load balancers.
 */

type SSEClient = {
  id: string;
  res: any;
  connectedAt: number;
  lastHeartbeat: number;
};

const clients: Map<string, SSEClient> = new Map();

// Configuração
const HEARTBEAT_INTERVAL_MS = 30000; // 30 segundos
const CLIENT_TIMEOUT_MS = 120000; // 2 minutos sem heartbeat = desconectar

// Timer do heartbeat
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Envia heartbeat para todos os clientes conectados
 * Remove clientes que não respondem
 */
function sendHeartbeatToAll(): void {
  const now = Date.now();
  const deadClients: string[] = [];

  clients.forEach((client, id) => {
    // Verificar timeout
    if (now - client.lastHeartbeat > CLIENT_TIMEOUT_MS) {
      deadClients.push(id);
      return;
    }

    try {
      client.res.write(`event: heartbeat\ndata: ${JSON.stringify({ timestamp: now })}\n\n`);
      client.lastHeartbeat = now;
    } catch {
      // Cliente desconectado
      deadClients.push(id);
    }
  });

  // Remover clientes mortos
  deadClients.forEach(id => {
    clients.delete(id);
    console.log(`[SSE] Client disconnected (timeout/error): ${id}`);
  });
}

/**
 * Inicia o timer de heartbeat se não estiver rodando
 */
function ensureHeartbeatRunning(): void {
  if (heartbeatTimer) {return;}
  
  heartbeatTimer = setInterval(sendHeartbeatToAll, HEARTBEAT_INTERVAL_MS);
  console.log('[SSE] Heartbeat timer started');
}

/**
 * Para o timer de heartbeat se não há clientes
 */
function stopHeartbeatIfNoClients(): void {
  if (clients.size === 0 && heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
    console.log('[SSE] Heartbeat timer stopped (no clients)');
  }
}

/**
 * Registra um novo cliente SSE
 */
export function registerClient(res: any): string {
  const now = Date.now();
  const id = `sse_${now}_${Math.random().toString(16).slice(2)}`;
  
  clients.set(id, { 
    id, 
    res, 
    connectedAt: now,
    lastHeartbeat: now 
  });

  // Enviar heartbeat inicial com info de conexão
  try {
    res.write(`event: connected\ndata: ${JSON.stringify({ clientId: id, timestamp: now })}\n\n`);
    res.write(`event: heartbeat\ndata: ${JSON.stringify({ timestamp: now })}\n\n`);
  } catch {
    clients.delete(id);
    return '';
  }

  // Garantir que heartbeat está rodando
  ensureHeartbeatRunning();
  
  console.log(`[SSE] Client connected: ${id} (total: ${clients.size})`);
  return id;
}

/**
 * Remove um cliente SSE
 */
export function unregisterClient(id: string): void {
  const client = clients.get(id);
  if (client) {
    clients.delete(id);
    console.log(`[SSE] Client unregistered: ${id} (total: ${clients.size})`);
    
    // Parar heartbeat se não há mais clientes
    stopHeartbeatIfNoClients();
  }
}

/**
 * Envia uma notificação para todos os clientes
 */
export function notifySSE(payload: { channel: string; event: string; data: any }): void {
  if (clients.size === 0) {return;}
  
  const msg = `event: ${payload.event}\ndata: ${JSON.stringify(payload.data)}\n\n`;
  const deadClients: string[] = [];

  clients.forEach((client) => {
    try {
      client.res.write(msg);
    } catch {
      deadClients.push(client.id);
    }
  });

  // Limpar clientes desconectados
  deadClients.forEach(id => {
    clients.delete(id);
    console.log(`[SSE] Client removed on write error: ${id}`);
  });
  
  stopHeartbeatIfNoClients();
}

/**
 * Retorna estatísticas dos clientes SSE
 */
export function getSSEStats(): { totalClients: number; clients: Array<{ id: string; connectedAt: number; lastHeartbeat: number }> } {
  return {
    totalClients: clients.size,
    clients: Array.from(clients.values()).map(c => ({
      id: c.id,
      connectedAt: c.connectedAt,
      lastHeartbeat: c.lastHeartbeat,
    })),
  };
}

/**
 * Força cleanup de todos os clientes (para shutdown)
 */
export function shutdownSSE(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  
  clients.forEach((client) => {
    try {
      client.res.write(`event: shutdown\ndata: ${JSON.stringify({ reason: 'server_shutdown' })}\n\n`);
      client.res.end();
    } catch {
      // Ignorar erros no shutdown
    }
  });
  
  clients.clear();
  console.log('[SSE] Shutdown complete');
}

export function getSSEClientManager() {
  return { registerClient, unregisterClient, notifySSE, getSSEStats, shutdownSSE };
}

