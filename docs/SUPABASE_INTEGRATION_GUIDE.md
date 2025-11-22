# 🗄️ Guia de Integração Supabase - Calculadora Avançada

## 📋 O que foi criado

### 1. **Service Layer** (`advancedCalculatorHistory.ts`)
- Serviço completo para gerenciar histórico da Calculadora Avançada
- Suporte a Supabase + fallback para localStorage
- Métodos: save, get, delete, clear

### 2. **Hook Personalizado** (`useAdvancedCalculatorHistory.ts`)
- Hook React para integração fácil
- Gerenciamento de estado (loading, error)
- Utilitários: statistics, search, filter
- Auto-load quando usuário muda

### 3. **Migration SQL** (`20250106_advanced_calculator_history.sql`)
- Tabela `advanced_calculation_history`
- Índices otimizados
- Row Level Security (RLS)
- Triggers para updated_at

---

## 🚀 Como Aplicar no Supabase

### **Opção 1: SQL Editor (Recomendado)**

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Cole o conteúdo de:
   ```
   supabase/migrations/20250106_advanced_calculator_history.sql
   ```
5. Clique em **Run** ▶️

### **Opção 2: Supabase CLI**

```bash
# No diretório do projeto
supabase migration new advanced_calculator_history

# Cole o SQL no arquivo criado em supabase/migrations/

# Aplique a migration
supabase db push
```

---

## 📊 Estrutura da Tabela

```sql
advanced_calculation_history
├── id (TEXT, PK)
├── user_id (UUID, FK → auth.users)
├── date (TIMESTAMPTZ)
├── cost, target_margin, shipping, packaging... (NUMERIC)
├── marketplace_id, payment_method (TEXT)
├── suggested_price, total_margin, net_profit... (NUMERIC)
├── features (JSONB) ⭐ Premium features data
├── notes (TEXT)
└── tags (TEXT[])
```

### **Campo `features` (JSONB)**
Armazena dados das 8 features premium:

```typescript
{
  aiSuggestions: {...},      // Sugestões da IA
  roiMetrics: {...},         // Métricas de ROI
  discounts: {...},          // Análise de descontos
  costBreakdown: {...},      // Breakdown de custos
  beforeAfter: {...},        // Antes x Depois
  sensitivity: {...},        // Análise de sensibilidade
  scenarios: [...]           // Cenários simulados
}
```

---

## 💻 Como Usar no Código

### **Importar o Hook**

```typescript
import { useAdvancedCalculatorHistory } from '@/hooks/useAdvancedCalculatorHistory';

function AdvancedCalculator() {
  const {
    history,
    isLoading,
    error,
    saveCalculation,
    deleteEntry,
    clearHistory,
    getStatistics,
  } = useAdvancedCalculatorHistory();

  // Usar...
}
```

### **Salvar Cálculo**

```typescript
const handleSave = async () => {
  await saveCalculation({
    cost: 100,
    targetMargin: 30,
    shipping: 15,
    packaging: 5,
    marketing: 10,
    otherCosts: 5,
    marketplaceId: 'mercadolivre',
    paymentMethod: 'credit',
    includePaymentFee: true,
    suggestedPrice: 195.50,
    totalMargin: 28.5,
    netProfit: 55.70,
    totalCost: 135,
    features: {
      aiSuggestions: {...},
      roiMetrics: {...},
      // ... outros
    },
    notes: 'Produto X',
    tags: ['eletrônicos', 'promocao'],
  });
};
```

### **Exibir Histórico**

```typescript
{history.map((entry) => (
  <div key={entry.id}>
    <h3>{entry.marketplaceId}</h3>
    <p>Preço: R$ {entry.suggestedPrice.toFixed(2)}</p>
    <p>Margem: {entry.totalMargin.toFixed(2)}%</p>
    <p>Lucro: R$ {entry.netProfit.toFixed(2)}</p>
    <button onClick={() => deleteEntry(entry.id)}>
      Deletar
    </button>
  </div>
))}
```

### **Estatísticas**

```typescript
const stats = getStatistics();

if (stats) {
  console.log('Total de cálculos:', stats.totalCalculations);
  console.log('Margem média:', stats.avgMargin);
  console.log('Marketplace mais usado:', stats.mostUsedMarketplace);
}
```

---

## 🔐 Segurança (RLS)

✅ **Políticas Ativadas:**
- Usuários veem apenas seus próprios cálculos
- Operações restritas ao próprio user_id
- Dados isolados por usuário

---

## 🎯 Próximos Passos

1. **Aplicar Migration**: Execute o SQL no Supabase
2. **Testar Integração**: Verifique se a tabela foi criada
3. **Integrar no AdvancedCalculator**: 
   - Adicionar botão "Salvar no Histórico"
   - Mostrar lista de cálculos anteriores
   - Permitir carregar cálculo salvo
4. **Features Avançadas**:
   - Exportar relatórios
   - Comparar múltiplos cálculos
   - Gráficos de evolução

---

## 📝 Checklist

- [ ] Migration aplicada no Supabase
- [ ] Tabela criada e visível no dashboard
- [ ] RLS policies ativas
- [ ] Hook testado com saveCalculation()
- [ ] História sendo carregada
- [ ] localStorage fallback funcionando
- [ ] Integração com AdvancedCalculator.tsx

---

## 🐛 Troubleshooting

### **Erro: "relation does not exist"**
➡️ A migration não foi aplicada. Execute o SQL no editor.

### **Erro: "new row violates row-level security policy"**
➡️ Verifique se o user_id está correto e se o usuário está autenticado.

### **Histórico vazio**
➡️ Normal! Salve o primeiro cálculo com o botão "Salvar no Histórico".

### **Dados não sincronizam**
➡️ Verifique as variáveis de ambiente:
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

---

## 🎨 Melhorias Futuras

- [ ] Real-time sync com Supabase subscriptions
- [ ] Compartilhamento de cálculos entre usuários
- [ ] Versionamento de cálculos
- [ ] Backup automático
- [ ] Analytics dashboard
- [ ] Export para Excel/PDF
- [ ] Templates personalizados salvos
- [ ] Comparação de histórico (antes vs agora)

---

**✨ Pronto! Sua Calculadora Avançada agora tem persistência completa com Supabase!**
