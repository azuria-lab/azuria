# Hub Multi-Marketplace - Documentação

## Visão Geral

O Hub Multi-Marketplace é um sistema completo para gerenciar e sincronizar produtos, pedidos e estoque em múltiplas plataformas de e-commerce de forma centralizada.

## Funcionalidades Principais

### ✅ **Implementado**

1. **Dashboard Centralizado**
   - Métricas em tempo real de todos os marketplaces
   - Status de conexão e sincronização
   - Estatísticas de performance por marketplace
   - Produtos mais vendidos

2. **Gerenciamento de Conexões**
   - Suporte para múltiplas plataformas (Amazon, Mercado Livre, Shopify, Shopee, etc.)
   - Modal de configuração com validação de credenciais
   - Teste de conectividade em tempo real
   - Gerenciamento de configurações por marketplace

3. **Tipos TypeScript Abrangentes**
   - Definições completas para todos os modelos de dados
   - Support para 10+ marketplaces diferentes
   - Tipagem forte para sincronização e API responses

4. **Context API e Hooks**
   - Context centralizado para estado do marketplace
   - Hook personalizado `useMarketplace`
   - Gerenciamento de estado com localStorage/sessionStorage

### 🚧 **Em Desenvolvimento**

5. **Sistema de Sincronização**
   - Sincronização de produtos, pedidos e estoque
   - Tratamento de conflitos automático
   - Sincronização em lote
   - Monitoramento de progresso em tempo real

## Estrutura de Arquivos

```
src/
├── types/
│   └── marketplace.ts          # Definições TypeScript completas
├── contexts/
│   └── MarketplaceContext.tsx  # Context API e service layer
├── hooks/
│   └── useMarketplace.ts       # Hook personalizado
└── components/marketplace/
    ├── MarketplaceHub.tsx      # Componente principal
    ├── DashboardStats.tsx      # Métricas e estatísticas
    ├── MarketplaceCard.tsx     # Card individual do marketplace
    └── MarketplaceConnectionModal.tsx  # Modal de configuração
```

## Como Usar

### 1. Provider Setup

```tsx
import { MarketplaceProvider } from './contexts/MarketplaceContext';
import MarketplaceHub from './components/marketplace/MarketplaceHub';

function App() {
  return (
    <MarketplaceProvider>
      <MarketplaceHub />
    </MarketplaceProvider>
  );
}
```

### 2. Hook Usage

```tsx
import { useMarketplace } from './hooks/useMarketplace';

function MyComponent() {
  const {
    marketplaces,
    dashboardData,
    connectMarketplace,
    startSync,
    getProducts,
    getOrders
  } = useMarketplace();

  // Conectar novo marketplace
  const handleConnect = async () => {
    await connectMarketplace('amazon', {
      accessKey: 'AKIA...',
      secretKey: 'secret...',
      sellerId: 'A...',
      mwsToken: 'token...'
    });
  };

  // Sincronizar produtos
  const handleSync = async () => {
    await startSync('marketplace-id', 'products');
  };

  return (
    <div>
      <h1>Marketplaces: {marketplaces.length}</h1>
      <p>Produtos: {dashboardData?.totalProducts}</p>
    </div>
  );
}
```

### 3. Tipos Disponíveis

```tsx
import {
  Marketplace,
  Product,
  Order,
  SyncJob,
  MarketplacePlatform,
  MarketplaceDashboardData
} from './types/marketplace';

// Plataformas suportadas
type Platform = 
  | 'amazon' 
  | 'mercadolivre' 
  | 'shopify' 
  | 'shopee' 
  | 'americanas'
  | 'casasbahia'
  | 'magento'
  | 'woocommerce'
  | 'extra'
  | 'custom';
```

## Plataformas Suportadas

| Marketplace | Status | Credenciais Necessárias |
|-------------|--------|------------------------|
| Amazon | ✅ | Access Key, Secret Key, Seller ID, MWS Token |
| Mercado Livre | ✅ | App ID, Secret Key, Access Token, Site ID |
| Shopify | ✅ | Shop Domain, Access Token, API Key, API Secret |
| Shopee | ✅ | Partner ID, Partner Key, Shop ID, Region |  
| Americanas | ✅ | Client ID, Client Secret, Username, Password |
| Casas Bahia | 🚧 | Em desenvolvimento |
| Magento | ✅ | API URL, API Key, Username, Password |
| WooCommerce | ✅ | API URL, Consumer Key, Consumer Secret |
| Extra | 🚧 | Em desenvolvimento |

## Features do Dashboard

### Métricas Principais
- **Marketplaces Conectados**: Status e taxa de conexão
- **Total de Produtos**: Produtos sincronizados em todas as plataformas
- **Pedidos Totais**: Pedidos processados no período
- **Receita Total**: Faturamento consolidado

### Componentes Interativos
- **Cards de Marketplace**: Status, estatísticas e ações rápidas
- **Modal de Conexão**: Formulário dinâmico por plataforma
- **Dashboard Stats**: Métricas visuais e gráficos
- **Sync Controls**: Controles de sincronização individual e em lote

### Estados de Sincronização
- **Idle**: Sincronizado e em espera
- **Syncing**: Sincronização em progresso
- **Error**: Erro na sincronização
- **Connected**: Conectado e funcionando
- **Disconnected**: Desconectado

## Próximos Passos

1. **Sistema de Sincronização Completo**
   - Implementar sincronização real com APIs
   - Resolver conflitos de dados
   - Queue de jobs de sincronização

2. **Gerenciamento de Produtos**
   - CRUD de produtos
   - Mapeamento de categorias entre marketplaces
   - Gestão de variações

3. **Gestão de Pedidos**
   - Workflow de processamento
   - Integração com sistemas de envio
   - Notificações automáticas

4. **Analytics Avançado**
   - Relatórios de performance
   - Análise de vendas
   - Insights de marketplace

## Tecnologias Utilizadas

- **React 18** + **TypeScript**
- **Context API** para gerenciamento de estado
- **Tailwind CSS** para styling
- **Lucide React** para ícones
- **ESLint** + **Prettier** para qualidade de código

## Contribuição

Este sistema foi projetado com arquitetura modular e extensível, facilitando a adição de novos marketplaces e funcionalidades.