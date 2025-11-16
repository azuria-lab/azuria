# 🎯 Dashboard Multimarketplace - Azuria

## 📋 Visão Geral

Sistema completo de gestão multimarketplace com carrossel interativo e dashboards analíticos em tempo real. Permite visualizar, comparar e gerenciar todos os seus marketplaces integrados (Mercado Livre, Shopee, Amazon, Magalu, etc.) em uma única interface moderna e intuitiva.

## ✨ Funcionalidades Principais

### 🔁 Carrossel Interativo de Marketplaces
- **Navegação Fluida**: Cards deslizáveis com efeitos 3D e parallax
- **Autoplay Inteligente**: Loop automático com pausa ao passar o mouse
- **Status em Tempo Real**: Indicadores visuais de conexão e sincronização
- **Mini Preview**: Grid de thumbnails para acesso rápido
- **Animações Suaves**: Transições cinematográficas entre marketplaces

### 📊 Dashboard Individual por Marketplace

#### 🔍 Visão Geral
- Total de produtos listados
- Total de vendas no período
- Receita bruta e margem média
- Ranking de produtos mais vendidos
- Status dos anúncios (ativos/inativos)

#### 📈 Análise de Preços
- Variação de preço por categoria
- Comparativo com concorrentes em tempo real
- Alertas automáticos de preço fora da margem
- Posicionamento no mercado (acima/abaixo/igual)
- Sugestões de precificação inteligente

#### 🧠 Inteligência de Mercado
- **Palavras-chave mais buscadas** com volume e tendências
- **Horários de pico** de vendas
- **Reputação completa**: score, avaliações, tempo de resposta
- **Tendências por categoria** com nível de demanda
- **Análise de crescimento** por segmento

#### 📦 Gestão de Estoque
- Estoque total e disponibilidade
- Produtos fora de estoque
- Alertas de estoque baixo
- Produtos não integrados
- Sincronização em tempo real

### ✨ Recursos Premium

- 📊 **Histórico completo** de preços e vendas (gráficos interativos)
- 🤖 **IA de recomendações** para ajuste de preço ideal
- 🔔 **Alertas configuráveis** (margem, concorrência, estoque)
- 📄 **Exportação** de relatórios (PDF/Excel)
- ⚡ **Sincronização automática** a cada 15 minutos

## 🏗️ Arquitetura

### Estrutura de Pastas

```
src/
├── components/
│   └── marketplace/
│       ├── MarketplaceCarousel.tsx       # Carrossel principal
│       ├── MarketplaceDashboard.tsx      # Dashboard individual
│       └── MultiMarketplaceDashboard.tsx # Componente principal
│
├── services/
│   └── marketplace/
│       ├── BaseMarketplaceHandler.ts     # Classe abstrata base
│       ├── MercadoLivreHandler.ts        # Handler do Mercado Livre
│       └── index.ts                      # Factory e exports
│
└── types/
    └── marketplace-api.ts                # Interfaces TypeScript
```

### Padrões de Design

#### 1. Template Method Pattern
Todos os handlers de marketplace estendem `BaseMarketplaceHandler`, que implementa a interface `MarketplaceAPI`:

```typescript
abstract class BaseMarketplaceHandler implements MarketplaceAPI {
  // Métodos comuns implementados
  async connect(credentials) { ... }
  async disconnect() { ... }
  
  // Métodos abstratos (devem ser implementados)
  abstract getDashboardData(): Promise<MarketplaceDashboardData>;
  abstract getProductList(): Promise<MarketplaceProduct[]>;
  // ...
}
```

#### 2. Factory Pattern
Criação centralizada de handlers:

```typescript
export function createMarketplaceHandler(marketplaceId: string): MarketplaceAPI {
  switch (marketplaceId) {
    case 'mercado-livre':
      return new MercadoLivreHandler();
    // ...outros marketplaces
  }
}
```

## 🚀 Como Usar

### Importação Básica

```tsx
import { MultiMarketplaceDashboard } from '@/components/marketplace/MultiMarketplaceDashboard';

function App() {
  return (
    <MultiMarketplaceDashboard 
      onConnectMarketplace={() => {
        // Abrir modal de conexão
      }}
      isPremium={true}
    />
  );
}
```

### Adicionando um Novo Marketplace

#### 1. Criar Handler
```typescript
// src/services/marketplace/ShopeeHandler.ts
export class ShopeeHandler extends BaseMarketplaceHandler {
  readonly id = 'shopee';
  readonly name = 'Shopee';
  readonly logoUrl = '/logos/shopee.svg';
  
  async getDashboardData(): Promise<MarketplaceDashboardData> {
    // Implementação específica para Shopee
  }
  
  // ...outros métodos
}
```

#### 2. Registrar no Factory
```typescript
// src/services/marketplace/index.ts
export function createMarketplaceHandler(marketplaceId: string): MarketplaceAPI {
  switch (marketplaceId) {
    case 'shopee':
      return new ShopeeHandler();
    // ...
  }
}
```

#### 3. Adicionar à Lista
```typescript
export const AVAILABLE_MARKETPLACES = [
  {
    id: 'shopee',
    name: 'Shopee',
    logoUrl: '/logos/shopee.svg',
    color: '#EE4D2D',
    category: 'internacional',
    region: 'Sudeste Asiático',
  },
  // ...
];
```

## 🔌 Integração com APIs

### Mercado Livre

```typescript
// Credenciais necessárias
const credentials = {
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  refreshToken: 'YOUR_REFRESH_TOKEN'
};

const handler = createMarketplaceHandler('mercado-livre');
await handler.connect(credentials);

// Obter dados do dashboard
const data = await handler.getDashboardData();

// Atualizar preço de produto
await handler.updatePrice('MLB123456', 99.90);
```

### Estrutura de Dados

```typescript
interface MarketplaceDashboardData {
  overview: {
    totalProducts: number;
    activeListings: number;
    totalSales: number;
    grossRevenue: number;
    averageMargin: number;
  };
  
  pricing: {
    averagePrice: number;
    priceRange: { min: number; max: number };
    competitorComparison: {...};
    priceAlerts: Array<{...}>;
  };
  
  marketIntelligence: {
    topKeywords: Array<{...}>;
    peakHours: Array<{...}>;
    reputation: {...};
    categoryTrends: Array<{...}>;
  };
  
  inventory: {
    totalStock: number;
    outOfStock: number;
    items: Array<{...}>;
  };
  
  topProducts: Array<{...}>;
}
```

## 🎨 Design e UX

### Paleta de Cores por Marketplace
- **Mercado Livre**: `#FFE600` (Amarelo)
- **Amazon**: `#FF9900` (Laranja)
- **Shopee**: `#EE4D2D` (Vermelho-Laranja)
- **Magalu**: `#0086FF` (Azul)

### Animações
- **Carrossel**: Transições 3D com `framer-motion`
- **Cards**: Hover effects com elevação e sombra
- **Indicadores**: Pulso animado para status de sincronização
- **Gráficos**: Animações progressivas de entrada

### Responsividade
- **Desktop**: Grid de 4 colunas
- **Tablet**: Grid de 2 colunas
- **Mobile**: Stack vertical com scroll horizontal no carrossel

## 🔐 Segurança

- Credenciais armazenadas de forma segura (nunca no frontend)
- Tokens de acesso com refresh automático
- Rate limiting respeitado conforme limites de cada API
- Validação de dados em todas as chamadas

## 📊 Performance

### Otimizações
- **Lazy Loading**: Componentes carregados sob demanda
- **Memoização**: React.memo para evitar re-renders desnecessários
- **Debounce**: Em buscas e atualizações frequentes
- **Cache**: Dados de dashboard cacheados por 5 minutos
- **Paginação**: Listas grandes paginadas automaticamente

### Métricas
- **Tempo de carregamento inicial**: < 2s
- **Transição entre dashboards**: < 500ms
- **Atualização de dados**: < 3s

## 🧪 Testes

```bash
# Rodar testes unitários
npm run test

# Testar conexão com marketplace
npm run test:marketplace -- mercado-livre
```

## 🚧 Roadmap

### Próximas Funcionalidades
- [ ] **Comparação lado a lado** de 2+ marketplaces
- [ ] **Gráficos históricos** interativos (Chart.js)
- [ ] **IA de precificação** com ML
- [ ] **Automações** (ex: ajuste automático de preços)
- [ ] **Webhooks** para eventos em tempo real
- [ ] **App mobile** (React Native)

### Novos Marketplaces
- [ ] Shopee (em desenvolvimento)
- [ ] Amazon Seller Central
- [ ] Magazine Luiza (Magalu)
- [ ] Americanas
- [ ] Temu
- [ ] AliExpress

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovoMarketplace`)
3. Implemente seguindo os padrões existentes
4. Teste completamente
5. Commit suas mudanças (`git commit -m 'Adiciona handler do Shopee'`)
6. Push para a branch (`git push origin feature/NovoMarketplace`)
7. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙋 Suporte

- 📧 Email: suporte@azuria.com.br
- 💬 Discord: [Azuria Community](#)
- 📚 Documentação: [docs.azuria.com.br](#)

---

**Desenvolvido com ❤️ pela equipe Azuria**
