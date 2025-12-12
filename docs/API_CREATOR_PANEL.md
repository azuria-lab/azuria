# API do Modo Deus (Creator Panel)

Documentação das APIs internas do painel administrativo "Modo Deus" da Azuria.

> ⚠️ **ATENÇÃO**: Estas APIs são exclusivas para administradores. Todas requerem autenticação via `x-admin-uid` header.

## Autenticação

Todas as requisições devem incluir:

```http
x-admin-uid: <UUID do administrador>
```

O UID deve estar configurado em `VITE_ADMIN_UID` ou `ADMIN_UID` nas variáveis de ambiente.

### Rate Limiting

- **10 requisições por minuto** por IP
- Após exceder: HTTP 429 Too Many Requests (60s de cooldown)

---

## Endpoints

### GET `/api/creator/stream`

Estabelece conexão SSE (Server-Sent Events) para receber atualizações em tempo real.

#### Headers
```http
x-admin-uid: <admin-uuid>
```

#### Response
- **Content-Type**: `text/event-stream`
- **Connection**: `keep-alive`

#### Eventos SSE

| Evento | Descrição |
|--------|-----------|
| `connected` | Confirmação de conexão com `clientId` |
| `heartbeat` | Keep-alive a cada 30s |
| `alert_ack` | Notificação quando um alerta é reconhecido |
| `shutdown` | Servidor encerrando conexão |

#### Exemplo de Conexão
```typescript
const eventSource = new EventSource('/api/creator/stream', {
  headers: { 'x-admin-uid': adminUid }
});

eventSource.addEventListener('alert_ack', (e) => {
  const data = JSON.parse(e.data);
  console.log('Alert acknowledged:', data);
});
```

---

### POST `/api/creator/ack`

Reconhece, resolve ou ignora um alerta do sistema.

#### Headers
```http
Content-Type: application/json
x-admin-uid: <admin-uuid>
```

#### Request Body
```json
{
  "id": "string (required) - ID do alerta",
  "action": "string (required) - ack | resolve | ignore",
  "adminId": "string (optional) - ID do admin que executou a ação"
}
```

#### Validação
| Campo | Tipo | Requerido | Regras |
|-------|------|-----------|--------|
| `id` | string | Sim | 1-100 caracteres |
| `action` | enum | Sim | `ack`, `resolve`, `ignore` |
| `adminId` | string | Não | max 100 caracteres |

#### Response

**Sucesso (200)**
```json
{
  "ok": true,
  "alert": {
    "id": "...",
    "status": "acknowledged | resolved | ignored",
    "updated_at": "2025-12-11T..."
  }
}
```

**Erro de Validação (400)**
```json
{
  "error": "Validation failed",
  "details": {
    "id": "Required field is missing",
    "action": "Must be one of: ack, resolve, ignore"
  }
}
```

**Não Autorizado (401)**
```json
{
  "error": "Unauthorized",
  "message": "Admin authentication required"
}
```

---

### GET `/api/creator/evolution`

Retorna eventos e snapshots de evolução da IA.

#### Headers
```http
x-admin-uid: <admin-uuid>
```

#### Query Parameters
| Parâmetro | Tipo | Default | Range | Descrição |
|-----------|------|---------|-------|-----------|
| `limit` | number | 50 | 1-500 | Número máximo de eventos |

#### Response (200)
```json
{
  "events": [
    {
      "id": "evo_1702300000000_abc123",
      "type": "learning | pattern | insight | memory | query",
      "payload": { ... },
      "created_at": 1702300000000
    }
  ],
  "snapshots": [
    {
      "id": "snap_1702300000000",
      "snapshot": { ... },
      "created_at": 1702300000000
    }
  ]
}
```

---

## Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Erro de validação |
| 401 | Não autorizado (UID inválido ou ausente) |
| 405 | Método não permitido |
| 429 | Rate limit excedido |
| 500 | Erro interno |

---

## Tipos TypeScript

```typescript
// Alerta do Creator
interface CreatorAlert {
  id: string;
  type: 'alert' | 'insight' | 'recommendation' | 'roadmap';
  area?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  payload?: Record<string, unknown>;
  originEngine?: string;
  confidence?: number;
  suggestedAction?: string;
  status: 'new' | 'acknowledged' | 'resolved' | 'ignored';
  created_at: string;
  updated_at: string;
}

// Evento de Evolução
interface EvolutionEntry {
  id: string;
  type: 'learning' | 'pattern' | 'insight' | 'memory' | 'query';
  payload: Record<string, unknown>;
  created_at: number;
}

// Snapshot de Evolução
interface EvolutionSnapshot {
  id: string;
  snapshot: Record<string, unknown>;
  created_at: number;
}
```

---

## Segurança

### Medidas Implementadas

1. **Autenticação por UID** - Apenas UIDs configurados podem acessar
2. **Rate Limiting** - 10 req/min por IP
3. **Validação de Input** - Sanitização e validação de todos os campos
4. **Sem Fallbacks Hardcoded** - Nenhum UID padrão em produção

### Configuração Recomendada

```env
# .env.local
VITE_ADMIN_UID=seu-uuid-v4-aqui

# Para múltiplos admins (separar por vírgula)
ADMIN_UIDS=uuid1,uuid2,uuid3
```

---

## Eventos SSE em Detalhe

### `connected`
```json
{
  "clientId": "sse_1702300000000_abc123",
  "timestamp": 1702300000000
}
```

### `heartbeat`
```json
{
  "timestamp": 1702300000000
}
```

### `alert_ack`
```json
{
  "id": "alert-uuid",
  "status": "acknowledged",
  "action": "ack",
  "adminId": "admin-uuid"
}
```

### `shutdown`
```json
{
  "reason": "server_shutdown"
}
```

---

## Exemplos de Uso

### React Hook para SSE
```typescript
import { useEffect, useState } from 'react';

export function useCreatorStream(adminUid: string) {
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const es = new EventSource(`/api/creator/stream?uid=${adminUid}`);
    
    es.addEventListener('connected', () => setConnected(true));
    es.addEventListener('alert_ack', (e) => {
      const data = JSON.parse(e.data);
      setAlerts(prev => prev.map(a => 
        a.id === data.id ? { ...a, status: data.status } : a
      ));
    });
    
    es.onerror = () => setConnected(false);
    
    return () => es.close();
  }, [adminUid]);

  return { connected, alerts };
}
```

### Reconhecer Alerta
```typescript
async function acknowledgeAlert(id: string, adminUid: string) {
  const res = await fetch('/api/creator/ack', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-uid': adminUid,
    },
    body: JSON.stringify({ id, action: 'ack' }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error);
  }
  
  return res.json();
}
```
