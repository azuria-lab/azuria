# 🏪 Sistema Multi-Marketplace - Documentação Completa

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Marketplaces Integrados](#marketplaces-integrados)
- [Arquitetura](#arquitetura)
- [Dashboard Multi-Marketplace](#dashboard-multi-marketplace)
- [Integração de APIs](#integração-de-apis)
- [Guia de Uso](#guia-de-uso)
- [Exemplos Práticos](#exemplos-práticos)

---

## 🎯 Visão Geral

O **Sistema Multi-Marketplace** do Azuria é uma plataforma completa para gerenciar vendas em múltiplos marketplaces simultaneamente. Permite visualizar métricas consolidadas, sincronizar produtos e analisar performance em tempo real.

### Características Principais

- ✅ **30+ Marketplaces** integrados (3 ativos, 27 planejados)
- ✅ **Dashboard unificado** com métricas consolidadas
- ✅ **Carrossel interativo** de marketplaces conectados
- ✅ **Sincronização automática** de dados
- ✅ **Analytics por marketplace** (vendas, produtos, conversão)
- ✅ **Gestão centralizada** de produtos
- ✅ **Alertas e notificações** em tempo real

### Diferenciais

- 🔄 Sincronização bidirecional (Azuria ↔ Marketplace)
- 📊 Métricas comparativas entre marketplaces
- 🚀 Performance otimizada com cache inteligente
- 🔐 Segurança de credenciais (Supabase Vault)
- 📱 Interface responsiva (mobile-first)

---

## 🛒 Marketplaces Integrados

### Ativos (3)

| Marketplace | Status | Taxa | Região | API |
|-------------|--------|------|--------|-----|
| **Mercado Livre** | ✅ Ativo | 11% | América Latina | v1.0 |
| **Amazon** | ✅ Ativo | 8-15% | Global | MWS v2 |
| **Shopee** | ✅ Ativo | 5-12% | Sudeste Asiático/BR | v2.0 |

### Planejados - Nacionais (8)

| Marketplace | Prioridade | Taxa | Observação |
|-------------|-----------|------|------------|
| Magazine Luiza | Alta | 12% | Grande volume no BR |
| Americanas | Alta | 13% | Tradicional brasileiro |
| Casas Bahia | Alta | 12.5% | Via Varejo |
| Extra | Média | 11.5% | Pão de Açúcar |
| Submarino | Média | 12% | B2W |
| Ponto | Média | 10% | Parceria Americanas |
| Carrefour | Baixa | 12% | Expansão recente |
| Madeira Madeira | Baixa | 11% | Casa & Decoração |

### Planejados - Internacionais (19)

| Marketplace | Região | Observação |
|-------------|--------|------------|
| eBay | Global | Leilões e vendas diretas |
| Walmart | EUA | Expansão internacional |
| AliExpress | China/Global | Dropshipping |
| Alibaba | China | B2B |
| Wish | Global | Baixo custo |
| Etsy | Global | Artesanato |
| Rakuten | Japão | Expansão |
| Lazada | Sudeste Asiático | Alibaba Group |
| Flipkart | Índia | Walmart Group |
| Tokopedia | Indonésia | Maior da região |
| JD.com | China | Segundo maior |
| Pinduoduo | China | Social commerce |
| Coupang | Coreia do Sul | Líder local |
| Allegro | Polônia | Líder na Europa Central |
| Fnac | França/Europa | Livros e eletrônicos |
| Otto | Alemanha | Moda e casa |
| Kaufland | Alemanha | Supermercado online |
| Zalando | Europa | Moda |
| ASOS | Reino Unido | Moda jovem |

---

## 🏗️ Arquitetura

### Estrutura de Componentes

```
/marketplace (Página)
│
├── MultiMarketplaceDashboard (Container)
│   │
│   ├── MarketplaceCarousel (Slider)
│   │   ├── MarketplaceCard [1..n]
│   │   │   ├── Logo
│   │   │   ├── Status Badge
│   │   │   ├── Last Sync
│   │   │   └── Quick Actions
│   │   │
│   │   └── AddMarketplaceCard
│   │
│   ├── ConsolidatedMetrics (Dashboard Overview)
│   │   ├── TotalSales
│   │   ├── TotalProducts
│   │   ├── ConversionRate
│   │   └── ActiveMarketplaces
│   │
│   └── MarketplaceDashboard (Individual View)
│       ├── SalesMetrics
│       ├── ProductsTable
│       ├── PerformanceCharts
│       └── RecentOrders
│
└── ConnectMarketplaceDialog (Modal)
    ├── MarketplaceSelector
    ├── CredentialsForm
    └── ConnectionTest
```

### Fluxo de Dados

```typescript
// 1. Estado global de marketplaces
const [marketplaces, setMarketplaces] = useState<MarketplaceCard[]>([]);

// 2. Seleção de marketplace
const [selectedId, setSelectedId] = useState<string | null>(null);

// 3. Buscar dados do marketplace
useEffect(() => {
  if (selectedId) {
    fetchMarketplaceData(selectedId);
  }
}, [selectedId]);

// 4. Criar handler específico
const handler = createMarketplaceHandler(selectedId);

// 5. Executar operações
const data = await handler.getDashboardData();
```

### Handlers de Marketplace

```typescript
// Interface base
interface MarketplaceHandler {
  connect(credentials: Credentials): Promise<ConnectionResult>;
  disconnect(): Promise<void>;
  syncProducts(): Promise<SyncResult>;
  getDashboardData(): Promise<DashboardData>;
  getOrders(filters?: OrderFilters): Promise<Order[]>;
  updateProduct(productId: string, data: ProductData): Promise<void>;
}

// Implementações específicas
class MercadoLivreHandler implements MarketplaceHandler { /*...*/ }
class AmazonHandler implements MarketplaceHandler { /*...*/ }
class ShopeeHandler implements MarketplaceHandler { /*...*/ }

// Factory
function createMarketplaceHandler(id: string): MarketplaceHandler {
  switch (id) {
    case 'mercado-livre': return new MercadoLivreHandler();
    case 'amazon': return new AmazonHandler();
    case 'shopee': return new ShopeeHandler();
    default: throw new Error(`Handler not found: ${id}`);
  }
}
```

---

## 📊 Dashboard Multi-Marketplace

### Carrossel de Marketplaces

Interface visual para navegar entre marketplaces conectados:

```typescript
interface MarketplaceCard {
  id: string;                    // Identificador único
  name: string;                  // Nome do marketplace
  logoUrl: string;               // URL do logo
  color: string;                 // Cor temática
  status: {
    isConnected: boolean;        // Conectado?
    lastSync?: Date;             // Última sincronização
    syncStatus: 'idle' | 'syncing' | 'success' | 'error';
    errorMessage?: string;       // Mensagem de erro
  };
  category: 'nacional' | 'internacional';
  region: string;                // Região de atuação
}
```

**Recursos:**
- Scroll horizontal suave
- Indicadores visuais de status (🟢 conectado, 🟡 sincronizando, 🔴 erro)
- Tempo desde última sincronização (ex: "há 30 min")
- Botão "+Adicionar" para conectar novos

### Métricas Consolidadas

Dashboard com visão geral de todos os marketplaces:

```typescript
interface ConsolidatedMetrics {
  totalSales: {
    today: number;
    week: number;
    month: number;
    trend: number;              // % de variação
  };
  totalProducts: {
    active: number;
    outOfStock: number;
    pending: number;
  };
  conversionRate: {
    average: number;            // % média
    best: string;               // Marketplace com melhor taxa
    worst: string;              // Marketplace com pior taxa
  };
  marketplaces: {
    connected: number;
    syncing: number;
    error: number;
  };
}
```

**Visualização:**

```
┌──────────────────────────────────────────┐
│  📊 Visão Geral                          │
├──────────────────────────────────────────┤
│  💰 Vendas Totais                        │
│  R$ 45.320,00 hoje   ↑ 12%              │
│  ────────────────────────────            │
│  📦 Produtos Ativos                      │
│  487 produtos        ⚠️ 23 sem estoque  │
│  ────────────────────────────            │
│  📈 Taxa de Conversão                    │
│  3.2% média          🏆 ML: 4.1%         │
│  ────────────────────────────            │
│  🏪 Marketplaces                         │
│  3 conectados        ✅ Todos OK         │
└──────────────────────────────────────────┘
```

### Dashboard Individual

Ao selecionar um marketplace, visualização detalhada:

```typescript
interface MarketplaceDashboardData {
  marketplace: {
    id: string;
    name: string;
    isConnected: boolean;
  };
  
  metrics: {
    sales: {
      today: number;
      week: number;
      month: number;
      chart: DataPoint[];      // Dados para gráfico
    };
    
    products: {
      total: number;
      active: number;
      inactive: number;
      outOfStock: number;
    };
    
    orders: {
      pending: number;
      processing: number;
      shipped: number;
      delivered: number;
    };
    
    performance: {
      conversionRate: number;
      averageTicket: number;
      revenuePerProduct: number;
    };
  };
  
  recentOrders: Order[];
  topProducts: Product[];
}
```

**Seções:**

1. **Header com métricas principais**
   - Vendas do mês
   - Taxa de conversão
   - Ticket médio

2. **Gráfico de vendas** (linha temporal)
   - Últimos 30 dias
   - Comparação com período anterior
   - Zoom interativo

3. **Tabela de produtos**
   - Top 10 mais vendidos
   - Estoque
   - Preço
   - Ações rápidas (editar, desativar)

4. **Pedidos recentes**
   - Status
   - Valor
   - Cliente
   - Data

---

## 🔌 Integração de APIs

### Mercado Livre

**Autenticação:**
```typescript
// OAuth 2.0
const mlAuth = {
  clientId: process.env.ML_CLIENT_ID,
  clientSecret: process.env.ML_CLIENT_SECRET,
  redirectUri: 'https://azuria.app/callback/ml',
  scopes: ['read', 'write', 'offline_access']
};

// Obter token
const token = await getMercadoLivreToken(authCode);
```

**Endpoints principais:**
```typescript
// Buscar produtos
GET /users/{userId}/items/search

// Criar produto
POST /items

// Atualizar produto
PUT /items/{itemId}

// Buscar pedidos
GET /orders/search

// Métricas
GET /users/{userId}/metrics
```

### Amazon

**Autenticação:**
```typescript
// MWS (Marketplace Web Service)
const amazonAuth = {
  sellerId: process.env.AMAZON_SELLER_ID,
  mwsAuthToken: process.env.AMAZON_MWS_TOKEN,
  marketplace: 'A2Q3Y263D00KWC' // BR
};
```

**Endpoints principais:**
```typescript
// Listar produtos
ListMatchingProducts

// Criar listagem
CreateProduct

// Buscar pedidos
ListOrders

// Relatórios
RequestReport
GetReportList
```

### Shopee

**Autenticação:**
```typescript
// Partner API
const shopeeAuth = {
  partnerId: process.env.SHOPEE_PARTNER_ID,
  partnerKey: process.env.SHOPEE_PARTNER_KEY,
  shopId: process.env.SHOPEE_SHOP_ID
};

// Gerar assinatura
const signature = generateShopeeSignature(path, timestamp, partnerId, partnerKey);
```

**Endpoints principais:**
```typescript
// Produtos
/api/v2/product/get_item_list
/api/v2/product/get_item_base_info
/api/v2/product/update_item

// Pedidos
/api/v2/order/get_order_list
/api/v2/order/get_order_detail

// Logística
/api/v2/logistics/get_tracking_number
```

---

## 📖 Guia de Uso

### Conectar Marketplace

**Passo 1:** Acessar página
```
/marketplace
```

**Passo 2:** Clicar em "+ Conectar Marketplace"

**Passo 3:** Selecionar marketplace

**Passo 4:** Inserir credenciais

**Para Mercado Livre:**
- Client ID
- Client Secret
- Autorizar acesso (OAuth)

**Para Amazon:**
- Seller ID
- MWS Auth Token
- Marketplace ID

**Para Shopee:**
- Partner ID
- Partner Key
- Shop ID

**Passo 5:** Testar conexão

**Passo 6:** Sincronizar produtos (automático)

### Sincronizar Produtos

**Manual:**
1. Selecionar marketplace no carrossel
2. Clicar em "Sincronizar agora"
3. Aguardar conclusão (1-5 min)

**Automática:**
- A cada 30 minutos
- Ao conectar um novo marketplace
- Ao criar/atualizar produto no Azuria

### Visualizar Métricas

**Dashboard geral:**
1. Acessar `/marketplace`
2. Ver métricas consolidadas no topo
3. Comparar performance entre marketplaces

**Dashboard individual:**
1. Clicar em um marketplace no carrossel
2. Ver métricas específicas
3. Analisar gráficos e tabelas
4. Exportar relatórios (PDF/CSV)

### Gerenciar Produtos

**Criar produto:**
1. Dashboard individual
2. Botão "Novo Produto"
3. Preencher dados
4. Selecionar marketplaces para publicar
5. Salvar (publica automaticamente)

**Editar produto:**
1. Localizar produto na tabela
2. Clicar em "Editar"
3. Modificar informações
4. Salvar (sincroniza com marketplaces)

**Desativar produto:**
1. Localizar produto
2. Toggle "Ativo/Inativo"
3. Confirmar (remove das listagens)

---

## 💡 Exemplos Práticos

### Exemplo 1: Comparar Vendas

```typescript
import { useMarketplaceMetrics } from '@/hooks/useMarketplaceMetrics';

function SalesComparison() {
  const { getConsolidatedSales } = useMarketplaceMetrics();
  
  const sales = getConsolidatedSales({
    period: 'month',
    marketplaces: ['mercado-livre', 'amazon', 'shopee']
  });
  
  return (
    <div>
      <h3>Vendas do Mês</h3>
      {sales.map(item => (
        <div key={item.marketplace}>
          <span>{item.name}:</span>
          <span>R$ {item.total.toFixed(2)}</span>
          <span>({item.percentage}%)</span>
        </div>
      ))}
    </div>
  );
}
```

### Exemplo 2: Sincronizar Produto

```typescript
import { syncProductToMarketplace } from '@/services/marketplace';

async function publishProduct(productId: string) {
  const marketplaces = ['mercado-livre', 'amazon'];
  
  for (const marketplace of marketplaces) {
    try {
      await syncProductToMarketplace(productId, marketplace);
      console.log(`✅ Publicado no ${marketplace}`);
    } catch (error) {
      console.error(`❌ Erro no ${marketplace}:`, error);
    }
  }
}
```

### Exemplo 3: Monitorar Estoque

```typescript
import { useMarketplaceProducts } from '@/hooks/useMarketplaceProducts';

function StockAlert() {
  const { products } = useMarketplaceProducts({
    filter: { outOfStock: true }
  });
  
  if (products.length === 0) {
    return <p>✅ Todos os produtos com estoque</p>;
  }
  
  return (
    <div className="alert alert-warning">
      <p>⚠️ {products.length} produtos sem estoque:</p>
      <ul>
        {products.map(p => (
          <li key={p.id}>{p.name} ({p.marketplace})</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🎓 Dicas e Boas Práticas

### Performance

1. **Cache inteligente:**
   - Dados de dashboard em cache (5 min)
   - Produtos em cache (10 min)
   - Revalidar em ações críticas

2. **Sincronização:**
   - Não sincronizar todos de uma vez
   - Fila de sincronização (1 por vez)
   - Retry automático em caso de erro

3. **Rate limits:**
   - Respeitar limites de API de cada marketplace
   - Implementar throttling
   - Exponential backoff em erros

### Segurança

1. **Credenciais:**
   - Armazenar no Supabase Vault
   - Nunca expor no frontend
   - Rotacionar periodicamente

2. **Webhooks:**
   - Validar assinatura
   - IP whitelist quando disponível
   - Rate limiting

3. **Logs:**
   - Registrar todas as chamadas de API
   - Não logar dados sensíveis
   - Monitorar erros

### UX

1. **Feedback visual:**
   - Loading states
   - Mensagens de sucesso/erro
   - Progresso de sincronização

2. **Offline:**
   - Cache de dados visualizados
   - Fila de ações pendentes
   - Sincronizar ao reconectar

---

## 🔗 Links Relacionados

- [Calculadora Avançada](./ADVANCED_CALCULATOR.md) (usa taxas de marketplace)
- [Documentação Stripe](./STRIPE_INTEGRATION.md) (sistema de pagamentos)
- [Mercado Livre Developers](https://developers.mercadolivre.com.br/)
- [Amazon MWS Documentation](https://developer.amazonservices.com/)
- [Shopee Open Platform](https://open.shopee.com/)

---

## 📞 Suporte

Problemas com integrações? Entre em contato:

- 📧 Email: integracao@azuria.app
- 💬 Discord: [#marketplace-support](https://discord.com/invite/azuria)
- 📚 Docs: [docs.azuria.app/marketplace](https://docs.azuria.app/marketplace)

---

**Última atualização:** Janeiro 2025  
**Versão:** 1.0.0  
**Marketplaces ativos:** 3 (Mercado Livre, Amazon, Shopee)  
**Marketplaces planejados:** 27
