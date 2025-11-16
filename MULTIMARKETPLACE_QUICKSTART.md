# 🚀 Quick Start - Dashboard Multimarketplace

## Instalação

```bash
# Já incluído no projeto Azuria
# Sem necessidade de instalação adicional
```

## Uso Básico (3 minutos)

### 1. Importar o Componente

```tsx
import { MultiMarketplaceDashboard } from '@/components/marketplace';

function MarketplacePage() {
  return (
    <MultiMarketplaceDashboard 
      onConnectMarketplace={() => {/* abrir modal */}}
      isPremium={false}
    />
  );
}
```

✅ **Pronto!** O dashboard completo já está funcionando.

## Conexão com Marketplace (5 minutos)

### Mercado Livre

```tsx
import { createMarketplaceHandler } from '@/services/marketplace';

// 1. Obter credenciais em: https://developers.mercadolivre.com.br
const credentials = {
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',  
  refreshToken: 'YOUR_REFRESH_TOKEN'
};

// 2. Conectar
const handler = createMarketplaceHandler('mercado-livre');
await handler.connect(credentials);

// 3. Usar
const data = await handler.getDashboardData();
```

## Operações Comuns

### Buscar Produtos

```tsx
const products = await handler.getProductList({
  status: 'active',
  limit: 50
});
```

### Atualizar Preço

```tsx
await handler.updatePrice('MLB123456', 149.90);
```

### Preços em Massa

```tsx
await handler.bulkUpdatePrices([
  { productId: 'MLB001', price: 99.90 },
  { productId: 'MLB002', price: 149.90 }
]);
```

### Monitorar Concorrência

```tsx
const competitors = await handler.getCompetitorPrices('MLB123456');
const avgPrice = competitors.reduce((s, c) => s + c.price, 0) / competitors.length;
```

## Personalizações

### Tema Customizado

```tsx
<MultiMarketplaceDashboard 
  className="my-custom-class"
  // Customizar via CSS/Tailwind
/>
```

### Eventos Customizados

```tsx
<MultiMarketplaceDashboard 
  onConnectMarketplace={handleConnect}
  // Adicionar lógica customizada
/>
```

## Adicionar Novo Marketplace (15 minutos)

### 1. Criar Handler

```typescript
// src/services/marketplace/ShopeeHandler.ts
import { BaseMarketplaceHandler } from './BaseMarketplaceHandler';

export class ShopeeHandler extends BaseMarketplaceHandler {
  readonly id = 'shopee';
  readonly name = 'Shopee';
  readonly logoUrl = '/logos/shopee.svg';
  
  async getDashboardData() {
    // Sua implementação
  }
}
```

### 2. Registrar

```typescript
// src/services/marketplace/index.ts
case 'shopee':
  return new ShopeeHandler();
```

### 3. Adicionar à Lista

```typescript
{
  id: 'shopee',
  name: 'Shopee',
  logoUrl: '/logos/shopee.svg',
  color: '#EE4D2D',
  category: 'internacional',
  region: 'Sudeste Asiático'
}
```

✅ Pronto! Seu novo marketplace já aparece no carrossel.

## Dicas Rápidas

### Performance
- Use debounce em buscas
- Cache dados por 5 minutos
- Pagine listas grandes

### Segurança
- Nunca exponha tokens no frontend
- Use variáveis de ambiente
- Implemente refresh token

### UX
- Mostre loading states
- Adicione toasts de feedback
- Trate erros graciosamente

## Troubleshooting

### "Marketplace não suportado"
➜ Certifique-se de que o handler está registrado no factory

### "Erro de autenticação"
➜ Verifique se as credenciais estão corretas e válidas

### "Dados não carregam"
➜ Verifique logs do console e status da API

## Recursos Adicionais

- 📚 [Documentação Completa](./MULTIMARKETPLACE_DASHBOARD.md)
- 💡 [Exemplos de Código](./src/examples/marketplace-examples.tsx)
- 📝 [Sumário de Implementação](./MULTIMARKETPLACE_IMPLEMENTATION_SUMMARY.md)

## Suporte

- 💬 Discord: [Azuria Community](#)
- 📧 Email: suporte@azuria.com.br
- 🐛 Issues: [GitHub Issues](#)

---

**Boa sorte! 🚀**
