# 🚀 Guia Completo de Setup - Mercado Pago + Azuria

**Data**: 1 de Outubro de 2025  
**Status**: Implementação em andamento

---

## ✅ Progresso Atual

### Fase 1: Otimização Azure ✅
- [x] Log Analytics retention reduzido para 30 dias
- [x] Decisão: Manter Standard tier (R$ 9/mês é insignificante)
- [x] Documentação criada (AZURE_SKU_DECISION.md)

### Fase 2: Setup Mercado Pago ✅
- [x] SDK instalado (`npm install mercadopago`)
- [x] Biblioteca criada (`lib/mercadopago.ts`)
- [x] Schema SQL criado (`supabase/migrations/001_subscriptions_schema.sql`)
- [x] `.env.example` atualizado

### Fase 3: Próximos Passos 🔄
- [ ] Criar conta Mercado Pago
- [ ] Configurar variáveis de ambiente
- [ ] Executar migration no Supabase
- [ ] Criar páginas e components
- [ ] Testar em sandbox

---

## 📋 Checklist Completo

### 1. Criar Conta Mercado Pago (10 minutos)

#### 1.1 Cadastro

1. **Acesse**: https://www.mercadopago.com.br/hub/registration/landing
2. **Escolha**: Conta de Vendedor
3. **Preencha**:
   - Email
   - CPF/CNPJ
   - Senha
   - Telefone
4. **Verifique** email e telefone

#### 1.2 Obter Credenciais

1. **Acesse**: https://www.mercadopago.com.br/developers/panel
2. **Navegue**: "Suas integrações" → "Credenciais"
3. **Modo Produção** (para uso real):
   - `Public Key`: `APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - `Access Token`: `APP_USR-xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx`
4. **Modo Sandbox** (para testes):
   - `Public Key (TEST)`: `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - `Access Token (TEST)`: `TEST-xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx`

**⚠️ IMPORTANTE**: Nunca commite as credenciais de produção!

---

### 2. Configurar Variáveis de Ambiente (5 minutos)

#### 2.1 Local Development

Crie arquivo `.env` na raiz do projeto:

```bash
# Copiar do .env.example
cp .env.example .env
```

Edite `.env` e adicione as credenciais:

```bash
# Supabase (já configurado)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Mercado Pago - SANDBOX (para testes)
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx
VITE_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Mercado Pago - PRODUCTION (comentar durante testes)
# MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxxxxxx-xxxxxxxx-xxxxxxxx
# VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# App URL
VITE_APP_URL=http://localhost:5173
```

#### 2.2 Azure Static Web Apps (Produção)

Configure no Azure Portal ou via CLI:

```bash
# Adicionar variáveis de ambiente
az staticwebapp appsettings set \
  --name "swa-jxbkuxsj7yfpo" \
  --resource-group "Azuria-Resources" \
  --setting-names \
    MERCADOPAGO_ACCESS_TOKEN="APP_USR-your-production-token" \
    VITE_MERCADOPAGO_PUBLIC_KEY="APP_USR-your-public-key" \
    VITE_APP_URL="https://azuria.app.br"
```

Ou via Azure Portal:
1. Acessar: portal.azure.com
2. Navegar: Static Web Apps → swa-jxbkuxsj7yfpo
3. Settings → Configuration
4. Adicionar:
   - `MERCADOPAGO_ACCESS_TOKEN`
   - `VITE_MERCADOPAGO_PUBLIC_KEY`
   - `VITE_APP_URL`

---

### 3. Executar Migration no Supabase (5 minutos)

#### 3.1 Via Supabase Dashboard (Recomendado)

1. **Acesse**: https://supabase.com/dashboard
2. **Selecione** seu projeto Azuria
3. **Navegue**: SQL Editor
4. **Cole** todo o conteúdo de `supabase/migrations/001_subscriptions_schema.sql`
5. **Execute** (Run)
6. **Verifique**: Deve criar 3 tabelas e várias funções

#### 3.2 Via Supabase CLI (Alternativa)

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Fazer login
supabase login

# Link do projeto
supabase link --project-ref your-project-ref

# Executar migration
supabase db push
```

#### 3.3 Verificar Tabelas Criadas

Execute no SQL Editor:

```sql
-- Verificar tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscriptions', 'payment_history', 'usage_tracking');

-- Deve retornar 3 linhas
```

---

### 4. Criar Planos no Mercado Pago (5 minutos)

#### 4.1 Criar Script de Setup

Crie arquivo `scripts/setup-mercadopago-plans.ts`:

```typescript
import { createSubscriptionPlan } from '../lib/mercadopago';

async function setupPlans() {
  console.log('🚀 Creating Mercado Pago subscription plans...\n');

  try {
    // Create PRO plan
    console.log('Creating PRO plan (R$ 9.90/month)...');
    const proPlanId = await createSubscriptionPlan('PRO');
    console.log(`✅ PRO Plan ID: ${proPlanId}\n`);

    // Create BUSINESS plan
    console.log('Creating BUSINESS plan (R$ 29.90/month)...');
    const businessPlanId = await createSubscriptionPlan('BUSINESS');
    console.log(`✅ BUSINESS Plan ID: ${businessPlanId}\n`);

    console.log('🎉 All plans created successfully!\n');
    console.log('⚠️  IMPORTANT: Save these plan IDs in your environment variables:');
    console.log(`MERCADOPAGO_PRO_PLAN_ID=${proPlanId}`);
    console.log(`MERCADOPAGO_BUSINESS_PLAN_ID=${businessPlanId}`);
  } catch (error) {
    console.error('❌ Error creating plans:', error);
    process.exit(1);
  }
}

setupPlans();
```

#### 4.2 Executar Script

```bash
# Executar
npx tsx scripts/setup-mercadopago-plans.ts

# Salvar os IDs retornados no .env
```

#### 4.3 Adicionar Plan IDs no .env

```bash
# Mercado Pago Plan IDs
MERCADOPAGO_PRO_PLAN_ID=2c9380848d2a2e3b018d2a4c6e9c0145
MERCADOPAGO_BUSINESS_PLAN_ID=2c9380848d2a2e3b018d2a4c6e9c0146
```

---

### 5. Implementar Limite de Cálculos (15 minutos)

#### 5.1 Criar `lib/subscription-limits.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export class SubscriptionLimitError extends Error {
  constructor(message: string, public limitType: string) {
    super(message);
    this.name = 'SubscriptionLimitError';
  }
}

/**
 * Check if user can perform a calculation
 * Free users: 10 per day
 * PRO/BUSINESS: unlimited
 */
export async function checkCalculationLimit(userId: string): Promise<boolean> {
  try {
    // Call Supabase function
    const { data, error } = await supabase
      .rpc('can_user_perform_action', {
        p_user_id: userId,
        p_action: 'calculate'
      });

    if (error) throw error;

    if (!data) {
      throw new SubscriptionLimitError(
        'Limite diário de cálculos atingido! Faça upgrade para PRO para cálculos ilimitados.',
        'daily_calculation_limit'
      );
    }

    return data;
  } catch (error) {
    if (error instanceof SubscriptionLimitError) throw error;
    console.error('Error checking calculation limit:', error);
    throw new Error('Erro ao verificar limite de cálculos');
  }
}

/**
 * Increment calculation counter
 */
export async function incrementCalculationCount(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .rpc('increment_usage', {
        p_user_id: userId,
        p_action: 'calculate'
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error incrementing calculation count:', error);
    // Don't throw - don't block user if counting fails
  }
}

/**
 * Get user's current usage
 */
export async function getUserUsage(userId: string) {
  try {
    const { data, error } = await supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found

    return {
      calculations: data?.calculations_count || 0,
      apiCalls: data?.api_calls_count || 0,
      exports: data?.exports_count || 0
    };
  } catch (error) {
    console.error('Error getting user usage:', error);
    return { calculations: 0, apiCalls: 0, exports: 0 };
  }
}

/**
 * Get user's subscription
 */
export async function getUserSubscription(userId: string) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data || { plan: 'free', status: 'active' };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return { plan: 'free', status: 'active' };
  }
}
```

#### 5.2 Adicionar Verificação nos Cálculos

No componente/página de cálculo, adicionar:

```typescript
import { checkCalculationLimit, incrementCalculationCount, SubscriptionLimitError } from '@/lib/subscription-limits';

async function handleCalculate() {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      // Redirect to login
      return;
    }

    // Check limit BEFORE calculation
    await checkCalculationLimit(user.data.user.id);

    // Perform calculation
    const result = await performCalculation();

    // Increment counter AFTER successful calculation
    await incrementCalculationCount(user.data.user.id);

    return result;
  } catch (error) {
    if (error instanceof SubscriptionLimitError) {
      // Show upgrade prompt
      setShowUpgradePrompt(true);
      return;
    }
    
    // Handle other errors
    console.error('Calculation error:', error);
  }
}
```

---

### 6. Criar Componente de Upgrade (10 minutos)

#### 6.1 `components/UpgradePrompt.tsx`

```typescript
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function UpgradePrompt() {
  const navigate = useNavigate();

  return (
    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Limite Diário Atingido! 🎯
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            Você atingiu o limite de 10 cálculos por dia do plano FREE.
            <br />
            Faça upgrade para o plano PRO e tenha cálculos ilimitados!
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/pricing')}>
              Ver Planos e Preços
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Voltar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 7. Criar Página de Pricing (20 minutos)

#### 7.1 `src/pages/PricingPage.tsx`

```typescript
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SUBSCRIPTION_PLANS } from '@/lib/mercadopago';
import { SubscribeButton } from '@/components/SubscribeButton';

export function PricingPage() {
  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Escolha o Plano Ideal para Você
        </h1>
        <p className="text-xl text-muted-foreground">
          Comece grátis e faça upgrade quando precisar
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* FREE Plan */}
        <Card className="p-6 relative">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">FREE</h3>
            <div className="text-4xl font-bold mb-2">
              R$ 0
              <span className="text-lg font-normal text-muted-foreground">/mês</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Para começar
            </p>
          </div>

          <ul className="space-y-3 mb-6">
            {SUBSCRIPTION_PLANS.FREE.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <Button variant="outline" className="w-full" disabled>
            Plano Atual
          </Button>
        </Card>

        {/* PRO Plan */}
        <Card className="p-6 relative border-2 border-blue-600">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
            Mais Popular
          </div>

          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">PRO</h3>
            <div className="text-4xl font-bold mb-2">
              R$ 9,90
              <span className="text-lg font-normal text-muted-foreground">/mês</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Para profissionais
            </p>
          </div>

          <ul className="space-y-3 mb-6">
            {SUBSCRIPTION_PLANS.PRO.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <SubscribeButton planType="PRO" />
        </Card>

        {/* BUSINESS Plan */}
        <Card className="p-6 relative">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">BUSINESS</h3>
            <div className="text-4xl font-bold mb-2">
              R$ 29,90
              <span className="text-lg font-normal text-muted-foreground">/mês</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Para empresas
            </p>
          </div>

          <ul className="space-y-3 mb-6">
            {SUBSCRIPTION_PLANS.BUSINESS.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <SubscribeButton planType="BUSINESS" />
        </Card>
      </div>

      {/* FAQ */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">
          Perguntas Frequentes
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">
              Posso cancelar a qualquer momento?
            </h3>
            <p className="text-muted-foreground">
              Sim! Você pode cancelar sua assinatura a qualquer momento.
              Você continuará tendo acesso até o final do período pago.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">
              Quais formas de pagamento são aceitas?
            </h3>
            <p className="text-muted-foreground">
              Aceitamos cartão de crédito, PIX e boleto através do Mercado Pago.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">
              Posso fazer upgrade ou downgrade depois?
            </h3>
            <p className="text-muted-foreground">
              Sim! Você pode mudar de plano a qualquer momento.
              O valor será ajustado proporcionalmente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 8. Próximos Passos

#### Agora você precisa:

1. ✅ **Criar conta Mercado Pago** (10 min)
2. ✅ **Configurar .env** com credenciais (5 min)
3. ✅ **Executar SQL migration** no Supabase (5 min)
4. ✅ **Criar planos** no Mercado Pago (5 min)
5. ✅ **Testar em modo sandbox** (30 min)

**Depois disso, você estará pronto para lançar!** 🚀

---

## 🧪 Testando em Modo Sandbox

### Credenciais de Teste

Use estas credenciais do Mercado Pago para testar:

**Cartão de Crédito (Aprovado)**:
- Número: `5031 4332 1540 6351`
- CVV: `123`
- Validade: `11/25`
- Nome: `APRO`

**PIX (Aprovado)**:
- Será gerado QR Code de teste
- Pagamento será aprovado automaticamente

### Fluxo de Teste

1. Fazer login no app
2. Acessar `/pricing`
3. Clicar em "Assinar PRO"
4. Usar cartão de teste
5. Verificar webhook recebido
6. Confirmar assinatura ativada

---

**Status**: ⏳ Aguardando você criar conta Mercado Pago!

**Próximo passo**: Siga o item #1 deste guia (Criar Conta Mercado Pago) 🚀
