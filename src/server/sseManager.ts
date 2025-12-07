type SSEClient = {
  id: string;
  res: any;
};

const clients: Map<string, SSEClient> = new Map();

export function registerClient(res: any) {
  const id = `sse_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  clients.set(id, { id, res });
  res.write(`event: heartbeat\ndata: ok\n\n`);
  return id;
}

export function unregisterClient(id: string) {
  clients.delete(id);
}

export function notifySSE(payload: { channel: string; event: string; data: any }) {
  const msg = `event: ${payload.event}\ndata: ${JSON.stringify(payload.data)}\n\n`;
  clients.forEach((client) => {
    try {
      client.res.write(msg);
    } catch {
      clients.delete(client.id);
    }
  });
}

export function getSSEClientManager() {
  return { registerClient, unregisterClient, notifySSE };
}

