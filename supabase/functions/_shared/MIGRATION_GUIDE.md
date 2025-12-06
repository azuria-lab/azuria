# 🔧 Script Helper - Aplicar Security Middleware

Este documento fornece um guia passo a passo para aplicar o security middleware nas Edge Functions restantes.

---

## 📋 Edge Functions Pendentes

### Webhooks (Alta Prioridade)
- [x] `stripe-webhook` ✅ Concluído
- [x] `abacatepay-webhook` ✅ Concluído
- [ ] `mercadopago-webhook`

### Payment Functions (Alta Prioridade)
- [ ] `stripe-create-checkout`
- [ ] `stripe-create-portal`
- [ ] `abacatepay-create-billing`
- [ ] `abacatepay-check-status`
- [ ] `create-payment-preference`

### Subscription Management (Média Prioridade)
- [ ] `create-subscription`
- [ ] `cancel-subscription`

### Arquivos COMPLETE (Backup - Baixa Prioridade)
- [ ] `stripe-create-checkout-COMPLETE`
- [ ] `stripe-create-portal-COMPLETE`
- [ ] `stripe-webhook-COMPLETE`

---

## 🔄 Padrão de Refatoração

### Antes
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Lógica
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
```

### Depois
```typescript
import { withSecurityMiddleware } from '../_shared/security-config.ts';

async function handleRequest(req: Request): Promise<Response> {
  // Apenas lógica de negócio
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// Escolher opção apropriada:
// - allowCredentials: true (para endpoints autenticados)
// - allowCredentials: false (para webhooks públicos)
Deno.serve(withSecurityMiddleware(handleRequest, { allowCredentials: true }));
```

---

## ✅ Checklist de Refatoração

Para cada Edge Function:

### 1. Preparação
- [ ] Abrir arquivo da Edge Function
- [ ] Identificar tipo (webhook, autenticado, público)
- [ ] Verificar se usa autenticação

### 2. Imports
- [ ] Remover `import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'`
- [ ] Remover definição de `corsHeaders`
- [ ] Adicionar `import { withSecurityMiddleware } from '../_shared/security-config.ts'`

### 3. Refatorar Handler
- [ ] Extrair lógica do `serve()` para função `async function handleXXX(req: Request): Promise<Response>`
- [ ] Remover tratamento de OPTIONS (middleware faz isso)
- [ ] Remover try-catch externo (middleware faz isso)
- [ ] Remover `...corsHeaders` dos headers de resposta
- [ ] Manter apenas `'Content-Type': 'application/json'`

### 4. Aplicar Middleware
- [ ] Adicionar no final: `Deno.serve(withSecurityMiddleware(handleXXX, options))`
- [ ] Escolher opções:
  - Webhooks: `{}`  (sem credentials)
  - Autenticados: `{ allowCredentials: true }`

### 5. Testar
- [ ] Verificar sintaxe (sem erros de lint)
- [ ] Testar localmente se possível
- [ ] Commit e deploy

---

## 🎯 Opções do Middleware

### Para Webhooks
```typescript
Deno.serve(withSecurityMiddleware(handleWebhook));
// ou
Deno.serve(withSecurityMiddleware(handleWebhook, {}));
```

**Quando usar:**
- Stripe webhooks
- Mercado Pago webhooks
- Abacatepay webhooks
- Qualquer endpoint que recebe POST de serviços externos

### Para Endpoints Autenticados
```typescript
Deno.serve(withSecurityMiddleware(handleRequest, { allowCredentials: true }));
```

**Quando usar:**
- Criação de checkout (requer user_id)
- Portal do cliente
- Gerenciamento de assinatura
- Qualquer endpoint que requer Authorization header

### Para Endpoints Públicos
```typescript
Deno.serve(withSecurityMiddleware(handleRequest));
```

**Quando usar:**
- Endpoints de consulta pública
- Health checks
- Endpoints sem autenticação

---

## 🔍 Exemplo Completo: mercadopago-webhook

### Antes
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    // Lógica do webhook
    const event = await req.json();
    
    // Processar evento
    // ...
    
    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
```

### Depois
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { withSecurityMiddleware } from '../_shared/security-config.ts';

async function handleMercadoPagoWebhook(req: Request): Promise<Response> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  // Lógica do webhook
  const event = await req.json();
  
  // Processar evento
  // ...
  
  return new Response(
    JSON.stringify({ success: true }),
    {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

// Webhooks não precisam de credentials
Deno.serve(withSecurityMiddleware(handleMercadoPagoWebhook));
```

---

## 📝 Notas Importantes

### 1. Validação de Webhook
Mantenha a validação de assinatura de webhook:

```typescript
// Stripe
const signature = req.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

// Mercado Pago
// Validar x-signature header

// Abacatepay
// Validar conforme documentação
```

### 2. Error Handling
O middleware já trata erros, mas você pode lançar exceções específicas:

```typescript
if (!signature) {
  throw new Error('Missing webhook signature');
}

if (!isValidSignature(signature)) {
  throw new Error('Invalid webhook signature');
}
```

### 3. CORS para Webhooks
Webhooks de serviços externos (Stripe, Mercado Pago) podem vir de IPs variados.

O middleware:
- ✅ Permite requisições sem Origin header
- ✅ Valida Origin se presente
- ✅ Bloqueia origens não autorizadas

### 4. Logging
Mantenha logs importantes:

```typescript
console.log('Processing webhook:', event.type);
console.log('User ID:', userId);
```

Mas evite logar dados sensíveis:
```typescript
// ❌ Não faça
console.log('Full event:', event);

// ✅ Faça
console.log('Event type:', event.type);
```

---

## 🚀 Próximos Passos

1. **Aplicar em webhooks restantes** (mercadopago-webhook)
2. **Aplicar em payment functions** (create-checkout, create-portal, etc.)
3. **Aplicar em subscription management** (create/cancel subscription)
4. **Testar localmente**
5. **Deploy em staging**
6. **Testar em staging**
7. **Deploy em produção**

---

## ✅ Progresso

- [x] azuria-chat (2/18)
- [x] stripe-webhook (2/18)
- [x] abacatepay-webhook (3/18)
- [ ] mercadopago-webhook (3/18)
- [ ] stripe-create-checkout (3/18)
- [ ] stripe-create-portal (3/18)
- [ ] abacatepay-create-billing (3/18)
- [ ] abacatepay-check-status (3/18)
- [ ] create-payment-preference (3/18)
- [ ] create-subscription (3/18)
- [ ] cancel-subscription (3/18)
- [ ] Demais funções...

**Progresso:** 3/18 (17%)

---

**Última atualização:** 05/12/2025
